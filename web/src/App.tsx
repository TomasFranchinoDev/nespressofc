import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { ScrollTrigger } from '@/lib/gsap';
import { SmoothScrollProvider } from '@/providers/SmoothScroll';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { Preloader } from '@/components/layout/Preloader';
import { ChapterIndex, Navbar, ScrollProgress } from '@/components/layout/Chrome';
import { FilmGrain, Vignette } from '@/components/fx/Atmosphere';
import { Cursor } from '@/components/fx/Cursor';
import { PourDivider } from '@/components/fx/PourDivider';
import { Hero, preloadCrest3D } from '@/sections/Hero';
import { Origen } from '@/sections/Origen';
import { Identidad } from '@/sections/Identidad';
import { Plantel } from '@/sections/Plantel';
import { EnCancha } from '@/sections/EnCancha';
import { Barra } from '@/sections/Barra';
import { Torneos } from '@/sections/Torneos';
import { Sponsors } from '@/sections/Sponsors';
import { Galeria } from '@/sections/Galeria';
import { Cta } from '@/sections/Cta';

/** Resuelve cuando la foto del Hero (la que eligió el navegador según srcset) terminó de cargar. */
function heroImageLoaded() {
  return new Promise<void>((resolve) => {
    const find = () => {
      const img = document.querySelector<HTMLImageElement>('#inicio img');
      if (!img) return requestAnimationFrame(find);
      if (img.complete) return resolve();
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
    };
    find();
  });
}

/**
 * Todo lo que está debajo del Hero. Se monta de a UNA sección por vez, cediendo el hilo principal
 * entre cada una, mientras el preloader está en pantalla. Antes se montaba todo de golpe junto con el
 * Hero: ~50 ScrollTriggers, SplitText, el pin del Origen y un refresh de página completa generaban
 * tareas de 0,6–0,8 s (x4–x6 en un teléfono) justo cuando el Hero arrancaba su entrada.
 * Las secciones en sí no cambian.
 */
const REST = [PourDivider, Origen, Identidad, Plantel, EnCancha, Barra, PourDivider, Torneos, Sponsors, Galeria, Cta];

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};
const onIdle = (cb: () => void) => {
  const w = window as IdleWindow;
  return w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 150 }) : window.setTimeout(cb, 16);
};
const cancelIdle = (id: number) => {
  const w = window as IdleWindow;
  if (w.cancelIdleCallback) w.cancelIdleCallback(id);
  else clearTimeout(id);
};

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(0);
  const restDone = mounted >= REST.length;
  const { tier } = useDeviceTier();
  const restMounted = useMemo(deferred, []);

  const tasks = useMemo<Promise<unknown>[]>(
    () => [
      document.fonts.ready,
      heroImageLoaded(),
      restMounted.promise,
      ...(tier === 'high' ? [preloadCrest3D()] : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Monta la sección siguiente cuando el navegador está libre. Al terminar, un único refresh de
  // ScrollTrigger con el preloader todavía tapando: la entrada del Hero arranca con el hilo limpio.
  useEffect(() => {
    if (restDone) {
      const raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        restMounted.resolve();
      });
      return () => cancelAnimationFrame(raf);
    }
    const id = onIdle(() => setMounted((m) => m + 1));
    return () => cancelIdle(id);
  }, [mounted, restDone, restMounted]);

  // Después de la entrada, si la altura de la página cambia (imágenes, filtros), recalcular con debounce.
  useEffect(() => {
    if (!ready) return;
    // Si la altura de la página cambia (fuentes, imágenes, filtros), recalcular con debounce.
    let t = 0;
    let lastH = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [ready]);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>
        <a
          href="#origen"
          className="fixed left-4 top-4 z-[110] -translate-y-24 rounded bg-crema px-4 py-2 font-sub text-ink-950 focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <Preloader tasks={tasks} onDone={() => setReady(true)} />
        <ScrollProgress />
        {/* key: se re-montan una vez que existen todas las secciones, para observar sus capítulos. */}
        <Navbar key={`nav-${restDone}`} ready={ready} />
        <ChapterIndex key={`idx-${restDone}`} />

        <main>
          <Hero ready={ready} />
          {REST.slice(0, mounted).map((Section, i) => (
            <Section key={i} />
          ))}
        </main>

        <FilmGrain />
        <Vignette />
        <Cursor />
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
