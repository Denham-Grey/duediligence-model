// M2 · T2.4 (walkthrough), T2.5 (permissions in the UI), T2.7 (lockout and passcode rules).
// Drives the running app (E2E_URL, default http://localhost:3210) through one browser tab — data
// lives in memory for the life of the tab in M2 — and prints PASS/FAIL per check.
// Usage: npm run test:e2e
import { chromium } from '@playwright/test';

const BASE = (process.env.E2E_URL || 'http://localhost:3210').replace(/\/$/, '');
const BANK = 'Walkthrough Test Bank';
let failed = 0;
const results = [];
async function check(name, fn) {
  try { await fn(); results.push(`PASS  ${name}`); }
  catch (e) { failed++; results.push(`FAIL  ${name}\n      ${String(e.message || e).split('\n')[0]}`); }
}
const expectEq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('dialog', (d) => d.accept());
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const btn = (name) => page.getByRole('button', { name, exact: true }).first();
const text = (s) => page.getByText(s, { exact: true }).first();
const toast = (s) => page.getByText(s).first().waitFor({ timeout: 4000 });
async function signIn(user, pass) {
  await page.locator('input[type=text].input').first().fill(user);
  await page.locator('input[type=password]').first().fill(pass);
  await page.locator('button.btn-primary', { hasText: 'Sign in' }).click();
}
async function signOut() { await btn('Sign out').click(); await page.waitForURL('**/login'); }
async function openCase() { await btn('Cases').click(); await btn(BANK).click(); await page.waitForURL(/\/cases\/\d+$/); }
const path = () => new URL(page.url()).pathname;

await page.goto(`${BASE}/`);

// ——— T2.4 walkthrough ———
await check('1 sign in as admin → /cases', async () => {
  await page.waitForURL('**/login');
  await signIn('admin', '5210');
  await page.waitForURL('**/cases');
  await text('Due Diligence Cases').waitFor();
});

let caseId;
await check('2 create a case → its overview, toast', async () => {
  await page.getByPlaceholder('Legal name').fill(BANK);
  await btn('Create case').click();
  await page.waitForURL(/\/cases\/\d+$/);
  caseId = Number(path().split('/')[2]);
  await toast('Case opened · twenty-one sections ready');
  await page.getByText(BANK).first().waitFor();
});

await check('3 fill an enquiry in S3 (finding, rating, status, red flag)', async () => {
  await text('S3').click();
  await page.waitForURL(`**/cases/${caseId}/sections/S3`);
  await page.getByPlaceholder('Record what was reviewed, what was found, and your assessment…').first().fill('E2E finding');
  await page.locator('select:has(option[value="Not started"])').first().selectOption('Complete');
  await page.locator('select:has(option:text-is("Not rated"))').first().selectOption('2');
  await page.locator('label:has-text("Present") input[type=checkbox]').first().check();
  await text('Red flag recorded').waitFor();
  expectEq(await page.locator('input[readonly]').first().inputValue(), 'Administrator', 'assessor auto-stamp');
});

await check('4 rate the section', async () => {
  await page.locator('select:has(option:text-is("— not rated —"))').selectOption('2');
  await btn('Save section').click();
  await toast('S3 saved');
});

await check('5 waive a compulsory document with a reason', async () => {
  await btn('Mark not applicable').click();
  await page.getByPlaceholder('Reason this document is not applicable (recorded)').fill('Not applicable in test');
  await btn('Save reason').click();
  await page.getByText('Waived — Not applicable in test').first().waitFor();
});

await check('6 add an extra compulsory document', async () => {
  await page.getByPlaceholder('Additional document required by this review').fill('E2E extra document');
  await page.getByPlaceholder('Why it is required (recorded)').fill('Raised in test');
  await btn('Add to compulsory list').click();
  await page.getByText('Added in review — Raised in test').first().waitFor();
});

await check('7 add two supporting documents → A3.1, A3.2', async () => {
  await page.locator('input[type=file][multiple]').first().setInputFiles([
    { name: 'e2e-one.pdf', mimeType: 'application/pdf', buffer: Buffer.from('one') },
    { name: 'e2e-two.pdf', mimeType: 'application/pdf', buffer: Buffer.from('two') },
  ]);
  const just = page.getByPlaceholder('Explain what this document evidences and which finding(s) it supports…');
  await just.nth(0).fill('Supports enquiry 1');
  await just.nth(1).fill('Supports enquiry 2');
  await btn('Add 2 documents').click();
  await toast('2 documents added — A3.1, A3.2');
  await text('A3.1').waitFor();
  await text('A3.2').waitFor();
});

await check('8 remove one → the other renumbers to A3.1', async () => {
  const row = page.locator('tr', { hasText: 'e2e-one.pdf' });
  await row.getByRole('button', { name: 'Remove' }).click();
  await toast('Document removed');
  expectEq(await page.locator('tr', { hasText: 'e2e-two.pdf' }).locator('td').first().innerText(), 'A3.1', 'renumbered ref');
  expectEq(await page.getByText('A3.2', { exact: true }).count(), 0, 'A3.2 gone');
});

