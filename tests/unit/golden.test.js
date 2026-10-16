// M2 · T2.1 / T2.2 (and more) — golden parity between the prototype's logic class, evaluated
// straight from reference/prototype/DD Portal.dc.html, and the ported PortalApp class.
// Same inputs must give identical: migrated case data, partner-document seeds, scoring,
// the view-model behind every screen (renderVals), and the board report HTML (print + Word).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as m from '../../lib/template/dd-portal-data.js';
import * as renderer from '../../lib/report/dd-report-render.js';
import { Component as NewComponent } from '../../components/portal/PortalApp.js';

// The prototype's class, evaluated with a minimal stand-in for the dc runtime's DCLogic.
const html = readFileSync(join(__dirname, '../../reference/prototype/DD Portal.dc.html'), 'utf8');
const open = html.indexOf('>', html.indexOf('<script type="text/x-dc"')) + 1;
const src = html.slice(open, html.indexOf('</script>', open));
class StubLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(u, cb) { Object.assign(this.state, typeof u === 'function' ? u(this.state) : u); if (cb) cb(); }
}
const OldComponent = new Function('DCLogic', 'React', `${src}\nreturn Component;`)(StubLogic, {});

const PROPS = { orgName: 'Denham + Grey', reportingYear: 2026, showGuidance: true, enforceJustification: true };
const REP = { id: 2, name: 'Rep Tester', username: 'rep', password: 'x', role: 'rep', active: true, institutionId: 3, failed: 0, locked: false, mustChange: false };

// componentDidMount's load pipeline, run with the given class's statics.
function load(C) {
  const cases = m.demoCases();
  cases.forEach((c) => {
    if (!c.report) c.report = m.blankReport();
    C.migrateCodes(c, m.SECTIONS);
    C.migrateSections(c, m.SECTIONS);
    C.refreshAnnex(c, m);
    if (c.id === 3 && m.fillMeridian) m.fillMeridian(c, m.SECTIONS);
  });
  return cases;
}

function instance(C) {
  const inst = new C(PROPS);
  inst.mod = m;
  inst.renderer = renderer;
  // No-op re-render: renderVals' handlers are not invoked here.
  inst.setState = (u) => Object.assign(inst.state, typeof u === 'function' ? u(inst.state) : u);
  inst.state = { ...inst.state, data: { cases: load(C), users: m.USERS.map((u) => ({ ...u })).concat([{ ...REP }]) } };
  return inst;
}

const json = (x) => JSON.stringify(x);
const scoreView = (sc) => ({ ...sc, rows: sc.rows.map((r) => ({ code: r.s.code, comp: r.comp, nflags: r.nflags, atts: r.atts, weighted: r.weighted })) });

// Screens to compare, as state patches.
const ADMIN = { name: 'Administrator', role: 'admin', username: 'admin', institutionId: null };
const SCREENS = [
  { screen: 'login', me: null },
  { screen: 'dashboard', me: ADMIN },
  ...[3, 2, 1].map((caseId) => ({ screen: 'case', caseId, me: ADMIN })),
  ...m.SECTIONS.map((s) => ({ screen: 'section', caseId: 3, code: s.code, me: ADMIN })),
  { screen: 'scoring', caseId: 3, me: ADMIN },
  ...m.BUILDER_SPEC.map((p) => ({ screen: 'report', caseId: 3, rpPart: p.id, me: ADMIN })),
  { screen: 'audit', caseId: 3, me: ADMIN },
  { screen: 'pfiReview', caseId: 3, me: ADMIN },
  { screen: 'users', me: ADMIN },
  { screen: 'pfi', caseId: 3, me: { name: REP.name, role: 'rep', username: 'rep', institutionId: 3 } },
];

describe('golden parity with the prototype logic', () => {
  it('migrates the demo cases identically', () => {
    expect(json(load(NewComponent))).toBe(json(load(OldComponent)));
  });

  it('scores every demo case identically (T2.1)', () => {
    const a = instance(OldComponent);
    const b = instance(NewComponent);
    a.state.data.cases.forEach((c, i) => {
      expect(json(scoreView(b.scoring(b.state.data.cases[i])))).toBe(json(scoreView(a.scoring(c))));
    });
    // The values the prototype shows today (dashboard): Meridian 2.35, Atlas 3.00, Sahel pending.
    const out = Object.fromEntries(b.state.data.cases.map((c) => [c.bank, b.scoring(c)]));
    expect(out['Meridian Trust Bank Plc'].total.toFixed(2)).toBe('2.35');
    expect(out['Atlas Union Bank Ltd'].total.toFixed(2)).toBe('3.00');
    expect(out['Sahel Commercial Bank SA'].outcome).toBe('Pending — not all sections rated');
  });

  it('builds the same view-model for every screen', () => {
    const a = instance(OldComponent);
    const b = instance(NewComponent);
    for (const patch of SCREENS) {
      Object.assign(a.state, patch);
      Object.assign(b.state, patch);
      expect(json(b.renderVals()), `screen ${json(patch)}`).toBe(json(a.renderVals()));
    }
    // renderVals mutates as it goes (partner seeds, report records); the data must still agree.
    expect(json(b.state.data)).toBe(json(a.state.data));
  });

  it('renders byte-identical board reports, print and Word (T2.2)', () => {
    const a = instance(OldComponent);
    const b = instance(NewComponent);
    const ca = a.state.data.cases.find((c) => c.id === 3);
    const cb = b.state.data.cases.find((c) => c.id === 3);
    expect(cb.reports.length).toBeGreaterThan(0);
    // The two stored versions, plus a freshly generated snapshot (the "Generate report" path).
    const snap = (c) => ({ version: 3, by: 'Administrator', at: '16 Oct 2026 09:00 UTC', note: 'golden', snap: JSON.parse(JSON.stringify({ ...c, reports: [], audit: [] })) });
    const recs = [...ca.reports.map((r, i) => [r, cb.reports[i]]), [snap(ca), snap(cb)]];
    for (const [ra, rb] of recs) {
      for (const mode of ['print', 'word']) {
        const ha = a.buildReportHtml(ca, ra, mode);
        const hb = b.buildReportHtml(cb, rb, mode);
        expect(ha.length).toBeGreaterThan(10000);
        expect(hb).toBe(ha);
      }
    }
  });
});
