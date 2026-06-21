import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SignedUpload {
  path: string;
  token: string;
  signedUrl: string;
}

/**
 * Owns Supabase Storage interactions with admin privileges (secret key). The browser
 * never holds this key — it receives a short-lived signed upload token and uploads the
 * audio directly to the bucket, keeping large payloads off the backend.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly client: SupabaseClient | null;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('RECORDINGS_BUCKET', 'recordings');
    const url = config.get<string>('SUPABASE_URL', '');
    const key =
      config.get<string>('SUPABASE_SECRET_KEY') ||
      config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      '';

    const configured = url && !url.includes('YOUR_PROJECT_REF') && key && !key.startsWith('placeholder');
    this.client = configured
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
    if (!this.client) {
      this.logger.warn('Storage not configured (SUPABASE_SECRET_KEY missing) — uploads will be unavailable.');
    }
  }

  /** Issues a one-time signed URL the browser uses to upload directly to the bucket. */
  async createSignedUpload(path: string, bucket = this.bucket): Promise<SignedUpload> {
    if (!this.client) {
      throw new ServiceUnavailableException('Storage is not configured yet');
    }
    const { data, error } = await this.client.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) {
      this.logger.error(`createSignedUploadUrl failed: ${error?.message}`);
      throw new ServiceUnavailableException('Could not create upload URL');
    }
    return { path: data.path, token: data.token, signedUrl: data.signedUrl };
  }

  /** Downloads a stored object's bytes (server-side, for sending to Gemini). */
  async downloadFile(path: string, bucket = this.bucket): Promise<Blob> {
    if (!this.client) throw new ServiceUnavailableException('Storage is not configured yet');
    const { data, error } = await this.client.storage.from(bucket).download(path);
    if (error || !data) {
      this.logger.error(`download failed for ${path}: ${error?.message}`);
      throw new ServiceUnavailableException('Could not download recording');
    }
    return data;
  }

  /** A time-limited URL to play back / download a stored object. */
  async createSignedDownloadUrl(path: string, expiresInSec = 3600, bucket = this.bucket): Promise<string | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSec);
    return error ? null : (data?.signedUrl ?? null);
  }

  /** Best-effort delete — logs rather than throws so it never blocks a note deletion. */
  async remove(path: string, bucket = this.bucket): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.warn(`Failed to delete storage object ${path}: ${error.message}`);
    }
  }

  /** Best-effort bulk delete (e.g. when wiping an account). */
  async removeMany(paths: string[], bucket = this.bucket): Promise<void> {
    if (!this.client || paths.length === 0) return;
    const { error } = await this.client.storage.from(bucket).remove(paths);
    if (error) {
      this.logger.warn(`Failed to bulk-delete ${paths.length} objects from ${bucket}: ${error.message}`);
    }
  }

  /** Deletes the Supabase auth user (admin). Best-effort; logs on failure. */
  async deleteAuthUser(userId: string): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) {
      this.logger.warn(`Failed to delete auth user ${userId}: ${error.message}`);
    }
  }
}
