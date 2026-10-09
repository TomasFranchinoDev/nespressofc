#!/usr/bin/env node
/**
 * sync-valbe.mjs — Trae los datos de Nespresso FC desde el Torneo Valbé
 * y genera src/data/valbe.json para nespressofc.com.
 *
 * Fuente por defecto: el cache estático que publica complejovalbe.netlify.app
 *   1) GET  /api-cache/manifest.json      -> índice { files: { "<endpoint>?<query ordenada>": {file} } }
 *   2) GET  /api-cache/<hash>.json        -> respuesta original de la API (fuchibol en Render)
 *
 * No se consulta Render salvo que se pida explícitamente (VALBE_FUENTE=render),
 * porque los dueños de Valbé lo tienen deshabilitado (CONSULTAR_API = false).
 *
 * Uso:  node scripts/sync-valbe.mjs            (Node 18+; sin dependencias)
 *       VALBE_FUENTE=render node scripts/sync-valbe.mjs
 */

/* ------------------------------------------------------------------ */
/* Núcleo (sin APIs de Node: se puede probar tal cual en el navegador) */
/* ------------------------------------------------------------------ */

const ORIGEN_CACHE = "https://complejovalbe.netlify.app";
const ORIGEN_RENDER = "https://fuchibol-fi0t.onrender.com";

/** Misma clave que usa staticKey() en cache-api.js de Valbé. */
function claveCache(path, params = {}) {
  const sp = new URLSearchParams(params);
  sp.sort();
  const q = sp.toString();
  return path + (q ? "?" + q : "");
}

