// One-off converter: the prototype's dc template (DD Portal.dc.html, <x-dc> … </x-dc>) → JSX.
// Reproduces the dc runtime's semantics (support.js compile.ts / encode.ts):
//   {{ path }} text      → <I v={…}/> (span.sc-interp; undefined/null/boolean render nothing)
//   attr="{{ x }}"       → attr={x};  mixed "a {{ x }}" → template string (null → '')
//   style="…"            → object (static) or css(`…`) (dynamic)
//   value/checked        → undefined becomes '' / false
//   style-hover="…"      → hover class (!important, see styles/portal.css)
//   <sc-if value>        → truthy test;  <sc-for list as> → map over an array (else nothing)
//   whitespace-only text → kept as " " when it contains a space (dropped inside table/select parts)
// Each top-level screen (<sc-if value="{{ isX }}">) is written to its own component file.
// Usage: node scripts/convert-template.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'htmlparser2';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'reference/prototype/DD Portal.dc.html'), 'utf8');
const start = src.indexOf('<x-dc>') + '<x-dc>'.length;
const end = src.indexOf('</x-dc>');
const doc = parseDocument(src.slice(start, end), {
  lowerCaseTags: false, lowerCaseAttributeNames: false, recognizeSelfClosing: true, decodeEntities: true,
});

const SCREENS = {
  isLogin: 'LoginScreen', isChangePw: 'ChangePasscodeScreen', isDashboard: 'DashboardScreen',
  isCase: 'CaseScreen', isSection: 'SectionScreen', isScoring: 'ScoringScreen',
  isReport: 'ReportBuilderScreen', isAudit: 'AuditScreen', isPfi: 'PartnerPortalScreen',
  isPfiReview: 'PartnerReviewScreen', isUsers: 'UsersScreen',
};
const HOVER = {
  'color:var(--color-accent)': 'hv-color-accent',
  'color:var(--color-accent-700)': 'hv-color-accent-700',
  'border-color:var(--color-text)': 'hv-border-text',
  'background:var(--color-neutral-100)': 'hv-bg-neutral-100',
  'background:var(--color-accent-100)': 'hv-bg-accent-100',
};
const VOID = new Set(['input', 'br', 'img', 'meta', 'hr']);
const TABLEISH = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'select']);
const ATTR_RENAME = { class: 'className', colspan: 'colSpan', for: 'htmlFor' };
const WHOLE = /^\s*\{\{([\s\S]+?)\}\}\s*$/;
const NUMBER = /^-?\d+(\.\d+)?$/;
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// {{ expr }} → JS. Supports what the template uses: literals and dotted paths.
function expr(raw, scope) {
  const e = raw.trim();
  if (e === 'true' || e === 'false' || e === 'null') return e;
  if (e === 'undefined') return 'undefined';
  if (NUMBER.test(e)) return e;
  if (/^(['"]).*\1$/.test(e)) return JSON.stringify(e.slice(1, -1));
  const parts = e.split('.');
  if (!parts.every((p) => IDENT.test(p))) throw new Error(`Unsupported expression: {{ ${e} }}`);
  const [head, ...rest] = parts;
  const base = scope.includes(head) ? head : `v.${head}`;
  return base + rest.map((p) => `?.${p}`).join('');
}

const kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function cssObj(css) {
  const o = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith('--') ? prop : kebabToCamel(prop)] = decl.slice(i + 1).trim();
  }
  return o;
}
const objLiteral = (o) => '{ ' + Object.entries(o).map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ') + ' }';

