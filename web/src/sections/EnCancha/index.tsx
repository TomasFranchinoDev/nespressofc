/**
 * 05 · EN CANCHA
 * Mosaico bento de fotos de partido. Cada tile tiene parallax a su propia velocidad,
 * así la grilla "respira" en profundidad al scrollear. Marquee de palabras clave de fondo.
 */
import { Img } from '@/components/ui/Img';
import { Parallax } from '@/components/ui/ScrollFx';
import { Marquee, Reveal, SectionHeading } from '@/components/ui/Primitives';
import type { ImageSlug } from '@/data/images.generated';
import { cn } from '@/lib/cn';

// Bandas de 2 filas en desktop (12 columnas). Retratos en 3-4 columnas, apaisadas en 5-6: nadie pierde la cabeza.
const TILES: { slug: ImageSlug; caption: string; cls: string; speed: number; focus?: string }[] = [
  { slug: 'accion-22-b', caption: '#22 · Pinotti', cls: 'md:col-span-4 md:row-span-2', speed: 8, focus: '45% 30%' },
  { slug: 'accion-26', caption: '#26 · Pala', cls: 'col-span-2 md:col-span-5 md:row-span-2', speed: 12, focus: '35% 50%' },
  { slug: 'accion-18-cabezazo', caption: '#18 · Juani', cls: 'md:col-span-3 md:row-span-2', speed: 10, focus: '50% 30%' },
  { slug: 'equipo-cancha', caption: 'Todos', cls: 'col-span-2 md:col-span-6 md:row-span-2', speed: 10, focus: '50% 68%' },
  { slug: 'accion-5', caption: '#5 · Toto', cls: 'md:col-span-3 md:row-span-2', speed: 14, focus: '62% 40%' },
  { slug: 'accion-11', caption: '#11 · Cono', cls: 'md:col-span-3 md:row-span-2', speed: 12, focus: '55% 30%' },
  { slug: 'accion-10', caption: '#10 · Pipo', cls: 'col-span-2 md:col-span-5 md:row-span-2', speed: 14, focus: '30% 40%' },
  { slug: 'accion-arquero', caption: '#1 · El Flaco', cls: 'md:col-span-3 md:row-span-2', speed: 10, focus: '72% 30%' },
  { slug: 'accion-conduccion', caption: 'Pelota al pie', cls: 'md:col-span-4 md:row-span-2', speed: 12, focus: '32% 45%' },
];

const WORDS = ['Intensidad', 'Presión', 'Toque', 'Gol', 'Tercer tiempo'];

export function EnCancha() {
  return (
    <section id="cancha" aria-label="En Cancha" className="relative overflow-hidden bg-ink-950 py-28 md:py-40">
      <div className="px-4 md:px-[6vw]">
        <SectionHeading
          n="05"
          label="En Cancha"
          title={<>En la cancha<br />no hay chistes</>}
          sub={<>Bueno, casi. Fútbol 6, cancha chica, piernas grandes. Acá se deja todo y después se ceba.</>}
        />
      </div>

      <Marquee duration={40} className="mt-16 border-y border-white/10 py-4">
        {WORDS.map((w) => (
          <span key={w} className="font-display flex items-center px-6 text-5xl text-white/80 md:text-7xl">
            {w}
            <span className="ml-12 text-crema">✦</span>
          </span>
        ))}
      </Marquee>

      <ul className="mt-12 grid grid-flow-row-dense auto-rows-[46vw] grid-cols-2 gap-2 px-2 md:mt-16 md:auto-rows-[15.5vw] md:grid-cols-12 md:gap-3 md:px-[4vw]">
        {TILES.map((t, i) => (
          <li key={t.slug} className={cn('group relative overflow-hidden rounded-xl', t.cls)}>
            <Parallax speed={t.speed} className="h-full w-full">
              <Img
                slug={t.slug}
                focus={t.focus}
                sizes="(min-width: 768px) 45vw, 100vw"
                className="h-full w-full"
                imgClassName="transition-[filter,transform] duration-700 [filter:saturate(0.85)] group-hover:scale-[1.04] group-hover:[filter:saturate(1.05)]"
              />
            </Parallax>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
            <Reveal delay={(i % 3) * 0.05} className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
              <span className="font-sub text-[11px] uppercase tracking-[0.22em] text-white/85">{t.caption}</span>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-6 px-4 text-right text-xs text-white/35 md:px-[4vw]">Fotos de partido: Complejo Valbé</p>
    </section>
  );
}
