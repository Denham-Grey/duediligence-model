'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} title="Switch appearance" className="hv-border-text" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1px solid var(--color-divider)', padding: '3px 9px', cursor: 'pointer', color: 'inherit', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
      <span style={{ width: 9, height: 9, flex: 'none', borderRadius: '50%', background: 'var(--brand-yellow)', boxShadow: 'inset 3px 0 0 0 var(--on-yellow)' }}></span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
