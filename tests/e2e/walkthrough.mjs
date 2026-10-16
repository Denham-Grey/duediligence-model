// M2 · T2.4 (walkthrough), T2.5 (permissions in the UI), T2.7 (lockout and passcode rules) —
// updated for M4: accounts are real Supabase accounts. A throwaway admin (e2e_wt_admin) is created
// with the service role; the accounts the walkthrough adds through the UI are named e2e_* too, and
// all of them are deleted at the end. Case data is still held in memory until M5, so the
// representative is linked to Meridian (case 3), which exists both in memory and in the database.
// Usage: npm run test:e2e   (dev server on E2E_URL, default http://localhost:3210)
import { randomBytes } from 'node:crypto';
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { emailFor } from '../../lib/auth/constants.js';

const BASE = (process.env.E2E_URL || 'http://localhost:3210').replace(/\/$/, '');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const BANK = 'Walkthrough Test Bank';
const MERIDIAN = 'Meridian Trust Bank Plc';
const ADMIN = 'e2e_wt_admin';
const ADMIN_PW = randomBytes(9).toString('base64url');
const REP = 'e2e_rep.tester';
const ANALYST = 'e2e_analyst1';

let failed = 0;
const results = [];
async function check(name, fn) {
  try { await fn(); results.push(`PASS  ${name}`); }
  catch (e) { failed++; results.push(`FAIL  ${name}\n      ${String(e.message || e).split('\n')[0]}`); }
}
const expectEq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
async function cleanup() {
  const { data } = await db.from('profiles').select('id').like('username', 'e2e\\_%');
  for (const p of data || []) await db.auth.admin.deleteUser(p.id);
}

