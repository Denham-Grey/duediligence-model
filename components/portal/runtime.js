// Helpers used by the generated screens; each mirrors the dc runtime (support.js) exactly.
import { isValidElement } from 'react';

// {{ x }} in text: undefined/null/boolean render nothing; elements pass through; otherwise
// span.sc-interp around String(x) (walkText).
export function I({ v }) {
  if (v === undefined || v === null || typeof v === 'boolean') return null;
  if (isValidElement(v) || Array.isArray(v)) return v;
  return <span className="sc-interp">{String(v)}</span>;
}

// <sc-for list>: anything that is not an array renders nothing (walkFor).
export const arr = (x) => (Array.isArray(x) ? x : []);

// Mixed attribute "a {{ x }}": null/undefined become '' (compileAttr).
export const S = (x) => (x ?? '');

// value/checked: undefined becomes '' / false (walkElement). null is treated the same to keep
// React from warning about a null value; it renders identically.
export const val = (x) => (x ?? '');
export const chk = (x) => (x === undefined || x === null ? false : x);

// Dynamic style="…" string → React style object (cssToObj).
export function css(text) {
  const o = {};
  for (const decl of text.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decl.slice(i + 1).trim();
  }
  return o;
}
