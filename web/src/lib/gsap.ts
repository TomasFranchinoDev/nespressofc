/**
 * Registro único de GSAP y sus plugins.
 * Importá SIEMPRE desde acá (no desde 'gsap' directo) para garantizar que
 * ScrollTrigger/SplitText estén registrados y que existan los eases del sistema.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

// Mismas curvas que en lib/motion.ts y en los tokens CSS (--ease-*).
CustomEase.create('espresso', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('crema', 'M0,0 C0.65,0 0.35,1 1,1');

gsap.defaults({ ease: 'espresso', duration: 0.9 });

// En mobile la barra de direcciones cambia el alto del viewport al scrollear:
// no queremos recalcular todos los triggers por eso.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Media queries compartidas para gsap.matchMedia(). */
export const MQ = {
  desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };

// Solo en desarrollo: acceso desde la consola para depurar triggers.
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });
