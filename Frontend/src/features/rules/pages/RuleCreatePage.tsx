import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createRule, updateRule, getRules } from '@/lib/api/rules';
import { RuleForm, type RuleFormValues } from '../components/RuleForm';
import { toast } from '@/components/common/Toast';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function RuleCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation for Creating Rule (POST /api/v1/rules)
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
      toast.success(`Rule "${rule?.ruleName || 'New Rule'}" created and saved in backend DB!`);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
      navigate('/admin/rules');
    },
    onError: (err: any) => {
      toast.error('Failed to create rule', err?.message || 'Backend validation error');
      setIsSubmitting(false);
    },
  });

  // Mutation for Updating Pre-existing Rule (PUT /api/v1/rules/{id})
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: RuleFormValues }) =>
      updateRule(id, {
        name: values.name,
        description: values.description,
        ruleType: values.ruleType,
        severity: values.severity,
        parameters: values.parameters,
        performedBy: values.performedBy,
        changeReason: values.changeReason || 'Updated pre-existing rule parameters',
      }),
    onSuccess: (rule) => {
      toast.success(`Rule #${rule?.ruleId || ''} updated successfully in backend DB!`);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
      navigate('/admin/rules');
    },
    onError: (err: any) => {
      toast.error('Failed to update rule', err?.message || 'Backend validation error');
      setIsSubmitting(false);
    },
  });

  // Handle Form Submission with Backend Rule Type & Name Matching
  const handleSubmit = async (values: RuleFormValues) => {
    setIsSubmitting(true);
    try {
      // Fetch current active rules from backend database
      const paged = await getRules({ size: 100 });
      const currentRules = paged?.content || [];

      // Check if a rule of matching ruleType or ruleName already exists in backend DB
      const match = currentRules.find(
        (r) =>
          r.ruleType === values.ruleType ||
          r.ruleName?.toLowerCase().trim() === values.name.toLowerCase().trim() ||
          (r as any).name?.toLowerCase().trim() === values.name.toLowerCase().trim()
      );

      if (match) {
        // Pre-existing rule found for this ruleType -> update using PUT /api/v1/rules/{id} API
        const targetId = match.ruleId || (match as any).id;
        updateMutation.mutate({ id: Number(targetId), values });
      } else {
        // No match -> create new rule in backend DB using POST /api/v1/rules API
        createMutation.mutate(values);
      }
    } catch (e) {
      // Fallback to create API
      createMutation.mutate(values);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Monitoring Rule</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Define rule threshold & parameters for Rule Engine</p>
          </div>
        </div>
      </div>

      {/* ── Rule Form ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <RuleForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
          submitLabel="Save / Update Rule"
          performedBy={user?.email ?? 'admin@hawkeye.com'}
        />
      </div>
    </div>
  );
}
