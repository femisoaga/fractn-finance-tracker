import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAppSelector } from '../app/hooks';
import Spinner from '../components/Spinner';

type AuthMode = 'login' | 'register';

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAppSelector(s => s.auth);
  const [mode, setMode] = useState<AuthMode>('login');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const headings = useMemo(
    () =>
      mode === 'login'
        ? {
            title: 'Welcome back',
            subtitle: 'Sign in to continue tracking your finances.',
            cta: 'Sign in',
            toggle: "Don't have an account?",
            toggleCta: 'Create one',
          }
        : {
            title: 'Create your account',
            subtitle: 'Set up your profile to start logging transactions.',
            cta: 'Create account',
            toggle: 'Already have an account?',
            toggleCta: 'Sign in',
          },
    [mode]
  );

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFeedback(null);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        setFeedback({ type: 'success', message: 'Welcome back! Redirecting…' });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setFeedback({ type: 'success', message: 'Account created successfully! Redirecting…' });
      }
      navigate('/', { replace: true });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Try again.',
      });
    }
  });

  const toggleMode = () => {
    setFeedback(null);
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    reset();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner label="Preparing your experience…" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-950" />
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-3/4 top-1/4 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-[32px] border border-white/10 bg-white/10 p-[1px] shadow-2xl backdrop-blur-xl">
          <div className="rounded-[30px] bg-white/90 px-8 py-10 shadow-xl">
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500">Fractn</p>
              <h1 className="text-2xl font-semibold text-slate-900">{headings.title}</h1>
              <p className="text-sm text-slate-500">{headings.subtitle}</p>
            </div>

            {feedback && (
              <div
                className={clsx(
                  'mt-6 rounded-2xl border px-4 py-3 text-sm',
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                )}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                {errors.password && <p className="text-sm text-rose-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {isSubmitting ? 'Just a second…' : headings.cta}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              <span>{headings.toggle}</span>{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-indigo-600 underline-offset-4 transition hover:text-indigo-700"
              >
                {headings.toggleCta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
