// Renders a generated board report as a self-contained document in one of two forms:
//   mode 'print' — browser print layout (A4, running header/footer, page numbers) for PDF
//   mode 'word'  — Word-compatible HTML (.doc) with real Word header/footer and page breaks
// Styles are inline on every element so Word and the browser render the same design.

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (v) => v != null && String(v).trim() !== '';

const C = {
  ink: '#23262a', dark: '#2f3236', mid: '#474A4F', soft: '#5d6166', faint: '#8a8d92',
  rule: '#d6d4ce', tint: '#f6f5f1', tint2: '#ebe9e3', yellow: '#FFD300', ytint: '#fff6cc',
  redTint: '#f9eaea', onDark: '#e4e2dc',
};
const FLAG = { Green: '#2f6b3b', Amber: '#a86a12', Red: '#a4262c' };
const RATING = { 1: 'Strong', 2: 'Satisfactory', 3: 'Acceptable with conditions', 4: 'Weak', 5: 'Unacceptable' };
const FONT = `'Cormorant Garamond', Garamond, 'EB Garamond', 'Times New Roman', serif`;
const TBL = `width="100%" cellspacing="0" cellpadding="0" border="0"`;

const gap = (pt) => `<p style="margin:0;font-size:${pt}pt;line-height:${pt}pt">&nbsp;</p>`;
const para = (t, extra = '') => `<p style="margin:0 0 7pt;font-size:11.5pt;line-height:1.45;color:${C.ink};${extra}">${t}</p>`;
const paras = (s) => String(s || '').trim().split(/\n+/).filter((p) => p.trim()).map((p) => para(esc(p.trim()))).join('');
const chip = (v, label) => (FLAG[v]
  ? `<span style="background:${FLAG[v]};color:#ffffff;font-size:7.5pt;font-weight:700;letter-spacing:.08em;padding:1pt 4pt;white-space:nowrap">&nbsp;${esc(label || v.toUpperCase())}&nbsp;</span>`
  : esc(v || ''));
const nil = (t = '—') => `<span style="color:${C.faint}">${t}</span>`;
const sub = (t) => `<p style="margin:12pt 0 4pt;font-size:8.5pt;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:${C.mid};page-break-after:avoid">${t}</p>`;
const ref = (t) => `<p style="margin:0 0 6pt;font-size:9.5pt;line-height:1.35;color:${C.soft}">${t}</p>`;
const h3 = (t) => `<h3 style="margin:16pt 0 6pt;padding:0 0 3pt;border-bottom:1.25pt solid ${C.yellow};font-family:${FONT};font-size:13pt;font-weight:700;color:${C.dark};page-break-after:avoid">${esc(t)}</h3>`;

const shortTitle = (t) => { const s = String(t || ''); const i = s.indexOf(':'); return i > 0 && i < 90 ? s.slice(0, i) : s; };
const sectionName = (s) => String(s.title || s.label || '').replace(/^\d+\.\s*/, '');

function table(head, rows, opts = {}) {
  const small = !!opts.small;
  const pad = small ? '3.5pt 4pt' : '5pt 6pt';
  const fs = small ? '9pt' : '10.5pt';
  const th = head.map((h) => `<th width="${h.w}%" style="width:${h.w}%;background:${C.mid};padding:${pad};text-align:${h.align || 'left'};vertical-align:bottom;border:none"><span style="color:#ffffff;font-size:${small ? '7.5pt' : '8.5pt'};font-weight:700;letter-spacing:.05em;text-transform:uppercase">${esc(h.label)}</span></th>`).join('');
  const body = rows.map((r, ri) => `<tr>${r.map((cell, i) => {
    const h = head[i] || {};
    const bg = (cell && cell.bg) || (ri % 2 ? C.tint : '#ffffff');
    const inner = cell && typeof cell === 'object' ? cell.html : esc(cell);
    const color = h.idx ? C.soft : C.ink;
    return `<td style="padding:${pad};text-align:${h.align || 'left'};vertical-align:top;background:${bg};border-bottom:.5pt solid ${C.rule};font-size:${fs};line-height:1.32;color:${color}">${inner == null || inner === '' ? nil() : inner}</td>`;
  }).join('')}</tr>`).join('');
  return `<table ${TBL} style="width:100%;border-collapse:collapse;border-bottom:1.25pt solid ${C.mid}"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>${gap(9)}`;
}

