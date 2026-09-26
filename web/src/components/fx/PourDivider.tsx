/**
 * Transición "espresso vertido": el negro de la sección anterior gotea como ristretto
 * sobre el tostado de la siguiente.
 * Las gotas se estiran con el scroll (scrub). Va entre capítulos como corte de escena.
 */
import { useRef } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import { cn } from '@/lib/cn';

// Gotas: posición x (0-1000), ancho, largo máximo.
const DRIPS = [
  [60, 26, 120], [150, 18, 70], [235, 34, 190], [330, 20, 90], [410, 28, 150], [505, 40, 230],
  [600, 22, 110], [680, 30, 170], [770, 18, 80], [850, 36, 200], [940, 24, 120],
] as const;

export function PourDivider({ className, flip }: { className?: string; flip?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          '[data-drip]',
          { scaleY: 0.08 },
          {
            scaleY: 1, ease: 'none', stagger: { each: 0.03, from: 'random' },
            scrollTrigger: { trigger: ref.current, start: 'top 95%', end: 'bottom 35%', scrub: 0.8 },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 1000 300"
      preserveAspectRatio="none"
      className={cn('pointer-events-none relative z-10 -my-px block h-[18vh] w-full bg-roast-700 md:h-[26vh]', flip && 'rotate-180', className)}
    >
      <defs>
        <linearGradient id="pour-drip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0b0b" />
          <stop offset="1" stopColor="#1a0f06" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="42" fill="#0b0b0b" />
      <path d="M0 40 Q 250 58 500 44 T 1000 46 V 30 H 0 Z" fill="#0b0b0b" />
      {DRIPS.map(([x, wd, len]) => (
        <g key={x} data-drip style={{ transformOrigin: `${x}px 40px`, transformBox: 'view-box' }}>
          <path
            d={`M${x - wd / 2} 40 C ${x - wd / 2} ${40 + len * 0.6}, ${x - wd / 3} ${40 + len}, ${x} ${40 + len} C ${x + wd / 3} ${40 + len}, ${x + wd / 2} ${40 + len * 0.6}, ${x + wd / 2} 40 Z`}
            fill="url(#pour-drip)"
          />
          <ellipse cx={x} cy={40 + len - wd * 0.25} rx={wd * 0.18} ry={wd * 0.12} fill="#e8d5b5" opacity="0.18" />
        </g>
      ))}
    </svg>
  );
}
