# Sync Valbé → nespressofc.com

Mantiene las estadísticas de Nespresso FC actualizadas a partir de los datos públicos del Torneo Valbé.

## Cómo funciona

```
GitHub Actions (todos los días 07:17 ART, o a mano)
  └─ node scripts/sync-valbe.mjs
       ├─ GET complejovalbe.netlify.app/api-cache/manifest.json
       ├─ GET .../api-cache/<hash>.json  (×3 por edición: jugadores, fixture-completo, tabla)
       └─ escribe src/data/valbe.json   (solo si cambió algo)
  └─ git commit + push  →  Vercel redeploya solo
```

Por qué se hace en build y no en el navegador: el Netlify de Valbé no manda `Access-Control-Allow-Origin`, así que un `fetch` desde nespressofc.com falla por CORS.

Por qué el cache y no Render: Valbé tiene `CONSULTAR_API = false`; su cache estático es lo que ellos publican. Si algún día hace falta ir directo a la API (con permiso de ellos): `VALBE_FUENTE=render node scripts/sync-valbe.mjs`.

## Fuente: cómo leer el cache de Valbé

`manifest.json` tiene `files: { "<endpoint>?<query ordenada>": { file: "<sha256>.json" } }`. La clave se arma igual que `staticKey()` de su `cache-api.js`: `URLSearchParams` + `.sort()` + `.toString()`. Ejemplo: `/api/jugadores?equipoNombre=Nespresso+FC&grupo=Europa&torneo=Edicion6`.

| Endpoint | Para qué |
|---|---|
| `/api/equipos?torneo=EdicionN` | Detecta si Nespresso jugó esa edición, en qué grupo y su id |
| `/api/jugadores?equipoNombre&grupo&torneo` | PJ, goles, amarillas y rojas por jugador |
| `/api/partidos/fixture-completo?grupo&torneo` | Resultados, próximo partido, fechas jugadas |
| `/api/tabla?grupo&torneo` | Posición en la zona |
| `/api/partidos/:id/incidencias?torneo` | Goleadores por partido (para la iteración 2) |
| `/api/goleadores…`, `/api/partidos/bracket?copa…` | Rankings del torneo y copas (para la iteración 2) |

## Cosas a tener en cuenta (ya resueltas en el script)

- **La "Z" de `fechaPartido` es falsa**: `2026-10-14T19:10:00Z` es 19:10 hora de Sunchales (así lo muestra Valbé). El script la guarda sin zona horaria: `2026-10-14T19:10`.
- **Nombre y apellido vienen mezclados** (`"Pinotti Tomás" | "Alejandro"`): el match se hace por conjunto de palabras sin tildes. Si alguno falla, va a `overrides` en `valbe.config.json` con el `apiId`.
- **Los ids cambian por edición** (Nespresso es 37 en Edicion5 y 51 en Edicion6; cada jugador también cambia de id). Por eso la edición actual se detecta sola: es la más nueva del manifest donde aparece "Nespresso FC". Cuando arranque la Edicion7 no hay que tocar nada, salvo ponerle nombre en `nombresEdiciones`.
- **Privacidad**: `/api/jugadores` trae DNI y fecha de nacimiento. El script copia solo una lista blanca de campos (`partidos/goles/amarillas/rojas`).
- **Jugadores nuevos**: si aparece alguien en la API que no está en `config.jugadores`, el Action muestra un warning y queda en `sinMapear` del JSON.

## Dónde está cada cosa en este repo

- `.github/workflows/sync-valbe.yml` → en la **raíz del repo** (GitHub solo lee workflows desde ahí). Corre con `working-directory: web`.
- `web/scripts/sync-valbe.mjs` y `web/scripts/valbe.config.json` → el script y su configuración.
- `web/src/data/valbe.json` → los datos generados (no editar a mano).
- `web/src/data/players.ts` → `PLAYERS_BASE` (identidad + estadísticas de respaldo) y `PLAYERS` (ya mezclado con Valbé).
- `web/src/lib/stats.ts` → fechas jugadas, rótulo del torneo anterior y cantidad de torneos, leídos de `valbe.json`.
- `web/docs/valbe-merge.example.js` → el ejemplo original de integración (referencia).

Para correrlo a mano: GitHub → Actions → "Sync datos Valbé" → *Run workflow*. En local: `node scripts/sync-valbe.mjs` dentro de `web/`.

Si el repo restringe permisos, hay que habilitar *Settings → Actions → General → Workflow permissions → Read and write*.

## Iteración 2 (ideas)

- ~~Widget de **próximo partido** y **últimos resultados**~~ → hecho: `src/sections/Torneos/Matchday.tsx`.
- **Goleadores por partido** con `/api/partidos/:id/incidencias` (viene `jugadorId` = `apiId`).
- **Tarjetas de torneos** generadas desde `ediciones` en vez del texto fijo ("Dos torneos y contando", "23 goles en el camino").
- Copa/playoffs con `/api/partidos/bracket`.
- Correr el cron también después de cada fecha (miércoles/jueves/sábado a la noche) si querés ver los datos más rápido.
