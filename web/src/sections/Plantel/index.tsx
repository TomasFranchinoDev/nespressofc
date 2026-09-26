/**
 * 04 · EL PLANTEL
 * Comisión directiva → los que la meten (goleadores) → números del equipo → grilla filtrable → camisetas colgadas.
 * Todo sale de data/players.ts vía lib/stats.ts.
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { POSITION_LABEL, type Position, type Player } from '@/data/players';
import { STAFF } from '@/data/club';
import { ACTIVE, RETIRED, TEAM, byId, totalGoals, totalPJ, ageOf, SCORERS } from '@/lib/stats';
import { EASE } from '@/lib/motion';
import { Img } from '@/components/ui/Img';
import { Chip, Reveal, SectionHeading, StatCounter } from '@/components/ui/Primitives';
import { MaskReveal } from '@/components/ui/ScrollFx';
import { PlayerCard, PhotoPlaceholder } from './PlayerCard';

type Sort = 'numero' | 'goles' | 'pj';
const FILTERS: (Position | 'ALL')[] = ['ALL', 'ARQ', 'DEF', 'MD', 'DC'];
const PLURAL: Record<Position, string> = { ARQ: 'Arqueros', DEF: 'Defensores', MD: 'Mediocampistas', DC: 'Delanteros' };

function GoalBar({ label, goles, pj, max }: { label: string; goles: number; pj: number; max: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="kicker">{label}</span>
        <span className="font-sub text-sm text-white/60">
          <span className="font-display tabular text-2xl text-white">{goles}</span> goles · {pj} PJ
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-caramel to-crema"
          initial={{ width: 0 }}
          whileInView={{ width: `${(goles / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE.espresso, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function ScorerPanel({ p, rank, caption }: { p: Player; rank: string; caption: string }) {
  const max = Math.max(p.current?.goles ?? 0, p.past?.goles ?? 0, 4);
  return (
    <article className="relative overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-white/10">
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-[16/11]">
        {p.photo ? (
          <MaskReveal className="h-full w-full">
            <Img slug={p.photo.slug} focus={p.photo.focus} sizes="(min-width: 768px) 50vw, 100vw" className="h-full w-full" />
          </MaskReveal>
        ) : (
          <PhotoPlaceholder number={p.number} minimal />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
        <span className="kicker absolute left-5 top-5 rounded-full bg-ink-950/70 px-3 py-1.5 text-crema backdrop-blur">{rank}</span>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-[clamp(3.5rem,8vw,7rem)] text-white">{p.nickname ?? p.lastName}</h3>
            <p className="text-white/70">
              {p.firstName} {p.lastName} · #{p.number}
            </p>
          </div>
          <div className="text-right">
            <StatCounter value={totalGoals(p)} className="font-display block text-[clamp(4.5rem,10vw,9rem)] leading-[0.8] text-crema" />
            <span className="kicker">goles</span>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-5 md:p-7">
        <p className="text-white/70">{caption}</p>
        <GoalBar label="Torneo actual" goles={p.current?.goles ?? 0} pj={p.current?.pj ?? 0} max={max} />
        <GoalBar label="Invierno Valbé 26" goles={p.past?.goles ?? 0} pj={p.past?.pj ?? 0} max={max} />
      </div>
    </article>
  );
}

export function Plantel() {
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');
  const [sort, setSort] = useState<Sort>('numero');
  const [first, second] = SCORERS;

  const list = useMemo(() => {
    const l = ACTIVE.filter((p) => filter === 'ALL' || p.position === filter);
    return [...l].sort((a, b) =>
      sort === 'numero' ? a.number - b.number : sort === 'goles' ? totalGoals(b) - totalGoals(a) || a.number - b.number : totalPJ(b) - totalPJ(a) || a.number - b.number,
    );
  }, [filter, sort]);

  const staff = STAFF.reduce<{ name: string; roles: string[] }[]>((acc, s) => {
    const p = byId(s.playerId);
    const first = p.firstName.split(' ')[0];
    const name = p.nickname && p.nickname !== first ? `${first} “${p.nickname}” ${p.lastName}` : `${first} ${p.lastName}`;
    const found = acc.find((a) => a.name === name);
    if (found) found.roles.push(s.role);
    else acc.push({ name, roles: [s.role] });
    return acc;
  }, []);

  return (
    <section id="plantel" aria-label="El Plantel" className="relative bg-ink-950 px-4 py-28 md:px-[6vw] md:py-40">
      <SectionHeading
        n="04"
        label="El Plantel"
        title={<>Los que<br />ponen la cara</>}
        sub={`${TEAM.activos} jugadores, dos torneos y una sola regla: el que llega tarde ceba.`}
      />

      {/* Comisión directiva */}
      <Reveal className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-y border-white/10 py-6">
        <span className="kicker text-crema">Comisión directiva</span>
        {staff.map((s) => (
          <p key={s.name} className="text-sm text-white/80">
            <span className="font-sub uppercase tracking-[0.15em] text-white/45">{s.roles.join(' · ')}</span>
            <span className="mx-2 text-white/20">/</span>
            {s.name}
          </p>
        ))}
      </Reveal>

      {/* Goleadores */}
      <div className="mt-20">
        <Reveal>
          <p className="kicker text-crema">Los que la meten</p>
          <h3 className="font-display mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">Goleadores históricos</h3>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {first && (
            <ScorerPanel
              p={first}
              rank="Máximo artillero"
              caption={`Goleador del torneo actual: ${first.current?.goles} goles en ${first.current?.pj} partidos. Promedio de ${((first.current?.goles ?? 0) / Math.max(1, first.current?.pj ?? 1)).toFixed(0)} por partido.`}
            />
          )}
          {second && (
            <ScorerPanel
              p={second}
              rank="Segundo goleador histórico"
              caption={`${second.past?.goles} goles en ${second.past?.pj} partidos del Invierno Valbé 26. Y además, presidente.`}
            />
          )}
        </div>
      </div>

      {/* Números del equipo */}
      <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-4">
        {[
          { v: TEAM.goles, k: 'Goles en la historia' },
          { v: TEAM.activos, k: 'Jugadores en el plantel' },
          { v: TEAM.past.fechas + TEAM.current.fechas, k: 'Fechas jugadas' },
          { v: TEAM.amarillas, k: 'Amarillas (culpa del árbitro)' },
        ].map((s) => (
          <div key={s.k} className="bg-ink-900 p-6 md:p-8">
            <dd>
              <StatCounter value={s.v} pad={2} className="font-display text-[clamp(3.5rem,7vw,6rem)] leading-none text-white" />
            </dd>
            <dt className="kicker mt-2">{s.k}</dt>
          </div>
        ))}
      </dl>

      {/* Grilla */}
      <div className="mt-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="kicker text-crema">Plantel {new Date().getFullYear()}</p>
            <h3 className="font-display mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">Uno por uno</h3>
          </Reveal>
          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por posición">
              {FILTERS.map((f) => (
                <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                  {f === 'ALL' ? 'Todos' : PLURAL[f]}
                </Chip>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm text-white/60">
              <span className="kicker">Ordenar</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-full border border-white/15 bg-ink-900 px-4 py-1.5 font-sub text-xs uppercase tracking-[0.18em] text-white"
              >
                <option value="numero">Por número</option>
                <option value="goles">Por goles</option>
                <option value="pj">Por partidos</option>
              </select>
            </label>
          </div>
        </div>

        <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.7, ease: EASE.espresso, delay: (i % 4) * 0.06 }}
              >
                <PlayerCard p={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        <p className="mt-6 text-xs text-white/40">
          PJ: partidos jugados · G: goles · TA: tarjetas amarillas · Edades calculadas al día de hoy.
        </p>
      </div>

      {/* Camisetas colgadas */}
      <div className="mt-28">
        <Reveal>
          <p className="kicker text-crema">Leyendas</p>
          <h3 className="font-display mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">Camisetas colgadas</h3>
          <p className="mt-3 max-w-lg text-white/60">Jugaron el Invierno Valbé 26 y colgaron los botines. En este club, nadie se va del todo.</p>
        </Reveal>
        <div className="relative mt-12">
          <div aria-hidden className="absolute inset-x-0 top-3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <ul className="flex flex-wrap justify-center gap-10 md:gap-20">
            {RETIRED.map((p, i) => (
              <motion.li
                key={p.id}
                className="flex w-56 flex-col items-center"
                style={{ transformOrigin: '50% 0%' }}
                initial={{ rotate: i % 2 ? 10 : -10, opacity: 0 }}
                whileInView={{ rotate: [i % 2 ? 10 : -10, i % 2 ? -3 : 3, 0], opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: EASE.espresso }}
              >
                <span aria-hidden className="h-8 w-px bg-white/40" />
                <div className="relative w-full">
                  {/* Camiseta en SVG, con el degradé real */}
                  <svg viewBox="0 0 200 210" className="w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]" aria-hidden>
                    <defs>
                      <linearGradient id={`j-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={p.position === 'ARQ' ? '#4d8a3a' : '#8b5a3c'} />
                        <stop offset="1" stopColor={p.position === 'ARQ' ? '#1f3d17' : '#1a0f06'} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M70 8 Q100 26 130 8 L186 36 L172 84 L150 76 L150 202 L50 202 L50 76 L28 84 L14 36 Z"
                      fill={`url(#j-${p.id})`}
                      stroke="rgba(232,213,181,0.25)"
                    />
                    <text x="100" y="140" textAnchor="middle" className="font-display" fontSize="78" fill="#f4ecde">
                      {p.number}
                    </text>
                  </svg>
                </div>
                <p className="font-display mt-4 text-4xl">{p.nickname}</p>
                <p className="text-sm text-white/60">
                  {p.firstName} {p.lastName}
                </p>
                <p className="kicker mt-1">
                  {POSITION_LABEL[p.position]} · {ageOf(p.birthDate)} años
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
