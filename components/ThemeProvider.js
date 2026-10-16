'use client';

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

// Light/dark, as the prototype: first visit follows the OS; the user's choice sets
// html[data-dd-theme]. The prototype kept the choice in localStorage; from M4 it is saved
// on the user's profile (decision P4). Until then it lives for the session only.
// The DOM attribute is the single source of truth, read through useSyncExternalStore.
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const QUERY = '(prefers-color-scheme: dark)';

function subscribe(onChange) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-dd-theme'] });
  return () => {
    mq.removeEventListener('change', onChange);
    mo.disconnect();
  };
}

function getSnapshot() {
  return document.documentElement.getAttribute('data-dd-theme') || (window.matchMedia(QUERY).matches ? 'dark' : 'light');
}

const getServerSnapshot = () => 'light';

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    document.documentElement.setAttribute('data-dd-theme', getSnapshot() === 'dark' ? 'light' : 'dark');
  }, []);

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

export const useTheme = () => useContext(ThemeContext);