function kv(rows) {
  const live = rows.filter(([, v]) => has(v));
  if (!live.length) return '';
  return `<table ${TBL} style="width:100%;border-collapse:collapse;border-top:2pt solid ${C.dark}">${live.map(([k, v]) =>
    `<tr><td width="30%" style="width:30%;background:${C.tint};padding:5pt 8pt;vertical-align:top;border-bottom:.5pt solid ${C.rule}"><span style="font-size:8.5pt;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:${C.soft}">${esc(k)}</span></td><td style="padding:5pt 8pt;vertical-align:top;border-bottom:.5pt solid ${C.rule};font-size:11pt;line-height:1.35;color:${C.ink}">${esc(v)}</td></tr>`).join('')}</table>${gap(9)}`;
}

function list(items) {
  return `<table ${TBL} style="width:100%;border-collapse:collapse">${items.map((x, i) =>
    `<tr><td width="6%" style="width:6%;padding:3pt 4pt 3pt 0;vertical-align:top;font-size:11.5pt;font-weight:700;color:${C.mid}">${i + 1}.</td><td style="padding:3pt 0;vertical-align:top;font-size:11.5pt;line-height:1.4;color:${C.ink}">${esc(x)}</td></tr>`).join('')}</table>${gap(8)}`;
}

function gridBlock(b, rows, per, numMap) {
  if (!Array.isArray(rows)) return '';
  const fixed = !!b.rows;
  const lead = fixed ? (Array.isArray(b.rows[0]) ? b.rows[0].length : 1) : 0;
  const isPeriod = b.cols.some((c) => c.type === 'period');
  const head = b.cols.map((c) => ({
    label: c.type === 'period' ? (per[c.pk] || '') : c.label,
    w: c.w, align: c.type === 'period' || (isPeriod && /min|peer/i.test(c.label)) ? 'right' : 'left', idx: c.type === 'idx',
  }));
  const out = [];
  rows.forEach((row, ri) => {
    const fixedRow = fixed && ri < b.rows.length;
    if (!fixedRow && !(row || []).some((x) => has(x))) return;
    out.push(b.cols.map((c, ci) => {
      if (c.type === 'idx') return String(out.length + 1);
      if (fixedRow && ci < lead) {
        const lbl = Array.isArray(b.rows[ri]) ? b.rows[ri][ci] : b.rows[ri];
        const txt = ci === 0 && lead > 1 && numMap[lbl] ? numMap[lbl] : lbl;
        return { html: `<b style="color:${C.dark}">${esc(txt)}</b>` };
      }
      const v = (row || [])[ci] || '';
      if (c.type === 'flag') return { html: chip(v) };
      return v;
    }));
  });
  return out.length ? table(head, out, { small: isPeriod }) : '';
}

function blockHtml(b, store, per, numMap) {
  const v = store ? store[b.id] : null;
  let inner = '';
  if (b.k === 'text') inner = has(v) ? paras(v) : '';
  else if (b.k === 'fields' || b.k === 'notes') inner = kv(b.items.map(([k, l]) => [l, v && v[k]]));
  else if (b.k === 'list') { const items = (Array.isArray(v) ? v : []).filter(has); if (items.length) inner = list(items); }
  else if (b.k === 'grid') inner = gridBlock(b, v, per, numMap);
  return inner ? h3(b.title) + inner : '';
}

