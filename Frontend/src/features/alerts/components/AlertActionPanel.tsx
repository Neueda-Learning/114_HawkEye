import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Search, XCircle, AlertOctagon } from 'lucide-react';
import { acknowledgeAlert, investigateAlert, closeAlert, dismissAlert } from '@/lib/api/alerts';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from '@/components/common/Toast';
import { canTransition, isTerminalStatus } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Alert, AlertStatus } from '@/lib/types';

interface AlertActionPanelProps {
  alert: Alert;
  onUpdated?: () => void;
}

interface ActionConfig {
  label: string;
  toStatus: AlertStatus;
  icon: React.ReactNode;
  colorClass: string;
  requiresNote: boolean;
  mutationFn: (id: number, payload?: { resolutionNotes?: string; performedBy?: string }) => Promise<Alert>;
}

export function AlertActionPanel({ alert, onUpdated }: AlertActionPanelProps) {
  const { user }    = useAuthStore();
  const queryClient = useQueryClient();

  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null);
  const [note, setNote]                   = useState('');

  const mutation = useMutation({
    mutationFn: ({ action, note }: { action: ActionConfig; note: string }) =>
      action.mutationFn(alert.alertId, note ? { resolutionNotes: note, performedBy: user?.email ?? 'admin' } : { performedBy: user?.email ?? 'admin' }),
    onSuccess: (updated) => {
      toast.success(`Alert ${updated.alertStatus.toLowerCase()}`);
      void queryClient.invalidateQueries({ queryKey: ['alert', String(alert.alertId)] });
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setPendingAction(null);
      setNote('');
      onUpdated?.();
    },
    onError: (err) => toast.error('Action failed', err instanceof Error ? err.message : ''),
  });

  const ACTIONS: ActionConfig[] = [
    {
      label: 'Acknowledge',   toStatus: 'ACKNOWLEDGED',  requiresNote: false,
      icon:  <CheckCircle className="h-4 w-4" />,
      colorClass: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
      mutationFn: (id) => acknowledgeAlert(id),
    },
    {
      label: 'Investigate',   toStatus: 'INVESTIGATING', requiresNote: false,
      icon:  <Search className="h-4 w-4" />,
      colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
      mutationFn: (id) => investigateAlert(id),
    },
    {
      label: 'Close',         toStatus: 'CLOSED',        requiresNote: true,
      icon:  <CheckCircle className="h-4 w-4" />,
      colorClass: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300',
      mutationFn: (id, payload) => closeAlert(id, payload ? { performedBy: user?.email ?? 'admin', reason: payload.resolutionNotes } : undefined),
    },
    {
      label: 'Dismiss',       toStatus: 'DISMISSED',     requiresNote: true,
      icon:  <XCircle className="h-4 w-4" />,
      colorClass: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
      mutationFn: (id, payload) => dismissAlert(id, payload ? { performedBy: user?.email ?? 'admin', reason: payload.resolutionNotes } : undefined),
    },
  ];

  const available = ACTIONS.filter((a) => canTransition(alert.alertStatus, a.toStatus));

  if (isTerminalStatus(alert.alertStatus)) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <AlertOctagon className="h-4 w-4" />
          <span>This alert is <strong>{alert.alertStatus}</strong> — no further actions available.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Actions</h3>
          <StatusBadge status={alert.alertStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => {
            const allowed = canTransition(alert.alertStatus, action.toStatus);
            return (
              <button
                key={action.toStatus}
                disabled={!allowed}
                title={!allowed ? `Cannot transition from ${alert.alertStatus} to ${action.toStatus}` : undefined}
                onClick={() => { setPendingAction(action); setNote(''); }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${action.colorClass} disabled:cursor-not-allowed disabled:opacity-30`}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
        {available.length === 0 && (
          <p className="mt-2 text-xs text-gray-400">No valid transitions available from current status.</p>
        )}
      </div>

      {/* Confirm dialog with optional note */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {pendingAction.label} Alert
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Changing status from <strong>{alert.alertStatus}</strong> → <strong>{pendingAction.toStatus}</strong>
            </p>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {pendingAction.requiresNote ? 'Resolution Note *' : 'Note (optional)'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder={pendingAction.requiresNote ? 'Required — explain the resolution…' : 'Optional note…'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {pendingAction.requiresNote && !note && (
                <p className="mt-1 text-xs text-red-500">Note is required for this action</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPendingAction(null); setNote(''); }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={mutation.isPending || (pendingAction.requiresNote && !note.trim())}
                onClick={() => mutation.mutate({ action: pendingAction, note })}
                className="flex-1 rounded-lg bg-hawk-600 px-4 py-2 text-sm font-semibold text-white hover:bg-hawk-700 disabled:opacity-60"
              >
                {mutation.isPending ? 'Processing…' : `Confirm ${pendingAction.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

