import { useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RuleParameterFields } from './RuleParameterFields';
import { JsonViewer } from '@/components/common/JsonViewer';
import type { Rule, RuleType, Severity } from '@/lib/types';

const RULE_TYPES: RuleType[] = ['AMOUNT_THRESHOLD', 'VELOCITY', 'NEW_PAYEE', 'DAILY_LIMIT'];
const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const schema = z.object({
  name:        z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(255).optional(),
  ruleType:    z.enum(['AMOUNT_THRESHOLD', 'VELOCITY', 'NEW_PAYEE', 'DAILY_LIMIT']),
  severity:    z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  parameters:  z.record(z.unknown()),
  performedBy: z.string().min(1),
  changeReason: z.string().max(255).optional(),
});

export type RuleFormValues = z.infer<typeof schema>;

interface RuleFormProps {
  defaultValues?: Partial<RuleFormValues>;
  onSubmit: (values: RuleFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
  performedBy: string;
}

export function RuleForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Rule', performedBy }: RuleFormProps) {
  const methods = useForm<RuleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', description: '', severity: 'MEDIUM', parameters: {},
      performedBy, changeReason: '',
      ...defaultValues,
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, control } = methods;
  const watchedRuleType  = useWatch({ control, name: 'ruleType' });
  const watchedParams    = useWatch({ control, name: 'parameters' });
  const watchedAll       = useWatch({ control });

  // Reset parameters when ruleType changes
  useEffect(() => {
    methods.setValue('parameters', {});
  }, [watchedRuleType, methods]);

  // Sync performedBy
  useEffect(() => {
    methods.setValue('performedBy', performedBy);
  }, [performedBy, methods]);

  useEffect(() => {
    if (defaultValues) reset({ performedBy, ...defaultValues });
  }, [defaultValues, reset, performedBy]);

  const previewPayload = {
    name:         watchedAll.name,
    ruleType:     watchedAll.ruleType,
    severity:     watchedAll.severity,
    parameters:   watchedParams,
    performedBy:  watchedAll.performedBy,
    changeReason: watchedAll.changeReason,
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Rule Name *</label>
          <input
            {...register('name')}
            placeholder="e.g. High Value Transaction"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Brief description of when this rule triggers…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Rule Type + Severity side by side */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Rule Type *</label>
            <select
              {...register('ruleType')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select type…</option>
              {RULE_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            {errors.ruleType && <p className="mt-1 text-xs text-red-600">{errors.ruleType.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Severity *</label>
            <select
              {...register('severity')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Dynamic Parameters */}
        <div className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-600">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Rule Parameters</h3>
          <RuleParameterFields ruleType={watchedRuleType as RuleType | ''} />
        </div>

        {/* Change Reason */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Change Reason <span className="text-gray-400">(optional)</span>
          </label>
          <input
            {...register('changeReason')}
            placeholder="e.g. Adjusted after fraud review"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* JSON Preview */}
        <JsonViewer data={previewPayload} title="Payload Preview (what will be sent to API)" />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-hawk-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-hawk-700 disabled:opacity-60"
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </form>
    </FormProvider>
  );
}

