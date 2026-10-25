import { create } from 'zustand';
import { api, tokenStore } from './api';

interface FavoritesState {
  ids: string[];
  loaded: boolean;
  ensure: () => Promise<void>;
  toggle: (id: string) => Promise<boolean>;
  reset: () => void;
}

/** مزامنة المفضلة بين كل أنحاء الواجهة (القوائم، البطاقات، صفحة المفضلة) */
export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: [],
  loaded: false,

  async ensure() {
    if (get().loaded) return;
    if (!tokenStore.get()) {
      set({ ids: [], loaded: true });
      return;
    }
    try {
      const res = await api.get<any[]>('/favorites');
      set({
        ids: (res ?? []).map((f) => f?.property?.id).filter(Boolean),
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  async toggle(id) {
    if (!tokenStore.get()) return false;
    const before = get().ids;
    const on = before.includes(id);
    set({ ids: on ? before.filter((x) => x !== id) : [...before, id] });
    try {
      if (on) await api.del(`/favorites/${id}`);
      else await api.post('/favorites', { propertyId: id });
      return true;
    } catch {
      set({ ids: before });
      return false;
    }
  },

  reset: () => set({ ids: [], loaded: false }),
}));
