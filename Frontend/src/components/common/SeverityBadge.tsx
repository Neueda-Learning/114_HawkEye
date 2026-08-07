import { cn, severityColor } from '@/lib/utils';
import type { Severity } from '@/lib/types';

const ICONS: Record<Severity, string> = {
  LOW:      '●',
  MEDIUM:   '●',
  HIGH:     '●',
  CRITICAL: '⬆',
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        severityColor[severity],
        className,
      )}
    >
      <span className="text-[8px]">{ICONS[severity]}</span>
      {severity}
    </span>
  );
}

