import { useMemo } from 'react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  amount: z.number()
    .refine(v => !Number.isNaN(v), 'Enter an amount')
    .gt(0, 'Enter an amount greater than zero'),
  category: z.enum(['income', 'expense']),
  note: z.string().trim().max(120, 'Keep notes under 120 characters').optional(),
  date: z.string().min(1, 'Pick a date'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  onAdd: (value: FormData) => Promise<void>;
  className?: string;
}

export default function TransactionForm({ onAdd, className = '' }: TransactionFormProps) {
  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'income', date: defaultDate },
  });

  const onSubmit = handleSubmit(async (values) => {
    const trimmedNote = values.note?.trim();
    await onAdd({
      ...values,
      note: trimmedNote ? trimmedNote : undefined,
    });
    reset({ category: 'income', date: new Date().toISOString().slice(0, 10), note: '', amount: undefined });
  });

  return (
    <form onSubmit={onSubmit} className={clsx('space-y-5', className)}>
      <div className="space-y-1">
        <label htmlFor="amount" className="text-sm font-medium text-slate-700">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-sm text-rose-600">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-400">
            <input
              type="radio"
              value="income"
              className="sr-only peer"
              {...register('category')}
            />
            <span className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-indigo-500 peer-checked:bg-indigo-500/5" aria-hidden="true" />
            <span className="relative">Income</span>
          </label>
          <label className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-400">
            <input
              type="radio"
              value="expense"
              className="sr-only peer"
              {...register('category')}
            />
            <span className="absolute inset-0 rounded-xl border-2 border-transparent peer-checked:border-rose-500 peer-checked:bg-rose-500/5" aria-hidden="true" />
            <span className="relative">Expense</span>
          </label>
        </div>
        {errors.category && <p className="text-sm text-rose-600">{errors.category.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-medium text-slate-700">Note</label>
        <input
          id="note"
          type="text"
          placeholder="Add a short description (optional)"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          {...register('note')}
        />
        {errors.note && <p className="text-sm text-rose-600">{errors.note.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="text-sm font-medium text-slate-700">Date</label>
        <input
          id="date"
          type="date"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
          {...register('date')}
        />
        {errors.date && <p className="text-sm text-rose-600">{errors.date.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {isSubmitting ? 'Adding…' : 'Add transaction'}
      </button>
    </form>
  );
}
