# Fractn Finance Tracker (Slim)
React + Vite + Firebase (Auth/Firestore) + Redux Toolkit + Tailwind

**Live:** https://fractn-finance-tracker-jhdk.vercel.app/login
**Repo:** https://github.com/femisoaga/fractn-finance-tracker  

## What to review
- `src/lib/firebase.ts` — Firebase init
- `src/services/transactions.ts` — Firestore CRUD (per-user)
- `src/pages/Login.tsx` — Auth (Firebase)
- `src/pages/Dashboard.tsx` — Protected route, CRUD, totals, filters
- `src/app/store.ts`, `src/features/auth/authSlice.ts`, `src/features/ui/uiSlice.ts` — Redux (auth/UI)

## Notes
- Firestore rules isolate user data per `uid`.
- Env vars via Vite `VITE_` keys (`.env.example` provided).
- Redux handles auth & UI state, Firestore handles persistence.
- Deployed on Vercel with Firebase Auth + Firestore.

## Run locally
```bash
npm i
cp .env.example .env  # add your Firebase keys
npm run dev
