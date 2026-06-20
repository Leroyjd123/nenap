'use client';

import { useCallback, useRef, useState } from 'react';

export type RecorderState = 'idle' | 'recording' | 'stopped';

function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? 'audio/webm';
}

/** In-browser audio recording via MediaRecorder, with an elapsed-seconds timer. */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mimeRef = useRef<string>('audio/webm');

  const cleanup = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const fullMime = pickMime();
      mimeRef.current = fullMime.split(';')[0] ?? 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType: fullMime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(250);
      recorderRef.current = recorder;
      setElapsed(0);
      setState('recording');
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
      return true;
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Allow it in your browser to record.'
          : 'Could not start recording on this device.',
      );
      cleanup();
      return false;
    }
  }, [cleanup]);

  /** Stops recording and resolves the finished audio blob. */
  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve(new Blob([], { type: mimeRef.current }));
        return;
      }
      recorder.onstop = () => {
        cleanup();
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        setState('stopped');
        resolve(blob);
      };
      recorder.stop();
    });
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    recorderRef.current = null;
    chunksRef.current = [];
    setElapsed(0);
    setState('idle');
    setError(null);
  }, [cleanup]);

  return { state, elapsed, error, mimeType: mimeRef.current, start, stop, reset };
}
