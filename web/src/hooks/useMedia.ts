import { useSyncExternalStore } from 'react';

/** Suscripción a una media query, segura para el primer render. */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)', true);
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
