import { useMemo } from 'react';
import { usePrefersReducedMotion } from './useMedia';

export type Tier = 'high' | 'low';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Decide cuánto "cine" puede aguantar el dispositivo.
 * high → escudo 3D, más partículas. low → escudo SVG, menos partículas.
 */
export function useDeviceTier() {
  const reduced = usePrefersReducedMotion();
  return useMemo(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const saveData = nav.connection?.saveData ?? false;
    const webgl = hasWebGL();
    const tier: Tier = !reduced && webgl && !saveData && cores >= 6 && memory >= 4 ? 'high' : 'low';
    return { tier, webgl, reduced, particles: tier === 'high' ? 1 : 0.45 };
  }, [reduced]);
}
