import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // percentage change
  icon?: React.ReactNode;
  color?: 'default' | 'red' | 'green' | 'yellow' | 'purple' | 'blue';
  isLoading?: boolean;
  className?: string;
}

const colorMap = {
  default: 'bg-white dark:bg-gray-800',
  red:     'bg-red-50 dark:bg-red-900/20',
  green:   'bg-green-50 dark:bg-green-900/20',
  yellow:  'bg-yellow-50 dark:bg-yellow-900/20',
  purple:  'bg-purple-50 dark:bg-purple-900/20',
  blue:    'bg-blue-50 dark:bg-blue-900/20',
};

const iconColorMap = {
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  red:     'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  green:   'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  yellow:  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
  purple:  'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  blue:    'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'default',
  isLoading = false,
  className,
}: MetricCardProps) {
  const TrendIcon = trend === undefined || trend === 0
    ? Minus
    : trend > 0 ? TrendingUp : TrendingDown;

  const trendColor = trend === undefined || trend === 0
    ? 'text-gray-400'
    : trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-gray-200 p-6 dark:border-gray-700', colorMap[color], className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-gray-200 p-6 dark:border-gray-700', colorMap[color], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              {Math.abs(trend)}% vs last period
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-lg p-2.5', iconColorMap[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