const groupHead = (t) => `${gap(8)}<p style="margin:0 0 4pt;padding:5pt 8pt;background:${C.ytint};font-size:13.5pt;font-weight:700;color:${C.dark};page-break-after:avoid">${esc(t)}</p>`;

function sectionRecord(s) {
  const qs = (s.questions || []).filter((q) => has(q.finding) || q.redFlag);
  const parts = Object.keys(s.findingsParts || {}).map((k) => s.findingsParts[k]).filter((r) => r && has(r.text));
  const atts = s.attachments || [];
  if (!(qs.length || parts.length || atts.length || s.rating || has(s.rationale) || has(s.management))) return '';
  const meta = [
    s.rating ? `Section rating <b style="color:${C.dark}">${s.rating} — ${esc(RATING[s.rating] || '')}</b>` : '',
    has(s.assessor) ? `Assessed by ${esc(s.assessor)}` : '',
    has(s.dateCompleted) ? `Completed ${esc(s.dateCompleted)}` : '',
  ].filter(Boolean).join('&nbsp;&nbsp;·&nbsp;&nbsp;');
  let h = `${gap(12)}<table ${TBL} style="width:100%;border-collapse:collapse"><tr><td style="background:${C.tint2};padding:8pt 10pt;border-top:2pt solid ${C.mid}">
    <p style="margin:0 0 2pt;font-size:8pt;letter-spacing:.16em;font-weight:700;color:${C.soft}">ASSESSMENT RECORD · ${esc(s.code)}</p>
    <p style="margin:0;font-size:14pt;line-height:1.2;font-weight:700;color:${C.dark}">${esc(sectionName(s))}</p>
    ${meta ? `<p style="margin:3pt 0 0;font-size:9.5pt;color:${C.soft}">${meta}</p>` : ''}
  </td></tr></table>${gap(8)}`;
  if (has(s.rationale)) h += para(`<i>${esc(s.rationale)}</i>`);
  if (qs.length) {
    h += table(
      [{ label: '#', w: 5, idx: true }, { label: 'Line of enquiry', w: 24 }, { label: 'Rating', w: 14 }, { label: 'Finding', w: 57 }],
      qs.map((q) => {
        const bg = q.redFlag ? C.redTint : '';
        return [
          { html: String(q.num), bg }, { html: `<b style="color:${C.dark}">${esc(shortTitle(q.text))}</b>`, bg },
          { html: `${q.rating ? `${q.rating} — ${esc(RATING[q.rating] || '')}` : nil('Not rated')}<br><span style="font-size:9pt;color:${C.soft}">${esc(q.status || '')}</span>${q.redFlag ? `<br>${chip('Red', 'RED FLAG')}` : ''}`, bg },
          { html: `${esc(q.finding || '')}${has(q.notes) ? `<br><span style="font-size:9pt;color:${C.soft}">Evidence: ${esc(q.notes)}</span>` : ''}`, bg },
        ];
      }),
    );
  }
  parts.forEach((r) => { h += para(`${r.redFlag ? chip('Red', 'RED FLAG') + ' ' : ''}${esc(r.text)}`); });
  if (has(s.management)) h += sub('Management response') + paras(s.management);
  if (has(s.evidence)) h += ref(`Evidence reference: ${esc(s.evidence)}`);
  if (atts.length) {
    h += sub('Supporting documents') + table(
      [{ label: 'Ref', w: 10 }, { label: 'Document', w: 34 }, { label: 'Relevance', w: 56 }],
      atts.map((a) => [a.ref || '', a.filename || '', a.justification || '']),
    );
  }
  return h;
}

