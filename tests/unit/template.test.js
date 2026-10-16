// M1 · T1.4 — the template modules copied unchanged from the prototype load and hold the expected shape.
import { describe, expect, it } from 'vitest';
import { SECTIONS, USERS, demoCases } from '../../lib/template/dd-portal-data.js';
import { REPORT_SPEC, BUILDER_SPEC, ANNEX_DOCS, ANNEX_GROUPS } from '../../lib/template/dd-report-spec.js';
import { renderReportHtml } from '../../lib/report/dd-report-render.js';

describe('template modules', () => {
  it('has the 21 assessment sections S1–S21 in order', () => {
    expect(SECTIONS).toHaveLength(21);
    expect(SECTIONS.map((s) => s.code)).toEqual(Array.from({ length: 21 }, (_, i) => `S${i + 1}`));
  });

  it('weights sum to 100%', () => {
    expect(SECTIONS.reduce((a, s) => a + s.weight, 0)).toBeCloseTo(1, 10);
  });

  it('has 18 report parts, 3 of them in the builder', () => {
    expect(REPORT_SPEC).toHaveLength(18);
    expect(BUILDER_SPEC.map((p) => p.id)).toEqual(['cover', 'r5', 'r15']);
  });

  it('has the 49-document Annex A checklist in 7 groups', () => {
    expect(ANNEX_DOCS).toHaveLength(49);
    expect(ANNEX_GROUPS).toHaveLength(7);
  });

  it('seeds the demo data: 3 cases and the admin account', () => {
    expect(demoCases().map((c) => c.bank)).toEqual([
      'Meridian Trust Bank Plc', 'Sahel Commercial Bank SA', 'Atlas Union Bank Ltd',
    ]);
    expect(USERS.map((u) => u.username)).toEqual(['admin']);
  });

  it('exports the report renderer', () => {
    expect(typeof renderReportHtml).toBe('function');
  });
});
