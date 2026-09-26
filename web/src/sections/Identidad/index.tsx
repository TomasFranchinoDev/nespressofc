/**
 * 03 · LA IDENTIDAD
 *  A. Ficha técnica "Blend oficial" (la camiseta descrita como una cápsula de café).
 *  B. Anatomía del kit: foto sticky con hotspots + lista que se activa con el scroll (scrollytelling).
 *     Pasa sola de frente a espalda cuando la lista llega a los detalles de atrás.
 *  C. Paleta como cápsulas.
 *  D. Del render a la cancha + los dos escudos.
 */
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { Img } from '@/components/ui/Img';
import { Crest } from '@/components/ui/Crest';
import { Reveal, SectionHeading } from '@/components/ui/Primitives';
import { MaskReveal } from '@/components/ui/ScrollFx';
import type { ImageSlug } from '@/data/images.generated';

type Side = 'front' | 'back';
const KIT: Record<Side, ImageSlug> = { front: 'kit-front-worn', back: 'kit-back-worn' };

const FEATURES: { side: Side; x: number; y: number; title: string; text: string }[] = [
  { side: 'front', x: 65.4, y: 38.9, title: 'El escudo', text: 'Versión de batalla: N crema sobre escudo marrón. Del lado del corazón, como corresponde.' },
  { side: 'front', x: 54.5, y: 44.7, title: 'VASA Metal', text: 'Sponsor principal. Pecho, bien grande, bien a la vista.' },
  { side: 'front', x: 54.2, y: 52, title: 'LFC', text: 'Soluciones gastronómicas. Debajo de VASA, en el pecho.' },
  { side: 'front', x: 78.4, y: 40, title: 'V3 en las mangas', text: 'Bar y boliche: el tercer tiempo también tiene sponsor.' },
  { side: 'front', x: 37.8, y: 35.5, title: 'Degradé tostado', text: 'De café a negro ristretto, con chevrons en V que apuntan al arco rival.' },
  { side: 'front', x: 56.2, y: 62.5, title: 'Store Sunchales', text: 'Frente del pantalón, con la franja roja que corta el negro.' },
  { side: 'front', x: 93.4, y: 45.6, title: 'Fuera de reglamento', text: 'La cafetera de fondo. No es sponsor. Es la sede social.' },
  { side: 'back', x: 50.6, y: 28.5, title: 'Fatto in Casa', text: 'En la espalda. La rotisería que premia al jugador del partido con una pizza.' },
  { side: 'back', x: 52.3, y: 42.5, title: 'El número', text: 'Blanco, gigante, imposible de no ver. Este es el 17.' },
  { side: 'back', x: 44.5, y: 68.2, title: 'Germán', text: 'Remisería, en la parte de atrás del pantalón. Para que nadie se quede a pie.' },
];

const PALETTE = [
  { name: 'Ristretto', hex: '#0B0B0B' },
  { name: 'Tostado', hex: '#4A2C0A' },
  { name: 'Lungo', hex: '#6B3E14' },
  { name: 'Caramelo', hex: '#8B5A3C' },
  { name: 'Crema', hex: '#E8D5B5' },
];

const SPEC = [
  { k: 'Tostado', v: 'Marrón café' },
  { k: 'Notas', v: 'Pasto sintético, esfuerzo y fernet' },
  { k: 'Origen', v: 'Sunchales, Santa Fe' },
  { k: 'Cosecha', v: '2026' },
];

