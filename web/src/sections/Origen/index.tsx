/**
 * 02 · EL ORIGEN
 * Desktop: tira de película horizontal (pin + scroll en X). Cada toma tiene parallax interno
 * atado a la animación horizontal (containerAnimation) y una "aguja" de reproducción abajo.
 * Mobile / reducir movimiento: timeline vertical, sin pin.
 */
import { useRef, useState } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import { TIMELINE, type TimelineItem } from '@/data/content';
import { CLUB } from '@/data/club';
import { Img } from '@/components/ui/Img';
import { LoopVideo } from '@/components/ui/LoopVideo';
import { VideoModal } from '@/components/ui/Interactive';
import { Reveal } from '@/components/ui/Primitives';
import { SplitReveal } from '@/components/ui/SplitReveal';

function Frame({ item, onPlay }: { item: TimelineItem; onPlay: () => void }) {
  const m = item.media;
  return (
    <article data-frame className="relative w-full shrink-0 md:w-[min(58vw,940px)]">
      {/* Fotograma con perforaciones */}
      <div className="relative bg-ink-900 py-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
        <div aria-hidden className="sprockets absolute inset-x-0 top-1.5 h-2 opacity-20" />
        <div className="relative mx-3 aspect-[16/10] overflow-hidden bg-ink-800">
          <div data-frame-media className="absolute -inset-x-[10%] inset-y-0">
            {m.type === 'image' ? (
              <Img slug={m.slug} focus={m.focus} sizes="(min-width: 768px) 60vw, 100vw" className="h-full w-full" />
            ) : (
              <LoopVideo src={m.loop} poster={m.poster} label={item.title} />
            )}
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
          {item.date && (
            <span className="absolute bottom-3 right-4 font-mono text-sm tracking-widest text-[#ffb347] [text-shadow:0_0_8px_rgba(255,160,60,0.8)] md:text-base">
              ▶ {item.date}
            </span>
          )}
          {m.type === 'video' && (
            <button
              type="button"
              onClick={onPlay}
              data-cursor="Play"
              className="group absolute inset-0 flex items-center justify-center"
              aria-label="Ver el video completo de la entrega de camisetas"
            >
              <span className="flex items-center gap-3 rounded-full bg-ink-950/70 px-5 py-3 font-sub text-xs uppercase tracking-[0.22em] text-crema backdrop-blur transition-transform duration-500 group-hover:scale-105">
                <span className="inline-block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-crema" />
                Ver la entrega completa
              </span>
            </button>
          )}
        </div>
        <div aria-hidden className="sprockets absolute inset-x-0 bottom-1.5 h-2 opacity-20" />
      </div>

      <div className="mt-6 flex gap-5 md:gap-8">
        <span className="font-display tabular text-5xl text-outline md:text-7xl">{item.take}</span>
        <div className="pt-1">
          <h3 className="font-display text-3xl text-white md:text-5xl">{item.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65 md:text-base">{item.text}</p>
        </div>
      </div>
    </article>
  );
}

export function Origen() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState(false);
  const entrega = TIMELINE.find((t) => t.media.type === 'video')?.media;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const t = track.current!;
        const dist = () => t.scrollWidth - window.innerWidth;
        const st = {
          trigger: '[data-origen-pin]',
          start: 'top top',
          end: () => `+=${dist()}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        };
        const horizontal = gsap.to(t, { x: () => -dist(), ease: 'none', scrollTrigger: { ...st, pin: true, anticipatePin: 1 } });
        gsap.fromTo('[data-playhead]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { ...st, scrub: true } });
        gsap.utils.toArray<HTMLElement>('[data-frame-media]').forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: 'none',
              scrollTrigger: { trigger: el.closest('[data-frame]'), containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="origen" ref={root} aria-labelledby="origen-title" className="relative bg-gradient-to-b from-roast-700 via-roast-950 to-ink-950">
      <div data-origen-pin className="relative md:flex md:h-svh md:flex-col md:justify-center md:overflow-hidden">
        <div
          ref={track}
          className="flex flex-col gap-20 px-4 py-24 md:flex-row md:items-center md:gap-[8vw] md:px-[6vw] md:py-0 md:will-change-transform"
        >
          {/* Cartel de apertura */}
          <div className="shrink-0 md:w-[34vw]">
            <Reveal className="mb-5 flex items-center gap-4">
              <span className="kicker text-crema">Capítulo 02</span>
              <span className="h-px w-12 bg-crema/40" aria-hidden />
              <span className="kicker">El Origen</span>
            </Reveal>
            <SplitReveal as="h2" by="lines" className="font-display text-[clamp(3.6rem,9vw,9rem)] text-white">
              <span id="origen-title">Nacimos en {CLUB.founded}.</span>
            </SplitReveal>
            <Reveal delay={0.15} className="mt-6 max-w-sm text-white/65 md:text-lg">
              Un grupo de amigos, una cafetera y una idea: jugar en serio, reírnos en serio. Esta es la película de cómo
              arrancó todo.
            </Reveal>
            <Reveal delay={0.25} className="mt-10 hidden items-center gap-3 md:flex">
              <span className="kicker">Deslizá</span>
              <span className="text-crema">→</span>
            </Reveal>
          </div>

          {TIMELINE.map((item) => (
            <Frame key={item.take} item={item} onPlay={() => setVideo(true)} />
          ))}

          {/* Cierre */}
          <div className="shrink-0 md:w-[30vw]">
            <p className="font-display text-[clamp(3rem,7vw,7rem)] text-crema">Y recién empieza.</p>
            <p className="mt-4 max-w-xs text-white/60">Pocos meses de vida, dos torneos encima y la cafetera siempre caliente.</p>
          </div>
        </div>

        {/* Barra de reproducción */}
        <div aria-hidden className="absolute inset-x-[6vw] bottom-8 hidden items-center gap-4 md:flex">
          <span className="kicker">REC</span>
          <span className="relative h-px flex-1 bg-white/15">
            <span data-playhead className="absolute inset-0 origin-left bg-crema" style={{ transform: 'scaleX(0)' }} />
          </span>
          <span className="kicker">{String(TIMELINE.length).padStart(2, '0')} tomas</span>
        </div>
      </div>

      {entrega?.type === 'video' && (
        <VideoModal open={video} onClose={() => setVideo(false)} src={entrega.full} poster={entrega.poster} title="La entrega de camisetas" />
      )}
    </section>
  );
}
