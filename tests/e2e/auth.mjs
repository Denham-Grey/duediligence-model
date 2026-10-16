// M4 · T4.1–T4.8 — sign-in, lockout, forced change, sessions and user administration against the
// real Supabase project, through the running app (E2E_URL, default http://localhost:3210).
// Creates throwaway accounts (e2e_admin, e2e_analyst, e2e_rep → Meridian, case 3) with random
// passcodes that are never printed, and deletes them at the end, whatever the outcome.
// Usage: npm run test:auth
import { randomBytes } from 'node:crypto';
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { emailFor } from '../../lib/auth/constants.js';

const BASE = (process.env.E2E_URL || 'http://localhost:3210').replace(/\/$/, '');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const MERIDIAN = 3;
const pass = () => randomBytes(9).toString('base64url');
const ACCOUNTS = {
  e2e_admin: { name: 'E2E Admin', role: 'admin', password: pass() },
  e2e_analyst: { name: 'E2E Analyst', role: 'analyst', password: pass() },
  e2e_rep: { name: 'E2E Rep', role: 'rep', institution_id: MERIDIAN, password: pass() },
};

let failed = 0;
const results = [];
async function check(name, fn) {
  try { await fn(); results.push(`PASS  ${name}`); }
  catch (e) { failed++; results.push(`FAIL  ${name}\n      ${String(e.message || e).split('\n')[0]}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const profile = async (u) => (await db.from('profiles').select('*').eq('username', u).single()).data;

async function setup() {
  for (const [username, a] of Object.entries(ACCOUNTS)) {
    const { data, error } = await db.auth.admin.createUser({ email: emailFor(username), password: a.password, email_confirm: true });
    if (error) throw new Error(`setup ${username}: ${error.message}`);
    a.id = data.user.id;
    const { error: e2 } = await db.from('profiles').insert({ id: a.id, username, name: a.name, role: a.role, institution_id: a.institution_id || null, must_change: false });
    if (e2) throw new Error(`setup profile ${username}: ${e2.message}`);
  }
}
async function cleanup() {
  const { data } = await db.from('profiles').select('id, username').like('username', 'e2e\\_%');
  for (const p of data || []) await db.auth.admin.deleteUser(p.id); // profiles cascade
}

await cleanup(); // leftovers from an interrupted run
await setup();
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());
  const btn = (n) => page.getByRole('button', { name: n, exact: true }).first();
  const text = (s) => page.getByText(s, { exact: true }).first();
  async function signIn(u, p) {
    await page.locator('input[type=text].input').first().fill(u);
    await page.locator('input[type=password]').first().fill(p);
    await page.locator('button.btn-primary', { hasText: 'Sign in' }).click();
  }
  async function signOut() { await btn('Sign out').click(); await page.waitForURL('**/login'); }
  const api = (url, method = 'POST', body = {}) => page.evaluate(async ([u, m, b]) => {
    const r = await fetch(u, { method: m, headers: { 'content-type': 'application/json' }, body: m === 'GET' ? undefined : JSON.stringify(b) });
    return { status: r.status, body: await r.json().catch(() => null) };
  }, [url, method, body]);

  await check('proxy: a signed-out page request is sent to /login', async () => {
    const r = await fetch(`${BASE}/cases/3/scoring`, { redirect: 'manual' });
    if (![302, 303, 307, 308].includes(r.status)) throw new Error(`status ${r.status}`);
    eq(new URL(r.headers.get('location'), BASE).pathname, '/login', 'redirect target');
  });

  await page.goto(`${BASE}/login`);

  await check('T4.1 three wrong passcodes lock the account, with the prototype messages', async () => {
    await signIn('e2e_rep', 'wrong-pass');
    await text('Invalid username or passcode. 2 attempts remaining before the account locks.').waitFor();
    await signIn('e2e_rep', 'wrong-pass');
    await text('Invalid username or passcode. 1 attempt remaining before the account locks.').waitFor();
    await signIn('E2E_Rep', 'wrong-pass'); // usernames are case-insensitive
    await text('Account locked after three failed attempts. Contact an administrator to have a passcode reissued.').waitFor();
    const p = await profile('e2e_rep');
    eq(p.locked, true, 'profiles.locked');
    eq(p.failed_attempts, 3, 'profiles.failed_attempts');
  });

  let code;
  await check('T4.2 a locked account cannot sign in until an admin unlocks and reissues', async () => {
    await signIn('e2e_rep', ACCOUNTS.e2e_rep.password);
    await text('Account locked. Contact an administrator to have a passcode reissued.').waitFor();
    await signIn('e2e_admin', ACCOUNTS.e2e_admin.password);
    await page.waitForURL('**/cases');
    await btn('Users').click();
    const row = page.locator('tr', { hasText: 'e2e_rep' });
    await row.getByText('Locked', { exact: true }).waitFor();
    await row.getByRole('button', { name: 'Unlock and reissue' }).click();
    await page.getByText(/Account unlocked · passcode reissued for e2e_rep: \d{6}/).first().waitFor();
    code = (await row.locator('td').last().locator('span').last().innerText()).trim();
    if (!/^\d{6}$/.test(code)) throw new Error(`issued code "${code}" is not 6 digits`);
    const p = await profile('e2e_rep');
    eq(JSON.stringify([p.locked, p.failed_attempts, p.must_change]), JSON.stringify([false, 0, true]), 'locked, failed, must_change');
  });

  await check('T4.4 adding a duplicate username is refused', async () => {
    const fields = page.locator('.field');
    await fields.filter({ hasText: 'Name' }).first().locator('input').fill('Duplicate');
    await fields.filter({ hasText: 'Username' }).first().locator('input').fill('E2E_Analyst');
    await fields.filter({ hasText: 'Temporary passcode' }).locator('input').fill('abcdef12');
    await btn('Add').click();
    await page.getByText('The username "e2e_analyst" is already in use.').first().waitFor();
  });

  await check('T4.3 the forced change rejects short, mismatched and unchanged passcodes', async () => {
    await signOut();
    await signIn('e2e_rep', code);
    await page.waitForURL('**/change-passcode');
    const [p1, p2] = [page.locator('input[type=password]').nth(0), page.locator('input[type=password]').nth(1)];
    await p1.fill('abc12'); await p2.fill('abc12'); await btn('Set passcode').click();
    await text('Use at least six characters.').waitFor();
    await p1.fill('abcdef1'); await p2.fill('abcdef2'); await btn('Set passcode').click();
    await text('The two entries do not match.').waitFor();
    await p1.fill(code); await p2.fill(code); await btn('Set passcode').click();
    await text('Choose a passcode different from the one you were issued.').waitFor();
    ACCOUNTS.e2e_rep.password = pass();
    await p1.fill(ACCOUNTS.e2e_rep.password); await p2.fill(ACCOUNTS.e2e_rep.password); await btn('Set passcode').click();
    await page.waitForURL('**/portal');
    await page.getByText('Meridian Trust Bank Plc').first().waitFor();
    eq((await profile('e2e_rep')).must_change, false, 'must_change after the change');
  });

  await check('session: a reload keeps the user signed in on the same page', async () => {
    await page.reload();
    await page.waitForURL('**/portal');
    await page.getByText('Meridian Trust Bank Plc').first().waitFor();
  });

  await check('T4.8 a representative calling admin routes gets 404', async () => {
    eq((await api('/api/users', 'POST', { name: 'x', username: 'e2e_x', role: 'analyst', passcode: 'abcdef12' })).status, 404, 'POST /api/users');
    eq((await api(`/api/users/${ACCOUNTS.e2e_admin.id}/reissue`)).status, 404, 'POST reissue');
    const list = await api('/api/users', 'GET');
    eq(JSON.stringify(list.body.users.map((u) => u.username)), JSON.stringify(['e2e_rep']), 'a rep sees only their own account');
  });

  await check('T4.8 an analyst calling admin routes gets 403', async () => {
    await signOut();
    await signIn('e2e_analyst', ACCOUNTS.e2e_analyst.password);
    await page.waitForURL('**/cases');
    eq((await api('/api/users', 'POST', { name: 'x', username: 'e2e_x', role: 'analyst', passcode: 'abcdef12' })).status, 403, 'POST /api/users');
    eq((await api(`/api/users/${ACCOUNTS.e2e_rep.id}/reissue`)).status, 403, 'POST reissue');
    if ((await api('/api/users', 'GET')).body.users.length < 3) throw new Error('staff should see every account');
  });

  await check('T4.6 session cookies are SameSite=Lax (Secure in production)', async () => {
    const sb = (await ctx.cookies()).filter((c) => c.name.startsWith('sb-'));
    if (!sb.length) throw new Error('no Supabase session cookie');
    for (const c of sb) eq(c.sameSite, 'Lax', `${c.name} SameSite`);
    results.push(`INFO  session cookies HttpOnly=${sb.every((c) => c.httpOnly)}, Secure=${sb.every((c) => c.secure)} (dev over http; Secure is set in production)`);
  });

  await check('P4 the theme is saved on the profile and restored at the next sign-in', async () => {
    const was = await page.evaluate(() => document.documentElement.getAttribute('data-dd-theme'));
    await page.locator('button[title="Switch appearance"]').first().click();
    const now = was === 'dark' ? 'light' : 'dark';
    await page.waitForTimeout(800);
    eq((await profile('e2e_analyst')).theme, now, 'profiles.theme');
    await signOut();
    await page.evaluate(() => document.documentElement.setAttribute('data-dd-theme', 'light'));
    await signIn('e2e_analyst', ACCOUNTS.e2e_analyst.password);
    await page.waitForURL('**/cases');
    eq(await page.evaluate(() => document.documentElement.getAttribute('data-dd-theme')), now, 'theme after sign-in');
  });

  await check('T4.6 30 minutes without activity signs the user out', async () => {
    const idleCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await idleCtx.newPage();
    await p.clock.install();
    await p.goto(`${BASE}/login`);
    await p.locator('input[type=text].input').first().fill('e2e_analyst');
    await p.locator('input[type=password]').first().fill(ACCOUNTS.e2e_analyst.password);
    await p.locator('button.btn-primary', { hasText: 'Sign in' }).click();
    await p.waitForURL('**/cases');
    await p.clock.fastForward('31:00');
    await p.waitForURL('**/login', { timeout: 10000 });
    await p.getByText('Signed out after 30 minutes without activity.').first().waitFor();
    await idleCtx.close();
  });
} finally {
  await browser.close();
  await cleanup();
  const { data } = await db.from('profiles').select('id').like('username', 'e2e\\_%');
  results.push(`${data && data.length ? 'FAIL' : 'PASS'}  cleanup: throwaway accounts removed`);
  if (data && data.length) failed++;
}
console.log(results.join('\n'));
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.filter((r) => /^(PASS|FAIL)/.test(r)).length} checks passed`);
process.exit(failed ? 1 : 0);
