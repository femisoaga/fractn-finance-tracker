import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { addTx, listTx, removeTx } from '../services/transactions';
import type { Tx } from '../services/transactions';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setFilter } from '../app/store';
import TransactionForm from '../components/TransactionForm';
import Spinner from '../components/Spinner';

type FilterValue = 'all' | 'income' | 'expense';
type FlashMessage = { type: 'success' | 'error'; text: string } | null;

const FILTER_OPTIONS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const sortTransactions = (records: Tx[]) =>
  [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const filter = useAppSelector(state => state.ui.filter);
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    listTx(user.uid)
      .then(data => {
        if (active) setItems(sortTransactions(data));
      })
      .catch(() => {
        if (active) setFlash({ type: 'error', text: 'Unable to load transactions just now.' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 2500);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const filtered = useMemo(
    () => items.filter(item => (filter === 'all' ? true : item.category === filter)),
    [items, filter]
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, tx) => {
          if (tx.category === 'income') acc.income += tx.amount;
          else acc.expense += tx.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      ),
    [filtered]
  );

  const balance = totals.income - totals.expense;

  const handleAdd = async (values: Omit<Tx, 'id'>) => {
    if (!user) return;
    const optimistic: Tx = { id: crypto.randomUUID(), ...values };
    setItems(prev => sortTransactions([optimistic, ...prev]));

    try {
      const saved = await addTx(user.uid, values);
      setItems(prev => sortTransactions([saved, ...prev.filter(item => item.id !== optimistic.id)]));
      setFlash({ type: 'success', text: 'Transaction added.' });
    } catch {
      setItems(prev => prev.filter(item => item.id !== optimistic.id));
      setFlash({ type: 'error', text: 'Could not add the transaction.' });
    }
  };

  const handleRemove = async (id?: string) => {
    if (!user || !id) return;
    setRemovingId(id);

    const snapshot = [...items];
    setItems(prev => prev.filter(item => item.id !== id));

    try {
      await removeTx(user.uid, id);
      setFlash({ type: 'success', text: 'Transaction removed.' });
    } catch {
      setItems(snapshot);
      setFlash({ type: 'error', text: 'Delete failed. Try again.' });
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">A quick demo to track income and expenses.</p>
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </header>

        {flash && (
          <div
            className={clsx(
              'rounded-lg border px-4 py-3 text-sm shadow-sm',
              flash.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            )}
          >
            {flash.text}
          </div>
        )}

        <section className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">Current balance</p>
          <p className={clsx('mt-1 text-3xl font-semibold', balance >= 0 ? 'text-slate-900' : 'text-rose-600')}>
            ₦{balance.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Income ₦{totals.income.toLocaleString()} • Expenses ₦{totals.expense.toLocaleString()}
          </p>
        </section>

        <section className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => dispatch(setFilter(option.value))}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition',
                filter === option.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 shadow-sm hover:bg-slate-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-base font-semibold text-slate-800">Transactions</h2>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="py-10">
                <Spinner label="Loading transactions…" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
                No transactions yet. Add one below to see it here.
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {filtered.map(tx => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {tx.note || (tx.category === 'income' ? 'Income' : 'Expense')}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={tx.category === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                        {tx.category === 'income' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(tx.id)}
                        disabled={removingId === tx.id}
                        className="text-xs font-medium text-slate-400 underline-offset-4 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removingId === tx.id ? 'Removing…' : 'Delete'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Add a transaction</h2>
          <p className="mt-1 text-sm text-slate-500">Quickly log new income or expenses for the demo.</p>
          <div className="mt-4">
            <TransactionForm onAdd={handleAdd} className="space-y-4" />
          </div>
        </section>
      </div>
    </main>
  );
}
