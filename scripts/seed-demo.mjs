// M3 · T3.2 — seed the demonstration data into Supabase (dev / staging only — decision P6).
// Builds the three demo cases exactly as the prototype does on load (demoCases → migrateCodes →
// migrateSections → refreshAnnex → fillMeridian → partner-document seed), using the prototype's
// own class from reference/prototype (proven identical to the port by tests/unit/golden.test.js),
// then splits each case into the M3 tables with the service role.
//
// Usage:  npm run seed:demo
//   Needs .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.
//   Optional SEED_ADMIN_PASSWORD (≥ 6 characters): also creates the "admin" account
//   (Administrator, must change passcode at first sign-in). Without it, no user is created.
// Refuses to run if the database already holds any case.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import * as m from '../lib/template/dd-portal-data.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!URL || !SECRET) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY (use --env-file=.env.local).'); process.exit(2); }
const db = createClient(URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
export const EMAIL_DOMAIN = 'users.dd-portal.invalid';

// The prototype's logic class (statics + pfiOf), evaluated with a stand-in for DCLogic.
const html = readFileSync(join(root, 'reference/prototype/DD Portal.dc.html'), 'utf8');
const open = html.indexOf('>', html.indexOf('<script type="text/x-dc"')) + 1;
class StubLogic { constructor(props) { this.props = props || {}; this.state = {}; } setState() {} }
const Proto = new Function('DCLogic', 'React', `${html.slice(open, html.indexOf('</script>', open))}\nreturn Component;`)(StubLogic, {});

// "04 Aug 2026 08:15 UTC" → ISO timestamp.
function ts(label) {
  const t = Date.parse(String(label || '').replace(' UTC', ' GMT'));
  if (Number.isNaN(t)) throw new Error(`Unparseable date "${label}"`);
  return new Date(t).toISOString();
}
// SEED_DRY_RUN=1: build and split everything, write nothing.
const DRY = process.env.SEED_DRY_RUN === '1';
let fakeId = 0;
async function insert(table, rows, select) {
  if (!rows.length) return [];
  if (DRY) return rows.map((r) => ({ ...r, id: r.id || ++fakeId }));
  const q = db.from(table).insert(rows);
  const { data, error } = select ? await q.select(select) : await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data || [];
}

const { count, error: countErr } = await db.from('cases').select('id', { count: 'exact', head: true });
if (countErr) throw countErr;
if (count && !DRY) { console.error(`Refusing to seed: the database already holds ${count} case(s).`); process.exit(1); }

// 1. Build the cases as the prototype does on load.
const app = new Proto({ orgName: 'Denham + Grey', reportingYear: 2026 });
app.mod = m;
app.state = { data: { cases: m.demoCases(), users: [] }, me: null };
const cases = app.state.data.cases;
cases.forEach((c) => {
  if (!c.report) c.report = m.blankReport();
  Proto.migrateCodes(c, m.SECTIONS);
  Proto.migrateSections(c, m.SECTIONS);
  Proto.refreshAnnex(c, m);
  if (c.id === 3 && m.fillMeridian) m.fillMeridian(c, m.SECTIONS);
  app.pfiOf(c); // the 49 Annex A requests, and Meridian's sample states
});

const totals = { cases: 0, sections: 0, parts: 0, versions: 0, audit: 0, requests: 0, rounds: 0, files: 0, messages: 0 };
for (const c of cases) {
  // 2. Case header and case-level grids. Explicit ids keep the prototype's numbering (1–3).
  await insert('cases', [{
    id: c.id, bank: c.bank, country: c.country || '', category: c.category,
    created_at: ts(c.createdAt), created_by: c.createdBy,
    final_decision: c.finalDecision || '', covenants: c.covenants || '',
    profile: c.profile, ratios: c.ratios, prudential: c.prudential,
    prudential_notes: c.prudentialNotes, eligibility: c.eligibility,
  }]);
  totals.cases++;

  // 3. One row per section and per report part.
  totals.sections += (await insert('case_sections', c.sections.map((s) => ({ case_id: c.id, code: s.code, data: s })), 'code')).length;
  totals.parts += (await insert('case_report_parts', m.REPORT_SPEC.map((p) => ({ case_id: c.id, part_id: p.id, data: c.report[p.id] || {} })), 'part_id')).length;

  // 4. Report versions. The demo versions predate snapshots (the prototype renders them from the
  //    case's current data), so their snapshot is the case as seeded.
  const snapshot = JSON.parse(JSON.stringify({ ...c, reports: [], audit: [], pfi: undefined }));
  totals.versions += (await insert('report_versions', (c.reports || []).map((r) => ({
    case_id: c.id, version: r.version, generated_by: r.by, generated_at: ts(r.at), note: r.note || '',
    snapshot: r.snap || snapshot,
  })), 'id')).length;

  // 5. Audit trail as recorded in the demo (newest first in the prototype; order is by time here).
  totals.audit += (await insert('audit_log', (c.audit || []).slice().reverse().map((e) => ({
    case_id: c.id, at: ts(e.at), who: e.who, role: null, action: e.action, detail: e.detail || '',
  })), 'id')).length;

  // 6. Partner documents: requests → versions (rounds) → files, and the thread.
  for (const [i, r] of c.pfi.requests.entries()) {
    const [req] = await insert('pfi_requests', [{
      case_id: c.id, title: r.title, note: r.note || '', requested_by: r.by, requested_at: ts(r.at),
      status: r.status, sort_order: i + 1,
    }], 'id');
    totals.requests++;
    for (const round of r.rounds) {
      const [rd] = await insert('pfi_rounds', [{ request_id: req.id, case_id: c.id, n: round.n, created_at: ts(round.at), created_by: round.by }], 'id');
      totals.rounds++;
      totals.files += (await insert('pfi_files', round.files.map((f) => ({
        id: randomUUID(), round_id: rd.id, request_id: req.id, case_id: c.id, name: f.name, size: f.size,
        mime: f.type || '', storage_path: null, uploaded_by: f.by, uploaded_at: ts(f.at),
      })), 'id')).length;
    }
    totals.messages += (await insert('pfi_messages', r.thread.map((t) => ({
      request_id: req.id, case_id: c.id, kind: t.kind, role: t.role, who: t.who, at: ts(t.at),
      text: t.text, about: t.about || '', tag: t.tag || '',
    })), 'id')).length;
  }
}

// 7. Optional admin account.
let admin = 'skipped (set SEED_ADMIN_PASSWORD to create it)';
const pw = process.env.SEED_ADMIN_PASSWORD;
if (pw && !DRY) {
  if (pw.length < 6) throw new Error('SEED_ADMIN_PASSWORD must be at least 6 characters (decision P1).');
  const { data, error } = await db.auth.admin.createUser({ email: `admin@${EMAIL_DOMAIN}`, password: pw, email_confirm: true });
  if (error) throw new Error(`admin user: ${error.message}`);
  await insert('profiles', [{ id: data.user.id, username: 'admin', name: 'Administrator', role: 'admin', must_change: true }]);
  admin = 'created (username "admin"; must change the passcode at first sign-in)';
}

console.log('Seeded:', totals);
console.log('Admin account:', admin);
console.log('Next: sync the case id sequence —', "select setval(pg_get_serial_sequence('public.cases', 'id'), (select max(id) from public.cases));");
