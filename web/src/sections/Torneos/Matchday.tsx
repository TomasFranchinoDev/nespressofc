/**
 * Bloque "Matchday" de #torneos: próximo partido + últimos resultados del torneo en juego.
 * Todo sale de src/data/valbe.json (lo actualiza el GitHub Action), así que se renueva solo
 * después de cada fecha.
 */
import { motion } from 'motion/react';
import { CLUB } from '@/data/club';
import { EDICION_ACTUAL, POSICION, PROXIMO, RESULTADOS, type PartidoValbe } from '@/lib/stats';
import { cuentaRegresiva, partesFecha } from '@/lib/fecha';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { Crest, CREST_PATHS } from '@/components/ui/Crest';
import { Reveal } from '@/components/ui/Primitives';

/** Escudo genérico del rival con sus iniciales (no tenemos sus escudos). */
function RivalCrest({ nombre, className }: { nombre: string; className?: string }) {
  const iniciales = nombre
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <svg viewBox="100 0 830 1000" className={cn('block', className)} aria-hidden>
      <path d={CREST_PATHS.outer} fill="#1c1612" stroke="rgba(244,241,236,0.35)" strokeWidth="14" />
      <text x="516" y="600" textAnchor="middle" className="font-display" fontSize="360" fill="#f4f1ec">
        {iniciales}
      </text>
    </svg>
  );
}

const BADGE: Record<string, string> = {
  G: 'bg-crema text-ink-950',
  E: 'bg-white/15 text-white',
  P: 'bg-sunchales text-white',
};
const RESULTADO_LARGO: Record<string, string> = { G: 'Ganado', E: 'Empatado', P: 'Perdido' };

function Badge({ r, className, decorative }: { r: string; className?: string; decorative?: boolean }) {
  const k = r[0];
  const largo = `${RESULTADO_LARGO[k]}${r.includes('pen') ? ' por penales' : ''}`;
  return (
    <span
      className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-lg', BADGE[k], className)}
      title={largo}
      aria-hidden={decorative || undefined}
    >
      <span aria-hidden>{k}</span>
      {!decorative && <span className="sr-only">{largo}</span>}
    </span>
  );
}

