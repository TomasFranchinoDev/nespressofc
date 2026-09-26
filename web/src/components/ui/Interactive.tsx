/**
 * Interacciones con Motion: botón magnético, card con tilt 3D, mockup de celular, modal de video.
 */
import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { SPRING, EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { useFinePointer } from '@/hooks/useMedia';
import { useScrollApi } from '@/providers/SmoothScroll';

/* ─── Botón / link magnético ──────────────────────────────── */
export function MagneticButton({
  children, href, onClick, className, disabled, strength = 0.35, ...aria
}: {
  children: ReactNode; href?: string; onClick?: () => void; className?: string; disabled?: boolean; strength?: number;
  'aria-label'?: string;
}) {
  const fine = useFinePointer();
  const x = useSpring(0, SPRING.lungo);
  const y = useSpring(0, SPRING.lungo);
  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (!fine || disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  const cls = cn(
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4',
    'font-sub text-sm uppercase tracking-[0.22em] transition-colors duration-500',
    disabled ? 'cursor-not-allowed border border-white/20 text-white/60' : 'bg-crema text-ink-950',
    className,
  );
  const inner = (
    <>
      {!disabled && (
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full rounded-full bg-roast-500 transition-transform duration-500 ease-[var(--ease-espresso)] group-hover:translate-y-0"
        />
      )}
      <span className="relative z-10 flex items-center gap-3 transition-colors duration-500 group-hover:text-crema">
        {children}
      </span>
    </>
  );
  if (href && !disabled)
    return (
      <motion.a
        href={href} target="_blank" rel="noreferrer" className={cls} style={{ x, y }}
        onMouseMove={onMove} onMouseLeave={reset} data-cursor="Ir" {...aria}
      >
        {inner}
      </motion.a>
    );
  return (
    <motion.button
      type="button" className={cls} style={{ x, y }} onMouseMove={onMove} onMouseLeave={reset}
      onClick={onClick} disabled={disabled} aria-disabled={disabled} {...aria}
    >
      {inner}
    </motion.button>
  );
}

/* ─── Card con tilt 3D y reflejo que sigue al puntero ─────── */
export function TiltCard({
  children, className, max = 9,
}: { children: ReactNode; className?: string; max?: number }) {
  const fine = useFinePointer();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING.ristretto);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING.ristretto);
  const glare = useTransform(
    [px, py],
    ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(232,213,181,0.22), transparent 55%)`,
  );
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!fine) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { px.set(0.5); py.set(0.5); };
  return (
    <motion.div
      className={cn('group relative [transform-style:preserve-3d]', className)}
      style={{ rotateX: fine ? rx : 0, rotateY: fine ? ry : 0, transformPerspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
      {fine && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glare }}
        />
      )}
    </motion.div>
  );
}

/* ─── Mockup de celular ───────────────────────────────────── */
export function PhoneMockup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative aspect-[9/19] w-full overflow-hidden rounded-[2.4rem] border-[7px] border-ink-800 bg-ink-950',
        'shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(232,213,181,0.12)]',
        className,
      )}
    >
      <div aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-950" />
      {children}
    </div>
  );
}

/* ─── Modal de video (con audio) ──────────────────────────── */
export function VideoModal({
  open, onClose, src, poster, title, vertical = true,
}: { open: boolean; onClose: () => void; src: string; poster?: string; title: string; vertical?: boolean }) {
  const { stop, start } = useScrollApi();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      start();
    };
  }, [open, onClose, stop, start]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog" aria-modal="true" aria-label={title}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/92 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            className={cn('relative max-h-[88svh]', vertical ? 'aspect-[9/16] h-[88svh] max-w-full' : 'aspect-video w-full max-w-5xl')}
            initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.6, ease: EASE.espresso }}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={src} poster={poster} controls autoPlay playsInline
              className="h-full w-full rounded-2xl bg-black object-contain"
            />
            <button
              ref={closeRef} type="button" onClick={onClose}
              className="absolute -top-3 right-0 translate-y-[-100%] font-sub text-xs uppercase tracking-[0.25em] text-crema hover:text-white"
            >
              Cerrar ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
