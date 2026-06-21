'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { WaveBars } from '@/components/ui/wave-bars';
import { useToast } from '@/components/ui/toast';
import { useRecorder } from '@/hooks/use-recorder';
import { useSpeechTranscript } from '@/hooks/use-speech-transcript';
import { fmtDuration, uploadRecording } from '@/lib/recordings';

interface RecordingRailProps {
  /** Resolves the note id, creating a draft first if this is a new note. */
  ensureNoteId: () => Promise<string | null>;
  /** Called after the recording is uploaded + processing is queued. */
  onSaved: (noteId: string) => void;
}

/** Imperative handle so the editor's Save button can flush an in-progress recording. */
export interface RecordingRailHandle {
  isRecording: boolean;
  /** Stop an active recording and upload it. Does NOT navigate (the editor does). */
  finalize: () => Promise<void>;
}

/** The Hi-Fi recording rail: capture the room while you keep typing (clay = recording). */
export const RecordingRail = forwardRef<RecordingRailHandle, RecordingRailProps>(
  function RecordingRail({ ensureNoteId, onSaved }, ref) {
    const toast = useToast();
    const recorder = useRecorder();
    const speech = useSpeechTranscript();
    const [uploading, setUploading] = useState(false);
    const noteIdRef = useRef<string | null>(null);

    const recording = recorder.state === 'recording';

    async function handleStart() {
      const id = await ensureNoteId();
      if (!id) {
        toast.show('Add a title or some text first');
        return;
      }
      noteIdRef.current = id;
      const ok = await recorder.start();
      if (ok && speech.supported) speech.start();
    }

    /** Stop + upload. `navigate` lets the editor's Save flush without redirecting. */
    async function doStop(navigate: boolean) {
      speech.stop();
      const blob = await recorder.stop();
      const noteId = noteIdRef.current;
      if (!noteId) return;
      setUploading(true);
      try {
        await uploadRecording(noteId, blob, recorder.mimeType, recorder.elapsed);
        toast.show('Recording saved — improving soon');
        if (navigate) onSaved(noteId);
      } catch (e) {
        toast.show(e instanceof Error ? e.message : 'Upload failed');
        recorder.reset();
        noteIdRef.current = null; // clear so a retry re-resolves the note id
      } finally {
        setUploading(false);
      }
    }

    // Mirror live values into refs so the imperative handle always sees the latest.
    const recordingRef = useRef(recording);
    recordingRef.current = recording;
    const doStopRef = useRef(doStop);
    doStopRef.current = doStop;

    useImperativeHandle(
      ref,
      () => ({
        get isRecording() {
          return recordingRef.current;
        },
        finalize: () => doStopRef.current(false),
      }),
      [],
    );

    return (
      <div
        className="col"
        style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', background: 'var(--surface-2)', padding: '20px 18px' }}
      >
        {!recording && !uploading && (
          <div className="col center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, margin: 'auto 0', textAlign: 'center' }}>
            <button
              className="btn btn-rec"
              style={{ width: 64, height: 64, borderRadius: 99, padding: 0 }}
              onClick={handleStart}
              aria-label="Start recording"
            >
              <Icon name="mic" size={26} />
            </button>
            <Button variant="primary" size="block" onClick={handleStart}>Start recording</Button>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 15, margin: 0, maxWidth: 200, lineHeight: 1.5 }}>
              Capture the room — a clean note generates after you save.
            </p>
            {recorder.error && <p style={{ color: 'var(--rec)', fontSize: 12.5, margin: 0 }}>{recorder.error}</p>}
          </div>
        )}

        {recording && (
          <>
            <div className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="rec-pill"><span className="live" /> {fmtDuration(recorder.elapsed)}</span>
              <button className="btn btn-soft btn-sm" onClick={() => doStop(true)}><Icon name="stop" size={15} /> Stop</button>
            </div>
            <WaveBars live n={26} h={42} />
            <span className="eyebrow">Live transcript</span>
            <div className="prose-nenap font-mono grow scrollable" style={{ flex: 1, overflowY: 'auto', fontSize: 13, color: 'var(--ink-2)' }}>
              {speech.supported ? (
                <p>
                  {speech.finalText} <span style={{ color: 'var(--ink-3)' }}>{speech.interim}</span>
                  {!speech.finalText && !speech.interim && <span style={{ color: 'var(--ink-3)' }}>Listening…</span>}
                </p>
              ) : (
                <p style={{ color: 'var(--ink-3)' }}>Live transcript isn’t supported in this browser — the recording still saves and is transcribed after.</p>
              )}
              {speech.error && <p style={{ color: 'var(--ink-3)', marginTop: 6 }}>{speech.error}</p>}
            </div>
          </>
        )}

        {uploading && (
          <div className="col center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, margin: 'auto 0' }}>
            <WaveBars n={20} h={36} />
            <span className="eyebrow">Saving your recording…</span>
          </div>
        )}
      </div>
    );
  },
);
