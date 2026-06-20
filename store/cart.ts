import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  key: string; // unique line key
  type: "SMM" | "CHANNEL" | "GENERAL";
  refId: string; // SmmProduct.id / ChannelListing.id / GeneralProduct.id
  title: string;
  amount: number; // line total in KRW
  // SMM-only
  targetUrl?: string;
  // SMM + GENERAL
  quantity?: number;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          // Channels are unique stock; avoid duplicate channel lines.
          if (
            item.type === "CHANNEL" &&
            s.items.some((i) => i.type === "CHANNEL" && i.refId === item.refId)
          ) {
            return s;
          }
          return { items: [...s.items, item] };
        }),
      remove: (key) =>
        set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.amount, 0),
    }),
    { name: "cart-v1" }
  )
);
