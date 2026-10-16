// Renders app/icon.svg (the portal mark) into the raster icons Next.js serves from app/:
//   favicon.ico     16, 32 and 48 px (for browsers without SVG icon support)
//   apple-icon.png  180 px (phone home screens)
// Usage: node scripts/make-icons.mjs   (uses Playwright's Chromium, a dev dependency)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';

const app = join(dirname(fileURLToPath(import.meta.url)), '../app');
const svg = readFileSync(join(app, 'icon.svg'), 'utf8');

const browser = await chromium.launch();
async function png(size) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: true });
  await page.close();
  // Chromium writes an opaque icon as RGB; ICO readers (Next.js included) need RGBA PNGs.
  return PNG.sync.write(PNG.sync.read(buf), { colorType: 6 });
}

// ICO container holding PNG images (supported by every current browser and Windows).
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2); // palette
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
}

const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) images.push({ size, data: await png(size) });
writeFileSync(join(app, 'favicon.ico'), ico(images));
writeFileSync(join(app, 'apple-icon.png'), await png(180));
await browser.close();
console.log('Wrote app/favicon.ico (16, 32, 48 px) and app/apple-icon.png (180 px)');
