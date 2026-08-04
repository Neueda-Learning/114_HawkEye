import { useFormContext } from 'react-hook-form';
import type { RuleType } from '@/lib/types';

interface Props {
  ruleType: RuleType | '';
}

export function RuleParameterFields({ ruleType }: Props) {
  const { register, formState: { errors } } = useFormContext();

  if (!ruleType) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-400 dark:bg-gray-800">
        Select a rule type above to configure parameters.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {ruleType === 'AMOUNT_THRESHOLD' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Threshold Amount (USD)
          </label>
          <p className="mb-1.5 text-xs text-gray-400">Alert when a single transaction exceeds this amount.</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              {...register('parameters.thresholdAmount', { valueAsNumber: true })}
              type="number" step="100" min="1"
              placeholder="10000"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {(errors.parameters as Record<string, {message?: string}>)?.thresholdAmount && (
            <p className="mt-1 text-xs text-red-600">{String((errors.parameters as Record<string, {message?: string}>).thresholdAmount?.message)}</p>
          )}
        </div>
      )}

      {ruleType === 'VELOCITY' && (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Window (minutes)
            </label>
            <p className="mb-1.5 text-xs text-gray-400">Time window to count transactions in.</p>
            <input
              {...register('parameters.windowMinutes', { valueAsNumber: true })}
              type="number" min="1" max="1440"
              placeholder="10"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Transactions
            </label>
            <p className="mb-1.5 text-xs text-gray-400">Alert if transactions exceed this count within the window.</p>
            <input
              {...register('parameters.maxTransactions', { valueAsNumber: true })}
              type="number" min="1"
              placeholder="5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </>
      )}

      {ruleType === 'NEW_PAYEE' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lookback Days
          </label>
          <p className="mb-1.5 text-xs text-gray-400">
            Alert if account has never transacted with this payee in the last N days.
          </p>
          <input
            {...register('parameters.lookbackDays', { valueAsNumber: true })}
            type="number" min="1" max="3650"
            placeholder="365"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      {ruleType === 'DAILY_LIMIT' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Limit Amount (USD)
          </label>
          <p className="mb-1.5 text-xs text-gray-400">Alert when total daily debits exceed this amount.</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              {...register('parameters.dailyLimitAmount', { valueAsNumber: true })}
              type="number" step="1000" min="1"
              placeholder="50000"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-3 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

