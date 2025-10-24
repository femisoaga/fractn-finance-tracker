import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: { auth: authReducer, ui: uiReducer },
});

function uiReducer(state = { filter: 'all' as 'all'|'income'|'expense' }, action: any) {
  switch (action.type) {
    case 'ui/setFilter': return { ...state, filter: action.payload };
    default: return state;
  }
}
export const setFilter = (f: 'all'|'income'|'expense') => ({ type: 'ui/setFilter', payload: f });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
