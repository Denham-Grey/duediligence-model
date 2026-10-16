// M2 · T2.6 — the scoring and outcome rules of Application Guide §7.1, one test per rule.
import { describe, expect, it } from 'vitest';
import * as m from '../../lib/template/dd-portal-data.js';
import { Component } from '../../components/portal/PortalApp.js';

const app = Object.assign(new Component({}), { mod: m });
const scored = m.SECTIONS.filter((s) => !s.narrative).map((s) => s.code); // S3–S16

function caseWith(rating, patch = {}) {
  const c = m.buildCase({ bank: 'Scoring Test Bank' });
  c.sections.forEach((s) => { if (scored.includes(s.code)) s.rating = rating; });
  Object.entries(patch).forEach(([code, fn]) => fn(c.sections.find((s) => s.code === code)));
  return app.scoring(c);
}

describe('scoring rules (§7.1)', () => {
  it('the scored sections are S3–S16, and S16 carries no weight', () => {
    expect(scored).toEqual(Array.from({ length: 14 }, (_, i) => `S${i + 3}`));
    expect(m.SECTIONS.find((s) => s.code === 'S16').weight).toBe(0);
  });

  it('1. any section rated 5 → Decline (rated 5)', () => {
    expect(caseWith(2, { S5: (s) => { s.rating = 5; } }).outcome).toBe('Decline — a section was rated 5 (unacceptable)');
  });

  it('2. a red flag in S8 (AML/CFT) or S15 (Integrity) → Decline', () => {
    const flag = (s) => { s.questions[0].redFlag = true; };
    expect(caseWith(2, { S8: flag }).outcome).toBe('Decline — red flag in AML/CFT or Integrity');
    expect(caseWith(2, { S15: flag }).outcome).toBe('Decline — red flag in AML/CFT or Integrity');
    // A red flag elsewhere does not decline on its own.
    expect(caseWith(1, { S6: flag }).outcome).toBe('Approve');
  });

  it('3. any scored section unrated → Pending, including S16 despite its zero weight', () => {
    expect(caseWith(2, { S4: (s) => { s.rating = null; } }).outcome).toBe('Pending — not all sections rated');
    const s16 = caseWith(2, { S16: (s) => { s.rating = null; } });
    expect(s16.outcome).toBe('Pending — not all sections rated');
    expect(s16.allRated).toBe(false);
  });

  it('4–6. weighted score thresholds: ≤2 Approve, ≤3 Approve with conditions, ≤4 Defer', () => {
    expect(caseWith(1).total).toBeCloseTo(1, 10);
    expect(caseWith(1).outcome).toBe('Approve');
    // Prototype defect kept for parity (Application Guide D18): the weights sum to
    // 1.0000000000000002, so all-2 scores 2.0000000000000004 — over the ≤ 2 line — and the
    // outcome is "Approve with conditions", although the displayed score is 2.00.
    expect(caseWith(2).total.toFixed(2)).toBe('2.00');
    expect(caseWith(2).total).toBeGreaterThan(2);
    expect(caseWith(2).outcome).toBe('Approve with conditions');
    expect(caseWith(3).outcome).toBe('Approve with conditions');
    // Defer band, away from the boundary: S6 at 3, the rest at 4 → 3.80.
    expect(caseWith(4, { S6: (s) => { s.rating = 3; } }).total).toBeCloseTo(3.8, 10);
    expect(caseWith(4, { S6: (s) => { s.rating = 3; } }).outcome).toBe('Defer — strengthen before approval');
    // S6 (weight 20%) at 3 with the rest at 2 → 2.20, just over the Approve line.
    expect(caseWith(2, { S6: (s) => { s.rating = 3; } }).total).toBeCloseTo(2.2, 10);
    expect(caseWith(2, { S6: (s) => { s.rating = 3; } }).outcome).toBe('Approve with conditions');
  });

  it('7. above 4 → Decline — reached only through the rounding defect (D18)', () => {
    // Without a 5 (rule 1) the total cannot exceed 4 in exact arithmetic, but all-4 scores
    // 4.0000000000000009 and so declines, although the rule says Defer at exactly 4.00.
    expect(caseWith(4).total.toFixed(2)).toBe('4.00');
    expect(caseWith(4).outcome).toBe('Decline');
  });

  it('red-flag and document totals add up across sections', () => {
    const r = caseWith(2, { S6: (s) => { s.questions[0].redFlag = true; s.questions[1].redFlag = true; s.attachments.push({}); } });
    expect(r.flagsTotal).toBe(2);
    expect(r.attsTotal).toBe(1);
  });
});
