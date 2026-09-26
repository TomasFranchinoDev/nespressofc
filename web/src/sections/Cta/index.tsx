/**
 * 10 · CTA FINAL + CRÉDITOS
 * Llamado a la acción sobre la foto del equipo y, al final, los créditos de la película
 * subiendo con el scroll (reparto, dirigencia, sponsors) hasta el "FIN".
 * Los botones de contacto se activan solos cuando se completa CLUB.contact.
 */
import { useRef } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import { CLUB, STAFF } from '@/data/club';
import { SPONSORS } from '@/data/content';
import { ACTIVE, RETIRED, byId } from '@/lib/stats';
import { Img } from '@/components/ui/Img';
import { Crest } from '@/components/ui/Crest';
import { Parallax } from '@/components/ui/ScrollFx';
import { MagneticButton } from '@/components/ui/Interactive';
import { Reveal } from '@/components/ui/Primitives';
import { SplitReveal } from '@/components/ui/SplitReveal';
import { Particles } from '@/components/fx/Particles';
import { usePrefersReducedMotion } from '@/hooks/useMedia';

function CreditBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="mt-20 first:mt-0">
      <p className="kicker text-crema">{title}</p>
      <ul className="mt-5 space-y-2">
        {rows.map(([a, b]) => (
          <li key={a + b} className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-3 text-sm md:text-base">
            <span className="text-right font-sub uppercase tracking-[0.12em] text-white/50">{a}</span>
            <span className="text-white/20">·</span>
            <span className="text-left text-white">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Credits() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const roll = root.current!.querySelector<HTMLElement>('[data-roll]')!;
        gsap.fromTo(
          roll,
          { y: () => window.innerHeight },
          {
            y: () => -roll.offsetHeight + window.innerHeight * 0.82,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
          },
        );
      });
    },
    { scope: root },
  );

  const staff = STAFF.map((s) => {
    const p = byId(s.playerId);
    return [s.role, `${p.firstName.split(' ')[0]} ${p.lastName}`] as [string, string];
  });

  return (
    <div ref={root} className={reduced ? 'relative' : 'relative h-[300vh]'}>
      <div className={reduced ? 'py-24' : 'sticky top-0 h-svh overflow-hidden'}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-ink-950 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
        <div data-roll className="mx-auto max-w-2xl px-4 text-center will-change-transform">
          <p className="kicker">{CLUB.name} presenta</p>
          <p className="font-display mt-4 text-[clamp(3rem,8vw,6rem)] text-white">La suerte del principiante</p>
          <p className="kicker mt-2">Una película de fútbol 6 filmada en {CLUB.city}</p>

          <div className="mt-24">
            <CreditBlock
              title="Reparto"
              rows={[...ACTIVE].sort((a, b) => a.number - b.number).map((p) => [`#${p.number} ${p.nickname ?? ''}`.trim(), `${p.firstName} ${p.lastName}`])}
            />
            <CreditBlock title="Leyendas" rows={RETIRED.map((p) => [`#${p.number} ${p.nickname ?? ''}`.trim(), `${p.firstName} ${p.lastName}`])} />
            <CreditBlock title="Dirigencia y cuerpo técnico" rows={staff} />
            <CreditBlock title="Con el apoyo de" rows={SPONSORS.map((s) => [s.rubro ?? 'Sponsor', s.name])} />
            <CreditBlock title="Fotografía de partidos" rows={[['Cortesía', 'Complejo Valbé']]} />
            <CreditBlock title="Catering" rows={[['Pizza del jugador del partido', 'Fatto in Casa'], ['Café', 'La cafetera de siempre']]} />
          </div>

          <p className="mt-24 text-sm italic text-white/45">Ningún arquero fue maltratado durante el rodaje.</p>

          <div className="mt-32 flex flex-col items-center">
            <Crest variant="kit" className="h-40 w-auto" />
            <p className="font-display mt-8 text-[clamp(6rem,20vw,14rem)] leading-none text-crema">Fin</p>
            <p className="kicker mt-2">(por ahora)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Cta() {
  const { instagram, whatsapp, email } = CLUB.contact;
  const wa = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('¡Hola Nespresso FC! Queremos jugar un partido.')}` : undefined;

  return (
    <section id="sumate" aria-label="Sumate" className="relative bg-ink-950">
      <div className="relative flex min-h-svh items-center overflow-hidden">
        <Parallax speed={10} className="absolute inset-0">
          <Img slug="equipo-cancha" sizes="100vw" className="h-full w-full" focus="50% 60%" imgClassName="[filter:saturate(0.8)_brightness(0.55)]" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink-950 via-roast-900/40 to-ink-950" />
        <Particles mode="steam" density={0.6} />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-32 text-center md:px-8">
          <Reveal className="mb-6 flex items-center justify-center gap-4">
            <span className="kicker text-crema">Capítulo 10</span>
            <span className="h-px w-12 bg-crema/40" aria-hidden />
            <span className="kicker">Sumate</span>
          </Reveal>
          <SplitReveal as="h2" by="chars" className="font-display text-[clamp(4rem,13vw,13rem)] text-white">
            ¿Te animás a un café?
          </SplitReveal>
          <Reveal delay={0.2} className="mx-auto mt-6 max-w-xl text-lg text-white/75">
            Desafianos a un partido, sumate al plantel o vení a alentar. Después del partido, el café (o lo que sea) lo ponemos
            nosotros.
          </Reveal>
          <Reveal delay={0.35} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton href={wa} disabled={!wa}>
              {wa ? 'Desafianos' : 'Desafianos · pronto'}
            </MagneticButton>
            <MagneticButton
              href={instagram ? `https://instagram.com/${instagram}` : undefined}
              disabled={!instagram}
              className={instagram ? 'bg-transparent text-crema ring-1 ring-crema/60' : undefined}
            >
              {instagram ? `@${instagram}` : 'Instagram · en creación'}
            </MagneticButton>
            {email && (
              <MagneticButton href={`mailto:${email}`} className="bg-transparent text-crema ring-1 ring-crema/60">
                Escribinos
              </MagneticButton>
            )}
          </Reveal>
          {!instagram && (
            <Reveal delay={0.45} className="mt-6 text-sm text-white/45">
              Estamos armando las redes. Mientras tanto, buscanos en el Complejo Valbé.
            </Reveal>
          )}
        </div>
      </div>

      <Credits />

      <footer className="relative border-t border-white/10 px-4 py-8 md:px-[6vw]">
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/40 md:flex-row">
          <p>
            © {new Date().getFullYear()} {CLUB.name} · {CLUB.city}
          </p>
          <p className="font-sub uppercase tracking-[0.2em]">{CLUB.motto}</p>
        </div>
      </footer>
    </section>
  );
}
