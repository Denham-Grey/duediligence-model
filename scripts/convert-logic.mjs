// One-off converter: the prototype's logic class (the <script type="text/x-dc"> in DD Portal.dc.html)
// → components/portal/PortalApp.js. The class body is kept verbatim; only the patches below are
// applied, each of which must match exactly the expected number of times or the script stops.
// Usage: node scripts/convert-logic.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'reference/prototype/DD Portal.dc.html'), 'utf8');
const open = html.indexOf('>', html.indexOf('<script type="text/x-dc"')) + 1;
let js = html.slice(open, html.indexOf('</script>', open)).trim() + '\n';

function patch(label, from, to, times = 1) {
  const n = typeof from === 'string' ? js.split(from).length - 1 : (js.match(new RegExp(from.source, from.flags + (from.flags.includes('g') ? '' : 'g'))) || []).length;
  if (n !== times) throw new Error(`Patch "${label}": expected ${times} match(es), found ${n}`);
  js = typeof from === 'string' ? js.split(from).join(to) : js.replace(new RegExp(from.source, from.flags.includes('g') ? from.flags : from.flags + 'g'), to);
}

// 1. A React class component instead of the dc runtime's DCLogic.
patch('class', 'class Component extends DCLogic {', 'export class Component extends React.Component {');

// 2. Theme: no localStorage. The choice lives on the <html> attribute (saved on the profile from M4).
patch('applyTheme storage', "      window.localStorage.setItem('ddPortalTheme', theme);\n", '');
patch('theme read',
  "  componentDidMount() {\n    try {\n      const saved = window.localStorage.getItem('ddPortalTheme');",
  "  componentDidMount() {\n    this.setState({ booted: true });\n    try {\n      const saved = document.documentElement.getAttribute('data-dd-theme');");

// 3. Template and report modules are bundled, not fetched with import().
patch('renderer import', "    import('./dd-report-render.js').then((r) => { this.renderer = r; }).catch(() => {});", '    this.renderer = reportRenderer;');
patch('data import', "    import('./dd-portal-data.js').then((m) => {", '    Promise.resolve(portalData).then((m) => {');

// 4. Store: the in-memory adapter instead of localStorage (Supabase from M5).
patch('store read', '        const raw = window.localStorage.getItem(Component.STORE_KEY);', '        const raw = portalStore.read();', 2);
patch('store write', '        window.localStorage.setItem(Component.STORE_KEY, JSON.stringify({', '        portalStore.write(JSON.stringify({');
patch('store clear', '    try { window.localStorage.removeItem(Component.STORE_KEY); } catch (e) {}', '    try { portalStore.clear(); } catch (e) {}');

// 5. startScreen skipped sign-in as Administrator (Application Guide D13): removed.
patch('startScreen', '      const start = this.props.startScreen;', '      const start = null; // startScreen removed (Application Guide D13)');

// 6. After loading, the address bar decides the screen (URL routes replace the saved session screen).
patch('after load',
  "    }).catch(() => this.setState({ loginErr: 'Could not load the assessment template.' }));",
  "      this.setState({}, () => this.afterLoad());\n    }).catch(() => this.setState({ loginErr: 'Could not load the assessment template.' }));");
patch('url sync', '  componentDidUpdate(prev) {', '  componentDidUpdate(prev, prevState) {');
patch('url sync call', '    this.persist();\n  }\n\n  componentWillUnmount()', '    this.persist();\n    this.syncUrl(prev, prevState);\n  }\n\n  componentWillUnmount()');

// 7. Partner files: in memory instead of IndexedDB (Supabase Storage from M6).
patch('file store',
  /  \/\/ File content lives in this browser's IndexedDB;[\s\S]*?(?=  pfiUpload\(c, req, list\) \{)/,
  "  // File content is held in memory until M6 moves it to Supabase Storage (no IndexedDB).\n"
  + '  static putFile(id, blob) { return portalStore.putFile(id, blob); }\n\n'
  + '  static getFile(id) { return portalStore.getFile(id); }\n\n');
patch('file delete',
  "      Component.idb().then((db) => { db.transaction('files', 'readwrite').objectStore('files').delete(f.id); }).catch(() => {});",
  '      portalStore.deleteFile(f.id);');

