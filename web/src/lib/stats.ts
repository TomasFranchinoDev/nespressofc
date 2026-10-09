/**
 * Todo lo que se DERIVA de los datos del plantel.
 * Nada de números hardcodeados en componentes: si cambia players.ts, cambia la página.
 */
import { PLAYERS, type Player, type StatLine } from '@/data/players';
import { EDICION_LABEL } from '@/data/content';
import valbe from '@/data/valbe.json';

/* ─── Ediciones de Valbé (src/data/valbe.json) ────────────────── */
interface EdicionValbe {
  nombre: string;
  fechasJugadas: number;
  golesFavor: number;
  golesContra: number;
}
const EDICIONES = valbe.ediciones as Record<string, EdicionValbe>;
const ID_ACTUAL = valbe.edicionActual;
const IDS_PASADAS = Object.keys(EDICIONES).filter((e) => e !== ID_ACTUAL);

export const EDICION_ACTUAL: EdicionValbe | undefined = EDICIONES[ID_ACTUAL];
export const EDICIONES_PASADAS = IDS_PASADAS.map((e) => EDICIONES[e]);
/** Cantidad de torneos jugados (ediciones de Valbé donde aparece Nespresso). */
export const TORNEOS_JUGADOS = Object.keys(EDICIONES).length || 2;

/**
 * Rótulo de `past`: hoy es una sola edición (Invierno 26). Cuando haya más de una,
 * `past` pasa a ser la suma de todas y el rótulo se vuelve genérico solo.
 */
export const PAST_LABEL =
  IDS_PASADAS.length === 1
    ? (EDICION_LABEL[IDS_PASADAS[0]] ?? { corto: EDICIONES[IDS_PASADAS[0]].nombre, largo: EDICIONES[IDS_PASADAS[0]].nombre })
    : { corto: 'Anteriores', largo: 'torneos anteriores' };

const NUMEROS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
/** 2 → "dos" (para el copy: "dos torneos y contando"). */
export const enLetras = (n: number, capital = false) => {
  const w = NUMEROS[n] ?? String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
};

/** 2 → "2", 1.333 → "1,3". */
export const fmtNum = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/** Edad a hoy desde la fecha de nacimiento (no hay que actualizarla nunca). */
export function ageOf(birthDate: string, now = new Date()): number {
  const [y, m, d] = birthDate.split('-').map(Number);
  let age = now.getFullYear() - y;
  const beforeBirthday = now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

const sum = (lines: (StatLine | null)[], key: keyof StatLine) =>
  lines.reduce((acc, l) => acc + (l?.[key] ?? 0), 0);

export const totalGoals = (p: Player) => (p.current?.goles ?? 0) + (p.past?.goles ?? 0);
export const totalPJ = (p: Player) => (p.current?.pj ?? 0) + (p.past?.pj ?? 0);
export const totalCards = (p: Player) => (p.current?.amarillas ?? 0) + (p.past?.amarillas ?? 0);

export const ACTIVE = PLAYERS.filter((p) => p.status === 'activo');
export const RETIRED = PLAYERS.filter((p) => p.status === 'retirado');

export const byId = (id: string) => PLAYERS.find((p) => p.id === id)!;

export const displayName = (p: Player) => p.nickname ?? p.lastName;

/** Totales del equipo por torneo. */
export const TEAM = {
  current: {
    goles: sum(PLAYERS.map((p) => p.current), 'goles'),
    amarillas: sum(PLAYERS.map((p) => p.current), 'amarillas'),
    // Fechas reales del fixture de Valbé; el máximo de PJ queda solo como respaldo.
    fechas: EDICION_ACTUAL?.fechasJugadas ?? Math.max(...PLAYERS.map((p) => p.current?.pj ?? 0)),
  },
  past: {
    goles: sum(PLAYERS.map((p) => p.past), 'goles'),
    amarillas: sum(PLAYERS.map((p) => p.past), 'amarillas'),
    fechas: EDICIONES_PASADAS.length
      ? EDICIONES_PASADAS.reduce((acc, e) => acc + e.fechasJugadas, 0)
      : Math.max(...PLAYERS.map((p) => p.past?.pj ?? 0)),
  },
  get goles() {
    return this.current.goles + this.past.goles;
  },
  get amarillas() {
    return this.current.amarillas + this.past.amarillas;
  },
  activos: ACTIVE.length,
};

/** Ranking histórico de goleadores (solo quienes hicieron al menos 1). */
export const SCORERS = [...ACTIVE]
  .filter((p) => totalGoals(p) > 0)
  .sort((a, b) => totalGoals(b) - totalGoals(a) || (b.current?.goles ?? 0) - (a.current?.goles ?? 0));

export const topScorer = (key: 'current' | 'past') =>
  [...PLAYERS].sort((a, b) => (b[key]?.goles ?? 0) - (a[key]?.goles ?? 0))[0];

export type Tag = 'Goleador' | 'Refuerzo' | 'Reconvertido' | 'Máximo artillero';

/** Tags derivados de los datos (no inventados). */
export function tagsOf(p: Player): { tag: Tag; hint: string }[] {
  const tags: { tag: Tag; hint: string }[] = [];
  if (p.status !== 'activo') return tags;
  if (SCORERS[0]?.id === p.id) tags.push({ tag: 'Máximo artillero', hint: `${totalGoals(p)} goles en la historia del club` });
  else if (topScorer('current').id === p.id) tags.push({ tag: 'Goleador', hint: 'Goleador del torneo actual' });
  if (p.past === null) tags.push({ tag: 'Refuerzo', hint: 'Primer torneo con la camiseta' });
  if (p.previous?.position && p.previous.position !== p.position)
    tags.push({ tag: 'Reconvertido', hint: `Del ${p.previous.number} al ${p.number}` });
  return tags;
}

/** Rango de años de nacimiento de todo el plantel histórico. */
export const BIRTH_RANGE = (() => {
  const years = PLAYERS.map((p) => Number(p.birthDate.slice(0, 4)));
  return { min: Math.min(...years), max: Math.max(...years) };
})();
