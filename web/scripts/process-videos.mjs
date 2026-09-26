/**
 * Pipeline de video (usa el ffmpeg que trae ffmpeg-static, no hace falta instalar nada).
 * - Versiones completas con audio para los modales (faststart = empieza a reproducir antes de bajar todo).
 * - Loops cortos, mudos y livianos para reproducir inline.
 * - Pósters en WebP.
 *
 * Uso: npm run assets:videos
 */
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(root, '../../Imagenes');
const OUT = path.resolve(root, '../public/media');
fs.mkdirSync(OUT, { recursive: true });

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

const H264 = ['-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-movflags', '+faststart'];

const JOBS = [
  {
    name: 'entrega',
    file: 'Entrega de camisetas.mp4',
    // Tramo de los abrazos de la entrega para el loop del Origen.
    loop: { start: 70, duration: 12 },
    poster: 76,
  },
  {
    name: 'fichaje',
    file: 'video de posible futuro fichaje mas premio del sponsor por jugador del partido fatto in casa.mp4',
    loop: { start: 8, duration: 6 },
    poster: 9,
  },
];

for (const job of JOBS) {
  const input = path.join(SRC, job.file);
  const t = Date.now();

  run(['-i', input, ...H264, '-crf', '28', '-maxrate', '700k', '-bufsize', '1400k', '-c:a', 'aac', '-b:a', '96k', path.join(OUT, `${job.name}.mp4`)]);

  run([
    '-ss', String(job.loop.start), '-t', String(job.loop.duration), '-i', input,
    ...H264, '-crf', '30', '-an', '-vf', 'fps=24', path.join(OUT, `${job.name}-loop.mp4`),
  ]);

  run(['-ss', String(job.poster), '-i', input, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '78', path.join(OUT, `${job.name}-poster.webp`)]);

  const size = (f) => (fs.statSync(path.join(OUT, f)).size / 1e6).toFixed(1) + 'MB';
  console.log(`✓ ${job.name}: full ${size(`${job.name}.mp4`)} · loop ${size(`${job.name}-loop.mp4`)}  ${Date.now() - t}ms`);
}
