/**
 * Pipeline de imágenes.
 * Lee los originales de ../Imagenes (que nunca se tocan), aplica rotación / recorte / ajustes
 * y genera versiones AVIF + WebP en varios anchos dentro de public/img.
 * También escribe src/data/images.generated.ts con dimensiones y un LQIP (placeholder borroso)
 * para que el componente <Img> pueda reservar espacio y evitar saltos de layout.
 *
 * Uso: npm run assets:images
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(root, '../../Imagenes');
const OUT = path.resolve(root, '../public/img');
const MANIFEST = path.resolve(root, '../src/data/images.generated.ts');

const WIDTHS = [480, 960, 1600, 2400];

/**
 * slug → { file, rotate?, crop?(meta) => region, upscale?, maxWidth?, alt }
 * `alt` vive acá para que cada imagen tenga siempre un texto alternativo.
 */
const IMAGES = {
  logo: { file: 'Logo.jpg', alt: 'Escudo de Nespresso FC' },

  // Equipo
  'equipo-debut': {
    file: 'Foto equipo nespresso 1 vez que jugamos en cancha.jpeg',
    alt: 'El plantel de Nespresso FC posando con la bandera del escudo en una cancha de césped',
  },
  // Fondo del Hero con el etalonaje "horneado" (antes eran un filter CSS + una capa mix-blend-multiply
  // que el GPU recalculaba en cada frame del dolly-in; en mobile era de lo más caro del Hero).
  'hero-bg': {
    file: 'Foto equipo nespresso 1 vez que jugamos en cancha.jpeg',
    grade: true,
    alt: 'El plantel de Nespresso FC posando con la bandera del escudo en una cancha de césped',
  },
  'equipo-cancha': {
    file: 'Foto equipo nespresso en cancha.jpeg',
    alt: 'El equipo en cancha de sintético con la bandera "La suerte del principiante no puede fallar"',
  },
  'presentacion-valbe': {
    file: 'FOTO DE PRESENTACION DEL PRIMER TORNEO DEL EQUIPO.jpeg',
    alt: 'Foto oficial de presentación del Sexto Torneo Invierno Valbé 26, división Europa',
  },
  'llegada-ropa': {
    file: 'Foto del dia que llego la indumentaria.jpeg',
    // Recorta el garabato de la esquina superior.
    crop: (m) => ({ left: 0, top: 140, width: m.width, height: m.height - 140 }),
    alt: 'Las camisetas numeradas de Nespresso FC sobre el césped sintético, el día que llegaron',
  },
  'previa-galpon': {
    file: 'Imagen de equipo no en la chancha.jpeg',
    alt: 'Jugadores agachados frente a un galpón con la bandera del equipo colgada',
  },
  'previa-selfie': {
    file: 'Imagen de equipo no en la cancha 2.jpeg',
    alt: 'Selfie del grupo frente a la bandera del equipo',
  },
  'tercer-tiempo-selfie': {
    file: 'imagen de un tercer tiempo.jpeg',
    alt: 'Tercer tiempo en los bancos del complejo, con la bandera sobre la mesa',
  },
  'tercer-tiempo-nespresso': {
    file: 'Chiste equipo bandera nespresso tercer tiempo.jpeg',
    alt: 'Tercer tiempo de noche bajo guirnaldas, el grupo con la bandera de Nespresso',
  },
  'tercer-tiempo-malvinas': {
    file: 'Chiste equipo bandera malvinas argentinas tercer tiempo.jpeg',
    alt: 'El mismo grupo en el mismo lugar, ahora con la bandera "Las Malvinas son argentinas"',
  },
  'bancada-moto': {
    file: 'Foto de la bancada de nespresso con la bandera.jpeg',
    alt: 'Un hincha sosteniendo la bandera de Nespresso sobre una moto en la calle',
  },
  barra: {
    file: 'Foto de la barra brava hecha con ia.jpeg',
    upscale: 2048,
    alt: 'Tribuna repleta con bengalas y un banner gigante de Nespresso',
  },
  'vice-secado': {
    file: 'chiste del vicepresidente haciendose secar la nuca.jpeg',
    crop: (m) => ({ left: 0, top: 58, width: m.width, height: m.height - 58 }),
    alt: 'Coty, el vicepresidente, sentado con un trago mientras le secan la nuca',
  },
  'vice-ig': {
    file: 'chiste del vicepresidente secando la nuca al chiqui tapia.jpeg',
    alt: 'Captura de Instagram: Coty secándole la nuca al Chiqui Tapia',
  },

  // Indumentaria
  'kit-flat': {
    file: 'Remera frente.jpeg',
    rotate: 270,
    alt: 'Camiseta de Nespresso FC extendida: degradé marrón, escudo y sponsor VASA Metal',
  },
  'kit-short': {
    file: 'Pantalon frente.jpeg',
    rotate: 270,
    alt: 'Pantalón negro con el número 17, Store Sunchales y el escudo',
  },
  'kit-front-worn': {
    file: 'Remera y pantalon frente.jpeg',
    alt: 'El kit completo, de frente, con una cafetera de fondo',
  },
  'kit-back-worn': {
    file: 'Remera y pantalon espalda.jpeg',
    alt: 'El kit de espaldas: número 17, logo de Fatto in Casa y Germán en el pantalón',
  },
  'kit-render-front': {
    file: 'Remera de adelante y atras en buena calidad.jpeg',
    crop: (m) => ({ left: 0, top: 0, width: Math.round(m.width / 2), height: m.height }),
    upscale: 960,
    alt: 'Render del diseño de la camiseta, de frente',
  },
  'kit-render-back': {
    file: 'Remera de adelante y atras en buena calidad.jpeg',
    crop: (m) => ({ left: Math.round(m.width / 2), top: 0, width: m.width - Math.round(m.width / 2), height: m.height }),
    upscale: 960,
    alt: 'Render del diseño de la camiseta, de espalda, con "Cafeteros" en la nuca',
  },

  // Acción
  'accion-26': {
    file: 'Imagen de jugador en situacion de partido.jpeg',
    alt: 'Pala, el 26, conduce la pelota perseguido por un rival de pechera',
  },
  'accion-10': {
    file: 'Imagenes de jugador en situacion de partido.jpeg',
    alt: 'Pipo, el 10, con la pelota, visto a través de la red',
  },
  'accion-conduccion': {
    file: 'Imagen de jugador en situacion de partido (2).jpeg',
    alt: 'Un jugador de Nespresso encara con la pelota al pie',
  },
  'accion-18-cabezazo': { file: 'Foto de partido.jpeg', alt: 'Nacho Romero salta a cabecear en un partido nocturno' },
  'accion-5': { file: 'Foto de partido (2).jpeg', alt: 'Toto, el 5, protege la pelota ante dos rivales' },
  'accion-30': { file: 'Foto de partido (3).jpeg', alt: 'Leo, el 30, de espaldas frente al arquero rival. Fecha 2, división Europa' },
  'accion-11': { file: 'Foto de partido (4).jpeg', alt: 'Cono, el 11, controla la pelota con el pecho' },
  'accion-arquero': { file: 'Foto de partido (5).jpeg', alt: 'El Flaco Yasenzaniro sale a achicar con el buzo verde' },
  'accion-22-a': { file: 'Foto de partido (6).jpeg', alt: 'Tomás Pinotti, el 22, domina la pelota entre rivales' },
  'accion-22-b': { file: 'Foto de partido (7).jpeg', alt: 'Tomás Pinotti, el 22, encara con la pelota al pie' },
  'accion-18-b': { file: 'Foto de partido (8).jpeg', alt: 'Juani, el 18, acompaña la jugada' },
};

