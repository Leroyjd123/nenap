import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

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
  async transcribe(audio: Blob, mimeType: string): Promise<string> {
    const ai = this.require();
    const uploaded = await ai.files.upload({ file: audio, config: { mimeType } });
    const fileUri = await this.waitForActive(uploaded.name, uploaded.uri);

    const res = await ai.models.generateContent({
      model: this.model,
      contents: [{ role: 'user', parts: [{ fileData: { fileUri, mimeType } }, { text: TRANSCRIBE_PROMPT }] }],
    });
    return (res.text ?? '').trim();
  }

  /** Produce an enhanced HTML version from the user's note + transcript. */
  async enhance(original: string, transcript: string): Promise<string> {
    const ai = this.require();
    const res = await ai.models.generateContent({
      model: this.model,
      contents: enhancePrompt(original, transcript),
    });
    return this.stripFences((res.text ?? '').trim());
  }

  private require(): GoogleGenAI {
    if (!this.client) throw new ServiceUnavailableException('Gemini is not configured');
    return this.client;
  }

  /** Uploaded files start in PROCESSING; poll until ACTIVE before referencing. */
  private async waitForActive(name: string | undefined, uri: string | undefined): Promise<string> {
    const ai = this.require();
    if (!name || !uri) throw new Error('Gemini file upload returned no reference');
    for (let i = 0; i < 30; i++) {
      const file = await ai.files.get({ name });
      if (file.state === 'ACTIVE') return file.uri ?? uri;
      if (file.state === 'FAILED') throw new Error('Gemini failed to process the audio file');
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error('Timed out waiting for Gemini to process the audio');
  }

  /** Models sometimes wrap HTML in ```html fences despite instructions. */
  private stripFences(text: string): string {
    return text.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
}
