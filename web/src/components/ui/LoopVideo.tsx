/**
 * Video mudo en loop que solo se reproduce cuando está en pantalla (ahorra batería y CPU).
 * Con "reducir movimiento" queda en el póster.
 */
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMedia';
import { cn } from '@/lib/cn';

export function LoopVideo({ src, poster, className, label }: { src: string; poster?: string; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()),
      { rootMargin: '200px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
