/**
 * 08 · SPONSORS
 * Marcas tipográficas provisorias (hasta tener los logos en vector), con rubro y ubicación en la ropa.
 * Para usar el logo real: agregá `logo: '/img/sponsors/xxx.svg'` en data/content.ts y reemplazá <Mark>.
 */
import { motion } from 'motion/react';
import { SPONSORS, type Sponsor } from '@/data/content';
import { EASE } from '@/lib/motion';
import { Marquee, Reveal, SectionHeading } from '@/components/ui/Primitives';
import { useScrollApi } from '@/providers/SmoothScroll';

function Mark({ s }: { s: Sponsor }) {
  switch (s.id) {
    case 'vasa':
      return (
        <span className="flex flex-col items-end leading-none">
          <span className="font-sans text-6xl font-black tracking-[-0.06em] text-white">VASA</span>
          <span className="font-sans text-2xl font-medium tracking-tight text-white/85">Metal</span>
        </span>
      );
    case 'lfc':
      return (
        <span className="flex flex-col items-center leading-none">
          <span className="font-serif text-6xl font-bold tracking-tight text-white">LFC</span>
          <span className="mt-2 font-serif text-[10px] uppercase tracking-[0.3em] text-white/70">Soluciones gastronómicas</span>
        </span>
      );
    case 'store':
      return (
        <span className="relative flex flex-col items-center leading-[0.85]">
          <span className="font-display text-5xl tracking-wider text-white">Store</span>
          <span className="font-display text-5xl tracking-wider text-white">Sunchales</span>
          <span aria-hidden className="mt-2 h-2 w-40 -skew-x-12 bg-sunchales" />
        </span>
      );
    case 'v3':
      return (
        <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/80">
          <span className="font-sans text-4xl font-black italic tracking-tighter text-white">V3</span>
        </span>
      );
    case 'fatto':
      return (
        <span className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-crema/70 text-center">
          <span className="font-serif text-2xl italic leading-none text-crema">Fatto</span>
          <span className="font-serif text-xs italic text-crema/80">in</span>
          <span className="font-serif text-2xl italic leading-none text-crema">Casa</span>
        </span>
      );
    case 'german':
      return (
        <span className="flex flex-col items-center leading-none">
          <span className="font-sub text-[10px] uppercase tracking-[0.35em] text-white/60">Remisería</span>
          <span className="font-sub mt-1 text-5xl font-bold uppercase tracking-wide text-white">Germán</span>
        </span>
      );
  }
}

export function Sponsors() {
  const { scrollTo } = useScrollApi();
  return (
    <section id="sponsors" aria-label="Sponsors" className="relative bg-ink-950 py-28 md:py-40">
      <div className="px-4 md:px-[6vw]">
        <SectionHeading
          n="08"
          label="Sponsors"
          title={<>Los que<br />bancan</>}
          sub="Sin ellos no hay camiseta, ni premio al jugador del partido, ni vuelta a casa. Gracias, de verdad."
        />
      </div>

      <Marquee duration={36} className="mt-16 border-y border-white/10 py-5">
        {SPONSORS.map((s) => (
          <span key={s.id} className="font-display flex items-center px-8 text-5xl text-white/30 md:text-7xl">
            {s.name}
            <span className="ml-16 text-crema/60">✦</span>
          </span>
        ))}
      </Marquee>

      <ul className="mt-16 grid gap-px overflow-hidden bg-white/8 px-0 sm:grid-cols-2 lg:grid-cols-3 md:mx-[6vw] md:rounded-3xl">
        {SPONSORS.map((s, i) => (
          <motion.li
            key={s.id}
            className="group relative flex min-h-[20rem] flex-col justify-between bg-ink-900 p-8 transition-colors duration-500 hover:bg-roast-900"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.8, ease: EASE.espresso, delay: (i % 3) * 0.1 }}
          >
            <span className="kicker tabular">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex flex-1 items-center justify-center py-6 transition-transform duration-700 ease-[var(--ease-espresso)] group-hover:scale-105">
              <Mark s={s} />
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="font-sub text-sm uppercase tracking-[0.15em] text-white">{s.name}</p>
                {s.rubro && <p className="text-xs text-white/50">{s.rubro}</p>}
              </div>
              <p className="text-right font-sub text-[10px] uppercase tracking-[0.2em] text-crema/80">{s.placement}</p>
            </div>
          </motion.li>
        ))}
      </ul>

      <Reveal className="mx-4 mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-crema/25 p-6 md:mx-[6vw] md:flex-row md:items-center">
        <p className="text-white/80">
          <span className="font-display mr-3 text-3xl text-crema">🍕 Premio al jugador del partido</span>
          <br className="md:hidden" />
          Pizza cortesía de Fatto in Casa.
        </p>
        <button
          type="button"
          onClick={() => scrollTo('#mercado', { offset: -120 })}
          className="font-sub text-xs uppercase tracking-[0.22em] text-crema underline-offset-4 hover:underline"
        >
          Ver el video →
        </button>
      </Reveal>
    </section>
  );
}