function ProximoPartido({ p }: { p: PartidoValbe | null }) {
  if (!p?.fechaHora) {
    return (
      <div className="flex h-full flex-col justify-center rounded-3xl bg-ink-900 p-6 ring-1 ring-white/10 md:p-10">
        <p className="kicker text-crema">Próximo partido</p>
        <p className="font-display mt-4 text-[clamp(2.4rem,5vw,4rem)]">Fixture por confirmar</p>
        <p className="mt-2 text-white/55">Apenas Valbé publique la próxima fecha, aparece acá.</p>
      </div>
    );
  }
  const f = partesFecha(p.fechaHora);
  const local = p.condicion === 'local';
  const nosotros = { nombre: CLUB.name, crest: <Crest variant="kit" className="h-full w-auto" title="" /> };
  const ellos = { nombre: p.rival, crest: <RivalCrest nombre={p.rival} className="h-full w-auto" /> };
  const [izq, der] = local ? [nosotros, ellos] : [ellos, nosotros];

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-roast-900 via-ink-900 to-ink-950 p-6 ring-1 ring-crema/20 md:p-10">
      {/* Halo de reflector */}
      <div aria-hidden className="pointer-events-none absolute -top-1/3 left-1/2 h-[80%] w-[90%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(232,213,181,0.16),transparent_65%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <p className="kicker text-crema">Próximo partido</p>
        <span className="flex items-center gap-2 rounded-full bg-crema px-3 py-1 font-sub text-[10px] uppercase tracking-[0.2em] text-ink-950">
          {cuentaRegresiva(p.fechaHora)}
        </span>
      </div>

      <div className="relative mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:mt-10">
        {[izq, der].map((t, i) => (
          <motion.div
            key={t.nombre}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, x: i ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE.espresso }}
            style={{ order: i ? 3 : 1 }}
          >
            <div className="h-20 md:h-28">{t.crest}</div>
            <p className="font-display mt-3 text-[clamp(1.6rem,3vw,2.6rem)] leading-[0.9]">{t.nombre}</p>
          </motion.div>
        ))}
        <span className="font-display order-2 text-[clamp(2.2rem,4vw,3.6rem)] text-crema/80">vs</span>
      </div>

      <dl className="relative mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 text-center md:mt-auto">
        {[
          [f.dia, f.ddmm],
          ['Hora', f.hora],
          [p.cancha ?? 'Cancha', local ? 'Local' : 'Visitante'],
        ].map(([k, v]) => (
          <div key={k} className="bg-ink-950/70 px-2 py-4">
            <dt className="kicker text-[10px]">{k}</dt>
            <dd className="font-display tabular mt-1 text-3xl">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="relative mt-4 text-sm text-white/50">
        {p.fecha ? `${p.fecha} · ` : ''}Complejo Valbé. La pava ya está en el fuego.
      </p>
    </article>
  );
}

function UltimosResultados() {
  const racha = [...RESULTADOS].reverse().slice(-5);
  return (
    <div className="flex h-full flex-col rounded-3xl bg-ink-900 p-6 ring-1 ring-white/10 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-crema">Últimos resultados</p>
          <h3 className="font-display mt-2 text-[clamp(2.4rem,5vw,4.5rem)]">Cómo venimos</h3>
        </div>
        {racha.length > 0 && (
          <div role="img" className="flex items-center gap-1.5" aria-label={`Racha: ${racha.map((r) => RESULTADO_LARGO[r.resultado![0]]).join(', ')}`}>
            <span className="kicker mr-2">Racha</span>
            {racha.map((r) => (
              <Badge key={r.id} r={r.resultado!} className="h-6 w-6 text-sm" decorative />
            ))}
          </div>
        )}
      </div>

      {POSICION && (
        <p className="mt-4 font-sub text-sm uppercase tracking-[0.15em] text-white/60">
          <span className="text-crema">
            {POSICION.puesto}º de {POSICION.de}
          </span>{' '}
          · {POSICION.zona} · {POSICION.puntos} pts · {POSICION.pg}G {POSICION.pe}E {POSICION.pp}P
        </p>
      )}

      {RESULTADOS.length === 0 ? (
        <p className="mt-8 text-white/55">Todavía no se jugó ninguna fecha de {EDICION_ACTUAL?.nombre ?? 'este torneo'}.</p>
      ) : (
        <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {RESULTADOS.map((r, i) => {
            const f = r.fechaHora ? partesFecha(r.fechaHora) : null;
            return (
              <motion.li
                key={r.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE.espresso, delay: i * 0.06 }}
              >
                <Badge r={r.resultado ?? 'E'} />
                <div className="min-w-0">
                  <p className="truncate font-sub text-base uppercase tracking-[0.08em] text-white md:text-lg">
                    <span className="text-white/40">vs</span> {r.rival}
                  </p>
                  <p className="text-xs text-white/45">
                    {[r.fecha, f?.ddmm, r.condicion === 'local' ? 'Local' : 'Visitante'].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <p className="font-display tabular text-4xl leading-none md:text-5xl" aria-label={`${r.golesFavor} a ${r.golesContra}`}>
                  <span className={r.resultado?.startsWith('G') ? 'text-crema' : 'text-white'}>{r.golesFavor}</span>
                  <span className="mx-1.5 text-white/30">–</span>
                  <span className="text-white/60">{r.golesContra}</span>
                  {r.penales && (
                    <span className="ml-2 align-middle font-sub text-xs text-white/45">
                      ({r.penales.favor}–{r.penales.contra} pen)
                    </span>
                  )}
                </p>
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function Matchday() {
  return (
    <div className="mt-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
        <ProximoPartido p={PROXIMO} />
        <UltimosResultados />
      </div>
      <Reveal className="mt-3 text-right text-xs text-white/35">
        Fuente: Torneo Valbé{EDICION_ACTUAL ? ` · ${EDICION_ACTUAL.nombre}` : ''}
      </Reveal>
    </div>
  );
}