await check('9 S17: add a second external rating and remove it', async () => {
  await btn('S17').click();
  await page.waitForURL(`**/sections/S17`);
  await btn('Add another external rating').click();
  await text('External rating 2').waitFor();
  await btn('Remove this rating').click();
  await page.waitForTimeout(200);
  expectEq(await page.getByText('External rating 2', { exact: true }).count(), 0, 'rating 2 removed');
});

await check('10 edit a period heading, then reset periods', async () => {
  await page.getByRole('button', { name: BANK, exact: true }).first().click();
  await btn('Scoring & board report').click();
  await page.waitForURL(`**/cases/${caseId}/scoring`);
  const head = page.getByLabel('Ratio period 1');
  await head.fill('E2E period');
  expectEq(await head.inputValue(), 'E2E period', 'edited heading');
  await page.getByRole('button', { name: /^Reset periods to/ }).click();
  expectEq(await head.inputValue(), 'Interim 9M 2026', 'reset heading');
});

await check('11 generate a report as admin, then download Word', async () => {
  await page.getByPlaceholder('e.g. First draft for committee review').fill('E2E v1');
  await btn('Generate report').click();
  await toast('Board report v1 generated');
  const [download] = await Promise.all([page.waitForEvent('download'), btn('Word').click()]);
  expectEq(download.suggestedFilename(), 'DD-Report-Walkthrough-Test-Bank-v1.doc', 'Word file name');
});

await check('12 add a representative user linked to the case', async () => {
  await btn('Users').click();
  await page.waitForURL('**/users');
  const fields = page.locator('.field');
  await fields.filter({ hasText: 'Name' }).first().locator('input').fill('Rep Tester');
  await fields.filter({ hasText: 'Username' }).first().locator('input').fill('Rep.Tester');
  await page.locator('select:has(option[value="rep"])').selectOption('rep');
  // Option text sits in span.sc-interp (as in the prototype), so match with has-text, not text-is.
  await page.locator('select:has(option:has-text("Select institution"))').selectOption({ label: BANK });
  await fields.filter({ hasText: 'Temporary passcode' }).locator('input').fill('1234');
  await btn('Add').click();
  await toast('Account created · passcode change required at first sign-in');
  await page.locator('tr', { hasText: 'rep.tester' }).getByText('Passcode change required at next sign-in').waitFor();
});

await check('13 rep signs in → forced passcode change → /portal', async () => {
  await signOut();
  await signIn('rep.tester', '1234');
  await page.waitForURL('**/change-passcode');
  await page.locator('input[type=password]').nth(0).fill('abcd');
  await page.locator('input[type=password]').nth(1).fill('abcd');
  await btn('Set passcode').click();
  await page.waitForURL('**/portal');
  await page.getByText(BANK).first().waitFor();
  expectEq(await btn('Cases').count(), 0, 'no staff navigation for a rep');
});

