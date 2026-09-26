/**
 * Capa de "película" global: grano + viñeta.
 * El ruido se genera UNA vez en un canvas y se anima moviendo el background (barato para la GPU).
 */
import { useEffect, useState } from 'react';

function makeNoise(size = 180) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export function FilmGrain({ opacity = 0.075 }: { opacity?: number }) {
  const [src, setSrc] = useState<string>();
  useEffect(() => setSrc(makeNoise()), []);
  if (!src) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" style={{ opacity }}>
      <div
        className="absolute -inset-[20%] animate-grain mix-blend-overlay motion-reduce:animate-none"
        style={{ backgroundImage: `url(${src})`, backgroundSize: '180px 180px' }}
      />
    </div>
  );
}

export function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[65]"
      style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
    />
  );
}
