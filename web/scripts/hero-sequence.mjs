/**
 * Convierte el video IA del Hero (dolly-in) en una secuencia de frames WebP + manifest.
 * El Hero la detecta sola (public/media/hero/manifest.json) y reemplaza la foto fija
 * por el video "scrubbeado" con el scroll.
 *
 * Uso:
 *   node scripts/hero-sequence.mjs ruta/hero_16x9.mp4 [ruta/hero_9x16.mp4]
 */
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(root, '../public/media/hero');
const [desktopSrc, mobileSrc] = process.argv.slice(2);
if (!desktopSrc) {
  console.error('Uso: node scripts/hero-sequence.mjs hero_16x9.mp4 [hero_9x16.mp4]');
  process.exit(1);
}

/** Extrae ~`target` frames repartidos en todo el video. */
function extract(src, dir, width, target, quality) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  // Duración: `ffmpeg -i` sin salida termina con error, pero imprime "Duration:" en stderr.
  let duration = 5;
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', src], { stdio: 'pipe' });
  } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(String(e.stderr));
    if (m) duration = +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
  const fps = Math.max(0.1, target / duration);
  execFileSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', src,
    '-vf', `fps=${fps.toFixed(3)},scale='min(${width},iw)':-2`,
    '-c:v', 'libwebp', '-quality', String(quality), path.join(dir, '%04d.webp'),
  ]);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).length;
}

const manifest = {
  count: extract(desktopSrc, path.join(OUT, 'desktop'), 1600, 90, 68),
  pattern: '/media/hero/desktop/{i}.webp',
  width: 1600,
  height: 900,
};
if (mobileSrc) {
  manifest.mobile = { count: extract(mobileSrc, path.join(OUT, 'mobile'), 720, 60, 65), pattern: '/media/hero/mobile/{i}.webp' };
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`✓ Secuencia del Hero: ${manifest.count} frames desktop${manifest.mobile ? ` · ${manifest.mobile.count} mobile` : ''}`);
