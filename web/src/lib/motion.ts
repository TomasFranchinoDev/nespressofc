/**
 * Tokens de movimiento para Motion (framer).
 * Regla de convivencia: Motion anima lo que depende de EVENTOS (hover, click, montaje).
 * GSAP anima lo que depende del SCROLL. Nunca la misma propiedad del mismo elemento.
 */
import type { Transition, Variants } from 'motion/react';

export const EASE = {
  espresso: [0.16, 1, 0.3, 1] as const,
  crema: [0.65, 0, 0.35, 1] as const,
};

export const DUR = { micro: 0.5, base: 0.9, cine: 1.4 } as const;

export const SPRING = {
  ristretto: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  lungo: { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 } satisfies Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: DUR.base, ease: EASE.espresso } },
};

export const stagger = (each = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
});
