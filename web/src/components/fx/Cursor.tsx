/**
 * Cursor custom (solo mouse/trackpad): punto crema que sigue con resorte y crece sobre
 * elementos interactivos. Muestra la etiqueta de [data-cursor="..."] si existe.
 */
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMedia';

export function Cursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.5 });
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement).closest<HTMLElement>('a,button,[data-cursor],[role="button"],input,select');
      setHover(!!el);
      setLabel(el?.dataset.cursor ?? null);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine, reduced, x, y]);

  if (!fine || reduced) return null;
  const size = label ? 78 : hover ? 40 : 10;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] flex items-center justify-center rounded-full mix-blend-difference"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: size, height: size, backgroundColor: label ? '#e8d5b5' : hover ? 'rgba(232,213,181,0.25)' : '#e8d5b5' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {label && <span className="font-sub text-[10px] uppercase tracking-[0.2em] text-ink-950">{label}</span>}
    </motion.div>
  );
}
