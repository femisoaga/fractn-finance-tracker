import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type User = { uid: string; email: string | null } | null;
const slice = createSlice({
  name: 'auth',
  initialState: { user: null as User, loading: true },
  reducers: {
    setUser: (s, a: PayloadAction<User>) => { s.user = a.payload; s.loading = false; },
    setLoading: (s, a: PayloadAction<boolean>) => { s.loading = a.payload; },
  },
});
export const { setUser, setLoading } = slice.actions;
export default slice.reducer;
