# Fractn Finance Tracker (Slim)
React + Vite + Firebase (Auth/Firestore) + Redux Toolkit.

## Live
<> | Repo: <>

## What to review
- src/app/store.ts — Redux store & UI filter state
- src/features/auth/authSlice.ts — auth user in Redux via onAuthStateChanged
- src/routes/ProtectedRoute.tsx — guard
- src/services/transactions.ts — Firestore CRUD
- src/pages/Dashboard.tsx — optimistic add, delete, totals, filters

## Notes
- Server data via Firestore SDK (simple & fast); Redux used for UI & auth.
- Can extend to RTK Query endpoints for Firestore later (server cache vs UI state).
- Firestore rules scoped per user: /users/{uid}/transactions/{id}
- Env vars via Vite `VITE_` keys.
