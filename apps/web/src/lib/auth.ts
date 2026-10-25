import { create } from 'zustand';
import { api, tokenStore } from './api';
import { useFavorites } from './favorites';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  loyaltyPoints: number;
  tier: string;
  preferredCurrency: string;
  wallet?: { balance: number; currency: string };
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password },
        false,
      );
      tokenStore.set(res.accessToken, res.refreshToken);
      set({ user: res.user, loading: false });
      useFavorites.getState().reset();
      void useFavorites.getState().ensure();
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'تعذّر تسجيل الدخول' });
      throw e;
    }
  },

  async register(payload) {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/register',
        payload,
        false,
      );
      tokenStore.set(res.accessToken, res.refreshToken);
      set({ user: res.user, loading: false });
      useFavorites.getState().reset();
      void useFavorites.getState().ensure();
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'تعذّر إنشاء الحساب' });
      throw e;
    }
  },

  async logout() {
    const refresh = tokenStore.getRefresh();
    if (refresh) await api.post('/auth/logout', { refreshToken: refresh }).catch(() => null);
    tokenStore.clear();
    useFavorites.getState().reset();
    set({ user: null });
  },

  async fetchMe() {
    if (!tokenStore.get()) return;
    try {
      const user = await api.get<AuthUser>('/users/me');
      set({ user });
    } catch {
      tokenStore.clear();
      useFavorites.getState().reset();
      set({ user: null });
    }
  },
}));
