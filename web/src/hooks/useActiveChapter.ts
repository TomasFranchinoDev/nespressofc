import { useEffect, useState } from 'react';
import { CHAPTERS, type ChapterId } from '@/data/club';

/** Capítulo cuyo cuerpo cruza el centro del viewport. */
export function useActiveChapter(): ChapterId {
  const [active, setActive] = useState<ChapterId>('inicio');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as ChapterId);
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}