await cleanup();
{
  const { data, error } = await db.auth.admin.createUser({ email: emailFor(ADMIN), password: ADMIN_PW, email_confirm: true });
  if (error) throw new Error(`setup: ${error.message}`);
  const { error: e2 } = await db.from('profiles').insert({ id: data.user.id, username: ADMIN, name: 'Administrator', role: 'admin', must_change: false });
  if (e2) throw new Error(`setup profile: ${e2.message}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('dialog', (d) => d.accept());
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const btn = (name) => page.getByRole('button', { name, exact: true }).first();
const text = (s) => page.getByText(s, { exact: true }).first();
const toast = (s) => page.getByText(s).first().waitFor({ timeout: 6000 });
async function signIn(user, pass) {
  await page.locator('input[type=text].input').first().fill(user);
  await page.locator('input[type=password]').first().fill(pass);
  await page.locator('button.btn-primary', { hasText: 'Sign in' }).click();
}
async function signOut() { await btn('Sign out').click(); await page.waitForURL('**/login'); }
async function openCase(bank) { await btn('Cases').click(); await btn(bank).click(); await page.waitForURL(/\/cases\/\d+$/); }
async function setNewPasscode(pw) {
  await page.waitForURL('**/change-passcode');
  await page.locator('input[type=password]').nth(0).fill(pw);
  await page.locator('input[type=password]').nth(1).fill(pw);
  await btn('Set passcode').click();
}
const path = () => new URL(page.url()).pathname;
const block = (file) => page.locator('div').filter({ hasText: file }).filter({ has: page.locator('textarea') }).last();

try {
  await page.goto(`${BASE}/`);

  // ——— T2.4 walkthrough ———
  await check('1 sign in as admin → /cases', async () => {
    await page.waitForURL('**/login');
    await signIn(ADMIN, ADMIN_PW);
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
    await page.waitForURL('**/sections/S17');
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

  await check('12 add a representative user linked to Meridian', async () => {
    await btn('Users').click();
    await page.waitForURL('**/users');
    const fields = page.locator('.field');
    await fields.filter({ hasText: 'Name' }).first().locator('input').fill('Rep Tester');
    await fields.filter({ hasText: 'Username' }).first().locator('input').fill('E2E_Rep.Tester');
    await page.locator('select:has(option[value="rep"])').selectOption('rep');
    // Option text sits in span.sc-interp (as in the prototype), so match with has-text, not text-is.
    await page.locator('select:has(option:has-text("Select institution"))').selectOption({ label: MERIDIAN });
    await fields.filter({ hasText: 'Temporary passcode' }).locator('input').fill('temp-123');
    await btn('Add').click();
    await toast('Account created · passcode change required at first sign-in');
    await page.locator('tr', { hasText: REP }).getByText('Passcode change required at next sign-in').waitFor();
  });

  await check('13 rep signs in → forced passcode change → /portal', async () => {
    await signOut();
    await signIn(REP, 'temp-123');
    await setNewPasscode('rep-pass-1');
    await page.waitForURL('**/portal');
    await page.getByText(MERIDIAN).first().waitFor();
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

  await check('15 admin requests clarification on one file', async () => {
    await signOut();
    await signIn(ADMIN, ADMIN_PW);
    await page.waitForURL('**/cases');
    await openCase(MERIDIAN);
    await page.getByRole('button', { name: /^Partner documents · 1 to review/ }).click();
    await page.waitForURL('**/cases/3/partner-documents');
    const b = block('e2e-a.pdf');
    await b.locator('select').selectOption({ label: 'e2e-a.pdf (v1)' });
    await b.locator('textarea').fill('Please clarify the signatory.');
    await b.getByRole('button', { name: 'Request clarification' }).click();
    await toast('Clarification requested recorded');
    await page.getByText('Clarification required · 2').first().waitFor();
  });

  await check('16 rep replies → Submitted', async () => {
    await signOut();
    await signIn(REP, 'rep-pass-1');
    await page.waitForURL('**/portal');
    const b = block('e2e-a.pdf');
    await b.getByPlaceholder('Reply to the due diligence team').fill('Signed by the company secretary.');
    await b.getByRole('button', { name: 'Send reply' }).click();
    await toast('Reply sent');
    await page.getByText('Submitted · 1').first().waitFor();
  });

  await check('17 admin accepts → Accepted', async () => {
    await signOut();
    await signIn(ADMIN, ADMIN_PW);
    await openCase(MERIDIAN);
    await page.getByRole('button', { name: /^Partner documents/ }).click();
    await block('e2e-a.pdf').getByRole('button', { name: 'Accept' }).click();
    await toast('Accepted recorded');
    await page.getByText('Accepted · 2').first().waitFor();
  });

  await check('18 audit trails list every action, newest first', async () => {
    await page.getByRole('button', { name: MERIDIAN, exact: true }).first().click();
    await btn('Audit trail').click();
    await page.waitForURL('**/cases/3/audit');
    const meridian = (await page.locator('tbody tr td:nth-child(3)').allInnerTexts()).slice(0, 4);
    expectEq(JSON.stringify(meridian), JSON.stringify(['pfi.accept', 'pfi.reply', 'pfi.clarify', 'pfi.upload']), 'Meridian partner-document actions');
    await openCase(BANK);
    await btn('Audit trail').click();
    await page.waitForURL(`**/cases/${caseId}/audit`);
    const actions = await page.locator('tbody tr td:nth-child(3)').allInnerTexts();
    const expected = ['report.downloaded', 'report.generated', 'rating.removed', 'rating.added',
      'attachment.deleted', 'attachment.uploaded', 'attachment.uploaded', 'section.saved', 'case.created'];
    expectEq(JSON.stringify(actions), JSON.stringify(expected), 'new case audit actions');
  });

  // ——— T2.5 permissions in the UI ———
  await check('T2.5 analyst: decision and report generation disabled', async () => {
    await btn('Users').click();
    const fields = page.locator('.field');
    await fields.filter({ hasText: 'Name' }).first().locator('input').fill('Ana Lyst');
    await fields.filter({ hasText: 'Username' }).first().locator('input').fill(ANALYST);
    await fields.filter({ hasText: 'Temporary passcode' }).locator('input').fill('temp-111');
    await btn('Add').click();
    await toast('Account created · passcode change required at first sign-in');
    await signOut();
    await signIn(ANALYST, 'temp-111');
    await setNewPasscode('analyst-2');
    await page.waitForURL('**/cases');
    await openCase(MERIDIAN);
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
    await signIn(REP, 'rep-pass-1');
    await page.waitForURL('**/portal');
    const ok = await page.evaluate(() => {
      if (!window.next || !window.next.router) return false;
      window.next.router.push('/cases/3/scoring');
      return true;
    });
    if (!ok) throw new Error('window.next.router not available');
    await page.waitForURL('**/cases/3/scoring', { timeout: 3000 }).catch(() => {});
    await page.waitForURL('**/portal', { timeout: 5000 });
    expectEq(await page.getByText('Weighted scoring matrix').count(), 0, 'scoring screen shown to a rep');
  });

  // ——— T2.7 lockout and passcode rules ———
  await check('T2.7 three wrong passcodes lock the account, with the prototype messages', async () => {
    await signOut();
    await signIn(REP, 'wrong-pass');
    await text('Invalid username or passcode. 2 attempts remaining before the account locks.').waitFor();
    await signIn(REP, 'wrong-pass');
    await text('Invalid username or passcode. 1 attempt remaining before the account locks.').waitFor();
    await signIn(REP, 'wrong-pass');
    await text('Account locked after three failed attempts. Contact an administrator to have a passcode reissued.').waitFor();
    await signIn(REP, 'rep-pass-1');
    await text('Account locked. Contact an administrator to have a passcode reissued.').waitFor();
  });

  let issued;
  await check('T2.7 admin "Unlock and reissue" shows a new 6-digit code', async () => {
    await signIn(ADMIN, ADMIN_PW);
    await page.waitForURL('**/cases');
    await btn('Users').click();
    const row = page.locator('tr', { hasText: REP });
    await row.getByText('Locked', { exact: true }).waitFor();
    await row.getByRole('button', { name: 'Unlock and reissue' }).click();
    await page.getByText(new RegExp(`Account unlocked · passcode reissued for ${REP.replace('.', '\\.')}: \\d{6}`)).first().waitFor();
    issued = (await row.locator('td').last().locator('span').last().innerText()).trim();
    if (!/^\d{6}$/.test(issued)) throw new Error(`issued code "${issued}"`);
  });

  await check('T2.7 forced change rejects short, mismatched and unchanged passcodes', async () => {
    await signOut();
    await signIn(REP, issued);
    await page.waitForURL('**/change-passcode');
    const [p1, p2] = [page.locator('input[type=password]').nth(0), page.locator('input[type=password]').nth(1)];
    await p1.fill('abc12'); await p2.fill('abc12'); await btn('Set passcode').click();
    await text('Use at least six characters.').waitFor();
    await p1.fill('abcdef1'); await p2.fill('abcdef2'); await btn('Set passcode').click();
    await text('The two entries do not match.').waitFor();
    await p1.fill(issued); await p2.fill(issued); await btn('Set passcode').click();
    await text('Choose a passcode different from the one you were issued.').waitFor();
    await p1.fill('newpass1'); await p2.fill('newpass1'); await btn('Set passcode').click();
    await page.waitForURL('**/portal');
  });

  await check('no console errors during the run', async () => {
    // Refusals are answered with 400 (passcode equal to the issued one), 401 (wrong passcode) and
    // 423 (locked) by design; the browser logs those as failed resources.
    const real = consoleErrors.filter((e) => !/status of (400|401|423)/.test(e));
    if (real.length) throw new Error(real.slice(0, 3).join(' | '));
  });
} finally {
  await browser.close();
  await cleanup();
}
console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
