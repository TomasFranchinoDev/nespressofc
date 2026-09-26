/**
 * Misma mesa, misma gente, otra bandera: dos fotos casi idénticas.
 * El corte se mueve solo con el scroll hasta que el usuario lo agarra (drag o teclado).
 */
import { useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { Img } from '@/components/ui/Img';

export function CompareFlags() {
  const ref = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);
  const pos = useMotionValue(100); // % visible de la foto de arriba (Nespresso)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 35%'] });
  const auto = useTransform(scrollYProgress, [0.15, 0.85], [96, 4]);
  useMotionValueEvent(auto, 'change', (v) => !touched && pos.set(v));
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(pos, (v) => `${v}%`);

  const setFromPointer = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[3/4] w-full touch-pan-y select-none overflow-hidden rounded-2xl ring-1 ring-white/10"
      onPointerDown={(e) => {
        setTouched(true);
        setFromPointer(e.clientX);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => e.buttons === 1 && setFromPointer(e.clientX)}
      data-cursor="Arrastrá"
    >
      <Img slug="tercer-tiempo-malvinas" sizes="(min-width: 768px) 40vw, 100vw" className="absolute inset-0 h-full w-full" />
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        <Img slug="tercer-tiempo-nespresso" sizes="(min-width: 768px) 40vw, 100vw" className="h-full w-full" />
      </motion.div>
      <motion.div aria-hidden className="absolute inset-y-0 w-px bg-crema" style={{ left }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-crema font-sub text-sm text-ink-950 shadow-lg">
          ⟷
        </span>
      </motion.div>
      <span className="kicker absolute left-3 top-3 rounded-full bg-ink-950/70 px-3 py-1 text-crema backdrop-blur">Nespresso</span>
      <span className="kicker absolute right-3 top-3 rounded-full bg-ink-950/70 px-3 py-1 text-[#9fd3ff] backdrop-blur">Malvinas</span>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={100}
        aria-label="Comparar bandera de Nespresso con bandera de Malvinas"
        className="absolute inset-x-0 bottom-0 h-8 w-full cursor-pointer opacity-0"
        onChange={(e) => {
          setTouched(true);
          pos.set(Number(e.target.value));
        }}
      />
    </div>
  );
}
