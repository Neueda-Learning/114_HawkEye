import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
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
};

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'border-green-200 bg-white dark:border-green-800 dark:bg-gray-900',
  error:   'border-red-200 bg-white dark:border-red-800 dark:bg-gray-900',
  info:    'border-blue-200 bg-white dark:border-blue-800 dark:bg-gray-900',
  warning: 'border-yellow-200 bg-white dark:border-yellow-800 dark:bg-gray-900',
};

const ICON_COLORS = {
  success: 'text-green-500',
  error:   'text-red-500',
  info:    'text-blue-500',
  warning: 'text-yellow-500',
};

function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const Icon = ICONS[t.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg animate-fade-in',
        COLORS[t.type],
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', ICON_COLORS[t.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

