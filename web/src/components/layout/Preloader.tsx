/**
 * Preloader: el escudo se dibuja mientras cargan fuentes, la foto del Hero y (si corresponde) el 3D.
 * Contador 00→100 + frases que rotan. Al terminar, sube como un telón y avisa con onDone().
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { CrestOutline } from '@/components/ui/Crest';
import { EASE } from '@/lib/motion';
import { useScrollApi } from '@/providers/SmoothScroll';
import { usePrefersReducedMotion } from '@/hooks/useMedia';

const LINES = ['Moliendo granos…', 'Calentando el agua…', 'Buscando al arquero…', 'Inflando la pelota…', 'Extrayendo…'];

export function Preloader({ tasks, onDone }: { tasks: Promise<unknown>[]; onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const { stop, start } = useScrollApi();
  const [visible, setVisible] = useState(true);
  const [line, setLine] = useState(0);
  const raw = useMotionValue(0);
  const progress = useSpring(raw, { stiffness: 60, damping: 20 });
  const pct = useTransform(progress, (v) => String(Math.round(v * 100)).padStart(3, '0'));

  useEffect(() => {
    stop();
    window.scrollTo(0, 0);
    let done = 0;
    const total = tasks.length + 1;
    const bump = () => raw.set(++done / total);
    const minTime = new Promise((r) => setTimeout(r, reduced ? 300 : 1900));
    tasks.forEach((t) => t.catch(() => undefined).finally(bump));
    // Nunca bloquear más de 6s por una red lenta.
    const timeout = new Promise((r) => setTimeout(r, 6000));
    Promise.race([Promise.allSettled([...tasks, minTime]), timeout]).then(() => {
      raw.set(1);
      setTimeout(() => setVisible(false), reduced ? 0 : 550);
    });
    const id = setInterval(() => setLine((l) => (l + 1) % LINES.length), 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        start();
        onDone();
      }}
    >
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: reduced ? 0.2 : 1.1, ease: EASE.crema }}
          role="status"
          aria-live="polite"
          aria-label="Cargando Nespresso FC"
        >
          <CrestOutline progress={progress} className="h-[26vh] w-auto max-w-[60vw]" />
          <div className="mt-10 flex items-baseline gap-4">
            <motion.span className="font-display tabular text-6xl text-crema">{pct}</motion.span>
            <span className="kicker w-44">{LINES[line]}</span>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 kicker text-white/35">
            Nespresso FC · Sunchales
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
