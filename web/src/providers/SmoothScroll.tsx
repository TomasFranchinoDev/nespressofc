/**
 * Lenis ↔ GSAP ScrollTrigger.
 * - Lenis corre dentro del ticker de GSAP (un solo requestAnimationFrame para todo).
 * - Cada scroll de Lenis actualiza ScrollTrigger.
 * - Con "reducir movimiento" no se monta Lenis: scroll nativo.
 * - Expone scrollTo / stop / start vía contexto para navbar, índice, modales y preloader.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/useMedia';

interface ScrollApi {
  scrollTo: (target: string | number | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void;
  stop: () => void;
  start: () => void;
}

const ScrollCtx = createContext<ScrollApi | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  const scrollTo = useCallback<ScrollApi['scrollTo']>(
    (target, opts = {}) => {
      const lenis = lenisRef.current?.lenis;
      if (lenis && !reduced) {
        lenis.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.6 });
        return;
      }
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (typeof el === 'number') window.scrollTo({ top: el });
      else el?.scrollIntoView({ behavior: 'auto' });
    },
    [reduced],
  );

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo,
      stop: () => {
        lenisRef.current?.lenis?.stop();
        document.documentElement.style.overflow = 'hidden';
      },
      start: () => {
        lenisRef.current?.lenis?.start();
        document.documentElement.style.overflow = '';
      },
    }),
    [scrollTo],
  );

  return (
    <ScrollCtx.Provider value={api}>
      {!reduced && (
        <ReactLenis
          root
          ref={lenisRef}
          options={{ autoRaf: false, lerp: 0.09, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.95 }}
        >
          <LenisScrollTriggerBridge />
        </ReactLenis>
      )}
      {children}
    </ScrollCtx.Provider>
  );
}

/** Cada scroll de Lenis → ScrollTrigger.update (el instance se resuelve vía contexto de Lenis). */
function LenisScrollTriggerBridge() {
  useLenis(ScrollTrigger.update);
  return null;
}

export function useScrollApi() {
  const ctx = useContext(ScrollCtx);
  if (!ctx) throw new Error('useScrollApi debe usarse dentro de <SmoothScrollProvider>');
  return ctx;
}
