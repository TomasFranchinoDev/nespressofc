/**
 * Fechas de Valbé: llegan como "YYYY-MM-DDTHH:mm" en hora de pared de Sunchales, sin zona.
 * Se formatean partiendo el string (nunca con conversiones de zona horaria), así se ven
 * igual que en el sitio de Valbé desde cualquier lugar.
 */
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const pad = (n: number) => String(n).padStart(2, '0');

export function partesFecha(s: string) {
  const [fecha, hora = ''] = s.split('T');
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh = '00', mm = '00'] = hora.split(':');
  return {
    y, m, d,
    hora: `${hh}:${mm}`,
    dia: DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()],
    ddmm: `${pad(d)}/${pad(m)}`,
  };
}

/** Días de calendario entre hoy y la fecha del partido (0 = hoy, negativo = ya pasó). */
export function diasHasta(s: string, now = new Date()) {
  const { y, m, d } = partesFecha(s);
  const partido = Date.UTC(y, m - 1, d);
  const hoy = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((partido - hoy) / 86_400_000);
}

export function cuentaRegresiva(s: string, now = new Date()) {
  const n = diasHasta(s, now);
  if (n < 0) return 'Resultado en camino';
  if (n === 0) return '¡Es hoy!';
  if (n === 1) return 'Mañana';
  return `Faltan ${n} días`;
}
