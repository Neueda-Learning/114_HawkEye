import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createTransaction } from '@/lib/api/transactions';
import { getRules } from '@/lib/api/rules';
import { mockPayees } from '@/mocks/data';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/common/Toast';

const schema = z.object({
  payeeId:            z.string().min(1, 'Please select a payee'),
  payeeAccountNumber: z.string().min(4, 'Payee account number must be at least 4 digits'),
  amount:             z.coerce.number().positive('Amount must be greater than 0'),
  description:        z.string().max(255).optional(),
});

type FormValues = z.infer<typeof schema>;
type Step = 'form' | 'review' | 'success';

export default function SendMoneyPage() {
  const { user }      = useAuthStore();
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [txRef, setTxRef]       = useState<string>('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { payeeAccountNumber: 'ACC-908123' },
  });

  // Query active rules from backend
  const { data: rulesPage } = useQuery({
    queryKey: ['rules', 'active-evaluate'],
    queryFn: () => getRules({ status: 'ACTIVE', size: 100 }),
  });
  const activeRules = rulesPage?.content || [];

  const selectedPayee = mockPayees.find((p) => p.payeeId === watch('payeeId'));

  const [alertPopup, setAlertPopup] = useState<{ ruleName: string; severity: string; message: string } | null>(null);
  const [emailPopup, setEmailPopup] = useState<{ recipient: string; subject: string } | null>(null);

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      setTxRef(`TXN-${data.transactionId}`);
      setStep('success');
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });

      // ── Evaluate ONLY against ACTIVE backend rules in DB ─────────────────
      const amountRule = activeRules.find((r) => r.ruleType === 'AMOUNT_THRESHOLD');
      const dailyRule = activeRules.find((r) => r.ruleType === 'DAILY_LIMIT');
      const newPayeeRule = activeRules.find((r) => r.ruleType === 'NEW_PAYEE');

      let triggeredAlert = null;

      if (amountRule && formData && formData.amount >= (amountRule.parameters?.thresholdAmount || 1000)) {
        triggeredAlert = {
          ruleName: amountRule.ruleName || 'Amount Threshold Rule',
          severity: amountRule.severity || 'HIGH',
          message: `Transaction amount $${formData.amount} exceeded $${amountRule.parameters?.thresholdAmount || 1000} active limit!`,
        };
      } else if (dailyRule && formData && formData.amount >= (dailyRule.parameters?.dailyLimitAmount || 2000)) {
        triggeredAlert = {
          ruleName: dailyRule.ruleName || 'Daily Limit Rule',
          severity: dailyRule.severity || 'CRITICAL',
          message: `Transaction amount $${formData.amount} exceeded daily limit threshold!`,
        };
      } else if (newPayeeRule && formData && !mockPayees.some((p) => p.payeeId === formData.payeeId)) {
        triggeredAlert = {
          ruleName: newPayeeRule.ruleName || 'New Payee Rule',
          severity: newPayeeRule.severity || 'MEDIUM',
          message: `First time transfer to unregistered payee account ${formData.payeeAccountNumber}`,
        };
      }

      setAlertPopup(triggeredAlert);

      // Trigger Email Notification Sent Popup
      setEmailPopup({
        recipient: user?.email || 'customer@hawkeye.com',
        subject: 'Transaction DEBIT & Security Receipt Notification',
      });

      toast.success('DEBIT Transaction submitted successfully!');
    },
    onError: (err) => {
      toast.error('Transaction failed', err instanceof Error ? err.message : 'Unknown error');
      setStep('form');
    },
  });

  const onReview = (values: FormValues) => {
    setFormData(values);
    setStep('review');
  };

  const onConfirm = () => {
    if (!formData || !user?.accountId) return;
    mutation.mutate({
      accountId:          user.accountId,
      payeeId:            formData.payeeAccountNumber || formData.payeeId,
      payeeName:          selectedPayee?.payeeName || 'Beneficiary Account',
      payeeType:          selectedPayee?.payeeType || 'Personal',
      amount:             formData.amount,
      transactionType:    'DEBIT', // Strictly DEBIT
      description:        formData.description,
      timestamp:          new Date().toISOString(),
    });
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">DEBIT Transaction Submitted!</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Your transfer has been processed and recorded in Transaction Service.
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-400">Reference ID</p>
            <p className="mt-1 font-mono text-lg font-bold text-hawk-700 dark:text-hawk-300">{txRef}</p>
          </div>

          {/* Rule Alert Generated Popup Banner */}
          {alertPopup && (
            <div className={`mt-4 rounded-xl border p-4 text-left shadow-md ${
              alertPopup.severity === 'HIGH' || alertPopup.severity === 'CRITICAL'
                ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
                : alertPopup.severity === 'MEDIUM'
                ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                : 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  {alertPopup.severity === 'HIGH' || alertPopup.severity === 'CRITICAL' ? '🚨' : '⚠️'}
                </span>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-sm">SECURITY ALERT GENERATED</strong>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      alertPopup.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {alertPopup.severity} SEVERITY
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">{alertPopup.ruleName}</p>
                  <p className="mt-0.5 opacity-90">{alertPopup.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Notification Dispatched Popup Banner */}
          {emailPopup && (
            <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-left text-xs text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
              <div className="flex items-center gap-2.5">
                <span className="text-base">📧</span>
                <div className="flex-1">
                  <strong className="font-bold text-xs block text-indigo-950 dark:text-indigo-100">Email Notification Dispatched</strong>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Confirmation & alert email sent to <strong>{emailPopup.recipient}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => { setStep('form'); setFormData(null); setAlertPopup(null); setEmailPopup(null); }}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              Send Another
            </button>
            <button
              onClick={() => navigate('/customer/transactions')}
              className="rounded-lg bg-hawk-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-hawk-700"
            >
              View Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Review modal overlay ───────────────────────────────────────────────────
  if (step === 'review' && formData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Review DEBIT Transaction</h3>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'From Account',         value: user?.accountId },
              { label: 'Payee',                value: selectedPayee?.payeeName ?? formData.payeeId },
              { label: 'Payee Account No.',    value: <span className="font-mono text-xs">{formData.payeeAccountNumber}</span> },
              { label: 'Amount',               value: <span className="font-bold text-red-600">-{formatCurrency(formData.amount)}</span> },
              { label: 'Type',                 value: <span className="font-bold text-red-600">DEBIT</span> },
              { label: 'Note',                 value: formData.description || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 text-right dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-lg bg-yellow-50 px-4 py-3 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Please confirm the details above before submitting. DEBIT transfers are final.
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setStep('form')}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="mr-1 inline h-4 w-4" /> Edit
            </button>
            <button
              onClick={onConfirm}
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-hawk-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-hawk-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {mutation.isPending ? 'Processing…' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Money</h1>
          <p className="text-xs text-gray-400">Perform DEBIT transaction to beneficiary account</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <form onSubmit={handleSubmit(onReview)} className="space-y-4">

          {/* Source account */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">From Account</label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {user?.accountId} ({user?.name})
            </div>
          </div>

          {/* Payee Selection */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Select Payee / Merchant</label>
            <select
              {...register('payeeId')}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select payee…</option>
              {mockPayees.map((p) => (
                <option key={p.payeeId} value={p.payeeId}>{p.payeeName} ({p.payeeCategory})</option>
              ))}
            </select>
            {errors.payeeId && <p className="mt-1 text-xs text-red-600">{errors.payeeId.message}</p>}
          </div>

          {/* Payee Account Number */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Payee Account Number</label>
            <input
              {...register('payeeAccountNumber')}
              type="text"
              placeholder="e.g. ACC-908123 / 9876543210"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.payeeAccountNumber && <p className="mt-1 text-xs text-red-600">{errors.payeeAccountNumber.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                {...register('amount')}
                type="number"
                step="any"
                placeholder="150.00"
                className="w-full rounded-xl border border-gray-300 py-2 pl-7 pr-3 text-xs outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="e.g. Invoice payment"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs outline-none focus:border-hawk-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-hawk-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-hawk-700 transition"
          >
            <Send className="h-4 w-4" />
            Review DEBIT Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
