/**
 * Partículas en canvas 2D, sin librerías:
 *  - "steam": vapor de café que sube y se disuelve (sprites radiales grandes, alfa bajo).
 *  - "dust": motas de molienda / polvo bajo reflectores (puntos chicos que titilan).
 *  - "embers": chispas de bengala (suben rápido, naranja).
 * Se pausa sola cuando no está en pantalla o la pestaña está oculta.
 */
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMedia';
import { cn } from '@/lib/cn';

type Mode = 'steam' | 'dust' | 'embers';

interface P { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; seed: number }

const PALETTE: Record<Mode, [number, number, number]> = {
  steam: [232, 213, 181],
  dust: [244, 236, 222],
  embers: [255, 138, 60],
};

function sprite(rgb: [number, number, number], soft: boolean) {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, `rgba(${rgb.join(',')},1)`);
  grad.addColorStop(soft ? 0.25 : 0.4, `rgba(${rgb.join(',')},${soft ? 0.45 : 0.6})`);
  grad.addColorStop(1, `rgba(${rgb.join(',')},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
}

export function Particles({
  mode = 'steam', density = 1, className, maxDpr = 1.5,
}: {
  mode?: Mode; density?: number; className?: string;
  /** Resolución máxima del canvas. El vapor es borroso: se ve igual a menos píxeles y cuesta mucho menos. */
  maxDpr?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d')!;
    const img = sprite(PALETTE[mode], mode === 'steam');
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let w = 0, h = 0, raf = 0, visible = true;
    const parts: P[] = [];

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const base = mode === 'steam' ? 26 : mode === 'dust' ? 70 : 55;
    const count = () => Math.round(base * density * Math.min(1.4, Math.max(0.5, w / 1200)));

    const spawn = (initial = false): P => {
      const steam = mode === 'steam';
      const ember = mode === 'embers';
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 40,
        vx: (Math.random() - 0.5) * (steam ? 0.25 : ember ? 0.9 : 0.15),
        vy: -(steam ? 0.25 + Math.random() * 0.45 : ember ? 1.2 + Math.random() * 2.2 : 0.05 + Math.random() * 0.2),
        r: steam ? 60 + Math.random() * 140 : ember ? 1.5 + Math.random() * 2.5 : 0.8 + Math.random() * 1.8,
        life: initial ? Math.random() * 400 : 0,
        max: steam ? 500 + Math.random() * 400 : ember ? 90 + Math.random() * 120 : 600 + Math.random() * 600,
        seed: Math.random() * 1000,
      };
    };

    resize();
    for (let i = 0; i < count(); i++) parts.push(spawn(true));

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = mode === 'embers' ? 'lighter' : 'source-over';
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.life++;
        p.x += p.vx + Math.sin((t / 1000) * 0.6 + p.seed) * (mode === 'steam' ? 0.35 : 0.12);
        p.y += p.vy;
        const k = p.life / p.max;
        if (k >= 1 || p.y < -p.r * 2) { parts[i] = spawn(); continue; }
        // Entra y sale suave (seno), el vapor además crece al subir.
        const fade = Math.sin(Math.PI * k);
        const alpha = mode === 'steam' ? fade * 0.06 : mode === 'dust' ? fade * (0.35 + 0.35 * Math.sin(t / 300 + p.seed)) : fade * 0.9;
        const r = mode === 'steam' ? p.r * (0.6 + k * 0.9) : p.r;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.drawImage(img, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && !document.hidden));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, [mode, density, reduced, maxDpr]);

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}
