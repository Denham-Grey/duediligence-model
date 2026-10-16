// M2 · T2.3 — screen-by-screen visual parity against the prototype.
// Drives the original (served from the prototype folder) and the Next.js port through the same
// clicks — the markup is the same, so the same selectors work in both — screenshots every screen
// full-page and measures the share of differing pixels.
// Needs both running:  new  → PARITY_NEW (default http://localhost:3210/login)
//                      old  → PARITY_OLD (default http://localhost:3211/DD%20Portal.dc.html)
// Usage: npm run test:parity   (exit code 1 if any screen differs by more than PARITY_MAX, default 1%)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(root, 'test-results/parity');
const NEW = process.env.PARITY_NEW || 'http://localhost:3210/login';
const OLD = process.env.PARITY_OLD || 'http://localhost:3211/DD%20Portal.dc.html';
const MAX = Number(process.env.PARITY_MAX || 1);
const BANK = 'Meridian Trust Bank Plc';

const btn = (page, name) => page.getByRole('button', { name, exact: true }).first();
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  await page.evaluate(() => window.scrollTo(0, 0));
}
async function toCase(page) {
  await btn(page, 'Cases').click();
  await btn(page, BANK).click();
  await page.getByText('Overall completion').first().waitFor();
}

// Each step leaves the page on the screen named by its key.
const STEPS = [
  ['login', async (p) => { await p.getByText('Authorised personnel').first().waitFor(); }],
  ['dashboard', async (p) => {
    await p.locator('input[type=text].input').fill('admin');
    await p.locator('input[type=password]').fill('5210');
    await p.locator('button.btn-primary').click();
    await p.getByText('Due Diligence Cases').first().waitFor();
  }],
  ['case', async (p) => { await btn(p, BANK).click(); await p.getByText('Overall completion').first().waitFor(); }],
  ['section-S1', async (p) => { await p.getByText('S1', { exact: true }).first().click(); await p.getByText('Jump to').first().waitFor(); }],
  ...['S3', 'S4', 'S6', 'S8', 'S13', 'S17', 'S18', 'S21'].map((code) => [`section-${code}`, async (p) => {
    await btn(p, code).click();
    await p.locator('span', { hasText: new RegExp(`^${code}$`) }).first().waitFor();
  }]),
  ['scoring', async (p) => { await toCase(p); await btn(p, 'Scoring & board report').click(); await p.getByText('Weighted scoring matrix').first().waitFor(); }],
  ['report-cover', async (p) => { await toCase(p); await btn(p, 'Report builder').click(); await p.getByText('Board Report Builder').first().waitFor(); }],
  ['report-05', async (p) => { await btn(p, '05').click(); await p.waitForTimeout(200); }],
  ['report-15', async (p) => { await btn(p, '15').click(); await p.waitForTimeout(200); }],
  ['audit', async (p) => { await toCase(p); await btn(p, 'Audit trail').click(); await p.getByText('Every sign-in').first().waitFor(); }],
  ['partner-review', async (p) => { await toCase(p); await p.getByRole('button', { name: /^Partner documents/ }).first().click(); await p.getByText('Add a document request').first().waitFor(); }],
  ['users', async (p) => { await btn(p, 'Users').click(); await p.getByText('Accounts', { exact: true }).first().waitFor(); }],
  ['dark-dashboard', async (p) => { await btn(p, 'Cases').click(); await p.locator('button[title="Switch appearance"]').first().click(); await p.getByText('Due Diligence Cases').first().waitFor(); }],
  ['dark-section-S6', async (p) => { await btn(p, BANK).click(); await p.getByText('S6', { exact: true }).first().click(); await p.getByText('Jump to').first().waitFor(); }],
];

async function capture(url, tag) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const shots = {};
  await page.goto(url);
  for (const [key, step] of STEPS) {
    await step(page);
    await settle(page);
    shots[key] = await page.screenshot({ fullPage: true });
    writeFileSync(join(OUT, `${key}.${tag}.png`), shots[key]);
  }
  await browser.close();
  return shots;
}

mkdirSync(OUT, { recursive: true });
const [oldShots, newShots] = [await capture(OLD, 'old'), await capture(NEW, 'new')];
let failed = 0;
for (const [key] of STEPS) {
  const a = PNG.sync.read(oldShots[key]);
  const b = PNG.sync.read(newShots[key]);
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const crop = (img) => {
    const out = new PNG({ width: w, height: h });
    PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
    return out;
  };
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(crop(a).data, crop(b).data, diff.data, w, h, { threshold: 0.1 });
  // Height difference counts as fully differing rows.
  const extra = Math.abs(a.height - b.height) * w;
  const pct = ((n + extra) / (w * Math.max(a.height, b.height))) * 100;
  const ok = pct <= MAX;
  if (!ok) failed++;
  if (n) writeFileSync(join(OUT, `${key}.diff.png`), PNG.sync.write(diff));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${key.padEnd(18)} ${pct.toFixed(3)}% differ${a.height !== b.height ? `  (height ${a.height} vs ${b.height})` : ''}`);
}
console.log(`\n${STEPS.length - failed}/${STEPS.length} screens within ${MAX}%. Images in test-results/parity/`);
process.exit(failed ? 1 : 0);
