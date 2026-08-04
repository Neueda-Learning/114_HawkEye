import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createRule } from '@/lib/api/rules';
import { RuleForm, type RuleFormValues } from '../components/RuleForm';
import { toast } from '@/components/common/Toast';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function RuleCreatePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user }    = useAuthStore();

  const mutation = useMutation({
    mutationFn: (values: RuleFormValues) =>
      createRule({
        name:         values.name,
        description:  values.description,
        ruleType:     values.ruleType,
        severity:     values.severity,
        parameters:   values.parameters,
        performedBy:  values.performedBy,
        changeReason: values.changeReason,
      }),
    onSuccess: (rule) => {
      toast.success('Rule created!', rule.ruleName);
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
      navigate(`/admin/rules/${rule.ruleId}`);
    },
    onError: (err) => toast.error('Failed to create rule', err instanceof Error ? err.message : ''),
  });

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Rule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Define a new monitoring rule</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <RuleForm
          onSubmit={(values) => mutation.mutate(values)}
          isLoading={mutation.isPending}
          submitLabel="Create Rule"
          performedBy={user?.email ?? 'admin@hawkeye.com'}
        />
      </div>
    </div>
  );
}

