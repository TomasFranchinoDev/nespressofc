/**
 * 09 · GALERÍA / MOMENTOS
 * Masonry con filtros + lightbox con transición compartida (layoutId): la miniatura "crece" hasta pantalla completa.
 * Lightbox: flechas, teclado (←/→/Esc) y swipe en mobile.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { GALLERY, type GalleryCategory } from '@/data/content';
import { IMAGES } from '@/data/images.generated';
import { EASE } from '@/lib/motion';
import { Img } from '@/components/ui/Img';
import { Chip, SectionHeading } from '@/components/ui/Primitives';
import { useScrollApi } from '@/providers/SmoothScroll';

const CATS: (GalleryCategory | 'Todo')[] = ['Todo', 'Cancha', 'Equipo', 'Tercer tiempo', 'Indumentaria'];

export function Galeria() {
  const [cat, setCat] = useState<GalleryCategory | 'Todo'>('Todo');
  const [open, setOpen] = useState<number | null>(null);
  const { stop, start } = useScrollApi();
  const items = useMemo(() => GALLERY.filter((g) => cat === 'Todo' || g.cat === cat), [cat]);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      start();
    };
  }, [open, close, step, stop, start]);

  const current = open !== null ? items[open] : null;
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) step(1);
    else if (info.offset.x > 80) step(-1);
  };

  return (
    <section id="galeria" aria-label="Momentos" className="relative bg-ink-950 px-4 py-28 md:px-[6vw] md:py-40">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading n="09" label="Momentos" title={<>El álbum</>} sub="Todo lo que pasó, en desorden, como en el celular de cualquiera." />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar fotos">
          {CATS.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <motion.ul layout className="mt-14 columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
        <AnimatePresence mode="popLayout">
          {items.map((g, i) => (
            <motion.li
              key={g.slug}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: EASE.espresso, delay: Math.min(i, 8) * 0.03 }}
              className="mb-3 break-inside-avoid md:mb-4"
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full overflow-hidden rounded-xl"
                data-cursor="Ver"
                aria-label={`Ampliar: ${g.caption}`}
              >
                <motion.div layoutId={`g-${g.slug}`} style={{ aspectRatio: `${IMAGES[g.slug].w} / ${IMAGES[g.slug].h}` }}>
                  <Img
                    slug={g.slug}
                    sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 ease-[var(--ease-espresso)] group-hover:scale-105"
                  />
                </motion.div>
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink-950/90 to-transparent p-3 text-left font-sub text-[11px] uppercase tracking-[0.18em] text-white transition-transform duration-500 group-hover:translate-y-0">
                  {g.caption}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.caption}
            className="fixed inset-0 z-[85] flex flex-col items-center justify-center bg-ink-950/95 p-4 backdrop-blur-md md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            data-lenis-prevent
          >
            <motion.div
              layoutId={`g-${current.slug}`}
              className="relative max-h-[80svh] max-w-[92vw] overflow-hidden rounded-xl"
              style={{ aspectRatio: `${IMAGES[current.slug].w} / ${IMAGES[current.slug].h}`, height: 'min(80svh, 92vw * ' + IMAGES[current.slug].h / IMAGES[current.slug].w + ')' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={onDragEnd}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.6, ease: EASE.espresso }}
            >
              <Img slug={current.slug} sizes="92vw" className="h-full w-full" priority />
            </motion.div>
            <div className="mt-5 flex w-full max-w-3xl items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => step(-1)} className="font-sub text-xs uppercase tracking-[0.22em] text-white/70 hover:text-crema" aria-label="Foto anterior">
                ← Ant.
              </button>
              <p className="text-center font-sub text-sm uppercase tracking-[0.18em] text-white">
                {current.caption} <span className="text-white/40">· {open! + 1}/{items.length}</span>
              </p>
              <button type="button" onClick={() => step(1)} className="font-sub text-xs uppercase tracking-[0.22em] text-white/70 hover:text-crema" aria-label="Foto siguiente">
                Sig. →
              </button>
            </div>
            <button type="button" onClick={close} className="absolute right-5 top-5 font-sub text-xs uppercase tracking-[0.25em] text-crema" autoFocus>
              Cerrar ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
