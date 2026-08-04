import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createTransaction } from '@/lib/api/transactions';
import { mockPayees } from '@/mocks/data';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/common/Toast';

const schema = z.object({
  payeeId:         z.string().min(1, 'Please select a payee'),
  amount:          z.coerce.number().positive('Amount must be greater than 0').max(1000000, 'Amount too large'),
  transactionType: z.enum(['DEBIT', 'CREDIT']),
  description:     z.string().max(255).optional(),
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
    defaultValues: { transactionType: 'DEBIT' },
  });

  const selectedPayee = mockPayees.find((p) => p.payeeId === watch('payeeId'));

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (data) => {
      setTxRef(`TXN-${data.transactionId}`);
      setStep('success');
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction submitted successfully!');
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
      accountId:       user.accountId,
      payeeId:         formData.payeeId,
      payeeName:       selectedPayee?.payeeName,   // send payeeName for auto-create
      payeeType:       selectedPayee?.payeeType,   // send payeeType for auto-create
      amount:          formData.amount,
      transactionType: formData.transactionType,
      description:     formData.description,
      timestamp:       new Date().toISOString(),
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Submitted!</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Your transaction has been processed successfully.
          </p>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-400">Reference ID</p>
            <p className="mt-1 font-mono text-lg font-bold text-hawk-700 dark:text-hawk-300">{txRef}</p>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => { setStep('form'); setFormData(null); }}
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
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Review Transaction</h3>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'From Account', value: user?.accountId },
              { label: 'Payee',        value: selectedPayee?.payeeName ?? formData.payeeId },
              { label: 'Amount',       value: <span className="font-bold text-hawk-700 dark:text-hawk-300">{formatCurrency(formData.amount)}</span> },
              { label: 'Type',         value: formData.transactionType },
              { label: 'Note',         value: formData.description || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 text-right dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-lg bg-yellow-50 px-4 py-3 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Please confirm the details above before submitting. Transactions cannot be reversed.
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Money</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <form onSubmit={handleSubmit(onReview)} className="space-y-5">

          {/* Source account (read-only) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">From Account</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {user?.accountId} — {user?.name}
            </div>
          </div>

          {/* Payee */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Payee</label>
            <select
              {...register('payeeId')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select payee…</option>
              {mockPayees.map((p) => (
                <option key={p.payeeId} value={p.payeeId}>{p.payeeName}</option>
              ))}
            </select>
            {errors.payeeId && <p className="mt-1 text-xs text-red-600">{errors.payeeId.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Type</label>
            <div className="flex gap-3">
              {(['DEBIT', 'CREDIT'] as const).map((type) => (
                <label key={type} className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm dark:border-gray-600">
                  <input {...register('transactionType')} type="radio" value={type} className="text-hawk-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note <span className="text-gray-400">(optional)</span>
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="e.g. Vendor payment"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-hawk-600 px-4 py-3 text-sm font-semibold text-white hover:bg-hawk-700 transition"
          >
            <Send className="h-4 w-4" />
            Review Transaction
          </button>
        </form>
      </div>
    </div>
  );
}

