import { POSITION_LABEL, type Player, type StatLine } from '@/data/players';
import { ageOf, tagsOf } from '@/lib/stats';
import { Img } from '@/components/ui/Img';
import { TiltCard } from '@/components/ui/Interactive';
import { Crest } from '@/components/ui/Crest';
import { cn } from '@/lib/cn';

/** Placeholder elegante hasta que llegue la foto del jugador. */
export function PhotoPlaceholder({ number, className, minimal }: { number: number; className?: string; minimal?: boolean }) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-b from-caramel via-roast-700 to-ink-950', className)}>
      {/* Chevrons como los de la camiseta */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0 38px, rgba(0,0,0,0.35) 38px 76px), repeating-linear-gradient(45deg, transparent 0 38px, rgba(0,0,0,0.25) 38px 76px)',
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
      />
      <Crest
        variant="kit"
        className={cn('absolute left-1/2 w-auto -translate-x-1/2 opacity-60', minimal ? 'top-[12%] h-[34%]' : 'top-[18%] h-[26%]')}
        title=""
      />
      {!minimal && (
        <>
          <span className="font-display absolute inset-x-0 top-[44%] text-center text-[7rem] leading-none text-white/90">{number}</span>
          <span className="kicker absolute inset-x-0 bottom-[30%] text-center text-white/45">Foto próximamente</span>
        </>
      )}
    </div>
  );
}

function StatCol({ label, line }: { label: string; line: StatLine | null }) {
  return (
    <div className="px-4 py-3">
      <p className="kicker text-[10px]">{label}</p>
      {line ? (
        <dl className="mt-2 grid grid-cols-3 gap-1 text-center">
          {(
            [
              ['PJ', line.pj],
              ['G', line.goles],
              ['TA', line.amarillas],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dd className={cn('font-display tabular text-2xl', k === 'G' && v > 0 ? 'text-crema' : 'text-white')}>{v}</dd>
              <dt className="font-sub text-[9px] uppercase tracking-[0.2em] text-white/40">
                <abbr title={k === 'PJ' ? 'Partidos jugados' : k === 'G' ? 'Goles' : 'Tarjetas amarillas'} className="no-underline">
                  {k}
                </abbr>
              </dt>
            </div>
          ))}
        </dl>
      ) : (
        <p className="font-sub mt-3 text-xs uppercase tracking-[0.18em] text-white/35">No jugó</p>
      )}
    </div>
  );
}

export function PlayerCard({ p }: { p: Player }) {
  const tags = tagsOf(p);
  return (
    <TiltCard className="rounded-2xl" max={7}>
      <article className="relative overflow-hidden rounded-2xl bg-ink-850 ring-1 ring-white/8 transition-shadow duration-500 group-hover:ring-crema/40">
        <div className="relative aspect-[4/5] overflow-hidden">
          {p.photo ? (
            <Img
              slug={p.photo.slug}
              focus={p.photo.focus}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 90vw"
              className="h-full w-full"
              imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-espresso)] group-hover:scale-[1.07]"
            />
          ) : (
            <PhotoPlaceholder number={p.number} />
          )}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

          {p.photo && (<span
            aria-hidden
            className="font-display text-outline absolute right-3 top-2 text-[5.5rem] leading-none transition-transform duration-700 ease-[var(--ease-espresso)] group-hover:-translate-y-1"
          >
            {p.number}
          </span>)}

          {(tags.length > 0 || p.roles) && (
            <ul className="absolute left-3 top-3 flex max-w-[65%] flex-wrap gap-1.5">
              {tags.map((t) => (
                <li key={t.tag} title={t.hint} className="rounded-full bg-crema px-2.5 py-1 font-sub text-[9px] uppercase tracking-[0.18em] text-ink-950">
                  {t.tag}
                </li>
              ))}
              {p.roles?.map((r) => (
                <li key={r} className="rounded-full border border-crema/50 bg-ink-950/60 px-2.5 py-1 font-sub text-[9px] uppercase tracking-[0.18em] text-crema backdrop-blur">
                  {r}
                </li>
              ))}
            </ul>
          )}

          <div className="absolute inset-x-4 bottom-4">
            <h3 className="font-display text-5xl text-white">{p.nickname ?? p.lastName}</h3>
            <p className="mt-1 text-sm text-white/75">
              {p.firstName} {p.lastName}
            </p>
            <p className="font-sub mt-2 text-[11px] uppercase tracking-[0.2em] text-crema">
              #{p.number} · {POSITION_LABEL[p.position]} · {ageOf(p.birthDate)} años
            </p>
            {p.previous && (
              <p className="mt-1 text-xs text-white/50">
                Invierno 26: #{p.previous.number}
                {p.previous.position && ` · ${POSITION_LABEL[p.previous.position]}`}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/8 border-t border-white/8">
          <StatCol label="Torneo actual" line={p.current} />
          <StatCol label="Invierno 26" line={p.past} />
        </div>
      </article>
    </TiltCard>
  );
}
