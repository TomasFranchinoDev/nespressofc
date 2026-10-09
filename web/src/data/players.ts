/**
 * Plantel de Nespresso FC — datos reales.
 *
 * Identidad (nombre, número, posición, fotos, roles) → se edita acá.
 * Estadísticas (current / past) → vienen de src/data/valbe.json, que regenera todos los días
 * el GitHub Action "Sync datos Valbé" (scripts/sync-valbe.mjs). Los números de PLAYERS_BASE
 * quedan solo como respaldo si un jugador no aparece en ese JSON.
 * Totales, rankings, edades y tags se calculan solos en lib/stats.ts.
 */
import type { ImageSlug } from './images.generated';
import valbe from './valbe.json';

export type Position = 'ARQ' | 'DEF' | 'MD' | 'DC';

export const POSITION_LABEL: Record<Position, string> = {
  ARQ: 'Arquero',
  DEF: 'Defensor',
  MD: 'Mediocampista',
  DC: 'Delantero',
};

export interface StatLine {
  pj: number;
  goles: number;
  amarillas: number;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  number: number;
  position: Position;
  /** Número/posición del torneo anterior, si cambió. */
  previous?: { number?: number; position?: Position };
  /** ISO. Solo se muestra la edad calculada. */
  birthDate: string;
  status: 'activo' | 'retirado';
  /** Edición en juego de Valbé. null = no jugó. */
  current: StatLine | null;
  /** Suma de las ediciones anteriores de Valbé. null = no jugó ninguna. */
  past: StatLine | null;
  roles?: string[];
  photo?: { slug: ImageSlug; focus?: string };
}

const s = (pj: number, goles = 0, amarillas = 0): StatLine => ({ pj, goles, amarillas });

/** Plantel con estadísticas de respaldo (se pisan con valbe.json más abajo). */
export const PLAYERS_BASE: Player[] = [
  {
    id: 'kerk', firstName: 'Julián', lastName: 'Kerk', nickname: 'Juka',
    number: 7, position: 'MD', birthDate: '2003-03-27', status: 'activo',
    current: s(2, 4), past: s(6, 3),
  },
  {
    id: 'pinotti', firstName: 'Tomás Alejandro', lastName: 'Pinotti',
    number: 22, position: 'DC', birthDate: '2002-06-08', status: 'activo',
    current: s(2, 0), past: s(9, 4, 1), roles: ['Presidente'],
    photo: { slug: 'accion-22-b', focus: '40% 30%' },
  },
  {
    id: 'romero', firstName: 'Ignacio', lastName: 'Romero', nickname: 'Nacho',
    number: 3, position: 'DEF', birthDate: '1994-12-30', status: 'activo',
    current: s(3, 2), past: s(5, 0),
    photo: { slug: 'accion-18-cabezazo', focus: '48% 25%' },
  },
  {
    id: 'genero', firstName: 'Gerónimo', lastName: 'Genero', nickname: 'Gero',
    number: 8, position: 'MD', birthDate: '2004-02-07', status: 'activo',
    current: s(3, 1, 1), past: s(4, 1),
  },
  {
    id: 'fabbro', firstName: 'Valentino', lastName: 'Fabbro', nickname: 'Vale',
    number: 1, position: 'ARQ', previous: { number: 9, position: 'DC' },
    birthDate: '2003-09-23', status: 'activo',
    current: s(2, 1), past: s(8, 0),
  },
  {
    id: 'dipaolo', firstName: 'Facundo', lastName: 'Di Paolo', nickname: 'Dipa',
    number: 4, position: 'DEF', birthDate: '1995-06-30', status: 'activo',
    current: s(3, 0), past: s(8, 2),
  },
  {
    id: 'suarez', firstName: 'Tomás Bautista', lastName: 'Suárez', nickname: 'Toto',
    number: 5, position: 'MD', birthDate: '2002-05-16', status: 'activo',
    current: s(3, 0), past: s(5, 2, 1),
    photo: { slug: 'accion-5', focus: '62% 35%' },
  },
  {
    id: 'fregona', firstName: 'Elian', lastName: 'Fregona', nickname: 'Pipo',
    number: 10, position: 'MD', birthDate: '2003-12-18', status: 'activo',
    current: s(3, 0), past: s(9, 1, 2),
    photo: { slug: 'accion-10', focus: '30% 30%' },
  },
  {
    id: 'alasia', firstName: 'Ulises', lastName: 'Alasia', nickname: 'Cono',
    number: 11, position: 'MD', birthDate: '2002-12-20', status: 'activo',
    current: s(1, 0), past: s(6, 1),
    photo: { slug: 'accion-11', focus: '55% 25%' },
  },
  {
    id: 'armatti', firstName: 'Leandro', lastName: 'Armatti', nickname: 'Leo',
    number: 30, position: 'MD', birthDate: '1994-10-14', status: 'activo',
    current: s(0), past: s(4, 1),
    photo: { slug: 'accion-30', focus: '22% 30%' },
  },
  {
    id: 'marantelli', firstName: 'Juan Ignacio', lastName: 'Marantelli', nickname: 'Juani',
    number: 18, position: 'DC', birthDate: '1994-07-26', status: 'activo',
    current: s(3, 0, 1), past: null,
  },
  {
    id: 'acuna', firstName: 'Franco Ezequiel', lastName: 'Acuña', nickname: 'Coty',
    number: 19, position: 'DEF', birthDate: '1994-02-06', status: 'activo',
    current: s(2, 0), past: s(6, 0), roles: ['Vicepresidente', 'DT'],
  },
  {
    id: 'franchino', firstName: 'Tomás Agustín', lastName: 'Franchino', nickname: 'Tomi',
    number: 17, position: 'MD', birthDate: '2003-09-05', status: 'activo',
    current: s(2, 0), past: s(9, 0),
  },
  {
    id: 'driussi', firstName: 'Marcos', lastName: 'Driussi', nickname: 'Marcos',
    number: 6, position: 'MD', birthDate: '2003-09-01', status: 'activo',
    current: s(2, 0), past: s(1, 0), roles: ['DT'],
  },
  {
    id: 'palacios', firstName: 'Agustín', lastName: 'Palacios', nickname: 'Pala',
    number: 26, position: 'DEF', birthDate: '2003-10-10', status: 'activo',
    current: s(1, 0), past: s(7, 0, 1),
    photo: { slug: 'accion-26', focus: '32% 30%' },
  },

  // Retirados — "camisetas colgadas"
  {
    id: 'yasenzaniro', firstName: 'Martín', lastName: 'Yasenzaniro', nickname: 'Flaco',
    number: 1, position: 'ARQ', birthDate: '1982-03-06', status: 'retirado',
    current: null, past: null,
    photo: { slug: 'accion-arquero', focus: '75% 25%' },
  },
  {
    id: 'junco', firstName: 'Fernando', lastName: 'Junco', nickname: 'Fer',
    number: 2, position: 'DEF', birthDate: '2009-02-11', status: 'retirado',
    current: null, past: null,
  },
];

/* ─── Estadísticas de Valbé ─────────────────────────────────── */
type ValbeLine = { current: StatLine | null; past: StatLine | null };
const VALBE_STATS: Record<string, ValbeLine | undefined> = valbe.jugadores;

/** Pisa SOLO current/past con lo que trae Valbé; todo lo demás queda como está. */
const conValbe = (p: Player): Player => {
  const v = VALBE_STATS[p.id];
  return v ? { ...p, current: v.current ?? p.current, past: v.past ?? p.past } : p;
};

export const PLAYERS: Player[] = PLAYERS_BASE.map(conValbe);
