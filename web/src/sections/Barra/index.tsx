/**
 * 06 · LA BARRA & CULTURA
 *  A. La barra a pantalla completa (sticky): se enciende con el scroll, bengalas que titilan y chispas.
 *  B. Cantito en doble marquee.
 *  C. Cultura: bancada motorizada, cambio de bandera, Coty el vice, mercado de pases, polaroids.
 */
import { useRef } from 'react';
import { motion } from 'motion/react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import { EASE } from '@/lib/motion';
import { Img } from '@/components/ui/Img';
import { Particles } from '@/components/fx/Particles';
import { PhoneMockup } from '@/components/ui/Interactive';
import { Marquee, Reveal, SectionHeading } from '@/components/ui/Primitives';
import { SplitReveal } from '@/components/ui/SplitReveal';
import { MaskReveal } from '@/components/ui/ScrollFx';
import type { ImageSlug } from '@/data/images.generated';
import { CompareFlags } from './CompareFlags';
import { useIsDesktop } from '@/hooks/useMedia';

// Posición de las bengalas en la foto (en % del encuadre original 1024×559).
const FLARES = [
  { x: 13.8, y: 44.5, s: 1 },
  { x: 82.2, y: 43, s: 0.9 },
  { x: 25.5, y: 25, s: 0.5 },
  { x: 71, y: 23, s: 0.45 },
];

// Posición inicial en desktop (x, y) y en mobile (mx, my).
const POLAROIDS: { slug: ImageSlug; caption: string; rotate: number; x: string; y: string; mx: string; my: string }[] = [
  { slug: 'previa-galpon', caption: 'La previa', rotate: -6, x: '4%', y: '6%', mx: '4%', my: '4%' },
  { slug: 'previa-selfie', caption: 'Selfie oficial', rotate: 5, x: '36%', y: '0%', mx: '38%', my: '34%' },
  { slug: 'tercer-tiempo-selfie', caption: 'Tercer tiempo', rotate: -3, x: '66%', y: '10%', mx: '8%', my: '64%' },
];

function BarraStage() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        });
        tl.fromTo('[data-barra-img]', { scale: 1.3, filter: 'brightness(0.15) saturate(0.6)' }, { scale: 1, filter: 'brightness(0.85) saturate(1.05)', duration: 0.6 }, 0)
          .fromTo('[data-flare]', { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.05 }, 0.15)
          .fromTo('[data-barra-copy]', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3 }, 0.35)
          .to('[data-barra-copy]', { opacity: 0, y: -40, duration: 0.2 }, 0.85);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-[180vh] md:h-[220vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-ink-950">
        {/* Encuadre con la proporción de la foto, siempre cubriendo: los % de las bengalas coinciden. */}
        <div className="absolute left-1/2 top-1/2 aspect-[1024/559] w-[max(100vw,calc(100svh*1.832))] -translate-x-1/2 -translate-y-1/2">
          <div data-barra-img className="absolute inset-0 will-change-transform">
            <Img slug="barra" sizes="100vw" className="h-full w-full" />
            {FLARES.map((f, i) => (
              <span
                key={i}
                data-flare
                aria-hidden
                className="absolute h-[22%] w-[14%] -translate-x-1/2 -translate-y-1/2 animate-flicker rounded-full mix-blend-screen motion-reduce:animate-none"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  scale: f.s,
                  animationDelay: `${i * 0.37}s`,
                  background: 'radial-gradient(circle, rgba(255,170,90,0.9) 0%, rgba(255,90,30,0.45) 30%, transparent 70%)',
                }}
              />
            ))}
          </div>
        </div>
        <Particles mode="embers" className="z-[2]" />
        <Particles mode="steam" density={0.7} className="z-[2] opacity-60" />
        <div aria-hidden className="absolute inset-0 z-[3] bg-gradient-to-t from-ink-950 via-ink-950/20 to-ink-950/70" />

        <div data-barra-copy className="absolute inset-x-0 bottom-[5svh] z-[4] px-4 text-center">
          <p className="kicker text-crema">Capítulo 06 · La Barra & Cultura</p>
          <h2 className="font-display mt-3 text-[clamp(3rem,7.5vw,7.5rem)] text-white [text-shadow:0_10px_40px_rgba(0,0,0,0.6)]">
            La barra más grande
            <br />
            del mundo
          </h2>
          <p className="font-sub mt-3 text-sm uppercase tracking-[0.3em] text-white/70">(según nosotros)</p>
        </div>
      </div>
    </div>
  );
}

