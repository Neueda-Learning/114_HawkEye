import { cn, alertStatusColor } from '@/lib/utils';
import type { AlertStatus } from '@/lib/types';

const LABELS: Record<AlertStatus, string> = {
  OPEN:          'Open',
  ACKNOWLEDGED:  'Acknowledged',
  INVESTIGATING: 'Investigating',
  CLOSED:        'Closed',
  DISMISSED:     'Dismissed',
};

interface StatusBadgeProps {
  status: AlertStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        alertStatusColor[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}

