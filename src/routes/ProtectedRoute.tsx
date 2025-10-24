import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import Spinner from '../components/Spinner';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAppSelector(s => s.auth);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Spinner label="Preparing your workspace…" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}
