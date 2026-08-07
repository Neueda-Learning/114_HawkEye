import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getRuleById, updateRule } from '@/lib/api/rules';
import { RuleForm, type RuleFormValues } from '../components/RuleForm';
import { PageSkeleton } from '@/components/common/SkeletonLoader';
import { toast } from '@/components/common/Toast';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function RuleEditPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user }    = useAuthStore();

  const { data: rule, isLoading } = useQuery({
    queryKey: ['rule', id],
    queryFn:  () => getRuleById(Number(id)),
    enabled:  !!id,
  });

  const mutation = useMutation({
    mutationFn: (values: RuleFormValues) =>
      updateRule(Number(id), {
        name:         values.name,
        description:  values.description,
        ruleType:     values.ruleType,
        severity:     values.severity,
        parameters:   values.parameters,
        performedBy:  values.performedBy,
        changeReason: values.changeReason,
      }),
    onSuccess: () => {
      toast.success('Rule updated successfully');
      toast.email(
        'Email Notification Sent: Rule Modified',
        `An automated configuration notification email has been sent to system administrators detailing updates to Rule #${id}.`,
        'admin@hawkeye.com, analyst@hawkeye.com'
      );
      void queryClient.invalidateQueries({ queryKey: ['rule', id] });
      void queryClient.invalidateQueries({ queryKey: ['rules'] });
      navigate(`/admin/rules/${id}`);
    },
    onError: (err) => toast.error('Update failed', err instanceof Error ? err.message : ''),
  });

  if (isLoading) return <PageSkeleton />;
  if (!rule)     return <div className="py-20 text-center text-gray-400">Rule not found</div>;

  const defaultValues: Partial<RuleFormValues> = {
    name:        rule.ruleName,
    description: rule.description ?? '',
    ruleType:    rule.ruleType,
    severity:    rule.severity,
    parameters:  rule.parameters as Record<string, unknown>,
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Rule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rule.ruleName}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <RuleForm
          defaultValues={defaultValues}
          onSubmit={(values) => mutation.mutate(values)}
          isLoading={mutation.isPending}
          submitLabel="Save Changes"
          performedBy={user?.email ?? 'admin@hawkeye.com'}
        />
      </div>
    </div>
  );
}

