import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_values: FormValues) => {
    // Mock: simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-hawk-900 via-hawk-800 to-hawk-700 p-4">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">HawkEye</h1>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Check your email
              </h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                If an account exists for that email, we've sent a password reset link.
              </p>
              <Link
                to="/login"
                className="text-sm font-medium text-hawk-600 hover:underline dark:text-hawk-400"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
                Forgot password?
              </h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-hawk-500 focus:ring-2 focus:ring-hawk-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-hawk-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-hawk-700 transition disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </button>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-hawk-600 hover:underline dark:text-hawk-400"
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

