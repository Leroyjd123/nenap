'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { WaveBars } from '@/components/ui/wave-bars';
import { SaveNoteModal } from '@/components/editor/save-note-modal';
import { useToast } from '@/components/ui/toast';
import { useRecorder } from '@/hooks/use-recorder';
import { useSpeechTranscript } from '@/hooks/use-speech-transcript';
import { useCreateNote, useFolders } from '@/lib/queries';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { fmtDuration, uploadRecording } from '@/lib/recordings';

/** Record-first capture (from the dashboard): record now, name it on save, repeat. */
export function RecordFirst() {
  useDocumentTitle('Record — Nenap');
  const router = useRouter();
  const toast = useToast();
  const recorder = useRecorder();
  const speech = useSpeechTranscript();
  const folders = useFolders();
  const createNote = useCreateNote();

  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const blobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);

  const paused = recorder.state === 'paused';
  const active = recorder.state === 'recording' || paused;

  async function start() {
    const ok = await recorder.start();
    if (ok && speech.supported) speech.start();
  }

  async function stop() {
    speech.stop();
    durationRef.current = recorder.elapsed;
    blobRef.current = await recorder.stop();
    setSaveOpen(true);
  }

  async function handleSave({ title, folderId, tagNames, autoOrganise }: {
    title?: string;
    folderId: string | null;
    tagNames: string[];
    autoOrganise?: boolean;
  }) {
    if (!blobRef.current) return;
    setSaving(true);
    try {
      const note = await createNote.mutateAsync({
        title: title || 'Untitled recording',
        originalContent: speech.finalText ? `<p>${speech.finalText}</p>` : '',
        folderId,
        tagNames,
        autoOrganise,
      });
      await uploadRecording(note.id, blobRef.current, recorder.mimeType, durationRef.current);
      // Async: don't block on processing — let them keep capturing.
      toast.show('Saved — improving your note in the background');
      setSaveOpen(false);
      setSessionCount((c) => c + 1);
      // Reset for the next recording in this session.
      blobRef.current = null;
      durationRef.current = 0;
      speech.reset();
      recorder.reset();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Could not save recording');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(800px 500px at 50% 0%, var(--rec-tint), transparent 65%), var(--bg)' }}
    >
      <header className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px var(--pad)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.push('/')}>
          <Icon name="x" size={17} /> {sessionCount > 0 ? 'Done' : 'Close'}
        </button>
        <Brand className="text-[18px]" />
        {active ? (
          <span className="rec-pill">
            <span className="live" style={paused ? { animation: 'none', opacity: 0.5 } : undefined} />
            {paused ? 'Paused' : fmtDuration(recorder.elapsed)}
          </span>
        ) : (
          <span style={{ width: 60, textAlign: 'right' }}>
            {sessionCount > 0 && <span className="meta">{sessionCount} saved</span>}
          </span>
        )}
      </header>

      <div className="flex-1 w-full max-w-[560px] mx-auto px-[var(--pad)] flex flex-col justify-center">
        {!active && recorder.state !== 'stopped' && (
          <div className="col center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <button className="btn btn-rec" style={{ width: 84, height: 84, borderRadius: 99, padding: 0, borderWidth: 2 }} onClick={start} aria-label="Start recording">
              <Icon name="mic" size={32} />
            </button>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 16 }}>
              {sessionCount > 0 ? 'Record another, or tap Done.' : 'Capture first, name it later.'}
            </p>
            {recorder.error && <p style={{ color: 'var(--rec)', fontSize: 13 }}>{recorder.error}</p>}
          </div>
        )}

        {active && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: 24, boxShadow: 'var(--shadow-1)' }}>
            <WaveBars live={!paused} n={48} h={64} seed={3} />
            <hr className="hr" style={{ margin: '18px 0' }} />
            <span className="eyebrow">Live transcript</span>
            <div className="prose-nenap font-mono" style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-2)' }}>
              {speech.supported ? (
                <p>{speech.finalText} <span style={{ color: 'var(--ink-3)' }}>{speech.interim || (!speech.finalText && 'Listening…')}</span></p>
              ) : (
                <p style={{ color: 'var(--ink-3)' }}>Live transcript isn’t supported here — the audio still saves and is transcribed after.</p>
              )}
              {speech.error && <p style={{ color: 'var(--ink-3)', marginTop: 6 }}>{speech.error}</p>}
            </div>
          </div>
        )}
      </div>

      {active && (
        <div className="col center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, padding: '16px 0 28px' }}>
          <div className="row center" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="btn btn-soft btn-icon"
              style={{ width: 52, height: 52, borderRadius: 99 }}
              onClick={() => (paused ? recorder.resume() : recorder.pause())}
              aria-label={paused ? 'Resume recording' : 'Pause recording'}
            >
              <Icon name={paused ? 'play' : 'stop'} size={20} />
            </button>
            <button className="btn btn-rec" style={{ width: 70, height: 70, borderRadius: 99, padding: 0, borderWidth: 2 }} onClick={stop} aria-label="Stop and save">
              <Icon name="check" size={26} />
            </button>
            <span style={{ width: 52 }} />
          </div>
          <span className="meta">{paused ? 'paused — resume or save' : 'pause, or save & name'}</span>
        </div>
      )}

      <SaveNoteModal
        open={saveOpen}
        onClose={() => !saving && setSaveOpen(false)}
        folders={folders.data ?? []}
        askTitle
        showAutoOrganise
        title="Save recording"
        subtitle="Give it a title — a clean note generates in the background."
        saving={saving}
        onConfirm={handleSave}
      />
    </main>
  );
}
