'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';

const STEPS = [
  'Reading your notes & comments',
  'Listening back through the transcript',
  'Tidying the structure',
  'Almost there…',
];

/** The one gentle AI flourish: a breathing orb while the note is being improved. */
export function EnhancingOverlay() {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(8);

  useEffect(() => {
    const a = window.setInterval(() => setStep((x) => Math.min(x + 1, STEPS.length - 1)), 1400);
    const b = window.setInterval(() => setPct((p) => Math.min(p + 4 + Math.random() * 6, 94)), 400);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);

  return (
    <div className="enhancing">
      <div className="enh-orb">
        <div className="ring" />
        <div className="ring r2" />
        <div className="ring r3" />
        <div className="core">
          <Icon name="spark" size={26} />
        </div>
      </div>
      <div className="enh-label">Improving your note</div>
      <div className="enh-steps">{STEPS[step]}</div>
      <div className="enh-bar">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
