import { create } from 'zustand';
import { wishlistApi } from '@/api/services';

type WishlistItem = {
  productId: string;
};

interface WishlistState {
  ids: string[];
  isLoaded: boolean;
  isFetching: boolean;
  lastUserId: string | null;
  sync: (userId: string, force?: boolean) => Promise<void>;
  setIds: (ids: string[]) => void;
  setInWishlist: (productId: string, inWishlist: boolean) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  isLoaded: false,
  isFetching: false,
  lastUserId: null,
  sync: async (userId, force = false) => {
    const state = get();
    if (!userId) {
      set({ ids: [], isLoaded: false, isFetching: false, lastUserId: null });
      return;
    }

    if (state.isFetching) return;
    if (!force && state.isLoaded && state.lastUserId === userId) return;

    set({ isFetching: true, lastUserId: userId });

    try {
      const response = await wishlistApi.getAll();
      const payload = ((response as any)?.data || response || []) as WishlistItem[];
      const ids = payload.map((item) => item.productId);
      set({
        ids: Array.from(new Set(ids)),
        isLoaded: true,
        isFetching: false,
        lastUserId: userId,
      });
    } catch (error) {
      set({ isFetching: false });
      throw error;
    }
  },
  setIds: (ids) => set({
    ids: Array.from(new Set(ids)),
    isLoaded: true,
  }),
  setInWishlist: (productId, inWishlist) => set((state) => {
    const exists = state.ids.includes(productId);

    if (inWishlist && !exists) {
      return {
        ids: [...state.ids, productId],
        isLoaded: true,
      };
    }

    if (!inWishlist && exists) {
      return {
        ids: state.ids.filter((id) => id !== productId),
        isLoaded: true,
      };
    }

    return state;
  }),
  clear: () => set({
    ids: [],
    isLoaded: false,
    isFetching: false,
    lastUserId: null,
  }),
}));