export function Barra() {
  const desktop = useIsDesktop();
  const table = useRef<HTMLDivElement>(null);
  return (
    <section id="barra" aria-label="La Barra y Cultura" className="relative bg-ink-950">
      <BarraStage />

      <div className="relative z-10 -mt-[10svh] space-y-2 py-6">
        <Marquee duration={26} className="bg-crema py-3 text-ink-950">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="font-display px-6 text-5xl md:text-7xl">
              ¡Dale Nespresso! <span className="text-roast-500">✦</span>
            </span>
          ))}
        </Marquee>
        <Marquee duration={34} reverse className="-rotate-1 bg-roast-700 py-3">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className="font-display px-6 text-4xl text-crema md:text-6xl">
              La suerte del principiante no puede fallar <span className="text-white/50">✦</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="px-4 py-28 md:px-[6vw] md:py-40">
        <SectionHeading
          n="06"
          label="Cultura"
          title={<>Serios en la cancha.<br />El resto, no tanto.</>}
          titleClassName="text-[clamp(3rem,8vw,8rem)]"
        />

        {/* Bancada motorizada */}
        <div className="mt-20 grid items-center gap-10 md:grid-cols-12">
          <MaskReveal className="aspect-[4/3] rounded-2xl md:col-span-7">
            <Img slug="bancada-moto" sizes="(min-width: 768px) 55vw, 100vw" className="h-full w-full" />
          </MaskReveal>
          <div className="md:col-span-5">
            <p className="kicker text-crema">La bancada motorizada</p>
            <SplitReveal as="h3" className="font-display mt-3 text-[clamp(2.6rem,5vw,4.8rem)]">
              Hinchas no tenemos muchos. Pero tenemos moto.
            </SplitReveal>
            <Reveal className="mt-4 text-white/60">La bandera sale a pasear por Sunchales. El lema, también.</Reveal>
          </div>
        </div>

        {/* Cambio de bandera */}
        <div className="mt-32 grid items-center gap-10 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-5">
            <p className="kicker text-crema">Misma mesa, misma gente, otra bandera</p>
            <SplitReveal as="h3" className="font-display mt-3 text-[clamp(2.6rem,5vw,4.8rem)]">
              Las Malvinas son argentinas.
            </SplitReveal>
            <Reveal className="font-display mt-2 text-[clamp(2rem,3.6vw,3.4rem)] text-crema">Los tres puntos, también.</Reveal>
            <Reveal className="mt-5 text-white/50">Scrolleá o arrastrá la foto.</Reveal>
          </div>
          <div className="order-1 mx-auto w-full max-w-md md:order-2 md:col-span-6 md:col-start-7">
            <CompareFlags />
          </div>
        </div>

        {/* Coty, el vice */}
        <div className="mt-32 grid items-center gap-12 md:grid-cols-12">
          <div className="relative mx-auto flex w-full max-w-lg items-end justify-center gap-4 md:col-span-6">
            <motion.div
              className="w-[42%]"
              initial={{ rotate: -8, y: 40, opacity: 0 }}
              whileInView={{ rotate: -5, y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE.espresso }}
            >
              <PhoneMockup>
                <Img slug="vice-ig" sizes="200px" className="h-full w-full" />
              </PhoneMockup>
              <p className="kicker mt-3 text-center">2024</p>
            </motion.div>
            <motion.div
              className="w-[52%]"
              initial={{ rotate: 8, y: 60, opacity: 0 }}
              whileInView={{ rotate: 3, y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE.espresso, delay: 0.15 }}
            >
              <div className="overflow-hidden rounded-xl bg-white p-2 pb-10 shadow-2xl">
                <Img slug="vice-secado" sizes="280px" className="aspect-[3/4] w-full" focus="50% 30%" />
              </div>
              <p className="kicker mt-3 text-center">Después</p>
            </motion.div>
          </div>
          <div className="md:col-span-6">
            <p className="kicker text-crema">Coty · Vicepresidente y DT</p>
            <SplitReveal as="h3" className="font-display mt-3 text-[clamp(2.6rem,5vw,4.8rem)]">
              Del lado del secador al lado del secado.
            </SplitReveal>
            <Reveal className="mt-4 max-w-md text-white/65">
              Primero le secó la nuca al Chiqui Tapia. Después le tocó a él. Vicepresidente, DT este torneo y especialista en
              nucas: eso es hacer carrera.
            </Reveal>
          </div>
        </div>

        {/* Mercado de pases */}
        <div id="mercado" className="mt-32 grid scroll-mt-28 items-center gap-12 md:grid-cols-12">
          <div className="order-2 md:order-1 md:col-span-6">
            <p className="kicker text-crema">Mercado de pases</p>
            <SplitReveal as="h3" className="font-display mt-3 text-[clamp(2.6rem,5vw,4.8rem)]">
              ¿Posible fichaje?
            </SplitReveal>
            <Reveal className="mt-4 max-w-md text-white/65">
              Franchesco Toldo. La dirigencia no confirma ni desmiente. Lo que sí está confirmado: el jugador del partido se
              lleva una pizza de <span className="text-crema">Fatto in Casa</span>.
            </Reveal>
            <Reveal className="mt-6 inline-flex items-center gap-2 rounded-full border border-sunchales/50 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sunchales" />
              <span className="font-sub text-xs uppercase tracking-[0.22em] text-white/80">Rumor en desarrollo</span>
            </Reveal>
          </div>
          <div className="order-1 mx-auto w-[62%] max-w-[300px] md:order-2 md:col-span-4 md:col-start-8 md:w-full">
            <PhoneMockup>
              <video
                src="/media/fichaje.mp4"
                poster="/media/fichaje-poster.webp"
                controls
                playsInline
                preload="none"
                className="h-full w-full bg-black object-cover"
                aria-label="Video: posible fichaje y premio del sponsor Fatto in Casa"
              />
            </PhoneMockup>
          </div>
        </div>

        {/* Polaroids arrastrables */}
        <div className="mt-32">
          <Reveal>
            <p className="kicker text-crema">Archivo</p>
            <h3 className="font-display mt-3 text-[clamp(2.6rem,5vw,4.8rem)]">La mesa de las fotos</h3>
            <p className="mt-2 text-white/50">Agarralas, movelas, tiralas. Son nuestras.</p>
          </Reveal>
          <div
            ref={table}
            className="relative mt-10 h-[120vw] overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_center,#2a1a0e,#111_70%)] ring-1 ring-white/5 md:h-[36vw]"
          >
            {POLAROIDS.map((p, i) => (
              <motion.figure
                key={p.slug}
                drag
                dragConstraints={table}
                dragMomentum
                dragElastic={0.2}
                whileDrag={{ scale: 1.06, rotate: 0, zIndex: 10 }}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 80, rotate: p.rotate * 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: p.rotate }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE.espresso, delay: i * 0.12 }}
                className="absolute w-[58%] cursor-grab touch-none bg-[#f4efe6] p-2.5 pb-12 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] active:cursor-grabbing md:w-[30%]"
                style={{ left: desktop ? p.x : p.mx, top: desktop ? p.y : p.my }}
                data-cursor="Arrastrá"
              >
                <Img slug={p.slug} sizes="(min-width: 768px) 30vw, 60vw" className="pointer-events-none aspect-[4/3] w-full" />
                <figcaption className="absolute bottom-3 left-0 right-0 text-center font-[cursive] text-lg text-ink-900/80">{p.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
