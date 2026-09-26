/**
 * Texto que entra línea por línea (o letra por letra) con máscara, al entrar en viewport.
 * GSAP SplitText con autoSplit: vuelve a dividir si cambian las fuentes o el ancho.
 */
import { createElement, useRef, type ReactNode } from 'react';
import { gsap, SplitText, useGSAP, MQ } from '@/lib/gsap';
import { cn } from '@/lib/cn';

interface SplitRevealProps {
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span';
  children: ReactNode;
  className?: string;
  by?: 'lines' | 'chars' | 'words';
  delay?: number;
  stagger?: number;
  /** Punto de disparo del ScrollTrigger. */
  start?: string;
  /** Si es false, anima al montar (útil dentro de pins/hero). */
  onScroll?: boolean;
}

export function SplitReveal({
  as: Tag = 'div', children, className, by = 'lines', delay = 0, stagger, start = 'top 85%', onScroll = true,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(el, {
          type: by === 'lines' ? 'lines' : by === 'words' ? 'lines,words' : 'lines,chars',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit(self) {
            el.classList.remove('split-pending');
            const targets = by === 'lines' ? self.lines : by === 'words' ? self.words : self.chars;
            return gsap.from(targets, {
              yPercent: 115,
              rotate: by === 'chars' ? 4 : 0,
              duration: by === 'chars' ? 1 : 1.15,
              stagger: stagger ?? (by === 'chars' ? 0.025 : by === 'words' ? 0.04 : 0.09),
              delay,
              ease: 'espresso',
              scrollTrigger: onScroll ? { trigger: el, start, once: true } : undefined,
            });
          },
        });
        return () => split.revert();
      });
      mm.add(MQ.reduce, () => el.classList.remove('split-pending'));
    },
    { scope: ref },
  );

  return createElement(Tag, { ref, className: cn('split-pending', className) }, children);
}
