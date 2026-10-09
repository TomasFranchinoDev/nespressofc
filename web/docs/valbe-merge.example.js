/**
 * Ejemplo de integración en nespressofc.com.
 *
 * Hoy el plantel está hardcodeado (en el bundle se ve así):
 *   { id: "kerk", ..., current: $(2, 4), past: $(6, 3) }
 *
 * La idea: dejar el plantel (bio, número, fotos, roles) como está
 * y pisar SOLO las estadísticas con lo que trae valbe.json.
 * Si valbe.json no tiene a alguien, se queda el valor hardcodeado.
 */
import valbe from "./valbe.json";
import { jugadoresBase } from "./jugadores"; // <- tu array actual, renombrado

const conValbe = (p) => {
  const v = valbe.jugadores[p.id];
  if (!v) return p;
  return {
    ...p,
    current: v.current ?? p.current,
    past: v.past ?? p.past,
  };
};

export const jugadores = jugadoresBase.map(conValbe);

/** Datos del torneo en juego: fechasJugadas, golesFavor, posicion, proximo, partidos[] */
export const torneoActual = valbe.ediciones[valbe.edicionActual];

/** Todas las ediciones en las que jugó Nespresso (para las tarjetas de "Torneos & Palmarés"). */
export const ediciones = valbe.ediciones;

/**
 * Sugerencia: el contador "Fechas jugadas" hoy se calcula como
 * Math.max(...jugadores.map(j => j.current.pj)). Es más exacto usar:
 *   torneoActual.fechasJugadas
 */
