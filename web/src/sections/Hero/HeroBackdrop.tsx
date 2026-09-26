/**
 * Fondo del Hero.
 * Si existe /media/hero/manifest.json (frames generados con scripts/hero-sequence.mjs a partir
 * del video IA "dolly-in"), dibuja la secuencia en un canvas según el scroll (estilo Apple).
 * Si no existe, usa la foto real con un dolly-in simulado (scale) desde GSAP.
 */
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { Img } from '@/components/ui/Img';
import { heroState } from './state';

interface Manifest { count: number; pattern: string; width: number; height: number; mobile?: { count: number; pattern: string } }

function useSequence(canvas: React.RefObject<HTMLCanvasElement | null>) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frames: HTMLImageElement[] = [];
    let last = -1;
    const draw = () => {
      const c = canvas.current;
      if (!c || !frames.length || !c.clientWidth) return;
      // Ajusta la resolución interna al tamaño real (el canvas arranca oculto, con ancho 0).
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        last = -1;
      }
      const i = Math.min(frames.length - 1, Math.round(heroState.progress * (frames.length - 1)));
      // Si el frame exacto no bajó todavía, usa el más cercano que sí está.
      let f = frames[i];
      for (let d = 1; (!f?.complete || !f.naturalWidth) && d < frames.length; d++) f = frames[i - d] ?? frames[i + d];
      if (!f?.complete || i === last) return;
      last = i;
      const ctx = c.getContext('2d')!;
      const s = Math.max(w / f.naturalWidth, h / f.naturalHeight);
      ctx.drawImage(f, (w - f.naturalWidth * s) / 2, (h - f.naturalHeight * s) / 2, f.naturalWidth * s, f.naturalHeight * s);
    };

    fetch('/media/hero/manifest.json')
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : Promise.reject()))
      .then((m) => {
        if (cancelled) return;
        const mobile = window.innerWidth < 768 && m.mobile;
        const count = mobile ? m.mobile!.count : m.count;
        const pattern = mobile ? m.mobile!.pattern : m.pattern;
        const url = (i: number) => pattern.replace('{i}', String(i + 1).padStart(4, '0'));
        // Carga progresiva: primero 1 de cada 4 frames, después el resto.
        const order = [...Array(count).keys()].sort((a, b) => (a % 4 === 0 ? 0 : 1) - (b % 4 === 0 ? 0 : 1));
        order.forEach((i) => {
          const img = new Image();
          img.decoding = 'async';
          img.src = url(i);
          frames[i] = img;
        });
        frames[0].onload = () => setEnabled(true);
        gsap.ticker.add(draw);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      gsap.ticker.remove(draw);
    };
  }, [canvas]);

  return enabled;
}

export function HeroBackdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sequence = useSequence(canvas);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      <div data-hero-bg className="absolute inset-0 origin-[50%_45%] will-change-transform" style={{ transform: 'scale(1.08)' }}>
        {!sequence && (
          // Etalonaje horneado en la imagen (hero-bg): sin filter ni mix-blend que el GPU
          // tenga que recomponer en cada frame del dolly-in.
          <Img slug="hero-bg" priority sizes="100vw" className="h-full w-full" focus="50% 55%" />
        )}
        <canvas ref={canvas} aria-hidden className={sequence ? 'absolute inset-0 h-full w-full' : 'hidden'} />
      </div>
      {/* Degradés para leer el texto (el tinte café ya viene en la imagen). */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/10 to-ink-950" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_20%,rgba(11,11,11,0.75)_80%)]" />
    </div>
  );
}
