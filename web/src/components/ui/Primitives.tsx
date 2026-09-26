/**
 * Piezas chicas reutilizables: Reveal, StatCounter, Chip, SectionHeading, Marquee.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';
import { fadeUp } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { SplitReveal } from './SplitReveal';

/* Fade-up con blur al entrar en viewport. */
export function Reveal({
  children, className, delay = 0, as = 'div',
}: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'p' | 'li' | 'span' }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
}

/* Contador que sube de 0 a `value` al entrar en viewport. Cifras tabulares = sin saltos de ancho. */
export function StatCounter({
  value, className, duration = 1.6, pad = 0,
}: { value: number; className?: string; duration?: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) return setN(value);
    const c = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value, duration, reduced]);
  return (
    <span ref={ref} className={cn('tabular', className)} aria-label={String(value)}>
      {String(n).padStart(pad, '0')}
    </span>
  );
}

export function Chip({
  children, active, className, ...rest
}: { children: ReactNode; active?: boolean; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'relative rounded-full border px-4 py-1.5 font-sub text-xs uppercase tracking-[0.2em] transition-colors duration-300',
        active
          ? 'border-crema bg-crema text-ink-950'
          : 'border-white/15 text-white/70 hover:border-crema/60 hover:text-crema',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* Encabezado de capítulo: "CAPÍTULO 03 — LA IDENTIDAD" + título con SplitText. */
export function SectionHeading({
  n, label, title, sub, className, align = 'left', titleClassName,
}: {
  n: string; label: string; title: ReactNode; sub?: ReactNode; className?: string;
  align?: 'left' | 'center'; titleClassName?: string;
}) {
  return (
    <header className={cn('relative', align === 'center' && 'text-center', className)}>
      <Reveal className={cn('mb-5 flex items-center gap-4', align === 'center' && 'justify-center')}>
        <span className="kicker text-crema">Capítulo {n}</span>
        <span className="h-px w-12 bg-crema/40" aria-hidden />
        <span className="kicker">{label}</span>
      </Reveal>
      <SplitReveal as="h2" by="lines" className={cn('font-display text-[clamp(3.4rem,11vw,10rem)] text-white', titleClassName)}>
        {title}
      </SplitReveal>
      {sub && (
        <Reveal delay={0.15} className={cn('mt-6 max-w-xl text-base text-white/65 md:text-lg', align === 'center' && 'mx-auto')}>
          {sub}
        </Reveal>
      )}
    </header>
  );
}

/* Marquee infinito (CSS). El contenido se duplica para el loop continuo. */
export function Marquee({
  children, duration = 30, reverse, className,
}: { children: ReactNode; duration?: number; reverse?: boolean; className?: string }) {
  return (
    <div className={cn('relative flex overflow-hidden', className)} aria-hidden>
      <div
        className="flex w-max shrink-0 animate-marquee motion-reduce:animate-none"
        style={{ ['--marquee-duration' as string]: `${duration}s`, animationDirection: reverse ? 'reverse' : undefined }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  );
}
