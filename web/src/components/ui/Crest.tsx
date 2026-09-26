/**
 * Escudo en SVG (trazado a mano sobre el logo original).
 * Variantes:
 *  - "kit": escudo marrón con N crema, como en la camiseta.
 *  - "outline": solo trazo (para el preloader, se anima con pathLength).
 * El escudo oficial con wordmark se usa como imagen (/img/escudo-800.webp).
 */
import { motion, type MotionValue } from 'motion/react';
import { cn } from '@/lib/cn';

export const CREST_PATHS = {
  outer: 'M124 124 Q516 -2 908 124 L902 420 C892 660 782 870 516 968 C250 870 140 660 130 420 Z',
  inner: 'M161 160 Q516 44 871 160 L865 420 C855 650 752 845 516 920 C280 845 177 650 167 420 Z',
  stemL: 'M367 392 H417 V710 H367 Z',
  stemR: 'M624 364 H674 V666 H624 Z',
  diag: 'M367 392 L417 392 L674 648 L674 702 Z',
  swoosh:
    'M264 340 C 350 310 440 328 505 400 C 565 468 605 560 645 640 C 675 700 702 726 738 741 C 688 752 640 740 600 700 C 555 650 520 560 472 482 C 432 417 382 362 264 340 Z',
};

const N_PATHS = [CREST_PATHS.stemL, CREST_PATHS.stemR, CREST_PATHS.diag, CREST_PATHS.swoosh];

export function Crest({
  variant = 'kit', className, title = 'Escudo de Nespresso FC',
}: { variant?: 'kit' | 'crema'; className?: string; title?: string }) {
  const kit = variant === 'kit';
  return (
    <svg viewBox="100 0 830 1000" className={cn('block', className)} role="img" aria-label={title}>
      <defs>
        <linearGradient id="crest-kit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3e14" />
          <stop offset="1" stopColor="#2a1a0e" />
        </linearGradient>
      </defs>
      <path d={CREST_PATHS.outer} fill={kit ? '#1a0f06' : '#35231a'} />
      <path d={CREST_PATHS.inner} fill={kit ? 'url(#crest-kit)' : '#e8d5b5'} />
      <g fill={kit ? '#f4ecde' : '#35231a'}>
        {N_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Escudo "dibujándose" (preloader). `progress` es 0→1. */
export function CrestOutline({ progress, className }: { progress: MotionValue<number>; className?: string }) {
  return (
    <svg viewBox="100 0 830 1000" className={cn('block', className)} aria-hidden>
      {[CREST_PATHS.outer, CREST_PATHS.inner, ...N_PATHS].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#e8d5b5"
          strokeWidth={i < 2 ? 5 : 4}
          strokeLinejoin="round"
          style={{ pathLength: progress, opacity: i < 2 ? 1 : 0.9 }}
        />
      ))}
    </svg>
  );
}
