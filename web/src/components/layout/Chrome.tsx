/**
 * "Chrome" de la película: navbar, menú mobile, barra de progreso (la crema que se llena)
 * e índice lateral de capítulos.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import { CHAPTERS } from '@/data/club';
import { Crest } from '@/components/ui/Crest';
import { useActiveChapter } from '@/hooks/useActiveChapter';
import { useScrollApi } from '@/providers/SmoothScroll';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';

const NAV_LINKS = ['origen', 'identidad', 'plantel', 'barra', 'torneos'] as const;

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[75] h-[2px] origin-left bg-gradient-to-r from-roast-500 via-caramel to-crema"
      style={{ scaleX }}
    />
  );
}

export function Navbar({ ready }: { ready: boolean }) {
  const { scrollTo } = useScrollApi();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [heroEnd, setHeroEnd] = useState(1200);
  const active = useActiveChapter();

  useEffect(() => {
    const measure = () => setHeroEnd((document.getElementById('inicio')?.offsetHeight ?? 1200) - window.innerHeight * 1.1);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > heroEnd + 200 && y > prev && !menu);
  });

  // El escudo del navbar "recibe" al escudo 3D del Hero al final del recorrido.
  const crestOpacity = useTransform(scrollY, [heroEnd - 150, heroEnd + 50], [0, 1]);
  const go = (id: string) => {
    setMenu(false);
    scrollTo(`#${id}`);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[72] px-4 pt-3 md:px-8 md:pt-5"
        initial={{ y: -100 }}
        animate={{ y: ready && !hidden ? 0 : -100 }}
        transition={{ duration: 0.7, ease: EASE.espresso }}
      >
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-[1600px] items-center justify-between rounded-full border border-white/8 bg-ink-950/55 py-2 pl-3 pr-2 backdrop-blur-xl"
        >
          <button type="button" onClick={() => go('inicio')} className="flex items-center gap-3" aria-label="Ir al inicio">
            <motion.span style={{ opacity: crestOpacity }} className="block">
              <Crest variant="kit" className="h-8 w-auto" />
            </motion.span>
            <span className="font-display text-2xl tracking-wide text-white">
              Nespresso <span className="text-crema">FC</span>
            </span>
          </button>
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((id) => {
              const ch = CHAPTERS.find((c) => c.id === id)!;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    className={cn(
                      'rounded-full px-4 py-2 font-sub text-xs uppercase tracking-[0.2em] transition-colors',
                      active === id ? 'text-crema' : 'text-white/60 hover:text-white',
                    )}
                  >
                    {ch.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go('sumate')}
              className="hidden rounded-full bg-crema px-5 py-2.5 font-sub text-xs uppercase tracking-[0.2em] text-ink-950 transition-colors hover:bg-white sm:block"
            >
              Desafianos
            </button>
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="menu-mobile"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10"
              aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            >
              <motion.span className="block h-px w-4 bg-white" animate={{ rotate: menu ? 45 : 0, y: menu ? 3.5 : 0 }} />
              <motion.span className="block h-px w-4 bg-white" animate={{ rotate: menu ? -45 : 0, y: menu ? -3.5 : 0 }} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 z-[71] flex flex-col justify-center overflow-y-auto bg-roast-950/97 px-6 pb-8 pt-24 backdrop-blur-xl md:px-16"
            initial={{ clipPath: 'circle(0% at 95% 4%)' }}
            animate={{ clipPath: 'circle(150% at 95% 4%)' }}
            exit={{ clipPath: 'circle(0% at 95% 4%)' }}
            transition={{ duration: 0.8, ease: EASE.crema }}
            data-lenis-prevent
          >
            <motion.ol
              className="space-y-1"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } } }}
            >
              {CHAPTERS.map((c) => (
                <motion.li
                  key={c.id}
                  variants={{ hidden: { y: 40, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE.espresso } } }}
                >
                  <button type="button" onClick={() => go(c.id)} className="group flex items-baseline gap-4 text-left">
                    <span className="kicker w-8">{c.n}</span>
                    <span
                      className={cn(
                        'font-display text-[clamp(2rem,min(8vw,7svh),5.5rem)] transition-colors',
                        active === c.id ? 'text-crema' : 'text-white group-hover:text-crema',
                      )}
                    >
                      {c.label}
                    </span>
                  </button>
                </motion.li>
              ))}
            </motion.ol>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ChapterIndex() {
  const active = useActiveChapter();
  const { scrollTo } = useScrollApi();
  return (
    <nav aria-label="Capítulos" className="fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 xl:block">
      <ol className="flex flex-col items-end gap-3">
        {CHAPTERS.map((c) => {
          const on = active === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => scrollTo(`#${c.id}`)}
                className="group flex items-center gap-3"
                aria-current={on ? 'step' : undefined}
                aria-label={`${c.n} ${c.label}`}
              >
                <span
                  className={cn(
                    'font-sub text-[10px] uppercase tracking-[0.2em] transition-all duration-500',
                    on ? 'text-crema opacity-100' : 'translate-x-2 text-white/50 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                  )}
                >
                  {c.label}
                </span>
                <span className={cn('tabular font-sub text-[10px] transition-colors', on ? 'text-crema' : 'text-white/30')}>{c.n}</span>
                <span className={cn('block h-px transition-all duration-500', on ? 'w-8 bg-crema' : 'w-3 bg-white/25')} />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
