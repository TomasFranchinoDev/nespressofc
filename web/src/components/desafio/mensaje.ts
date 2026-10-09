/**
 * "Desafianos": lógica pura del formulario de amistosos (sin React).
 * Valida lo que carga el equipo rival y arma el mensaje que llega por WhatsApp o Instagram.
 */
import { CLUB } from '@/data/club';
import { partesFecha } from '@/lib/fecha';

export type Medio = 'whatsapp' | 'instagram';
export type Franja = 'tarde' | 'noche' | 'trasnoche' | 'flexible';
export type Cancha = 'valbe' | 'propia' | 'a-definir';

export interface Desafio {
  equipo: string;
  contacto: string;
  /** Por dónde le respondemos al rival. */
  medio: Medio;
  /** Teléfono o @usuario, según `medio`. */
  dato: string;
  /** "YYYY-MM-DD" (la segunda es opcional). */
  fechas: string[];
  franja: Franja | null;
  cancha: Cancha | null;
  canchaDetalle: string;
}

export const FRANJAS: { id: Franja; label: string; detalle: string }[] = [
  { id: 'tarde', label: 'Tarde', detalle: '14 a 18 h' },
  { id: 'noche', label: 'Noche', detalle: '18 a 21 h' },
  { id: 'trasnoche', label: 'Trasnoche', detalle: '21 a 24 h' },
  { id: 'flexible', label: 'Nos adaptamos', detalle: 'cualquier horario' },
];

export const CANCHAS: { id: Cancha; label: string; detalle: string }[] = [
  { id: 'valbe', label: 'Complejo Valbé', detalle: 'nuestra casa' },
  { id: 'propia', label: 'Su cancha', detalle: 'nos dicen dónde' },
  { id: 'a-definir', label: 'A definir', detalle: 'lo hablamos' },
];

export const DESAFIO_VACIO: Desafio = {
  equipo: '',
  contacto: '',
  medio: 'whatsapp',
  dato: '',
  fechas: [''],
  franja: null,
  cancha: null,
  canchaDetalle: '',
};

/** Hoy en formato "YYYY-MM-DD", en hora local (para el `min` del input de fecha). */
export function hoyISO(now = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export type Errores = Partial<Record<'equipo' | 'contacto' | 'dato' | 'fechas' | 'franja' | 'cancha' | 'canchaDetalle', string>>;

const soloDigitos = (s: string) => s.replace(/\D/g, '');
const usuarioIG = (s: string) => s.trim().replace(/^@/, '');

export function validar(d: Desafio, hoy = hoyISO()): Errores {
  const e: Errores = {};
  if (d.equipo.trim().length < 2) e.equipo = 'Contanos cómo se llama el equipo.';
  if (d.contacto.trim().length < 2) e.contacto = '¿Quién organiza?';
  if (d.medio === 'whatsapp' && soloDigitos(d.dato).length < 8) e.dato = 'Dejanos un WhatsApp con código de área.';
  if (d.medio === 'instagram' && !/^[a-zA-Z0-9._]{2,30}$/.test(usuarioIG(d.dato))) e.dato = 'Dejanos un usuario de Instagram válido.';
  const fechas = d.fechas.filter(Boolean);
  if (!fechas.length) e.fechas = 'Elegí al menos una fecha.';
  else if (fechas.some((f) => f < hoy)) e.fechas = 'Esa fecha ya pasó: elegí una de hoy en adelante.';
  if (!d.franja) e.franja = 'Elegí una franja horaria.';
  if (!d.cancha) e.cancha = 'Elegí dónde jugar.';
  else if (d.cancha === 'propia' && d.canchaDetalle.trim().length < 2) e.canchaDetalle = '¿En qué cancha?';
  return e;
}

const fechaLarga = (iso: string) => {
  const f = partesFecha(iso);
  return `${f.dia} ${f.ddmm}`;
};

export function armarMensaje(d: Desafio): string {
  const fechas = d.fechas.filter(Boolean).map(fechaLarga);
  const franja = FRANJAS.find((f) => f.id === d.franja);
  const cancha =
    d.cancha === 'valbe' ? 'Complejo Valbé' : d.cancha === 'propia' ? `${d.canchaDetalle.trim()} (su cancha)` : 'A definir';
  const contacto = d.medio === 'whatsapp' ? `WhatsApp ${d.dato.trim()}` : `Instagram @${usuarioIG(d.dato)}`;

  return [
    `⚽ ¡Desafío para ${CLUB.name}!`,
    '',
    `Equipo: ${d.equipo.trim()}`,
    `Organiza: ${d.contacto.trim()}`,
    `Contacto: ${contacto}`,
    `Fecha: ${fechas.join(' o ')}`,
    `Horario: ${franja ? `${franja.label} (${franja.detalle})` : '-'}`,
    `Cancha: ${cancha}`,
    '',
    'Enviado desde nespressofc.com',
  ].join('\n');
}

export const linkWhatsApp = (mensaje: string) =>
  CLUB.contact.whatsapp ? `https://wa.me/${CLUB.contact.whatsapp}?text=${encodeURIComponent(mensaje)}` : null;

/** Chat directo de Instagram. Instagram no deja precargar texto: el mensaje se copia antes. */
export const LINK_IG_DM = CLUB.contact.instagram ? `https://ig.me/m/${CLUB.contact.instagram}` : null;
export const LINK_IG_PERFIL = CLUB.contact.instagram ? `https://instagram.com/${CLUB.contact.instagram}` : null;