// "a {{ x }} b" → `a ${S(x)} b`
function templateString(raw, scope) {
  const parts = raw.split(/\{\{([\s\S]+?)\}\}/g);
  return '`' + parts.map((p, i) => (i & 1 ? '${S(' + expr(p, scope) + ')}' : p.replace(/[`\\$]/g, '\\$&'))).join('') + '`';
}

function attrs(node, scope) {
  const out = [];
  const classes = [];
  let classExpr = null;
  for (const [name, value] of Object.entries(node.attribs)) {
    if (name === 'style-hover') {
      const cls = HOVER[value.trim()];
      if (!cls) throw new Error(`No hover class for "${value}"`);
      classes.push(cls);
      continue;
    }
    const key = ATTR_RENAME[name] || name;
    const whole = value.match(WHOLE);
    if (key === 'className') {
      classExpr = value.includes('{{') ? templateString(value, scope) : JSON.stringify(value);
      continue;
    }
    if (key === 'style') {
      out.push(value.includes('{{') ? `style={css(${templateString(value, scope)})}` : `style={${objLiteral(cssObj(value))}}`);
      continue;
    }
    if (key === 'value' || key === 'checked') {
      if (whole) out.push(`${key}={${key === 'value' ? 'val' : 'chk'}(${expr(whole[1], scope)})}`);
      else if (value.includes('{{')) out.push(`${key}={${templateString(value, scope)}}`);
      else out.push(`${key}=${JSON.stringify(value)}`);
      continue;
    }
    if (whole) out.push(`${key}={${expr(whole[1], scope)}}`);
    else if (value.includes('{{')) out.push(`${key}={${templateString(value, scope)}}`);
    else out.push(`${key}=${JSON.stringify(value)}`);
  }
  if (classExpr || classes.length) {
    if (!classes.length) out.unshift(`className=${classExpr.startsWith('`') ? `{${classExpr}}` : classExpr}`);
    else if (!classExpr) out.unshift(`className=${JSON.stringify(classes.join(' '))}`);
    else out.unshift(`className={[${classExpr}, ${JSON.stringify(classes.join(' '))}].filter(Boolean).join(' ')}`);
  }
  return out;
}

const pad = (d) => '  '.repeat(d);
const screenFiles = {};
let loopDepth = 0;

function text(node, scope, parentTag, d) {
  const t = node.data;
  if (!t.includes('{{')) {
    if (!t.trim()) {
      if (!t.includes(' ') || TABLEISH.has(parentTag)) return null;
      return pad(d) + '{" "}';
    }
    return pad(d) + `{${JSON.stringify(t)}}`;
  }
  return t.split(/\{\{([\s\S]+?)\}\}/g)
    .map((p, i) => (i & 1 ? pad(d) + `<I v={${expr(p, scope)}} />` : p ? pad(d) + `{${JSON.stringify(p)}}` : null))
    .filter(Boolean).join('\n');
}

function children(node, scope, parentTag, d) {
  return node.children.map((c) => convert(c, scope, parentTag, d)).filter((x) => x != null).join('\n');
}

function convert(node, scope, parentTag, d) {
  if (node.type === 'text') return text(node, scope, parentTag, d);
  if (node.type !== 'tag') return null;
  const tag = node.name;
  if (tag === 'template' || tag === 'helmet') return null;

  if (tag === 'sc-if') {
    const raw = node.attribs.value.match(WHOLE)[1].trim();
    const cond = expr(raw, scope);
    if (SCREENS[raw] && scope.length === 0) {
      const name = SCREENS[raw];
      screenFiles[name] = children(node, [], parentTag, 3);
      return `${pad(d)}{${cond} ? <${name} v={v} /> : null}`;
    }
    const body = children(node, scope, parentTag, d + 2);
    return `${pad(d)}{${cond} ? (\n${pad(d + 1)}<>\n${body}\n${pad(d + 1)}</>\n${pad(d)}) : null}`;
  }

  if (tag === 'sc-for') {
    const list = expr(node.attribs.list.match(WHOLE)[1], scope);
    const as = node.attribs.as || 'item';
    const idx = `i${++loopDepth}`;
    const body = children(node, [...scope, as], parentTag, d + 2);
    loopDepth--;
    return `${pad(d)}{arr(${list}).map((${as}, ${idx}) => (\n${pad(d + 1)}<Fragment key={${idx}}>\n${body}\n${pad(d + 1)}</Fragment>\n${pad(d)}))}`;
  }

  const a = attrs(node, scope);
  const open = `<${tag}${a.length ? ' ' + a.join(' ') : ''}`;
  if (VOID.has(tag) || (!node.children.length)) return `${pad(d)}${open} />`;
  const body = children(node, scope, tag, d + 1);
  if (!body) return `${pad(d)}${open} />`;
  return `${pad(d)}${open}>\n${body}\n${pad(d)}</${tag}>`;
}

const HEADER = '// GENERATED by scripts/convert-template.mjs from reference/prototype/DD Portal.dc.html.\n'
  + '// The markup is the prototype\'s, converted mechanically. Edit by hand from here on, or regenerate\n'
  + '// before any hand edits are made. `v` is the view-model built by PortalApp.renderVals().\n';

// Import only what a generated body uses, so lint stays clean.
function imports(body, from) {
  const helpers = ['I', 'arr', 'S', 'val', 'chk', 'css'].filter((h) => new RegExp(`(<${h} |\\b${h}\\()`).test(body));
  const lines = [];
  if (/<Fragment\b/.test(body)) lines.push(`import { Fragment } from 'react';`);
  if (helpers.length) lines.push(`import { ${helpers.join(', ')} } from '${from}';`);
  return lines.join('\n');
}

// <x-dc> holds <template> (thumbnail), <helmet> (head assets) and the app's root <div>.
const rootEl = doc.children.find((n) => n.type === 'tag' && n.name === 'div');
const viewBody = convert(rootEl, [], null, 2);
const screenNames = Object.values(SCREENS);
const missing = screenNames.filter((n) => !screenFiles[n]);
if (missing.length) throw new Error('Screens not found: ' + missing.join(', '));

const outDir = join(root, 'components/portal');
mkdirSync(join(outDir, 'screens'), { recursive: true });
writeFileSync(join(outDir, 'PortalView.js'), `${HEADER}${imports(viewBody, './runtime')}
${screenNames.map((n) => `import { ${n} } from './screens/${n}';`).join('\n')}

export function PortalView({ v }) {
  return (
${viewBody}
  );
}
`);
for (const name of screenNames) {
  const body = screenFiles[name];
  writeFileSync(join(outDir, 'screens', `${name}.js`), `${HEADER}${imports(body, '../runtime')}

export function ${name}({ v }) {
  return (
    <>
${body}
    </>
  );
}
`);
}
console.log('Wrote PortalView.js and', screenNames.length, 'screens');