// 8. render() and URL routing, added before signIn().
patch('routing methods', '  signIn() {', `  render() {
    if (!this.state.booted) return null;
    return <PortalView v={this.renderVals()} />;
  }

  // ————— URL routes (Next.js) —————
  // The prototype kept the screen in state and restored it from browser storage. Here every screen
  // has an address; nav() still changes state, and the address follows (syncUrl).
  static urlFor(s) {
    const c = s.caseId;
    switch (s.screen) {
      case 'login': return '/login';
      case 'changepw': return '/change-passcode';
      case 'dashboard': return '/cases';
      case 'users': return '/users';
      case 'pfi': return '/portal';
      case 'case': return \`/cases/\${c}\`;
      case 'section': return \`/cases/\${c}/sections/\${s.code}\`;
      case 'scoring': return \`/cases/\${c}/scoring\`;
      case 'report': return \`/cases/\${c}/report\`;
      case 'audit': return \`/cases/\${c}/audit\`;
      case 'pfiReview': return \`/cases/\${c}/partner-documents\`;
      default: return '/cases';
    }
  }

  static fromUrl(path) {
    const p = String(path || '').replace(/\\/+$/, '') || '/';
    if (p === '/login') return { screen: 'login' };
    if (p === '/change-passcode') return { screen: 'changepw' };
    if (p === '/cases' || p === '/') return { screen: 'dashboard' };
    if (p === '/users') return { screen: 'users' };
    if (p === '/portal') return { screen: 'pfi' };
    const m = p.match(/^\\/cases\\/(\\d+)(?:\\/sections\\/(S\\d{1,2})|\\/(scoring|report|audit|partner-documents))?$/);
    if (!m) return null;
    const caseId = Number(m[1]);
    if (m[2]) return { screen: 'section', caseId, code: m[2] };
    const screens = { scoring: 'scoring', report: 'report', audit: 'audit', 'partner-documents': 'pfiReview' };
    return { screen: m[3] ? screens[m[3]] : 'case', caseId };
  }

  goUrl(url, replace) {
    if (url === this.props.pathname || !this.props.router) return;
    this.props.router[replace ? 'replace' : 'push'](url, { scroll: false });
  }

  // A screen named by the address, if the signed-in user may open it; otherwise null.
  wantedFromUrl() {
    const want = Component.fromUrl(this.props.pathname);
    if (!want || want.screen === 'login' || want.screen === 'changepw') return null;
    if (want.caseId != null && !this.cases().some((c) => c.id === want.caseId)) return null;
    if (want.screen === 'section' && !(this.mod && this.mod.SECTIONS.some((t) => t.code === want.code))) return null;
    return want;
  }

  afterLoad() {
    const s = this.state;
    if (!s.me) {
      if (s.screen !== 'changepw') this.goUrl('/login', true);
      return;
    }
    // A representative's address is always their portal (nav() would keep them there anyway,
    // but without a state change the address would not follow).
    const want = s.me.role === 'rep' ? null : this.wantedFromUrl();
    if (want) this.nav(want);
    else this.goUrl(Component.urlFor(s), true);
  }

  syncUrl(prev, prevState) {
    const s = this.state;
    if (!s.data || !prevState) return;
    const url = Component.urlFor(s);
    const moved = prevState.screen !== s.screen || prevState.caseId !== s.caseId || prevState.code !== s.code;
    if (moved) { this.goUrl(url, false); return; }
    if (prev.pathname !== this.props.pathname && this.props.pathname !== url) {
      // Back/forward or a typed address: follow it when allowed, otherwise restore the address.
      if (!s.me) { this.goUrl('/login', true); return; }
      const want = s.me.role === 'rep' ? null : this.wantedFromUrl();
      if (want) this.nav(want);
      else this.goUrl(url, true);
    }
  }

  signIn() {`);

const HEADER = `'use client';

// GENERATED by scripts/convert-logic.mjs from reference/prototype/DD Portal.dc.html: the prototype's
// logic class, verbatim apart from the patches listed in that script (storage, imports, routing,
// render). Edit by hand from here on.
import React from 'react';
import * as portalData from '@/lib/template/dd-portal-data.js';
import * as reportRenderer from '@/lib/report/dd-report-render.js';
import { portalStore } from '@/lib/store';
import { PortalView } from './PortalView';

`;
writeFileSync(join(root, 'components/portal/PortalApp.js'), HEADER + js);
console.log('Wrote components/portal/PortalApp.js —', js.split('\n').length, 'lines');
