/**
 * Recorta el escudo oficial (Logo.jpg, fondo blanco) a PNG/WebP con transparencia.
 * 1. Flood fill desde los bordes sobre píxeles "blancos" → exterior transparente.
 * 2. En el borde exterior, calcula el alfa según cuánto blanco hay mezclado (antialias)
 *    y pinta el píxel con el marrón del borde, para que no quede halo claro sobre fondos oscuros.
 * El crema del interior nunca se toca porque el borde marrón lo separa del exterior.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(root, '../../Imagenes/Logo.jpg');
const OUT = path.resolve(root, '../public/img');

const BROWN = [53, 35, 26];
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
const isWhite = (i) => {
  const [r, g, b] = px(i);
  return Math.min(r, g, b) > 228 && Math.max(r, g, b) - Math.min(r, g, b) < 22;
};

const exterior = new Uint8Array(W * H);
const queue = [];
for (let x = 0; x < W; x++) queue.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) queue.push(y * W, y * W + W - 1);
while (queue.length) {
  const i = queue.pop();
  if (exterior[i] || !isWhite(i)) continue;
  exterior[i] = 1;
  const x = i % W, y = (i / W) | 0;
  if (x > 0) queue.push(i - 1);
  if (x < W - 1) queue.push(i + 1);
  if (y > 0) queue.push(i - W);
  if (y < H - 1) queue.push(i + W);
}

const out = Buffer.alloc(W * H * 4);
const lumBrown = 0.2126 * BROWN[0] + 0.7152 * BROWN[1] + 0.0722 * BROWN[2];
for (let i = 0; i < W * H; i++) {
  const [r, g, b] = px(i);
  let a = 255, c = [r, g, b];
  if (exterior[i]) a = 0;
  else {
    // ¿Toca el exterior en un radio de 2px? Entonces es borde con antialias.
    const x = i % W, y = (i / W) | 0;
    let edge = false;
    for (let dy = -2; dy <= 2 && !edge; dy++)
      for (let dx = -2; dx <= 2 && !edge; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && exterior[ny * W + nx]) edge = true;
      }
    if (edge) {
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      a = Math.round(255 * Math.min(1, Math.max(0, (255 - lum) / (255 - lumBrown))));
      c = BROWN;
    }
  }
  out.set([c[0], c[1], c[2], a], i * 4);
}

const img = sharp(out, { raw: { width: W, height: H, channels: 4 } }).trim();
const buf = await img.png().toBuffer();
await sharp(buf).resize({ width: 800 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, 'escudo-800.webp'));
await sharp(buf).resize({ width: 400 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, 'escudo-400.webp'));
await sharp(buf).resize({ width: 800 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'escudo-800.png'));
console.log('✓ escudo recortado');
