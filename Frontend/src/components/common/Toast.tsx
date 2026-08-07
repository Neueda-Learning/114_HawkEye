import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'email';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  recipient?: string;
}

// Simple event bus for toasts
type Listener = (toast: ToastMessage) => void;
const listeners: Listener[] = [];

export const toast = {
  show: (msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    listeners.forEach((l) => l({ ...msg, id }));
  },
  success: (title: string, description?: string) =>
    toast.show({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    toast.show({ type: 'error', title, description }),
  info: (title: string, description?: string) =>
    toast.show({ type: 'info', title, description }),
  warning: (title: string, description?: string) =>
    toast.show({ type: 'warning', title, description }),
  email: (title: string, description?: string, recipient?: string) =>
    toast.show({ type: 'email', title, description, recipient }),
};

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
  email:   Mail,
};

const COLORS = {
  success: 'border-green-200 bg-white dark:border-green-800 dark:bg-gray-900',
  error:   'border-red-200 bg-white dark:border-red-800 dark:bg-gray-900',
  info:    'border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-900',
  warning: 'border-yellow-200 bg-white dark:border-yellow-800 dark:bg-gray-900',
  email:   'border-indigo-200 bg-gradient-to-r from-indigo-50/95 to-purple-50/95 dark:border-indigo-800 dark:bg-gray-900 shadow-indigo-500/10',
};

const ICON_COLORS = {
  success: 'text-green-500',
  error:   'text-red-500',
  info:    'text-blue-500',
  warning: 'text-yellow-500',
  email:   'text-indigo-600 dark:text-indigo-400',
};

function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const Icon = ICONS[t.type];

  useEffect(() => {
    // Keep email notification toasts visible slightly longer for maximum clarity (5.5s)
    const displayDuration = t.type === 'email' ? 5500 : 4000;
    const timer = setTimeout(onDismiss, displayDuration);
    return () => clearTimeout(timer);
  }, [onDismiss, t.type]);

  return (
    <div
      className={cn(
        'flex w-96 items-start gap-3 rounded-2xl border p-4 shadow-xl animate-fade-in font-sans',
        COLORS[t.type],
      )}
      role="alert"
    >
      <div className={cn('p-2 rounded-xl shrink-0 mt-0.5', t.type === 'email' ? 'bg-indigo-100 text-indigo-700' : '')}>
        <Icon className={cn('h-5 w-5', ICON_COLORS[t.type])} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{t.title}</p>
          {t.type === 'email' && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-extrabold text-white uppercase tracking-wider">
              Email Sent
            </span>
          )}
        </div>
        {t.description && (
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug">{t.description}</p>
        )}
        {t.recipient && (
          <p className="mt-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md inline-block">
            ✉️ To: {t.recipient}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((t: ToastMessage) => {
    setToasts((prev) => [...prev, t]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      const idx = listeners.indexOf(addToast);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [addToast]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2.5" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
