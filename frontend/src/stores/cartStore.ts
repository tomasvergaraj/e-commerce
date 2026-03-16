import { create } from 'zustand';
import { cartApi } from '@/api/services';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  product: any;
  variant?: any;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  loading: boolean;
  cartId: string | null;
  cartPulseTick: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  loading: false,
  cartId: null,
  cartPulseTick: 0,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const res = await cartApi.get();
      const data = res.data || res;
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        itemCount: data.itemCount || 0,
        cartId: data.id,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, variantId, quantity = 1) => {
    try {
      set({ loading: true });
      const res = await cartApi.addItem({ productId, variantId, quantity });
      const data = res.data || res;
      set((state) => ({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        itemCount: data.itemCount || 0,
        loading: false,
        cartPulseTick: state.cartPulseTick + 1,
      }));
    } catch {
      set({ loading: false });
      throw new Error('Error al agregar');
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const res = await cartApi.updateItem(itemId, { quantity });
      const data = res.data || res;
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        itemCount: data.itemCount || 0,
      });
    } catch {}
  },

  removeItem: async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      const data = res.data || res;
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        itemCount: data.itemCount || 0,
      });
    } catch {}
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ items: [], subtotal: 0, itemCount: 0 });
    } catch {}
  },
}));
