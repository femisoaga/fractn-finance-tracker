import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAppDispatch } from './app/hooks';
import { setUser } from './features/auth/authSlice';

function AuthWatcher() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      dispatch(setUser(u ? { uid: u.uid, email: u.email } : null));
    });
    return unsubscribe;
  }, [dispatch]);
  return null;
}

export default function App() {
  return (
    <>
      <AuthWatcher />
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
