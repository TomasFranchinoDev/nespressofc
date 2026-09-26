/**
 * <picture> responsive con AVIF + WebP generados por scripts/optimize-images.mjs.
 * Reserva el espacio (width/height) y muestra un LQIP borroso mientras carga.
 */
import { useState, type CSSProperties } from 'react';
import { IMAGES, type ImageSlug } from '@/data/images.generated';
import { cn } from '@/lib/cn';

interface ImgProps {
  slug: ImageSlug;
  /** Atributo sizes, ej: "(min-width: 768px) 50vw, 100vw". */
  sizes?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  focus?: string;
  priority?: boolean;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  draggable?: boolean;
}

export const srcFor = (slug: ImageSlug, width = 1600, ext: 'webp' | 'avif' = 'webp') => {
  const meta = IMAGES[slug];
  const w = [...meta.widths].reverse().find((x) => x <= width) ?? meta.widths[0];
  return `/img/${slug}-${w}.${ext}`;
};

export function Img({
  slug, sizes = '100vw', alt, className, imgClassName, focus, priority, style, imgStyle, draggable = false,
}: ImgProps) {
  const meta = IMAGES[slug];
  const [loaded, setLoaded] = useState(false);
  const srcset = (ext: string) => meta.widths.map((w) => `/img/${slug}-${w}.${ext} ${w}w`).join(', ');

  return (
    <picture
      className={cn('block overflow-hidden bg-ink-800 bg-cover bg-center', className)}
      style={{ backgroundImage: loaded ? undefined : `url(${meta.lqip})`, ...style }}
    >
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
      <img
        src={srcFor(slug, 960)}
        width={meta.w}
        height={meta.h}
        alt={alt ?? meta.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={draggable}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
        style={{ objectPosition: focus, ...imgStyle }}
      />
    </picture>
  );
}
