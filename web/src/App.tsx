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

export default function App() {
  const [ready, setReady] = useState(false);
  const { tier } = useDeviceTier();

  const tasks = useMemo<Promise<unknown>[]>(
    () => [document.fonts.ready, heroImageLoaded(), ...(tier === 'high' ? [preloadCrest3D()] : [])],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Con todo cargado, las alturas son definitivas: recalcular los triggers.
  useEffect(() => {
    if (!ready) return;
    ScrollTrigger.refresh();
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
        <Navbar ready={ready} />
        <ChapterIndex />

        <main>
          <Hero ready={ready} />
          <PourDivider />
          <Origen />
          <Identidad />
          <Plantel />
          <EnCancha />
          <Barra />
          <PourDivider />
          <Torneos />
          <Sponsors />
          <Galeria />
          <Cta />
        </main>

        <FilmGrain />
        <Vignette />
        <Cursor />
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
