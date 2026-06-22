import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';
import type { GenerationUsage, LangfuseTraceClient } from '../langfuse/langfuse.service';

const TRANSCRIBE_PROMPT =
  'Transcribe this audio verbatim into clean, readable text. Fix only obvious filler and false starts. ' +
  'Do not summarise, add headings, or invent content. Return only the transcript text.';

function enhancePrompt(original: string, transcript: string): string {
  return [
    'You are a calm note-keeper. Produce an improved, well-structured version of the user\'s note.',
    'STRICT RULES:',
    '- Preserve the user\'s meaning and intent. Do NOT invent facts, opinions, or details.',
    '- Use the transcript only to clarify and fill gaps in what the user already captured.',
    '- Improve structure, headings, and flow. Keep it concise and faithful.',
    '- Output semantic HTML using only <h3>, <p>, <ul>, <li>, <strong>, <em>. No <html>/<body>, no markdown fences.',
    '',
    `USER'S ORIGINAL NOTE:\n${original || '(empty)'}`,
    '',
    `TRANSCRIPT (reference):\n${transcript || '(none)'}`,
  ].join('\n');
}

/**
 * Owns all Gemini calls (the frontend never touches Gemini directly). Gemini Flash
 * handles audio natively. Throws a retryable error when no key is configured so the
 * job runner can surface it without crashing.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly model: string;
  private readonly client: GoogleGenAI | null;

  constructor(config: ConfigService) {
    this.model = config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    const key = config.get<string>('GEMINI_API_KEY', '');
    const configured = key && !key.startsWith('placeholder');
    this.client = configured ? new GoogleGenAI({ apiKey: key }) : null;
    if (!this.client) {
      this.logger.warn('Gemini not configured (GEMINI_API_KEY missing) — processing will fail until set.');
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /** Transcribe an audio blob via the Files API (robust for longer recordings). */
  async transcribe(audio: Blob, mimeType: string, trace?: LangfuseTraceClient): Promise<string> {
    const ai = this.require();
    const uploaded = await ai.files.upload({ file: audio, config: { mimeType } });
    const fileUri = await this.waitForActive(uploaded.name, uploaded.uri);

    const generation = trace?.generation({ name: 'transcribe', model: this.model, input: { mimeType, prompt: TRANSCRIBE_PROMPT } });
    try {
      const res = await ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ fileData: { fileUri, mimeType } }, { text: TRANSCRIBE_PROMPT }] }],
      });
      const output = (res.text ?? '').trim();
      generation?.end({ output, usageDetails: this.usageFrom(res) });
      return output;
    } catch (err) {
      generation?.end({ level: 'ERROR', statusMessage: (err as Error).message });
      throw err;
    }
  }

  /** Produce an enhanced HTML version from the user's note + transcript. */
  async enhance(original: string, transcript: string, trace?: LangfuseTraceClient): Promise<string> {
    const ai = this.require();
    const input = enhancePrompt(original, transcript);
    const generation = trace?.generation({ name: 'enhance', model: this.model, input });
    try {
      const res = await ai.models.generateContent({ model: this.model, contents: input });
      const output = this.stripFences((res.text ?? '').trim());
      generation?.end({ output, usageDetails: this.usageFrom(res) });
      return output;
    } catch (err) {
      generation?.end({ level: 'ERROR', statusMessage: (err as Error).message });
      throw err;
    }
  }

  /**
   * Suggests a single folder name and a few tags for a note. Best-effort — returns
   * empty suggestions if the model misbehaves (the caller treats it as optional).
   */
  async organise(original: string, transcript: string, enhanced: string, trace?: LangfuseTraceClient): Promise<{ folder: string | null; tags: string[] }> {
    const ai = this.require();
    const prompt = [
      'You categorise a personal note. Return ONLY minified JSON, no prose, no code fences.',
      'Shape: {"folder": string, "tags": string[]}',
      '- "folder": ONE short, general category (1-3 words, Title Case), e.g. "Work", "College", "Ideas", "Health".',
      '- "tags": 2-5 short lowercase keywords describing the content. No "#". No duplicates.',
      'Base it on the note below. Be concise and faithful — do not invent unrelated topics.',
      '',
      `NOTE:\n${enhanced || original || transcript || '(empty)'}`,
    ].join('\n');

    const generation = trace?.generation({ name: 'organise', model: this.model, input: prompt });
    let res: GenerateContentResponse;
    try {
      res = await ai.models.generateContent({ model: this.model, contents: prompt });
    } catch (err) {
      generation?.end({ level: 'ERROR', statusMessage: (err as Error).message });
      throw err;
    }
    const raw = this.stripFences((res.text ?? '').trim());
    try {
      const parsed = JSON.parse(raw) as { folder?: unknown; tags?: unknown };
      const folder = typeof parsed.folder === 'string' && parsed.folder.trim() ? parsed.folder.trim().slice(0, 60) : null;
      const tags = Array.isArray(parsed.tags)
        ? [...new Set(parsed.tags.filter((t): t is string => typeof t === 'string').map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 5)
        : [];
      generation?.end({ output: { folder, tags }, usageDetails: this.usageFrom(res) });
      return { folder, tags };
    } catch {
      this.logger.warn('organise(): could not parse Gemini JSON; skipping suggestions');
      generation?.end({ output: raw, level: 'WARNING', statusMessage: 'unparseable JSON', usageDetails: this.usageFrom(res) });
      return { folder: null, tags: [] };
    }
  }

  /** Maps a Gemini response's token counts to Langfuse's usage shape (for cost/latency). */
  private usageFrom(res: GenerateContentResponse): GenerationUsage | undefined {
    const u = res.usageMetadata;
    if (!u) return undefined;
    return {
      input: u.promptTokenCount ?? 0,
      output: u.candidatesTokenCount ?? 0,
      total: u.totalTokenCount ?? 0,
    };
  }

  private require(): GoogleGenAI {
    if (!this.client) throw new ServiceUnavailableException('Gemini is not configured');
    return this.client;
  }

  /** Uploaded files start in PROCESSING; poll until ACTIVE before referencing. */
  private async waitForActive(name: string | undefined, uri: string | undefined): Promise<string> {
    const ai = this.require();
    if (!name || !uri) throw new ServiceUnavailableException('Gemini file upload returned no reference');
    for (let i = 0; i < 30; i++) {
      const file = await ai.files.get({ name });
      if (file.state === 'ACTIVE') return file.uri ?? uri;
      if (file.state === 'FAILED') throw new ServiceUnavailableException('Gemini failed to process the audio file');
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new ServiceUnavailableException('Timed out waiting for Gemini to process the audio');
  }

  /** Models sometimes wrap HTML in ```html fences despite instructions. */
  private stripFences(text: string): string {
    return text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
}
