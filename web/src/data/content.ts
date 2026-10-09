/**
 * Contenido editorial: timeline, torneos, sponsors, galería.
 * Todo texto visible "fijo" de las secciones vive acá o en la propia sección como copy corto.
 */
import type { ImageSlug } from './images.generated';

/* ─── El Origen ────────────────────────────────────────────── */
export type TimelineMedia =
  | { type: 'image'; slug: ImageSlug; focus?: string }
  | { type: 'video'; loop: string; full: string; poster: string };

export interface TimelineItem {
  take: string;
  date?: string;
  title: string;
  text: string;
  media: TimelineMedia;
}

export const TIMELINE: TimelineItem[] = [
  {
    take: '01',
    date: '10·06·26',
    title: 'Llegó la ropa',
    text: 'Las camisetas, numeradas, sobre el sintético. Hubo gente que se emocionó. Nadie lo va a admitir.',
    media: { type: 'image', slug: 'llegada-ropa' },
  },
  {
    take: '02',
    date: '10·06·26',
    title: 'La entrega',
    text: 'Una por una, con nombre y abrazo. Como en la Selección, pero con menos presupuesto.',
    media: { type: 'video', loop: '/media/entrega-loop.mp4', full: '/media/entrega.mp4', poster: '/media/entrega-poster.webp' },
  },
  {
    take: '03',
    title: 'Prueba de talle',
    text: 'La camiseta se estrena en la cocina. Al fondo, la cafetera: la verdadera sede social.',
    media: { type: 'image', slug: 'kit-front-worn', focus: '50% 30%' },
  },
  {
    take: '04',
    title: 'Primera vez en cancha',
    text: 'Césped natural, cielo gris, bandera nueva y cero miedo.',
    media: { type: 'image', slug: 'equipo-debut' },
  },
  {
    take: '05',
    date: '13·06·26',
    title: 'Debut oficial',
    text: 'Sexto Torneo Invierno Valbé 26, división Europa. Primer partido, primera foto oficial.',
    media: { type: 'image', slug: 'presentacion-valbe' },
  },
  {
    take: '06',
    title: 'El tercer tiempo',
    text: 'Donde se juega el partido de verdad. Invicto desde el primer día.',
    media: { type: 'image', slug: 'tercer-tiempo-nespresso', focus: '50% 60%' },
  },
];

/* ─── Torneos ──────────────────────────────────────────────── */

/**
 * Rótulos de cada edición de Valbé para cards y gráficos.
 * Cuando arranque una edición nueva (ej. Edicion7), sumala acá y en scripts/valbe.config.json.
 */
export const EDICION_LABEL: Record<string, { corto: string; largo: string }> = {
  Edicion5: { corto: 'Invierno 26', largo: 'Invierno Valbé 26' },
  Edicion6: { corto: 'Verano 26', largo: 'Verano Valbé' },
};

export const TOURNAMENTS = [
  {
    key: 'past' as const,
    name: 'Sexto Torneo Invierno Valbé 26',
    edition: 'Edición de invierno',
    season: 'Invierno 2026',
    division: 'Europa',
    venue: 'Complejo Valbé',
    status: 'Finalizado',
    debut: '13·06·26',
    image: 'presentacion-valbe' as ImageSlug,
  },
  {
    key: 'current' as const,
    name: 'Torneo Verano Valbé',
    edition: 'Edición de verano',
    season: 'Verano 2026',
    division: undefined as string | undefined,
    venue: 'Complejo Valbé',
    status: 'En juego',
    debut: undefined as string | undefined,
    image: 'accion-22-a' as ImageSlug,
  },
];

/* ─── Sponsors ─────────────────────────────────────────────── */
export type SponsorStyle = 'vasa' | 'lfc' | 'store' | 'v3' | 'fatto' | 'german';

export interface Sponsor {
  id: SponsorStyle;
  name: string;
  /** Solo si nos lo confirmaron. */
  rubro?: string;
  placement: string;
  note?: string;
}

export const SPONSORS: Sponsor[] = [
  { id: 'vasa', name: 'VASA Metal', placement: 'Pecho · sponsor principal' },
  { id: 'lfc', name: 'LFC', rubro: 'Soluciones gastronómicas', placement: 'Pecho' },
  { id: 'store', name: 'Store Sunchales', placement: 'Pantalón · frente' },
  { id: 'v3', name: 'V3', rubro: 'Bar · boliche', placement: 'Mangas' },
  {
    id: 'fatto', name: 'Fatto in Casa', rubro: 'Rotisería', placement: 'Espalda',
    note: 'Premia al jugador del partido con una pizza.',
  },
  { id: 'german', name: 'Germán', rubro: 'Remisería', placement: 'Pantalón · atrás' },
];

/* ─── Galería ──────────────────────────────────────────────── */
export type GalleryCategory = 'Cancha' | 'Equipo' | 'Tercer tiempo' | 'Indumentaria';

export const GALLERY: { slug: ImageSlug; cat: GalleryCategory; caption: string }[] = [
  { slug: 'accion-22-b', cat: 'Cancha', caption: '#22 · Pinotti encara' },
  { slug: 'equipo-cancha', cat: 'Equipo', caption: 'La suerte del principiante no puede fallar' },
  { slug: 'accion-18-cabezazo', cat: 'Cancha', caption: 'Nacho Romero, de cabeza' },
  { slug: 'tercer-tiempo-selfie', cat: 'Tercer tiempo', caption: 'Bancos, vasos y bandera' },
  { slug: 'accion-11', cat: 'Cancha', caption: '#11 · Cono la para de pecho' },
  { slug: 'kit-flat', cat: 'Indumentaria', caption: 'La camiseta, extendida' },
  { slug: 'previa-galpon', cat: 'Equipo', caption: 'La previa' },
  { slug: 'accion-26', cat: 'Cancha', caption: '#26 · Pala conduce' },
  { slug: 'accion-arquero', cat: 'Cancha', caption: '#1 · El Flaco sale a achicar' },
  { slug: 'kit-short', cat: 'Indumentaria', caption: 'Pantalón: Store Sunchales' },
  { slug: 'accion-5', cat: 'Cancha', caption: '#5 · Toto la protege' },
  { slug: 'previa-selfie', cat: 'Equipo', caption: 'Selfie oficial (no tan oficial)' },
  { slug: 'accion-10', cat: 'Cancha', caption: '#10 · Pipo, detrás de la red' },
  { slug: 'kit-back-worn', cat: 'Indumentaria', caption: 'De espaldas: el 17' },
  { slug: 'accion-22-a', cat: 'Cancha', caption: '#22 · Pinotti la domina' },
  { slug: 'tercer-tiempo-nespresso', cat: 'Tercer tiempo', caption: 'Guirnaldas y bandera' },
  { slug: 'accion-30', cat: 'Cancha', caption: '#30 · Leo, fecha 2' },
  { slug: 'equipo-debut', cat: 'Equipo', caption: 'Primera vez en cancha' },
  { slug: 'accion-conduccion', cat: 'Cancha', caption: 'Pelota al pie' },
  { slug: 'accion-18-b', cat: 'Cancha', caption: '#18 · Juani acompaña' },
  { slug: 'llegada-ropa', cat: 'Indumentaria', caption: 'El día que llegó la ropa' },
  { slug: 'presentacion-valbe', cat: 'Equipo', caption: 'Presentación Invierno Valbé 26' },
];