await check('14 rep uploads 2 files → Submitted', async () => {
  await page.locator('label', { hasText: 'Upload documents' }).first().locator('input[type=file]').setInputFiles([
    { name: 'e2e-a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('aaa') },
    { name: 'e2e-b.pdf', mimeType: 'application/pdf', buffer: Buffer.from('bbb') },
  ]);
  await toast('2 files uploaded');
  await page.getByText('Submitted · 1').first().waitFor();
});

async function reviewBlock() {
  return page.locator('div').filter({ hasText: 'e2e-a.pdf' }).filter({ has: page.locator('textarea') }).last();
}
await check('15 admin requests clarification on one file', async () => {
  await signOut();
  await signIn('admin', '5210');
  await page.waitForURL('**/cases');
  await openCase();
  await page.getByRole('button', { name: /^Partner documents · 1 to review/ }).click();
  await page.waitForURL(`**/cases/${caseId}/partner-documents`);
  const block = await reviewBlock();
  await block.locator('select').selectOption({ label: 'e2e-a.pdf (v1)' });
  await block.locator('textarea').fill('Please clarify the signatory.');
  await block.getByRole('button', { name: 'Request clarification' }).click();
  await toast('Clarification requested recorded');
  await page.getByText('Clarification required · 1').first().waitFor();
});

await check('16 rep replies → Submitted', async () => {
  await signOut();
  await signIn('rep.tester', 'abcd');
  await page.waitForURL('**/portal');
  await page.getByPlaceholder('Reply to the due diligence team').fill('Signed by the company secretary.');
  await btn('Send reply').click();
  await toast('Reply sent');
  await page.getByText('Submitted · 1').first().waitFor();
});

await check('17 admin accepts → Accepted', async () => {
  await signOut();
  await signIn('admin', '5210');
  await openCase();
  await page.getByRole('button', { name: /^Partner documents/ }).click();
  const block = await reviewBlock();
  await block.getByRole('button', { name: 'Accept' }).click();
  await toast('Accepted recorded');
  await page.getByText('Accepted · 1').first().waitFor();
});

await check('18 audit trail lists every case action, newest first', async () => {
  await page.getByRole('button', { name: BANK, exact: true }).first().click();
  await btn('Audit trail').click();
  await page.waitForURL(`**/cases/${caseId}/audit`);
  const actions = await page.locator('tbody tr td:nth-child(3)').allInnerTexts();
  const expected = ['pfi.accept', 'pfi.reply', 'pfi.clarify', 'pfi.upload', 'report.downloaded', 'report.generated',
    'rating.removed', 'rating.added', 'attachment.deleted', 'attachment.uploaded', 'attachment.uploaded', 'section.saved', 'case.created'];
  expectEq(JSON.stringify(actions), JSON.stringify(expected), 'audit actions');
});

// ——— T2.5 permissions in the UI ———
await check('T2.5 analyst: decision and report generation disabled', async () => {
  await btn('Users').click();
  const fields = page.locator('.field');
  await fields.filter({ hasText: 'Name' }).first().locator('input').fill('Ana Lyst');
  await fields.filter({ hasText: 'Username' }).first().locator('input').fill('analyst1');
  await fields.filter({ hasText: 'Temporary passcode' }).locator('input').fill('1111');
  await btn('Add').click();
  await signOut();
  await signIn('analyst1', '1111');
  await page.locator('input[type=password]').nth(0).fill('2222');
  await page.locator('input[type=password]').nth(1).fill('2222');
  await btn('Set passcode').click();
  await page.waitForURL('**/cases');
  await openCase();
  await btn('Scoring & board report').click();
  await text('Lead or admin role required.').waitFor();
  if (!(await btn('Save decision').isDisabled())) throw new Error('Save decision enabled');
  if (!(await btn('Generate report').isDisabled())) throw new Error('Generate report enabled');
});

await check('T2.5 analyst: no account administration on Users', async () => {
  await btn('Users').click();
  await text('Account administration is restricted to administrators.').waitFor();
  expectEq(await page.getByText('Add user', { exact: true }).count(), 0, '"Add user" form');
});

await check('T2.5 rep: a staff address sends them to /portal', async () => {
  await signOut();
  await signIn('rep.tester', 'abcd');
  await page.waitForURL('**/portal');
  // A client-side navigation to a staff address through Next's router (no reload, which would
  // drop M2's in-memory data).
  const ok = await page.evaluate((id) => {
    if (!window.next || !window.next.router) return false;
    window.next.router.push(`/cases/${id}/scoring`);
    return true;
  }, caseId);
  if (!ok) throw new Error('window.next.router not available');
  await page.waitForURL(`**/cases/${caseId}/scoring`, { timeout: 3000 }).catch(() => {});
  await page.waitForURL('**/portal', { timeout: 5000 });
  expectEq(await page.getByText('Weighted scoring matrix').count(), 0, 'scoring screen shown to a rep');
});

// ——— T2.7 lockout and passcode rules ———
await check('T2.7 three wrong passcodes lock the account, with the prototype messages', async () => {
  await signOut();
  await signIn('rep.tester', 'wrong');
  await text('Invalid username or passcode. 2 attempts remaining before the account locks.').waitFor();
  await signIn('rep.tester', 'wrong');
  await text('Invalid username or passcode. 1 attempt remaining before the account locks.').waitFor();
  await signIn('rep.tester', 'wrong');
  await text('Account locked after three failed attempts. Contact an administrator to have a passcode reissued.').waitFor();
  await signIn('rep.tester', 'abcd');
  await text('Account locked. Contact an administrator to have a passcode reissued.').waitFor();
});

let issued;
await check('T2.7 admin "Unlock and reissue" shows a new code', async () => {
  await signIn('admin', '5210');
  await page.waitForURL('**/cases');
  await btn('Users').click();
  const row = page.locator('tr', { hasText: 'rep.tester' });
  await row.getByText('Locked', { exact: true }).waitFor();
  await row.getByRole('button', { name: 'Unlock and reissue' }).click();
  issued = (await row.locator('td').last().locator('span').last().innerText()).trim();
  if (!/^\d{4}$/.test(issued)) throw new Error(`issued code "${issued}"`);
  await toast(`Account unlocked · passcode reissued for rep.tester: ${issued}`);
});

await check('T2.7 forced change rejects short, mismatched and unchanged passcodes', async () => {
  await signOut();
  await signIn('rep.tester', issued);
  await page.waitForURL('**/change-passcode');
  const [p1, p2] = [page.locator('input[type=password]').nth(0), page.locator('input[type=password]').nth(1)];
  await p1.fill('abc'); await p2.fill('abc'); await btn('Set passcode').click();
  await text('Use at least four characters.').waitFor();
  await p1.fill('abcd1'); await p2.fill('abcd2'); await btn('Set passcode').click();
  await text('The two entries do not match.').waitFor();
  await p1.fill(issued); await p2.fill(issued); await btn('Set passcode').click();
  await text('Choose a passcode different from the one you were issued.').waitFor();
  await p1.fill('newpass'); await p2.fill('newpass'); await btn('Set passcode').click();
  await page.waitForURL('**/portal');
});

await check('no console errors during the run', async () => {
  if (consoleErrors.length) throw new Error(consoleErrors.slice(0, 3).join(' | '));
});

await browser.close();
console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