function normalizar(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * La API mezcla nombre/apellido ("Pinotti Tomás" | "Alejandro"),
 * así que comparamos por conjunto de palabras.
 */
function puntaje(nombreSitio, jugadorApi) {
  const a = new Set(normalizar(nombreSitio));
  const b = new Set(normalizar(`${jugadorApi.nombre} ${jugadorApi.apellido}`));
  if (!a.size) return 0;
  let comunes = 0;
  for (const t of a) if (b.has(t)) comunes++;
  return comunes / a.size;
}

/** "2026-09-10T20:20:49.05Z" -> "2026-09-10T20:20" (la Z es mentira: es hora local de Sunchales). */
function horaLocal(s) {
  return s ? String(s).replace(/Z$/, "").slice(0, 16) : null;
}

function crearLector({ fuente = "cache", fetchImpl = fetch, userAgent } = {}) {
  const headers = userAgent ? { "User-Agent": userAgent } : {};
  let manifest = null;

  async function json(url, timeoutMs = 30000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetchImpl(url, { headers, signal: ctrl.signal, cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
      return await r.json();
    } finally {
      clearTimeout(t);
    }
  }

  return {
    async manifest() {
      if (!manifest) manifest = await json(`${ORIGEN_CACHE}/api-cache/manifest.json`);
      return manifest;
    },
    /** Devuelve el JSON del endpoint, o null si no existe en el cache. */
    async get(path, params = {}) {
      if (fuente === "render") {
        const q = new URLSearchParams(params).toString();
        // Render (plan gratis) puede tardar ~1 min en despertar.
        return json(`${ORIGEN_RENDER}${path}${q ? "?" + q : ""}`, 90000);
      }
      const m = await this.manifest();
      const entry = m.files?.[claveCache(path, params)];
      if (!entry) return null;
      const file = typeof entry === "string" ? entry : entry.file;
      return json(`${ORIGEN_CACHE}/api-cache/${file}`);
    },
  };
}

/**
 * Arma el snapshot completo.
 * @param {object} config  contenido de valbe.config.json
 * @param {object} lector  crearLector(...)
 */
async function sincronizar(config, lector) {
  const equipo = config.equipo;
  const avisos = [];
  const m = await lector.manifest();

  // Ediciones en orden de la más nueva a la más vieja (como vienen en el manifest).
  const ediciones = (m.databases ?? Object.keys(m.groups ?? {})).filter(
    (e) => !(config.ignorarEdiciones ?? []).includes(e)
  );

  const salida = {
    equipo,
    fuente: m.source ? `${ORIGEN_CACHE} (cache de ${m.source})` : ORIGEN_CACHE,
    fuenteGeneradaEn: m.generatedAt ?? null,
    edicionActual: null,
    ediciones: {},
    jugadores: {},
    sinMapear: [],
  };

  for (const ed of ediciones) {
    // ¿En qué grupo jugó el equipo en esta edición?
    const equipos = (await lector.get("/api/equipos", { torneo: ed })) ?? [];
    const yo = equipos.find((x) => normalizar(x.nombre).join(" ") === normalizar(equipo).join(" "));
    if (!yo) continue; // el equipo no participó

    const grupo = yo.grupo;
    const q = { grupo, torneo: ed };

    const [jugadores, fixture, tabla] = await Promise.all([
      lector.get("/api/jugadores", { ...q, equipoNombre: yo.nombre }),
      lector.get("/api/partidos/fixture-completo", q),
      lector.get("/api/tabla", q),
    ]);

    // --- Partidos del equipo ---
    const partidos = (fixture ?? [])
      .filter((p) => p.equipo1Id === yo.id || p.equipo2Id === yo.id)
      .map((p) => {
        const local = p.equipo1Id === yo.id;
        const jugado = p.golesEquipo1 != null && p.golesEquipo2 != null;
        const gf = local ? p.golesEquipo1 : p.golesEquipo2;
        const gc = local ? p.golesEquipo2 : p.golesEquipo1;
        let resultado = null;
        if (jugado) {
          if (gf !== gc) resultado = gf > gc ? "G" : "P";
          else {
            const pf = local ? p.penalesEquipo1 : p.penalesEquipo2;
            const pc = local ? p.penalesEquipo2 : p.penalesEquipo1;
            resultado = pf != null && pc != null && pf !== pc ? (pf > pc ? "G" : "P") + " (pen)" : "E";
          }
        }
        return {
          id: p.id,
          fecha: p.fecha?.nombre ?? null,
          copa: p.fecha?.copa ?? null,
          fechaHora: horaLocal(p.fechaPartido),
          cancha: p.cancha ?? null,
          condicion: local ? "local" : "visitante",
          rival: local ? p.equipo2?.nombre : p.equipo1?.nombre,
          golesFavor: jugado ? gf : null,
          golesContra: jugado ? gc : null,
          penales:
            p.penalesEquipo1 != null
              ? { favor: local ? p.penalesEquipo1 : p.penalesEquipo2, contra: local ? p.penalesEquipo2 : p.penalesEquipo1 }
              : null,
          jugado,
          resultado,
        };
      })
      .sort((a, b) => String(a.fechaHora).localeCompare(String(b.fechaHora)));

    // --- Posición en la tabla ---
    let posicion = null;
    for (const [zona, filas] of Object.entries(tabla ?? {})) {
      const i = filas.findIndex((f) => f.nombreEquipo === yo.nombre);
      if (i >= 0) posicion = { zona, puesto: i + 1, de: filas.length, ...filas[i] };
    }
    if (posicion) delete posicion.nombreEquipo;

    // --- Jugadores: mapeo jugador de la API -> id del sitio ---
    const overrides = config.overrides?.[ed] ?? {};
    const usados = new Set();
    const stats = {};
    for (const [idSitio, nombreSitio] of Object.entries(config.jugadores)) {
      let elegido = null;
      if (overrides[idSitio] != null) {
        elegido = (jugadores ?? []).find((j) => j.id === overrides[idSitio]) ?? null;
      } else {
        const candidatos = (jugadores ?? [])
          .map((j) => ({ j, s: puntaje(nombreSitio, j) }))
          .filter((c) => c.s >= (config.umbralNombre ?? 0.99) && !usados.has(c.j.id))
          .sort((a, b) => b.s - a.s);
        if (candidatos.length > 1 && candidatos[0].s === candidatos[1].s) {
          avisos.push(`${ed}: "${nombreSitio}" es ambiguo; agregá un override.`);
        } else if (candidatos.length) elegido = candidatos[0].j;
      }
      if (!elegido) continue;
      usados.add(elegido.id);
      // Lista blanca de campos: la API también trae DNI y fecha de nacimiento, NO los copiamos.
      stats[idSitio] = {
        apiId: elegido.id,
        pj: elegido.partidos ?? 0,
        goles: elegido.goles ?? 0,
        amarillas: elegido.amarillas ?? 0,
        rojas: elegido.rojas ?? 0,
      };
    }
    for (const j of jugadores ?? []) {
      if (!usados.has(j.id)) {
        salida.sinMapear.push({ edicion: ed, apiId: j.id, nombre: `${j.nombre} ${j.apellido}`.trim() });
      }
    }

    const jugados = partidos.filter((p) => p.jugado);
    salida.ediciones[ed] = {
      nombre: config.nombresEdiciones?.[ed] ?? ed,
      grupo,
      zona: yo.zona ?? null,
      equipoId: yo.id,
      fechasJugadas: jugados.length,
      golesFavor: jugados.reduce((s, p) => s + p.golesFavor, 0),
      golesContra: jugados.reduce((s, p) => s + p.golesContra, 0),
      posicion,
      proximo: partidos.find((p) => !p.jugado) ?? null,
      partidos,
      jugadores: stats,
    };
    if (!salida.edicionActual) salida.edicionActual = ed; // la primera (más nueva) donde aparece
  }

  if (!salida.edicionActual) throw new Error(`No encontré a "${equipo}" en ninguna edición.`);

  // --- Vista compatible con el sitio: current = edición actual, past = suma de las anteriores ---
  const pasadas = Object.keys(salida.ediciones).filter((e) => e !== salida.edicionActual);
  const vacio = () => ({ pj: 0, goles: 0, amarillas: 0 });
  for (const idSitio of Object.keys(config.jugadores)) {
    const cur = salida.ediciones[salida.edicionActual].jugadores[idSitio];
    const past = pasadas
      .map((e) => salida.ediciones[e].jugadores[idSitio])
      .filter(Boolean)
      .reduce((acc, s) => ({ pj: acc.pj + s.pj, goles: acc.goles + s.goles, amarillas: acc.amarillas + s.amarillas }), vacio());
    const tienePasado = pasadas.some((e) => salida.ediciones[e].jugadores[idSitio]);
    salida.jugadores[idSitio] = {
      current: cur ? { pj: cur.pj, goles: cur.goles, amarillas: cur.amarillas } : null,
      past: tienePasado ? past : null,
    };
  }

  return { datos: salida, avisos };
}

/* ------------------------------------------------------------------ */
/* CLI (Node)                                                          */
/* ------------------------------------------------------------------ */

async function main() {
  const { readFile, writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");

  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const config = JSON.parse(await readFile(path.join(raiz, "scripts/valbe.config.json"), "utf8"));
  const destino = path.join(raiz, config.salida ?? "src/data/valbe.json");

  const lector = crearLector({
    fuente: process.env.VALBE_FUENTE === "render" ? "render" : "cache",
    userAgent: "nespressofc-sync/1.0 (+https://www.nespressofc.com)",
  });

  const { datos, avisos } = await sincronizar(config, lector);

  for (const a of avisos) console.log(`::warning::${a}`);
  for (const s of datos.sinMapear) {
    console.log(`::warning::Jugador sin mapear en ${s.edicion}: ${s.nombre} (apiId ${s.apiId})`);
  }

  // Solo reescribimos si cambió algo real (ignora marcas de tiempo) -> no hay commits vacíos.
  let anterior = null;
  try {
    anterior = JSON.parse(await readFile(destino, "utf8"));
  } catch {}
  const sinFecha = (d) => JSON.stringify({ ...d, sincronizadoEn: undefined, fuenteGeneradaEn: undefined });
  if (anterior && sinFecha(anterior) === sinFecha(datos)) {
    console.log("Sin cambios.");
    return;
  }

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, JSON.stringify({ sincronizadoEn: new Date().toISOString(), ...datos }, null, 2) + "\n");
  const act = datos.ediciones[datos.edicionActual];
  console.log(
    `OK ${datos.edicionActual}: ${act.fechasJugadas} PJ, ${act.golesFavor} GF, ` +
      `puesto ${act.posicion?.puesto ?? "?"}/${act.posicion?.de ?? "?"} -> ${path.relative(raiz, destino)}`
  );
}

const esCli =
  typeof process !== "undefined" &&
  process.argv?.[1] &&
  import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;

if (esCli) {
  main().catch((e) => {
    console.error(`::error::${e.message}`);
    process.exit(1);
  });
}

export { claveCache, crearLector, sincronizar, horaLocal, normalizar, puntaje };
