# Nespresso FC — Landing cinematográfica

Single-page scroll-driven para el equipo de fútbol 6 Nespresso FC (Sunchales, Santa Fe).

**Stack:** React 19 + Vite 8 + TypeScript · Tailwind CSS v4 · Motion · GSAP (ScrollTrigger, SplitText) · Lenis · Three.js / R3F (solo el escudo, carga diferida).

## Correr

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción en dist/
```

## Editar contenido (sin tocar componentes)

| Qué | Dónde |
| --- | --- |
| Jugadores, números, stats, apodos, fotos | `src/data/players.ts` |
| Redes / WhatsApp / mail (activan los botones del final) | `src/data/club.ts` → `CLUB.contact` |
| Comisión directiva | `src/data/club.ts` → `STAFF` |
| Historia (tomas del Origen), torneos, sponsors, galería | `src/data/content.ts` |

Totales, goleadores, edades y tags se **calculan** en `src/lib/stats.ts`.

### Agregar la foto de un jugador
1. Copiá la foto a `../Imagenes/`.
2. Sumala en `IMAGES` dentro de `scripts/optimize-images.mjs` (slug + archivo + alt).
3. `npm run assets:images`
4. En `players.ts`: `photo: { slug: 'tu-slug', focus: '50% 30%' }`.

## Pipelines de assets

```bash
npm run assets           # imágenes (AVIF/WebP + LQIP) + escudo recortado + videos
npm run assets:images    # solo imágenes → public/img + src/data/images.generated.ts
npm run assets:videos    # videos comprimidos, loops y pósters → public/media
npm run assets:hero -- hero_16x9.mp4 hero_9x16.mp4   # secuencia del Hero
```

ffmpeg viene incluido (`ffmpeg-static`), no hace falta instalarlo.

### Video del Hero (opcional)
El Hero usa la foto real con un dolly-in simulado. Si generás el video IA "dolly-in" (Kling/Runway)
y corrés `npm run assets:hero -- video.mp4 [video_vertical.mp4]`, el Hero detecta
`public/media/hero/manifest.json` y pasa a reproducir el video frame a frame con el scroll.

## Arquitectura

```
src/
  data/          contenido real (tipado)
  lib/           gsap (registro + eases), motion (tokens), stats (derivados), cn
  hooks/         media queries, tier del dispositivo, capítulo activo
  providers/     SmoothScroll (Lenis ↔ ScrollTrigger)
  components/
    layout/      Preloader, Navbar/Menú/Progreso/Índice
    fx/          Grano, viñeta, partículas (vapor/polvo/chispas), cursor, gotas de café
    ui/          Img, SplitReveal, Parallax/MaskReveal, TiltCard, botones, modales…
    three/       Escudo 3D (extruido desde el SVG del logo)
  sections/      Hero, Origen, Identidad, Plantel, EnCancha, Barra, Torneos, Sponsors, Galeria, Cta
```

**Regla de animación:** GSAP maneja todo lo que depende del scroll; Motion, todo lo que depende de eventos.
Con `prefers-reduced-motion` no se monta Lenis y los scrubs se reemplazan por estados finales.
