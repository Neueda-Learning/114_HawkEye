import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCw, PlusCircle, CheckCircle2 } from 'lucide-react';
import { createRule, updateRule, getRules } from '@/lib/api/rules';
import { RuleForm, type RuleFormValues } from '../components/RuleForm';
import { toast } from '@/components/common/Toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Rule } from '@/lib/types';

export default function RuleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [existingRule, setExistingRule] = useState<Rule | null>(null);
  const [pendingValues, setPendingValues] = useState<RuleFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation for Creating Rule
  const createMutation = useMutation({
    mutationFn: (values: RuleFormValues) =>
      createRule({
        name: values.name,
        description: values.description,
        ruleType: values.ruleType,
        severity: values.severity,
        parameters: values.parameters,
        performedBy: values.performedBy,
        changeReason: values.changeReason || 'Initial Creation',
      }),
    onSuccess: (rule) => {
      toast.success(`Rule "${rule?.ruleName || pendingValues?.name}" created and saved to backend database!`);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
      navigate('/admin/rules');
    },
    onError: (err: any) => {
      toast.error('Failed to create rule', err?.message || 'Server error');
      setIsSubmitting(false);
    },
  });

  // Mutation for Updating Pre-existing Rule
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: RuleFormValues }) =>
      updateRule(id, {
        name: values.name,
        description: values.description,
        ruleType: values.ruleType,
        severity: values.severity,
        parameters: values.parameters,
        performedBy: values.performedBy,
        changeReason: values.changeReason || 'Updated pre-existing rule',
      }),
    onSuccess: (rule) => {
      toast.success(`Rule #${rule?.ruleId || existingRule?.ruleId} updated successfully in backend database!`);
      setExistingRule(null);
      setPendingValues(null);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
      navigate('/admin/rules');
    },
    onError: (err: any) => {
      toast.error('Failed to update existing rule', err?.message || 'Server error');
      setIsSubmitting(false);
    },
  });

  // Handle Form Submission with Pre-existing Duplicate Check
  const handleSubmit = async (values: RuleFormValues) => {
    setIsSubmitting(true);
    try {
      // Fetch current active rules from backend to check if rule already exists
      const paged = await getRules({ size: 100 });
      const currentRules = paged.content || [];

      // Check if a rule with matching ruleName or ruleType already exists
      const match = currentRules.find(
        (r) =>
          r.ruleName.toLowerCase().trim() === values.name.toLowerCase().trim() ||
          (r as any).name?.toLowerCase().trim() === values.name.toLowerCase().trim() ||
          r.ruleType === values.ruleType
      );

      if (match) {
        // Pre-existing rule found -> prompt user to UPDATE existing rule only
        setExistingRule(match);
        setPendingValues(values);
        setIsSubmitting(false);
      } else {
        // No match -> create new rule in backend
        createMutation.mutate(values);
      }
    } catch (e) {
      // Fallback directly to create
      createMutation.mutate(values);
    }
  };

  const handleConfirmUpdate = () => {
    if (existingRule && pendingValues) {
      setIsSubmitting(true);
      updateMutation.mutate({ id: existingRule.ruleId, values: pendingValues });
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Monitoring Rule</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure new fraud detection parameters in Rule Engine</p>
          </div>
        </div>
      </div>

      {/* ── Modal / Banner for Pre-existing Rule Prompt ─────────────────────── */}
      {existingRule && pendingValues && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-xl dark:border-amber-800 dark:bg-amber-950/60">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
                  Pre-existing Rule Detected in Backend!
                </h3>
                <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-200">
                  RULE #{existingRule.ruleId}
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200">
                A rule named <strong>"{existingRule.ruleName}"</strong> ({existingRule.ruleType}) already exists in the backend rules database.
              </p>
              <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-100/50 p-3 text-xs dark:border-amber-700/50 dark:bg-amber-900/40">
                <span className="font-semibold text-amber-900 dark:text-amber-200 block mb-1">New Configuration to Update:</span>
                <ul className="space-y-0.5 font-mono text-[11px] text-amber-800 dark:text-amber-300">
                  <li>• Name: {pendingValues.name}</li>
                  <li>• Rule Type: {pendingValues.ruleType}</li>
                  <li>• Severity: {pendingValues.severity}</li>
                  <li>• Parameters: {JSON.stringify(pendingValues.parameters)}</li>
                </ul>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleConfirmUpdate}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${updateMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>{updateMutation.isPending ? 'Updating Backend...' : 'Update Existing Rule'}</span>
                </button>
                <button
                  onClick={() => {
                    // Force create anyway if user explicitly chooses
                    createMutation.mutate(pendingValues);
                  }}
                  disabled={createMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100/80 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-200"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create as New Separate Rule</span>
                </button>
                <button
                  onClick={() => {
                    setExistingRule(null);
                    setPendingValues(null);
                  }}
                  className="text-xs font-medium text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rule Form ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <RuleForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
          submitLabel="Save Rule to Backend"
          performedBy={user?.email ?? 'admin@hawkeye.com'}
        />
      </div>
    </div>
  );
}
