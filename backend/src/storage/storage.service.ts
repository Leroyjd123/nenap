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
  async createSignedUpload(path: string): Promise<SignedUpload> {
    if (!this.client) {
      throw new ServiceUnavailableException('Storage is not configured yet');
    }
    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(path);
    if (error || !data) {
      this.logger.error(`createSignedUploadUrl failed: ${error?.message}`);
      throw new ServiceUnavailableException('Could not create upload URL');
    }
    return { path: data.path, token: data.token, signedUrl: data.signedUrl };
  }

  /** Downloads a stored object's bytes (server-side, for sending to Gemini). */
  async downloadFile(path: string): Promise<Blob> {
    if (!this.client) throw new ServiceUnavailableException('Storage is not configured yet');
    const { data, error } = await this.client.storage.from(this.bucket).download(path);
    if (error || !data) {
      this.logger.error(`download failed for ${path}: ${error?.message}`);
      throw new ServiceUnavailableException('Could not download recording');
    }
    return data;
  }

  /** A time-limited URL to play back / download a stored recording. */
  async createSignedDownloadUrl(path: string, expiresInSec = 3600): Promise<string | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSec);
    return error ? null : (data?.signedUrl ?? null);
  }

  async remove(path: string): Promise<void> {
    if (!this.client) return;
    await this.client.storage.from(this.bucket).remove([path]);
  }
}
