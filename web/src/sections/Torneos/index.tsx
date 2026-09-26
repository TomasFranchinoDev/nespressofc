/**
 * 07 · TORNEOS & PALMARÉS
 * Dos "entradas" de torneo, la tabla histórica de goleadores (barras apiladas actual + pasado)
 * y la vitrina (en construcción).
 */
import { motion } from 'motion/react';
import { TOURNAMENTS } from '@/data/content';
import { SCORERS, TEAM, topScorer, totalGoals } from '@/lib/stats';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { Img } from '@/components/ui/Img';
import { Crest } from '@/components/ui/Crest';
import { Reveal, SectionHeading, StatCounter } from '@/components/ui/Primitives';
import { TiltCard } from '@/components/ui/Interactive';

function Ticket({ t, i }: { t: (typeof TOURNAMENTS)[number]; i: number }) {
  const team = TEAM[t.key];
  const top = topScorer(t.key);
  const live = t.status === 'En juego';
  const rows = [
    ['Sede', t.venue],
    ...(t.division ? [['División', t.division]] : []),
    ...(t.debut ? [['Debut', t.debut]] : []),
    ['Goleador', `${top.nickname ?? top.lastName} (${top[t.key]?.goles})`],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: i ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 1, ease: EASE.espresso, delay: i * 0.12 }}
    >
      <TiltCard max={5} className="rounded-3xl">
        <article
          className="relative grid overflow-hidden rounded-3xl bg-crema text-ink-950 md:grid-cols-[1fr_1.25fr]"
          style={{
            // Muescas del ticket
            maskImage: 'radial-gradient(circle at 0 50%, transparent 14px, black 15px), radial-gradient(circle at 100% 50%, transparent 14px, black 15px)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <div className="relative aspect-[16/10] md:aspect-auto">
            <Img slug={t.image} sizes="(min-width: 768px) 25vw, 100vw" className="absolute inset-0 h-full w-full" />
            <div aria-hidden className="absolute inset-0 bg-roast-700/30 mix-blend-multiply" />
          </div>
          <div className="relative border-t-2 border-dashed border-ink-950/20 p-6 md:border-l-2 md:border-t-0 md:p-8">
            <div className="flex items-center justify-between">
              <span className="font-sub text-[11px] uppercase tracking-[0.25em] text-ink-950/60">{t.edition}</span>
              <span
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1 font-sub text-[10px] uppercase tracking-[0.2em]',
                  live ? 'bg-sunchales text-white' : 'bg-ink-950 text-crema',
                )}
              >
                {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
                {t.status}
              </span>
            </div>
            <h3 className="font-display mt-4 text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.9]">{t.name}</h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <StatCounter value={team.fechas} pad={2} className="font-display block text-6xl leading-none" />
                <span className="font-sub text-[10px] uppercase tracking-[0.2em] text-ink-950/60">{live ? 'Fechas jugadas' : 'Fechas'}</span>
              </div>
              <div>
                <StatCounter value={team.goles} pad={2} className="font-display block text-6xl leading-none" />
                <span className="font-sub text-[10px] uppercase tracking-[0.2em] text-ink-950/60">Goles del plantel</span>
              </div>
            </div>
            <dl className="mt-6 space-y-1.5 border-t border-ink-950/15 pt-4 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="font-sub uppercase tracking-[0.15em] text-ink-950/55">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}

function ScorersChart() {
  const max = Math.max(...SCORERS.map(totalGoals));
  return (
    <div className="rounded-3xl bg-ink-900 p-6 ring-1 ring-white/10 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-crema">Tabla histórica</p>
          <h3 className="font-display mt-2 text-[clamp(2.4rem,5vw,4.5rem)]">Goleadores</h3>
        </div>
        <div className="flex gap-5 text-xs text-white/60" aria-hidden>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-roast-500" /> Invierno 26</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-crema" /> Torneo actual</span>
        </div>
      </div>
      <ol className="mt-8 space-y-3">
        {SCORERS.map((p, i) => {
          const past = p.past?.goles ?? 0;
          const cur = p.current?.goles ?? 0;
          return (
            <li key={p.id} className="grid grid-cols-[2rem_7rem_1fr_2rem] items-center gap-3 md:grid-cols-[2.5rem_10rem_1fr_3rem]">
              <span className="font-display tabular text-2xl text-white/35">{i + 1}</span>
              <span className="truncate font-sub text-sm uppercase tracking-[0.12em]">
                {p.nickname ?? p.lastName} <span className="text-white/40">#{p.number}</span>
              </span>
              <div
                className="flex h-5 overflow-hidden rounded-full bg-white/5"
                role="img"
                aria-label={`${p.firstName} ${p.lastName}: ${past} goles en Invierno 26 y ${cur} en el torneo actual`}
              >
                <motion.span
                  className="h-full bg-roast-500"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(past / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE.espresso, delay: i * 0.05 }}
                />
                <motion.span
                  className="h-full bg-crema"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(cur / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE.espresso, delay: 0.3 + i * 0.05 }}
                />
              </div>
              <span className="font-display tabular text-right text-3xl">{past + cur}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Vitrina() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-ink-850 to-ink-950 p-6 ring-1 ring-white/10 md:p-10">
      {/* Spot de luz */}
      <div aria-hidden className="absolute left-1/2 top-0 h-[70%] w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(232,213,181,0.18),transparent_70%)]" />
      <p className="kicker relative text-crema">Palmarés</p>
      <div className="relative mx-auto mt-8 aspect-[4/5] max-w-xs rounded-t-[40%] border border-white/15 bg-gradient-to-br from-white/[0.07] to-transparent p-6 backdrop-blur-sm">
        <div aria-hidden className="absolute inset-y-6 left-[18%] w-px bg-gradient-to-b from-white/30 to-transparent" />
        {[0.38, 0.66].map((y) => (
          <div key={y} aria-hidden className="absolute inset-x-5 h-1.5 rounded bg-white/10" style={{ top: `${y * 100}%` }} />
        ))}
        <Crest variant="kit" className="absolute left-1/2 top-[70%] h-[22%] w-auto -translate-x-1/2 opacity-80" title="" />
      </div>
      <p className="font-display relative mt-8 text-center text-[clamp(2rem,4vw,3.4rem)]">Vitrina en construcción</p>
      <p className="relative mt-1 text-center text-white/55">La cafetera ya la tenemos.</p>
    </div>
  );
}

export function Torneos() {
  return (
    <section id="torneos" aria-label="Torneos y Palmarés" className="relative bg-gradient-to-b from-roast-700 via-roast-950 to-ink-950 px-4 pb-28 pt-16 md:px-[6vw] md:pb-40 md:pt-24">
      <SectionHeading
        n="07"
        label="Torneos & Palmarés"
        title={<>Dos torneos<br />y contando</>}
        sub={`Debutamos en el Complejo Valbé en invierno y volvimos para el verano. ${TEAM.goles} goles en el camino.`}
      />
      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        {TOURNAMENTS.map((t, i) => (
          <Ticket key={t.key} t={t} i={i} />
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ScorersChart />
        <Vitrina />
      </div>
      <Reveal className="mt-6 text-xs text-white/35">Goles contados sobre el plantel actual.</Reveal>
    </section>
  );
}
