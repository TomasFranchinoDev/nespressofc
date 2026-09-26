/**
 * Primitivas de scroll (GSAP):
 *  - <Parallax>: la imagen se desplaza más lento/rápido que la página.
 *  - <MaskReveal>: el contenedor se abre con clip-path mientras la imagen "se asienta" (scale 1.2 → 1).
 * Ambas se desactivan con "reducir movimiento".
 */
import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import { cn } from '@/lib/cn';

export function Parallax({
  children, speed = 12, className, innerClassName,
}: { children: ReactNode; speed?: number; className?: string; innerClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          '[data-parallax-inner]',
          { yPercent: -speed },
          {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <div
        data-parallax-inner
        className={cn('absolute inset-x-0 will-change-transform', innerClassName)}
        style={{ top: `-${speed}%`, bottom: `-${speed}%` }}
      >
        {children}
      </div>
    </div>
  );
}

export function MaskReveal({
  children, className, from = 'inset(18% 12% 18% 12% round 6px)', scrub = true,
}: { children: ReactNode; className?: string; from?: string; scrub?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const st = { trigger: ref.current, start: 'top 90%', end: 'top 30%', scrub: scrub ? 0.6 : false, once: !scrub };
        gsap.fromTo(ref.current, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: scrub ? 'none' : 'espresso', duration: 1.4, scrollTrigger: st });
        gsap.fromTo('[data-mask-inner]', { scale: 1.25 }, { scale: 1, ease: scrub ? 'none' : 'espresso', duration: 1.6, scrollTrigger: st });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <div data-mask-inner className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