async function processOne(slug, spec) {
  let img = sharp(path.join(SRC, spec.file), { failOn: 'none' });
  if (spec.rotate) img = img.rotate(spec.rotate);
  // Materializa la rotación para que el recorte trabaje sobre las dimensiones finales.
  let buf = await img.toBuffer();
  let meta = await sharp(buf).metadata();
  if (spec.crop) {
    buf = await sharp(buf).extract(spec.crop(meta)).toBuffer();
    meta = await sharp(buf).metadata();
  }
  if (spec.grade) {
    // Mismo resultado que: filter saturate(.78) contrast(1.12) brightness(.62) + tinte #4A2C0A al 45% en multiply.
    const tint = [74, 44, 10].map((c) => 0.62 * (0.55 + 0.45 * (c / 255)));
    buf = await sharp(buf).modulate({ saturation: 0.78 }).toBuffer();
    buf = await sharp(buf).linear(1.12, 128 * (1 - 1.12)).toBuffer();
    buf = await sharp(buf).linear(tint, [0, 0, 0]).toBuffer();
  }
  if (spec.upscale && meta.width < spec.upscale) {
    // No es una IA de upscaling, pero lanczos + un sharpen suave rinde bien a pantalla completa.
    buf = await sharp(buf).resize({ width: spec.upscale, kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).toBuffer();
    meta = await sharp(buf).metadata();
  }

  const widths = WIDTHS.filter((w) => w < meta.width);
  const top = Math.min(meta.width, 2400);
  if (!widths.length || (top - widths[widths.length - 1] > 200 && !widths.includes(top))) widths.push(top);

  await Promise.all(
    widths.flatMap((w) => [
      sharp(buf).resize({ width: w }).webp({ quality: 74 }).toFile(path.join(OUT, `${slug}-${w}.webp`)),
      sharp(buf).resize({ width: w }).avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${slug}-${w}.avif`)),
    ]),
  );

  const lqip = await sharp(buf).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const height = Math.round((meta.height / meta.width) * widths[widths.length - 1]);
  return {
    slug,
    entry: {
      w: widths[widths.length - 1],
      h: height,
      widths,
      alt: spec.alt,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    },
    buf,
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const entries = {};
  for (const [slug, spec] of Object.entries(IMAGES)) {
    if (only.length && !only.includes(slug)) continue;
    const t = Date.now();
    const { entry, buf } = await processOne(slug, spec);
    entries[slug] = entry;
    if (slug === 'equipo-debut') {
      await sharp(buf).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82 }).toFile(path.join(OUT, 'og.jpg'));
    }
    console.log(`✓ ${slug.padEnd(24)} ${entry.widths.join('/')}  ${Date.now() - t}ms`);
  }

  if (!only.length) {
    const body = `// Generado por scripts/optimize-images.mjs — no editar a mano.\n` +
      `export const IMAGES = ${JSON.stringify(entries, null, 2)} as const;\n\n` +
      `export type ImageSlug = keyof typeof IMAGES;\n`;
    await fs.writeFile(MANIFEST, body);
    console.log(`\nManifest → ${path.relative(process.cwd(), MANIFEST)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