const partHead = (label, title) => `<table ${TBL} style="width:100%;border-collapse:collapse">
  <tr><td style="background:${C.dark};padding:14pt 16pt 12pt">
    <p style="margin:0 0 3pt;font-size:9pt;letter-spacing:.2em;font-weight:700;color:${C.yellow}">${esc(label)}</p>
    <h2 style="margin:0;font-family:${FONT};font-size:20pt;line-height:1.15;font-weight:600;color:#ffffff">${esc(title)}</h2>
  </td></tr>
  <tr><td style="background:${C.yellow};height:4pt;padding:0;font-size:2pt;line-height:2pt">&nbsp;</td></tr>
</table>${gap(10)}`;

const field = (code) => `<!--[if supportFields]><span style='mso-element:field-begin'></span> ${code} <span style='mso-element:field-separator'></span><![endif]-->1<!--[if supportFields]><span style='mso-element:field-end'></span><![endif]-->`;

export function renderReportHtml(opts) {
  const { c, spec, periods, scoring, orgName, version, generatedBy, generatedAt } = opts;
  const word = opts.mode === 'word';
  const per = periods || {};
  const rd = c.report || {};
  const memo = (rd.cover && rd.cover.memo) || {};
  const subject = memo.subject || c.bank || '';
  const date = memo.reportDate || generatedAt || '';
  const decision = c.finalDecision || memo.rec || (scoring && scoring.outcome) || '';
  const pb = word
    ? `<p style="margin:0;font-size:1pt;line-height:1pt;page-break-before:always">&nbsp;</p>`
    : `<div style="break-before:page;page-break-before:always;height:0" class="pb"></div>`;

  // assessment sections attach to the report part that carries them; the rest become parts of their own
  const secByReport = {};
  const standalone = [];
  c.sections.forEach((s) => {
    const key = s.code === 'S9' ? 'r11' : s.report;
    if (key) (secByReport[key] = secByReport[key] || []).push(s);
    else standalone.push(s);
  });
  const after = { S5: 'r3', S10: 'r11', S11: 'r11', S12: 'r11', S15: 'r12' };
  const order = [];
  spec.filter((p) => p.id !== 'cover').forEach((p) => {
    order.push({ kind: 'part', p });
    standalone.filter((s) => after[s.code] === p.id).forEach((s) => order.push({ kind: 'sec', s }));
  });
  standalone.filter((s) => !after[s.code]).forEach((s) => order.splice(order.length - 1, 0, { kind: 'sec', s }));
  let n = 0;
  order.forEach((o) => { o.num = o.kind === 'part' && o.p.id === 'annexA' ? 'Annex A' : String(++n).padStart(2, '0'); });
  const numMap = {};
  order.forEach((o) => { if (o.kind === 'part') numMap[o.p.num] = o.num; });
  const titleOf = (o) => (o.kind === 'part' ? o.p.title.replace(/^Annex A — /, '') : sectionName(o.s));

  const scoringHtml = scoring ? (() => {
    const kpi = (label, value, first) => `<td width="25%" style="width:25%;background:${C.tint2};border-top:3pt solid ${C.yellow};${first ? '' : 'border-left:4pt solid #ffffff;'}padding:9pt 10pt;vertical-align:top">
      <p style="margin:0 0 3pt;font-size:17pt;line-height:1.1;font-weight:600;color:${C.dark}">${esc(value)}</p>
      <p style="margin:0;font-size:8pt;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:${C.soft}">${esc(label)}</p></td>`;
    const rows = scoring.rows.filter((r) => r.s.weight).map((r) => [
      { html: `<b style="color:${C.dark}">${esc(r.s.code)}</b>&nbsp; ${esc(sectionName(r.s))}` },
      `${Math.round(r.s.weight * 100)}%`,
      r.s.rating ? `${r.s.rating} — ${RATING[r.s.rating] || ''}` : '',
      r.weighted ? r.weighted.toFixed(2) : '',
      r.nflags ? { html: chip('Red', String(r.nflags)) } : '',
    ]);
    rows.push([
      { html: `<b style="color:${C.dark}">Weighted score</b>`, bg: C.ytint }, { html: '<b>100%</b>', bg: C.ytint }, { html: '', bg: C.ytint },
      { html: `<b>${scoring.allRated ? scoring.total.toFixed(2) : '—'}</b>`, bg: C.ytint }, { html: `<b>${scoring.flagsTotal || '—'}</b>`, bg: C.ytint },
    ]);
    return `${h3('Weighted assessment score')}
      <table ${TBL} style="width:100%;border-collapse:collapse"><tr>
        ${kpi('Weighted score (1–5)', scoring.allRated ? scoring.total.toFixed(2) : '—', true)}
        ${kpi(c.finalDecision ? 'Recommendation' : 'Indicative outcome', decision)}
        ${kpi('Red flags raised', String(scoring.flagsTotal))}
        ${kpi('Assessment complete', `${Math.round(scoring.completion * 100)}%`)}
      </tr></table>${gap(10)}
      ${table([{ label: 'Section', w: 46 }, { label: 'Weight', w: 10, align: 'right' }, { label: 'Rating', w: 24 }, { label: 'Weighted', w: 10, align: 'right' }, { label: 'Flags', w: 10, align: 'right' }], rows)}`;
  })() : '';

  const bodyParts = order.map((o) => {
    let inner = '';
    if (o.kind === 'part') {
      const p = o.p;
      const store = rd[p.id] || {};
      if (p.id === 'r7') {
        const extras = Array.isArray(store.extraRatings) ? store.extraRatings : [];
        const grp = (bl, s, head) => { const x = bl.map((b) => blockHtml(b, s, per, numMap)).join(''); return x ? groupHead(head) + x : ''; };
        const intB = p.blocks.filter((b) => b.grp === 'internal'), extB = p.blocks.filter((b) => b.grp !== 'internal');
        inner = grp(intB, store, 'Internal rating') + grp(extB, store, extras.length ? 'External rating 1' : 'External rating')
          + extras.map((ex, i) => grp(extB, ex, `External rating ${i + 2}`)).join('');
      } else {
        if (p.id === 'r16' && has(c.covenants)) inner += h3('Conditions and covenants agreed') + list(String(c.covenants).split('\n').filter(has));
        inner += p.blocks.map((b) => blockHtml(b, store, per, numMap)).join('');
      }
      if (p.id === 'r1') inner += scoringHtml;
      inner += (secByReport[p.id] || []).map(sectionRecord).join('');
    } else inner = sectionRecord(o.s);
    const label = o.num === 'Annex A' ? 'ANNEX A' : `PART ${o.num}`;
    return `${pb}${partHead(label, titleOf(o))}${inner || para(nil('No content was captured for this part.'))}`;
  }).join('');

  const memoRows = [
    ['To', memo.to], ['From', memo.from], ['Through', memo.thru], ['Copy', memo.cc],
    ['Subject', subject], ['Date', date], ['Programme', memo.programme],
    ['Due diligence team', memo.team], ['Due diligence period', memo.period], ['Facility proposed', memo.facility],
  ];

  const cover = `
    <table ${TBL} style="width:100%;border-collapse:collapse">
      <tr><td style="background:${C.dark};padding:16pt 20pt">
        <table ${TBL} style="width:100%;border-collapse:collapse"><tr>
          <td style="vertical-align:middle"><p style="margin:0;font-size:10pt;letter-spacing:.2em;font-weight:700;color:#ffffff">${esc(String(orgName || '').toUpperCase())}</p></td>
          <td style="vertical-align:middle;text-align:right"><p style="margin:0;font-size:9pt;letter-spacing:.2em;font-weight:700;color:${C.yellow}">CONFIDENTIAL</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="background:${C.yellow};height:6pt;padding:0;font-size:3pt;line-height:3pt">&nbsp;</td></tr>
    </table>
    ${gap(54)}
    <p style="margin:0 0 6pt;font-size:10pt;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:${C.mid}">Board paper · Credit &amp; Investment Committee</p>
    <h1 style="margin:0 0 6pt;font-family:${FONT};font-size:34pt;line-height:1.05;font-weight:600;color:${C.dark}">Bank Due Diligence Report</h1>
    <p style="margin:0 0 6pt;font-size:22pt;line-height:1.15;font-weight:500;color:${C.mid}">${esc(subject)}</p>
    <p style="margin:0 0 18pt;font-size:10.5pt;color:${C.soft}">${esc([c.category, c.country].filter(Boolean).join(' · '))}${c.category || c.country ? '&nbsp;&nbsp;·&nbsp;&nbsp;' : ''}Version ${esc(version)}&nbsp;&nbsp;·&nbsp;&nbsp;${esc(date)}</p>
    ${kv(memoRows)}
    ${decision ? `${gap(10)}<table ${TBL} style="width:100%;border-collapse:collapse"><tr><td style="background:${C.dark};padding:14pt 16pt 10pt;border-bottom:4pt solid ${C.yellow}">
      <p style="margin:0 0 3pt;font-size:9pt;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:${C.yellow}">Decision sought</p>
      <p style="margin:0 0 6pt;font-size:20pt;line-height:1.15;font-weight:600;color:#ffffff">${esc(decision)}</p>
      ${has(memo.facility) ? `<p style="margin:0 0 4pt;font-size:11.5pt;line-height:1.4;color:${C.onDark}">${esc(memo.facility)}${has(c.covenants) ? `, subject to the conditions and covenants set out in Part ${esc(numMap['16'] || '')}.` : '.'}</p>` : ''}
    </td></tr></table>` : ''}
  `;

  const tocRows = order.map((o, i) => {
    const bg = i % 2 ? C.tint : '#ffffff';
    const codes = o.kind === 'sec' ? o.s.code : (secByReport[o.p.id] || []).map((s) => s.code).join(', ');
    return `<tr>
      <td width="12%" style="width:12%;background:${bg};padding:6pt 6pt 6pt 8pt;border-bottom:.5pt solid ${C.rule};font-size:10.5pt;font-weight:700;color:${C.mid}">${esc(o.num)}</td>
      <td style="background:${bg};padding:6pt 6pt;border-bottom:.5pt solid ${C.rule};font-size:12pt;color:${C.ink}">${esc(titleOf(o))}</td>
      <td width="16%" style="width:16%;background:${bg};padding:6pt 8pt 6pt 6pt;border-bottom:.5pt solid ${C.rule};font-size:9.5pt;color:${C.soft};text-align:right">${esc(codes)}</td></tr>`;
  }).join('');
  const contents = `${pb}${partHead('REPORT STRUCTURE', 'Contents')}
    <table ${TBL} style="width:100%;border-collapse:collapse;border-top:2pt solid ${C.dark};border-bottom:1.25pt solid ${C.mid}">${tocRows}</table>
    ${gap(12)}${ref(`Prepared by ${esc(generatedBy)} on ${esc(generatedAt)}. Figures in ₦ millions unless stated; financial years audited, quarters unaudited. Section codes (S1–S21) refer to the assessment record held in the due diligence portal.`)}`;

  const runHead = `${subject} — Due Diligence Report v${version}`;
  const footLeft = `${orgName || ''} · Board paper`;

  const css = word ? `
  @page Section1 { size: 595.3pt 841.9pt; margin: 72pt 58pt 64pt 58pt; mso-header-margin: 30pt; mso-footer-margin: 26pt;
    mso-title-page: yes; mso-header: h1; mso-footer: f1; mso-first-header: fh1; mso-first-footer: ff1; mso-paper-source: 0; }
  div.Section1 { page: Section1; }
  body { font-family: ${FONT}; color: ${C.ink}; }
  p.MsoHeader, p.MsoFooter { margin: 0; font-family: ${FONT}; font-size: 8.5pt; color: ${C.soft}; }
  table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
  ` : `
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  @page { size: A4; margin: 24mm 18mm 22mm;
    @top-left { content: "${runHead.replace(/"/g, '')}"; font: 8.5pt ${FONT}; color: ${C.soft}; }
    @top-right { content: "CONFIDENTIAL"; font: 700 8pt ${FONT}; color: ${C.mid}; letter-spacing: 0.12em; }
    @bottom-left { content: "${footLeft.replace(/"/g, '')}"; font: 8.5pt ${FONT}; color: ${C.soft}; }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8.5pt ${FONT}; color: ${C.soft}; } }
  @page :first { margin-top: 14mm; @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } }
  html { background: #fff; }
  body { margin: 0; font-family: ${FONT}; color: ${C.ink}; font-variant-numeric: lining-nums; }
  td { font-variant-numeric: lining-nums tabular-nums; }
  table { border-collapse: collapse; }
  tr, h3 { break-inside: avoid; page-break-inside: avoid; }
  h2, h3 { break-after: avoid; page-break-after: avoid; }
  .sheet { max-width: 174mm; margin: 0 auto; }
  @media screen { body { background: #e7e5e0; } .sheet { background: #fff; padding: 16mm 18mm 30mm; margin: 12mm auto; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
    .pb { border-top: 1px dashed #cfcdc7; margin: 18mm -18mm 14mm; } }
  @media print { .sheet { max-width: none; padding: 0; margin: 0; box-shadow: none; } }
  .tb { position: sticky; top: 0; z-index: 5; display: flex; gap: 16px; align-items: center; justify-content: space-between; padding: 10px 20px; background: ${C.dark}; color: #fff; font: 14px/1.3 ${FONT}; }
  .tb button { font: 700 13px ${FONT}; letter-spacing: .04em; background: ${C.yellow}; color: ${C.ink}; border: 0; padding: 7px 16px; cursor: pointer; }
  @media print { .tb { display: none; } }
  `;

  const head = word
    ? `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><meta name="ProgId" content="Word.Document"><title>${esc(runHead)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->`
    : `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(opts.fileTitle || runHead)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">`;

  const toolbar = word ? '' : `<div class="tb"><span>${esc(opts.fileTitle || runHead)}</span><button type="button" onclick="window.print()">Save as PDF</button></div>
<script>
  (function () {
    var go = function () { setTimeout(function () { window.print(); }, 300); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener('load', go);
  })();
<\/script>`;

  const hf = word ? `
<table id="hf" border="0" cellspacing="0" cellpadding="0" style="margin-left:900pt;width:1pt"><tr><td>
  <div style="mso-element:header" id="h1"><p class="MsoHeader" style="margin:0;padding-bottom:3pt;border-bottom:solid ${C.yellow} 1.5pt;tab-stops:right 479pt"><span style="color:${C.soft}">${esc(runHead)}</span><span style="mso-tab-count:1"></span><b><span style="color:${C.mid};letter-spacing:.1em">CONFIDENTIAL</span></b></p></div>
  <div style="mso-element:footer" id="f1"><p class="MsoFooter" style="margin:0;padding-top:3pt;border-top:solid ${C.rule} .75pt;tab-stops:right 479pt"><span style="color:${C.soft}">${esc(footLeft)}</span><span style="mso-tab-count:1"></span><span style="color:${C.soft}">Page ${field('PAGE')} of ${field('NUMPAGES')}</span></p></div>
  <div style="mso-element:header" id="fh1"><p class="MsoHeader">&nbsp;</p></div>
  <div style="mso-element:footer" id="ff1"><p class="MsoFooter">&nbsp;</p></div>
</td></tr></table>` : '';

  return `${head}<style>${css}</style></head>
<body>${toolbar}<div class="${word ? 'Section1' : 'sheet'}">
${cover}
${contents}
${bodyParts}
</div>${hf}</body></html>`;
}
