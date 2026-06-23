'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastState {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastState | null>(null);

/** Minimal toast (.toast) — an ink pill with a sage check. Auto-dismisses. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div className="toast" role="status" aria-live="polite">
          <span style={{ color: '#a8c79c' }}>✓</span>
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