function Capsule({ hex, name, i }: { hex: string; name: string; i: number }) {
  const light = hex === '#E8D5B5';
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: i * 0.08, duration: 0.9, ease: EASE.espresso }}
    >
      {/* Cápsula Nespresso: domo arriba, cuerpo cónico y ala ancha abajo */}
      <div className="relative h-24 w-20 md:h-32 md:w-24">
        <div
          className="absolute inset-x-[4%] bottom-[6%] top-[4%] border border-white/10 [clip-path:polygon(30%_0,70%_0,100%_100%,0_100%)] [border-radius:45%_45%_0_0/20%_20%_0_0]"
          style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${hex} 55%, black), ${hex} 40%, color-mix(in srgb, ${hex} 70%, white) 52%, color-mix(in srgb, ${hex} 60%, black))` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[9%] rounded-[50%] border border-white/10"
          style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${hex} 80%, white), color-mix(in srgb, ${hex} 60%, black))` }}
        />
      </div>
      <div className="text-center">
        <p className={cn('font-sub text-sm uppercase tracking-[0.18em]', light ? 'text-crema' : 'text-white/85')}>{name}</p>
        <p className="font-mono text-xs text-white/40">{hex}</p>
      </div>
    </motion.div>
  );
}

function KitAnatomy() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const side = FEATURES[active].side;

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-feature]').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mt-20 grid gap-10 md:mt-32 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
      {/* Foto sticky con hotspots */}
      <div className="z-10 self-start md:sticky md:top-[10svh]">
        <div className="relative mx-auto aspect-[899/1599] h-[70svh] overflow-hidden rounded-2xl bg-ink-850 ring-1 ring-white/10 md:h-[80svh]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={side}
              className="absolute inset-0"
              initial={{ opacity: 0, rotateY: side === 'back' ? -70 : 70, scale: 0.92 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: side === 'back' ? 70 : -70, scale: 0.92 }}
              transition={{ duration: 0.9, ease: EASE.espresso }}
              style={{ transformPerspective: 1200 }}
            >
              <Img slug={KIT[side]} sizes="(min-width: 768px) 45vw, 60vw" className="h-full w-full" imgClassName="object-contain" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
              {FEATURES.map((f, i) =>
                f.side !== side ? null : (
                  <button
                    key={f.title}
                    type="button"
                    onClick={() => setActive(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                    aria-label={f.title}
                  >
                    {/* Círculo con el mismo número que el ítem de la lista */}
                    <span
                      className={cn(
                        'relative flex items-center justify-center rounded-full font-sub font-semibold tabular leading-none shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-all duration-500',
                        i === active
                          ? 'h-8 w-8 bg-crema text-xs text-ink-950 md:h-9 md:w-9 md:text-sm'
                          : 'h-6 w-6 bg-crema/75 text-[10px] text-ink-950/80 ring-1 ring-ink-950/30',
                      )}
                    >
                      {i === active && <span className="absolute inset-0 animate-ping rounded-full bg-crema/60 motion-reduce:animate-none" />}
                      <span className="relative">{String(i + 1).padStart(2, '0')}</span>
                    </span>
                  </button>
                ),
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute left-3 top-3 flex gap-1 rounded-full bg-ink-950/70 p-1 backdrop-blur">
            {(['front', 'back'] as Side[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={s === side}
                onClick={() => setActive(FEATURES.findIndex((f) => f.side === s))}
                className={cn('rounded-full px-3 py-1 font-sub text-[10px] uppercase tracking-[0.2em]', s === side ? 'bg-crema text-ink-950' : 'text-white/60')}
              >
                {s === 'front' ? 'Frente' : 'Espalda'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista que maneja el scroll */}
      <ol className="relative">
        {FEATURES.map((f, i) => (
          <li
            key={f.title}
            data-feature
            onClick={() => setActive(i)}
            className={cn(
              'flex flex-col justify-center border-l py-6 pl-6 transition-colors duration-500 md:min-h-[62svh] md:py-0 md:pl-10',
              i === active ? 'border-crema' : 'border-white/10',
            )}
          >
            <span className="kicker tabular">
              {String(i + 1).padStart(2, '0')} · {f.side === 'front' ? 'Frente' : 'Espalda'}
            </span>
            <h3
              className={cn(
                'font-display mt-3 text-[clamp(2.2rem,6vw,5.5rem)] transition-colors duration-500',
                i === active ? 'text-white' : 'text-white/25',
              )}
            >
              {f.title}
            </h3>
            <p className={cn('mt-3 max-w-md text-base transition-opacity duration-500 md:text-lg', i === active ? 'text-white/70' : 'text-white/25')}>
              {f.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Identidad() {
  return (
    <section id="identidad" aria-label="La Identidad" className="relative overflow-clip bg-gradient-to-b from-ink-950 via-roast-950 to-ink-950 px-4 py-28 md:px-[6vw] md:py-40">
      <SectionHeading
        n="03"
        label="La Identidad"
        title={<>Blend<br />oficial</>}
        sub="Una camiseta se elige como un café: por color, por intensidad y por lo que te hace sentir. Esta es la nuestra."
      />

      {/* A. Ficha técnica */}
      <Reveal className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:mt-20 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="bg-ink-900 p-6 md:p-8">
          <p className="kicker">Intensidad</p>
          <p className="font-display mt-2 text-7xl text-crema">
            11<span className="text-3xl text-white/40">/13</span>
          </p>
          <div className="mt-4 flex gap-1" aria-hidden>
            {Array.from({ length: 13 }, (_, i) => (
              <span key={i} className={cn('h-2 flex-1 rounded-full', i < 11 ? 'bg-crema' : 'bg-white/10')} />
            ))}
          </div>
        </div>
        {SPEC.map((s) => (
          <div key={s.k} className="bg-ink-900 p-6 md:p-8">
            <p className="kicker">{s.k}</p>
            <p className="font-sub mt-3 text-xl uppercase tracking-wide text-white md:text-2xl">{s.v}</p>
          </div>
        ))}
      </Reveal>

      {/* B. Anatomía */}
      <KitAnatomy />

      {/* C. Paleta */}
      <div className="mt-28 md:mt-40">
        <Reveal>
          <p className="kicker text-crema">La paleta</p>
          <h3 className="font-display mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">Cinco cápsulas, un club</h3>
        </Reveal>
        <div className="mt-12 grid grid-cols-3 gap-y-10 md:grid-cols-5">
          {PALETTE.map((p, i) => (
            <Capsule key={p.hex} {...p} i={i} />
          ))}
        </div>
      </div>

      {/* D. Render vs realidad + escudos */}
      <div className="mt-28 grid gap-6 md:mt-40 md:grid-cols-12">
        <div className="md:col-span-7">
          <Reveal>
            <p className="kicker text-crema">Del render a la cancha</p>
            <h3 className="font-display mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">Así se diseñó. Así llegó.</h3>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <MaskReveal className="aspect-[4/5] rounded-xl bg-[#f3f1ee]">
              <Img slug="kit-render-front" sizes="30vw" className="h-full w-full bg-transparent" imgClassName="object-contain" />
            </MaskReveal>
            <MaskReveal className="aspect-[4/5] rounded-xl">
              <Img slug="kit-flat" sizes="30vw" className="h-full w-full" focus="50% 40%" />
            </MaskReveal>
          </div>
        </div>
        <div className="flex flex-col justify-end gap-6 md:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            <Reveal className="flex aspect-square items-center justify-center rounded-xl bg-ink-900 p-6 ring-1 ring-white/10">
              <img src="/img/escudo-400.webp" alt="Escudo oficial de Nespresso FC" width={400} height={463} loading="lazy" className="h-full w-auto" />
            </Reveal>
            <Reveal delay={0.1} className="flex aspect-square items-center justify-center rounded-xl bg-ink-900 p-6 ring-1 ring-white/10">
              <Crest variant="kit" className="h-full w-auto" title="Escudo de la camiseta" />
            </Reveal>
          </div>
          <Reveal className="text-white/60">
            <span className="text-crema">Dos escudos, una N.</span> El oficial, crema y con nombre. El de la camiseta, marrón y
            directo. La N con la curva de un chorro de café.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
