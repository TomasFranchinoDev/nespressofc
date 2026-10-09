/** Información general del club. Editá acá sin tocar componentes. */
export const CLUB = {
  name: 'Nespresso FC',
  city: 'Sunchales, Santa Fe',
  founded: 2026,
  motto: 'La suerte del principiante no puede fallar',
  /**
   * Contacto. Si un valor es null, su botón no se muestra.
   * whatsapp: con código de país, sin "+" ni espacios (formato de wa.me).
   * Los desafíos del formulario "Desafianos" llegan a estos dos canales.
   */
  contact: {
    instagram: 'nespressofc' as string | null,
    whatsapp: '5493493666696' as string | null,
    email: null as string | null,
  },
};

/** Organigrama (se muestra en El Plantel y en los créditos). */
export const STAFF = [
  { role: 'Presidente', playerId: 'pinotti' },
  { role: 'Vicepresidente', playerId: 'acuna' },
  { role: 'Director técnico', playerId: 'driussi' },
  { role: 'Director técnico (este torneo)', playerId: 'acuna' },
];

export const CHAPTERS = [
  { id: 'inicio', n: '01', label: 'Inicio' },
  { id: 'origen', n: '02', label: 'El Origen' },
  { id: 'identidad', n: '03', label: 'La Identidad' },
  { id: 'plantel', n: '04', label: 'El Plantel' },
  { id: 'cancha', n: '05', label: 'En Cancha' },
  { id: 'barra', n: '06', label: 'La Barra' },
  { id: 'torneos', n: '07', label: 'Torneos' },
  { id: 'sponsors', n: '08', label: 'Sponsors' },
  { id: 'galeria', n: '09', label: 'Momentos' },
  { id: 'sumate', n: '10', label: 'Sumate' },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];
