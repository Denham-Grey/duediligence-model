// RLS / security test suite for the DD Portal Supabase schema (M3, tests T3.3–T3.7).
//
//   npm run test:rls        (= node --env-file=.env.local tests/rls/run.mjs)
//
// Needs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY.
// Key values are never printed.
//
// Fixtures:
//   - Two permanent fixture cases, "RLS Test Bank A" and "RLS Test Bank B", are found or
//     created and REUSED on every run. They cannot be deleted because audit_log and
//     report_versions rows are immutable (and cases cascade into them), so each run adds
//     a few audit rows / report versions to these two cases only.
//   - Everything else (auth users + profiles, pfi_* rows, section/report rows, the
//     app_settings test key, final_decision) is created per run and removed at the end.

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!URL || !PUB || !SECRET) {
  console.error('Missing Supabase env vars (run with --env-file=.env.local).');
  process.exit(2);
}

// The suite leaves immutable rows behind, so it must not run against the real project
// (bdlvolxdazxrfjaabsra, cleaned up on 16 Oct 2026 — see supabase/maintenance/). Point it at a
// Supabase branch or a scratch project; to override deliberately, set
// RLS_TEST_ALLOW_PROJECT=<that project's ref>.
const REF = (URL.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1];
if (REF === 'bdlvolxdazxrfjaabsra' && process.env.RLS_TEST_ALLOW_PROJECT !== REF) {
  console.error('Refusing to run: this is the main DD Portal project. Use a branch or scratch project.');
  process.exit(2);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const svc = createClient(URL, SECRET, opts);

export const EMAIL_DOMAIN = 'users.dd-portal.invalid';
const BANK_A = 'RLS Test Bank A';
const BANK_B = 'RLS Test Bank B';
const PREFIX = 'rlstest_';
const SETTINGS_KEY = 'rls_test_probe';

let failures = 0;
let passes = 0;
function check(id, label, ok, info = '') {
  if (ok) passes++; else failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(5)} ${label}${!ok && info ? `  -> ${info}` : ''}`);
}
const errInfo = (r) => (r?.error ? `${r.error.code ?? ''} ${r.error.message ?? ''}`.trim() : `data=${JSON.stringify(r?.data)?.slice(0, 160)}`);
// A write "fails" when it errors OR (for update/delete with .select()) touches no rows.
const blocked = (r) => !!r.error || (Array.isArray(r.data) && r.data.length === 0);
const errCode = (r, code) => !!r.error && r.error.code === code;
const must = (r, what) => {
  if (r.error) throw new Error(`${what}: ${r.error.code} ${r.error.message}`);
  return r.data;
};

const password = () => randomBytes(12).toString('base64url').slice(0, 14);

async function findOrCreateCase(bank) {
  const found = must(await svc.from('cases').select('id').eq('bank', bank).limit(1), `find ${bank}`);
  if (found.length) return found[0].id;
  return must(await svc.from('cases').insert({ bank, category: 'Onboarding', country: 'Testland', created_by: 'RLS test suite' }).select('id').single(), `create ${bank}`).id;
}

async function purgeTestUsers() {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) if (u.email?.startsWith(PREFIX)) await svc.auth.admin.deleteUser(u.id);
    if (data.users.length < 1000) break;
  }
}

async function resetCaseChildren(ids) {
  must(await svc.from('pfi_requests').delete().in('case_id', ids), 'reset pfi_requests');
  must(await svc.from('case_sections').delete().in('case_id', ids), 'reset case_sections');
  must(await svc.from('case_report_parts').delete().in('case_id', ids), 'reset case_report_parts');
  must(await svc.from('cases').update({ final_decision: '' }).in('id', ids), 'reset final_decision');
  must(await svc.from('app_settings').delete().eq('key', SETTINGS_KEY), 'reset app_settings');
}

async function makeUser(slug, name, role, institutionId, extra = {}) {
  const username = `${PREFIX}${slug}`;
  const email = `${username}@${EMAIL_DOMAIN}`;
  const pw = password();
  const { data, error } = await svc.auth.admin.createUser({ email, password: pw, email_confirm: true });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  const id = data.user.id;
  must(await svc.from('profiles').insert({
    id, username, name, role, institution_id: institutionId ?? null, must_change: false, ...extra,
  }), `profile ${username}`);
  const client = createClient(URL, PUB, opts);
  const s = await client.auth.signInWithPassword({ email, password: pw });
  if (s.error) throw new Error(`sign in ${username}: ${s.error.message}`);
  return { id, username, name, role, client };
}

async function main() {
  console.log('DD Portal RLS suite');
  await purgeTestUsers();
  const A = await findOrCreateCase(BANK_A);
  const B = await findOrCreateCase(BANK_B);
  await resetCaseChildren([A, B]);

  // Staff-only rows the rep must not see.
  must(await svc.from('case_sections').insert([{ case_id: A, code: 'S1', data: { rating: '' } }, { case_id: B, code: 'S1', data: {} }]), 'seed sections');
  must(await svc.from('case_report_parts').insert([{ case_id: A, part_id: 'cover', data: {} }]), 'seed parts');
  must(await svc.from('app_settings').upsert({ key: SETTINGS_KEY, value: { probe: true } }), 'seed settings');

  // Users. Auth email domain check (internal emails, never shown to users).
  let users;
  try {
    users = {
      analyst: await makeUser('analyst', 'RLS Analyst', 'analyst'),
      lead: await makeUser('lead', 'RLS Lead', 'lead'),
      admin: await makeUser('admin', 'RLS Admin', 'admin'),
      repA: await makeUser('repa', 'RLS Rep A', 'rep', A),
      repB: await makeUser('repb', 'RLS Rep B', 'rep', B),
      repLocked: await makeUser('replocked', 'RLS Rep Locked', 'rep', A, { locked: true }),
      repDisabled: await makeUser('repdisabled', 'RLS Rep Disabled', 'rep', A, { active: false }),
    };
    check('AUTH', `auth.admin.createUser accepts @${EMAIL_DOMAIN} and password sign-in works`, true);
  } catch (e) {
    check('AUTH', `auth.admin.createUser accepts @${EMAIL_DOMAIN} and password sign-in works`, false, e.message);
    throw e;
  }
  const { analyst, lead, admin, repA, repB, repLocked, repDisabled } = users;

  try {
    // ---------------------------------------------------------------- fixtures via RPCs
    const reqA1 = must(await analyst.client.rpc('pfi_add_request', { p_case_id: A, p_title: 'Audited accounts', p_note: 'FY2023-FY2025' }), 'add reqA1');
    const reqA2 = must(await analyst.client.rpc('pfi_add_request', { p_case_id: A, p_title: 'Board charter' }), 'add reqA2');
    const reqB1 = must(await analyst.client.rpc('pfi_add_request', { p_case_id: B, p_title: 'UBO declarations' }), 'add reqB1');
    check('RPC', 'staff pfi_add_request -> Pending upload', reqA1.status === 'Pending upload' && reqA1.requested_by === 'RLS Analyst', JSON.stringify(reqA1));

    const fileIdA = crypto.randomUUID();
    const upA = await repA.client.rpc('pfi_record_upload', {
      p_request_id: reqA1.id,
      p_files: [{ id: fileIdA, name: 'accounts.pdf', size: 1234, mime: 'application/pdf', storage_path: `${A}/${reqA1.id}/1/${fileIdA}` }],
    });
    check('RPC', 'rep A uploads to own request -> version 1, Submitted', !upA.error && upA.data.n === 1 && upA.data.status === 'Submitted', errInfo(upA));
    const upB = must(await repB.client.rpc('pfi_record_upload', { p_request_id: reqB1.id, p_files: [{ name: 'ubo.pdf', size: 99 }] }), 'upload B');
    const fileIdB = upB.file_ids[0];
    const up2 = must(await analyst.client.rpc('pfi_record_upload', { p_request_id: reqA2.id, p_files: [{ name: 'charter.pdf' }] }), 'staff upload A2');
    const acc = await analyst.client.rpc('pfi_post', { p_request_id: reqA2.id, p_kind: 'accept' });
    check('RPC', "staff accept with no text -> 'Accepted.' / tag Accepted", !acc.error && acc.data.text === 'Accepted.' && acc.data.tag === 'Accepted', errInfo(acc));

    const badPath = await repA.client.rpc('pfi_record_upload', { p_request_id: reqA1.id, p_files: [{ name: 'x.pdf', storage_path: `${B}/${reqB1.id}/1/x` }] });
    check('RPC', 'upload with storage_path outside the request is refused (22023)', errCode(badPath, '22023'), errInfo(badPath));

    // ---------------------------------------------------------------- T3.3 rep reads
    for (const t of ['cases', 'case_sections', 'case_report_parts', 'report_versions', 'audit_log', 'app_settings']) {
      const r = await repA.client.from(t).select('*');
      check('T3.3', `rep A: ${t} -> 0 rows`, !r.error && r.data.length === 0, errInfo(r));
    }
    const prof = await repA.client.from('profiles').select('id');
    check('T3.3', 'rep A: profiles -> own row only', !prof.error && prof.data.length === 1 && prof.data[0].id === repA.id, errInfo(prof));
    for (const t of ['pfi_requests', 'pfi_rounds', 'pfi_files', 'pfi_messages']) {
      const all = await repA.client.from(t).select('case_id');
      check('T3.3', `rep A: ${t} -> only case A rows`, !all.error && all.data.length > 0 && all.data.every((x) => x.case_id === A), errInfo(all));
      const b = await repA.client.from(t).select('case_id').eq('case_id', B);
      check('T3.3', `rep A: ${t} for case B -> 0 rows`, !b.error && b.data.length === 0, errInfo(b));
    }
    const inst = await repA.client.rpc('my_institution');
    check('T3.3', 'rep A: my_institution() -> Bank A only', !inst.error && inst.data.length === 1 && inst.data[0].id === A && inst.data[0].bank === BANK_A, errInfo(inst));
    const anon = createClient(URL, PUB, opts);
    const anonCases = await anon.from('cases').select('id');
    check('T3.3', 'anonymous: cases -> denied or 0 rows', !!anonCases.error || anonCases.data.length === 0, errInfo(anonCases));
    const anonInst = await anon.rpc('my_institution');
    check('T3.3', 'anonymous: my_institution() -> denied', !!anonInst.error || anonInst.data.length === 0, errInfo(anonInst));

    // ---------------------------------------------------------------- T3.4 rep writes
    let r = await repA.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'accept', p_text: 'ok' });
    check('T3.4', "rep A: pfi_post kind 'accept' fails (42501)", errCode(r, '42501'), errInfo(r));
    r = await repA.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'comment', p_text: 'hi' });
    check('T3.4', "rep A: pfi_post kind 'comment' fails (42501)", errCode(r, '42501'), errInfo(r));
    r = await repA.client.rpc('pfi_post', { p_request_id: reqB1.id, p_kind: 'reply', p_text: 'hi' });
    check('T3.4', 'rep A: pfi_post on case B request fails (P0002)', errCode(r, 'P0002'), errInfo(r));
    r = await repA.client.rpc('pfi_record_upload', { p_request_id: reqB1.id, p_files: [{ name: 'x.pdf' }] });
    check('T3.4', 'rep A: pfi_record_upload on case B fails (P0002)', errCode(r, 'P0002'), errInfo(r));
    r = await repA.client.rpc('pfi_remove_file', { p_file_id: fileIdB });
    check('T3.4', 'rep A: pfi_remove_file on case B file fails (P0002)', errCode(r, 'P0002'), errInfo(r));
    r = await repA.client.rpc('pfi_add_request', { p_case_id: A, p_title: 'x' });
    check('T3.4', 'rep A: pfi_add_request fails (42501)', errCode(r, '42501'), errInfo(r));
    r = await repA.client.rpc('pfi_remove_file', { p_file_id: up2.file_ids[0] });
    check('T3.4', 'rep A: remove file on an Accepted request fails (55000)', errCode(r, '55000'), errInfo(r));
    r = await repA.client.rpc('pfi_record_upload', { p_request_id: reqA2.id, p_files: [{ name: 'late.pdf' }] });
    check('T3.4', 'rep A: upload to an Accepted request fails (55000)', errCode(r, '55000'), errInfo(r));
    r = await repA.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'reply', p_text: 'early' });
    check('T3.4', 'rep A: reply before staff have posted fails (55000)', errCode(r, '55000'), errInfo(r));
    r = await repA.client.from('pfi_messages').insert({ request_id: reqA1.id, case_id: A, kind: 'accept', role: 'dd', text: 'x' });
    check('T3.4', 'rep A: direct insert pfi_messages (kind accept) fails', !!r.error, errInfo(r));
    r = await repA.client.from('pfi_requests').insert({ case_id: B, title: 'x' });
    check('T3.4', 'rep A: direct insert pfi_requests on case B fails', !!r.error, errInfo(r));
    r = await repA.client.from('pfi_files').insert({ round_id: 1, request_id: reqA1.id, case_id: A, name: 'x' });
    check('T3.4', 'rep A: direct insert pfi_files fails', !!r.error, errInfo(r));
    r = await repA.client.from('pfi_rounds').insert({ request_id: reqA1.id, case_id: A, n: 9 });
    check('T3.4', 'rep A: direct insert pfi_rounds fails', !!r.error, errInfo(r));
    r = await repA.client.from('pfi_requests').update({ status: 'Accepted' }).eq('id', reqA1.id).select();
    check('T3.4', 'rep A: direct update pfi_requests.status fails', blocked(r), errInfo(r));
    r = await repA.client.from('pfi_files').delete().eq('id', fileIdA).select();
    check('T3.4', 'rep A: direct delete pfi_files fails', blocked(r), errInfo(r));

    // ---------------------------------------------------------------- workflow (§7.6)
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'clarify', p_text: 'Which years?', p_about: `accounts.pdf (v1)` });
    let st = must(await svc.from('pfi_requests').select('status').eq('id', reqA1.id).single(), 'status');
    check('WF', 'staff clarify -> Clarification required, tag/about set', !r.error && st.status === 'Clarification required' && r.data.tag === 'Clarification requested' && r.data.about === 'accounts.pdf (v1)', errInfo(r));
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'comment', p_text: '' });
    check('WF', 'staff comment without text fails (22023)', errCode(r, '22023'), errInfo(r));
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'reply', p_text: 'x' });
    check('WF', 'staff reply fails (42501)', errCode(r, '42501'), errInfo(r));
    r = await repA.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'reply', p_text: 'FY2023-FY2025', p_about: 'ignored' });
    st = must(await svc.from('pfi_requests').select('status').eq('id', reqA1.id).single(), 'status');
    check('WF', 'rep reply -> Submitted, role rep, about cleared', !r.error && st.status === 'Submitted' && r.data.role === 'rep' && r.data.about === '' && r.data.tag === 'Reply', errInfo(r));
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'reupload', p_text: 'Need signed opinion' });
    r = await repA.client.rpc('pfi_record_upload', { p_request_id: reqA1.id, p_files: [{ name: 'signed.pdf' }, { name: 'opinion.pdf' }] });
    check('WF', 'upload after Reupload required -> new version 2', !r.error && r.data.n === 2, errInfo(r));
    const v2Files = r.data?.file_ids ?? [];
    r = await repA.client.rpc('pfi_remove_file', { p_file_id: fileIdA });
    check('WF', 'rep removing a file from an earlier version fails (55000)', errCode(r, '55000'), errInfo(r));
    await repA.client.rpc('pfi_remove_file', { p_file_id: v2Files[0] });
    r = await repA.client.rpc('pfi_remove_file', { p_file_id: v2Files[1] });
    st = must(await svc.from('pfi_requests').select('status').eq('id', reqA1.id).single(), 'status');
    const liveRounds = must(await repA.client.from('pfi_rounds').select('n').eq('request_id', reqA1.id), 'rounds');
    check('WF', 'removing all v2 files drops v2 (v1 remains, status stays Submitted)', !r.error && liveRounds.length === 1 && liveRounds[0].n === 1 && st.status === 'Submitted', `${errInfo(r)} rounds=${JSON.stringify(liveRounds)} status=${st.status}`);
    const msgs = must(await repA.client.from('pfi_messages').select('text,kind').eq('request_id', reqA1.id).order('id'), 'msgs');
    check('WF', 'thread texts match the prototype', msgs.some((m) => m.text === 'Uploaded 1 file as version 1.') && msgs.some((m) => m.text === 'Uploaded 2 files as version 2.') && msgs.some((m) => m.text === 'Removed opinion.pdf from version 2.'), JSON.stringify(msgs.map((m) => m.text)));
    const repFiles = must(await repA.client.from('pfi_files').select('id').eq('request_id', reqA1.id), 'files');
    const staffFiles = must(await analyst.client.from('pfi_files').select('id').eq('request_id', reqA1.id), 'files');
    check('WF', 'soft-removed files hidden from rep, visible to staff', repFiles.length === 1 && staffFiles.length === 3, `rep=${repFiles.length} staff=${staffFiles.length}`);
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqA2.id, p_kind: 'accept' });
    check('WF', 'accepting an already Accepted request fails (55000)', errCode(r, '55000'), errInfo(r));
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqB1.id, p_kind: 'reject', p_text: 'Unsigned' });
    check('WF', 'staff reject with a file -> ok', !r.error && r.data.tag === 'Rejected', errInfo(r));
    r = await analyst.client.rpc('pfi_post', { p_request_id: reqB1.id, p_kind: 'reject', p_text: 'Again' });
    check('WF', 'reject when already Rejected fails (55000)', errCode(r, '55000'), errInfo(r));
    r = await analyst.client.rpc('pfi_remove_file', { p_file_id: up2.file_ids[0] });
    check('WF', 'staff may remove a file on an Accepted request', !r.error && r.data.status === 'Pending upload', errInfo(r));
    const auditActs = must(await analyst.client.from('audit_log').select('action,detail,who').eq('case_id', A).gte('at', new Date(Date.now() - 10 * 60e3).toISOString()), 'audit');
    check('WF', 'audit rows written by RPCs (pfi.upload detail format, who from profile)',
      auditActs.some((a) => a.action === 'pfi.upload' && a.detail === 'Audited accounts · v1 · 1 file(s)' && a.who === 'RLS Rep A') &&
      auditActs.some((a) => a.action === 'pfi.file.removed' && a.detail === 'Audited accounts · opinion.pdf') &&
      auditActs.some((a) => a.action === 'pfi.request.added' && a.detail === 'Audited accounts') &&
      auditActs.some((a) => a.action === 'pfi.clarify') && auditActs.some((a) => a.action === 'pfi.reply'),
      JSON.stringify(auditActs).slice(0, 300));

    // ---------------------------------------------------------------- T3.5 analyst vs lead/admin
    r = await analyst.client.from('cases').update({ final_decision: 'Approve' }).eq('id', A).select();
    check('T3.5', 'analyst: update cases.final_decision fails (42501)', errCode(r, '42501'), errInfo(r));
    r = await analyst.client.from('cases').update({ covenants: 'Analyst edit' }).eq('id', A).select();
    check('T3.5', 'analyst: update other case fields succeeds', !r.error && r.data.length === 1 && r.data[0].updated_by === analyst.id, errInfo(r));
    r = await analyst.client.rpc('generate_report_version', { p_case_id: A, p_note: 'x', p_snapshot: { bank: BANK_A } });
    check('T3.5', 'analyst: generate_report_version fails (42501)', errCode(r, '42501'), errInfo(r));
    r = await analyst.client.from('report_versions').insert({ case_id: A, version: 999, snapshot: {} });
    check('T3.5', 'analyst: direct insert report_versions fails', !!r.error, errInfo(r));
    r = await analyst.client.from('profiles').update({ name: 'Hacked' }).eq('id', lead.id).select();
    check('T3.5', 'analyst: update another profile (name) fails', blocked(r), errInfo(r));
    r = await analyst.client.from('profiles').update({ theme: 'dark' }).eq('id', lead.id).select();
    const leadTheme = must(await svc.from('profiles').select('theme').eq('id', lead.id).single(), 'lead theme');
    check('T3.5', "analyst: update another profile's theme changes nothing", blocked(r) && leadTheme.theme === null, errInfo(r));
    r = await analyst.client.from('profiles').update({ role: 'admin' }).eq('id', analyst.id).select();
    check('T3.5', 'analyst: update own role fails', blocked(r), errInfo(r));
    r = await analyst.client.from('profiles').update({ locked: false, failed_attempts: 0 }).eq('id', analyst.id).select();
    check('T3.5', 'analyst: update own locked/failed_attempts fails', blocked(r), errInfo(r));
    r = await analyst.client.from('profiles').update({ theme: 'dark' }).eq('id', analyst.id).select();
    check('T3.5', 'analyst: update own theme succeeds', !r.error && r.data.length === 1 && r.data[0].theme === 'dark', errInfo(r));
    r = await repA.client.from('profiles').update({ institution_id: B }).eq('id', repA.id).select();
    check('T3.5', 'rep A: update own institution_id fails', blocked(r), errInfo(r));

    r = await lead.client.from('cases').update({ final_decision: 'Approve' }).eq('id', A).select();
    check('T3.5', 'lead: update cases.final_decision succeeds', !r.error && r.data[0]?.final_decision === 'Approve', errInfo(r));
    r = await admin.client.from('cases').update({ final_decision: 'Defer' }).eq('id', A).select();
    check('T3.5', 'admin: update cases.final_decision succeeds', !r.error && r.data[0]?.final_decision === 'Defer', errInfo(r));
    const maxBefore = must(await svc.from('report_versions').select('version').eq('case_id', A).order('version', { ascending: false }).limit(1), 'max version')[0]?.version ?? 0;
    const g1 = await lead.client.rpc('generate_report_version', { p_case_id: A, p_note: 'Lead run', p_snapshot: { bank: BANK_A } });
    check('T3.5', `lead: generate_report_version succeeds -> v${maxBefore + 1}`, !g1.error && g1.data.version === maxBefore + 1 && g1.data.generated_by === 'RLS Lead', errInfo(g1));
    const g2 = await admin.client.rpc('generate_report_version', { p_case_id: A, p_note: 'Admin run', p_snapshot: { bank: BANK_A } });
    check('T3.5', `admin: generate_report_version succeeds -> v${maxBefore + 2}`, !g2.error && g2.data.version === maxBefore + 2, errInfo(g2));
    const repAudit = must(await svc.from('audit_log').select('detail,who').eq('case_id', A).eq('action', 'report.generated').eq('detail', `v${maxBefore + 2}`), 'rv audit');
    check('T3.5', 'report.generated audit row written with detail vN', repAudit.length === 1 && repAudit[0].who === 'RLS Admin', JSON.stringify(repAudit));

    // ---------------------------------------------------------------- forged audit identity
    const forged = await analyst.client.from('audit_log')
      .insert({ case_id: A, action: 'test.forge', detail: 'forge attempt', who: 'Mallory', role: 'admin', at: '2000-01-01T00:00:00Z', user_id: lead.id })
      .select().single();
    const fresh = forged.data && Math.abs(Date.parse(forged.data.at) - Date.now()) < 5 * 60e3;
    check('AUD', 'analyst audit insert: forged who/role/at/user_id overwritten by trigger',
      !forged.error && forged.data.who === 'RLS Analyst' && forged.data.role === 'analyst' && forged.data.user_id === analyst.id && fresh, errInfo(forged));
    r = await repA.client.from('audit_log').insert({ case_id: A, action: 'test.rep' });
    check('AUD', 'rep A: direct audit_log insert fails', !!r.error, errInfo(r));

    // ---------------------------------------------------------------- T3.6 immutability
    const actors = { analyst: analyst.client, lead: lead.client, admin: admin.client, 'service role': svc };
    for (const [who, c] of Object.entries(actors)) {
      for (const t of ['audit_log', 'report_versions']) {
        const up = await c.from(t).update(t === 'audit_log' ? { detail: 'tampered' } : { note: 'tampered' }).eq('case_id', A).select();
        check('T3.6', `${who}: update ${t} fails`, blocked(up), errInfo(up));
        const del = await c.from(t).delete().eq('case_id', A).select();
        check('T3.6', `${who}: delete ${t} fails`, blocked(del), errInfo(del));
      }
    }
    const tampered = must(await svc.from('audit_log').select('id').eq('case_id', A).eq('detail', 'tampered'), 'tamper check');
    const rvCount = must(await svc.from('report_versions').select('id').eq('case_id', A), 'rv count');
    check('T3.6', 'no audit row changed and report versions still present', tampered.length === 0 && rvCount.length >= 2, `tampered=${tampered.length} rv=${rvCount.length}`);

    // ---------------------------------------------------------------- T3.7 locked / disabled reps
    for (const [label, u] of [['locked rep', repLocked], ['disabled rep', repDisabled]]) {
      for (const t of ['pfi_requests', 'pfi_rounds', 'pfi_files', 'pfi_messages']) {
        const q = await u.client.from(t).select('id');
        check('T3.7', `${label}: ${t} -> 0 rows`, !q.error && q.data.length === 0, errInfo(q));
      }
      const mi = await u.client.rpc('my_institution');
      check('T3.7', `${label}: my_institution() -> 0 rows`, !mi.error && mi.data.length === 0, errInfo(mi));
      let x = await u.client.rpc('pfi_record_upload', { p_request_id: reqA1.id, p_files: [{ name: 'x.pdf' }] });
      check('T3.7', `${label}: pfi_record_upload fails (42501)`, errCode(x, '42501'), errInfo(x));
      x = await u.client.rpc('pfi_post', { p_request_id: reqA1.id, p_kind: 'reply', p_text: 'x' });
      check('T3.7', `${label}: pfi_post reply fails (42501)`, errCode(x, '42501'), errInfo(x));
      x = await u.client.rpc('pfi_remove_file', { p_file_id: fileIdA });
      check('T3.7', `${label}: pfi_remove_file fails (42501)`, errCode(x, '42501'), errInfo(x));
    }
  } finally {
    // ---------------------------------------------------------------- cleanup
    for (const u of Object.values(users)) await svc.auth.admin.deleteUser(u.id);
    await resetCaseChildren([A, B]);
    must(await svc.from('cases').update({ covenants: '' }).in('id', [A, B]), 'reset covenants');
    const left = must(await svc.from('profiles').select('id').like('username', `${PREFIX}%`), 'left users');
    console.log(`cleanup: test users removed (${left.length} left); fixture cases ${A}, ${B} kept (immutable audit/report rows reference them)`);
  }
}

main()
  .catch((e) => { failures++; console.error('ERROR', e.message); })
  .finally(() => {
    console.log(`\n${passes} passed, ${failures} failed`);
    process.exit(failures ? 1 : 0);
  });
