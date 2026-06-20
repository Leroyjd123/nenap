/** Animated waveform bars (.wave / .wave.live) — ported from the Hi-Fi design. */
export function WaveBars({ live, n = 34, h = 46, seed = 1 }: { live?: boolean; n?: number; h?: number; seed?: number }) {
  const bars = Array.from({ length: n }, (_, i) => {
    const v = 0.22 + 0.78 * Math.abs(Math.sin(i * 0.9 + seed) * Math.cos(i * 0.37 + seed * 2));
    return (
      <i
        key={i}
        style={{
          height: `${Math.round(v * h)}px`,
          animationDelay: live ? `${-(i % 7) * 0.13}s` : undefined,
          animationDuration: live ? `${0.7 + (i % 5) * 0.12}s` : undefined,
        }}
      />
    );
  });
  return (
    <div className={`wave${live ? ' live' : ''}`} style={{ height: `${h}px` }}>
      {bars}
    </div>
  );
}
