import { cn, formatDate } from '@/lib/utils';

export interface TimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  color?: 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'purple';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const dotColor = {
  gray:   'bg-gray-400 dark:bg-gray-500',
  blue:   'bg-blue-500',
  yellow: 'bg-yellow-500',
  green:  'bg-green-500',
  red:    'bg-red-500',
  purple: 'bg-purple-500',
};

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No events recorded
      </p>
    );
  }

  return (
    <ol className={cn('relative border-l border-gray-200 dark:border-gray-700 ml-3', className)}>
      {events.map((event, idx) => (
        <li key={event.id} className={cn('ml-6', idx < events.length - 1 && 'mb-6')}>
          {/* Dot */}
          <span
            className={cn(
              'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900',
              dotColor[event.color ?? 'gray'],
            )}
          >
            {event.icon ?? (
              <span className="h-2 w-2 rounded-full bg-white" />
            )}
          </span>

          {/* Content */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
              <time className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {formatDate(event.timestamp)}
              </time>
            </div>
            {event.description && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

