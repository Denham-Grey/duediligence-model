'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// The prototype's flash(): one message, bottom-left, cleared after 2.8 s.
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2800);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext value={flash}>
      {children}
      {toast ? (
        <div style={{ position: 'fixed', left: 40, bottom: 28, background: 'var(--color-text)', color: 'var(--color-bg)', padding: '12px 18px', fontSize: 13, zIndex: 40, boxShadow: 'var(--shadow-md)' }}>{toast}</div>
      ) : null}
    </ToastContext>
  );
}

export const useToast = () => useContext(ToastContext);
