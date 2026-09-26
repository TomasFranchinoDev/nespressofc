/**
 * 01 · HERO CINEMATIC
 * Sección alta (≈3 pantallas) con un "escenario" sticky. Un único timeline de GSAP, scrubbeado
 * por el scroll, maneja todo:
 *   0.00 → 1.00  dolly-in del fondo
 *   0.02 → 0.45  "NESPRESSO" explota hacia afuera, letra por letra
 *   0.30 → 0.60  entra el lema "La suerte del principiante no puede fallar"
 *   0.55 → 0.92  el escudo viaja al logo del navbar y se desvanece
 *   0.82 → 1.00  fundido a negro → corte al capítulo 2
 * La entrada (post-preloader) es otro timeline, sobre propiedades distintas (sin conflictos).
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { usePrefersReducedMotion } from '@/hooks/useMedia';
import { Crest } from '@/components/ui/Crest';
import { Particles } from '@/components/fx/Particles';
import { CLUB } from '@/data/club';
import { cn } from '@/lib/cn';
import { HeroBackdrop } from './HeroBackdrop';
import { heroState } from './state';

const Crest3D = lazy(() => import('@/components/three/Crest3D'));
/** Precarga del chunk 3D (la usa el preloader para no mostrar un hueco). */
export const preloadCrest3D = () => import('@/components/three/Crest3D');

