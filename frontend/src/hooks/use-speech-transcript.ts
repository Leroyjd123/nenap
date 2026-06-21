'use client';

import { useCallback, useRef, useState } from 'react';

// Minimal typing for the Web Speech API (not in TS's DOM lib).
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
}
type SRCtor = new () => SpeechRecognitionLike;

function getCtor(): SRCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Live transcript via the browser's Web Speech API — a real-time affordance only.
 * Gemini produces the canonical transcript on save (Phase 4). Best in Chrome/Edge.
 */
export function useSpeechTranscript() {
  const ctor = getCtor();
  const supported = !!ctor;
  const [finalText, setFinalText] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const start = useCallback(() => {
    if (!ctor) return;
    setError(null);
    const rec = new ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) setFinalText((prev) => (prev ? `${prev} ` : '') + r[0].transcript.trim());
        else interimChunk += r[0].transcript;
      }
      setInterim(interimChunk);
    };
    rec.onerror = (e) => {
      // 'no-speech'/'aborted' are benign (silence, manual stop); only surface real faults.
      if (e?.error && e.error !== 'no-speech' && e.error !== 'aborted') {
        setError('Live transcript paused — the recording is still capturing audio.');
      }
    };
    try {
      rec.start();
      recRef.current = rec;
    } catch {
      /* already started */
    }
  }, [ctor]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setInterim('');
  }, []);

  const reset = useCallback(() => {
    setFinalText('');
    setInterim('');
    setError(null);
  }, []);

  return { supported, finalText, interim, error, start, stop, reset };
}