const TITLE = 'NESPRESSO'.split('');

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const { tier } = useDeviceTier();
  const reduced = usePrefersReducedMotion();
  const [crestActive, setCrestActive] = useState(true);
  const use3D = tier === 'high';

  // Puntero → tilt del escudo.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      heroState.px = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  /* ─── Timeline de scroll ─────────────────────────────────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const spread = desktop ? 13 : 16; // vw por letra desde el centro

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            invalidateOnRefresh: true,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
            onUpdate: (self) => (heroState.progress = self.progress),
            onToggle: (self) => setCrestActive(self.isActive || self.progress < 1),
          },
        });

        tl.to('[data-hero-bg]', { scale: 1.34, yPercent: -3, duration: 1 }, 0)
          .to('[data-bar]', { yPercent: (i) => (i === 0 ? -100 : 100), duration: 0.18 }, 0)
          .to('[data-hero-meta]', { y: -40, opacity: 0, duration: 0.22 }, 0.02)
          .to(
            '[data-hero-char]',
            {
              x: (i) => `${(i - (TITLE.length - 1) / 2) * spread}vw`,
              rotate: (i) => (i - 4) * 6,
              opacity: 0,
              filter: 'blur(12px)',
              duration: 0.4,
            },
            0.03,
          )
          .fromTo('[data-tagline-line]', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, stagger: 0.06, duration: 0.2 }, 0.3)
          .to('[data-tagline]', { opacity: 0, y: -60, duration: 0.14 }, 0.74)
          .to(
            '[data-crest-wrap]',
            {
              // Destino: el escudo del navbar (centro aprox. según el padding del nav).
              x: () => (desktop ? 58 : 42) - window.innerWidth / 2,
              y: () => {
                const w = root.current!.querySelector<HTMLElement>('[data-crest-wrap]')!;
                return (desktop ? 45 : 37) - (w.offsetTop + w.offsetHeight / 2);
              },
              scale: () => 32 / (root.current!.querySelector<HTMLElement>('[data-crest-wrap]')!.offsetHeight * 0.9),
              duration: 0.34,
              ease: 'power2.inOut',
            },
            0.56,
          )
          .to('[data-crest-wrap]', { opacity: 0, duration: 0.06 }, 0.86)
          .to('[data-hero-shade]', { opacity: 1, duration: 0.2 }, 0.8)
          .to('[data-scroll-cue]', { opacity: 0, duration: 0.08 }, 0);
      });
    },
    { scope: root },
  );

  /* ─── Entrada después del preloader ──────────────────────── */
  useGSAP(
    () => {
      if (!ready) return;
      if (reduced) {
        heroState.intro = 1;
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: 'espresso' } });
      tl.fromTo('[data-bar]', { scaleY: 1 }, { scaleY: 0.12, duration: 1.4, ease: 'crema' }, 0)
        .fromTo('[data-hero-char-inner]', { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.05 }, 0.35)
        .fromTo(heroState, { intro: 0 }, { intro: 1, duration: 2.4, ease: 'power2.out' }, 0.2)
        .fromTo('[data-crest-inner]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.8 }, 0.25)
        .fromTo('[data-hero-meta-inner]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.9)
        .fromTo('[data-scroll-cue-inner]', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.4);
    },
    { scope: root, dependencies: [ready, reduced] },
  );

  return (
    <section
      id="inicio"
      ref={root}
      aria-label="Nespresso FC"
      className={cn('relative', reduced ? 'h-svh' : 'h-[240vh] md:h-[320vh]')}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <HeroBackdrop />
        <Particles mode="steam" density={use3D ? 1 : 0.5} className="z-[1] opacity-90" />
        <Particles mode="dust" density={use3D ? 0.8 : 0.4} className="z-[1]" />

        {/* Escudo: 3D si el equipo aguanta, SVG si no. */}
        <div
          data-crest-wrap
          className="absolute left-1/2 top-[13svh] z-[3] -ml-[21svh] h-[42svh] w-[42svh] will-change-transform md:top-[10svh] md:-ml-[25svh] md:h-[50svh] md:w-[50svh]"
        >
          <div data-crest-inner className="h-full w-full">
            {use3D ? (
              <Suspense fallback={<Crest variant="kit" className="mx-auto h-full w-auto opacity-0" />}>
                <Crest3D active={crestActive} />
              </Suspense>
            ) : (
              <Crest variant="kit" className="mx-auto h-full w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]" />
            )}
          </div>
        </div>

        {/* Título + meta */}
        <div className="absolute inset-x-0 bottom-[8svh] z-[4] px-4 md:bottom-[5svh] md:px-8">
          <div data-hero-meta className="mb-2 flex items-end justify-between md:mb-4">
            <span data-hero-meta-inner className="kicker text-crema">Fútbol 6 · {CLUB.city}</span>
            <span data-hero-meta-inner className="kicker hidden sm:block">Est. {CLUB.founded}</span>
          </div>
          <h1 aria-label="Nespresso FC" className="font-display flex justify-center text-[20.5vw] leading-[0.78] text-white md:text-[17.2vw]">
            {TITLE.map((c, i) => (
              <span key={i} data-hero-char className="inline-block will-change-transform" aria-hidden>
                <span className="inline-block overflow-hidden pb-[0.04em] align-bottom">
                  <span data-hero-char-inner className="inline-block">{c}</span>
                </span>
              </span>
            ))}
          </h1>
          <div data-hero-meta className="mt-3 flex items-start justify-between gap-6 md:mt-5">
            <p data-hero-meta-inner className="max-w-sm font-sub text-sm uppercase tracking-[0.18em] text-white/75 md:text-base">
              Intenso en la cancha. <span className="text-crema">Cremoso en el tercer tiempo.</span>
            </p>
          </div>
        </div>

        {/* Lema: entra donde estaba el título (sin movimiento, se omite: se superpondría al título). */}
        {!reduced && (
        <p
          data-tagline
          className="font-display absolute inset-x-0 bottom-[16svh] z-[4] px-4 text-center text-[11.5vw] leading-[0.9] text-crema md:bottom-[12svh] md:text-[7.4vw]"
        >
          {['“La suerte del principiante', 'no puede fallar”'].map((l) => (
            <span key={l} className="block overflow-hidden">
              {/* transform inline (no clase de Tailwind): GSAP lo lee y lo reemplaza sin sumarse. */}
              <span data-tagline-line className="block" style={reduced ? undefined : { transform: 'translateY(110%)' }}>
                {l}
              </span>
            </span>
          ))}
        </p>
        )}

        {/* Indicador de scroll */}
        <div data-scroll-cue className="absolute bottom-6 right-4 z-[5] md:right-8">
          <div data-scroll-cue-inner className="flex items-center gap-3">
          <span className="kicker hidden md:block">Deslizá para extraer</span>
          <span className="relative block h-10 w-px overflow-hidden bg-white/20">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_var(--ease-crema)_infinite] bg-crema motion-reduce:animate-none" />
          </span>
          </div>
        </div>

        {/* Letterbox cinematográfico */}
        {!reduced && (
          <>
            <div data-bar aria-hidden className="absolute inset-x-0 top-0 z-[6] h-[50svh] origin-top bg-ink-950" />
            <div data-bar aria-hidden className="absolute inset-x-0 bottom-0 z-[6] h-[50svh] origin-bottom bg-ink-950" />
          </>
        )}
        <div data-hero-shade aria-hidden className="pointer-events-none absolute inset-0 z-[7] bg-ink-950 opacity-0" />
      </div>
    </section>
  );
}
