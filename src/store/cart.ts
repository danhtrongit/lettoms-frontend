"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, colorCode: string, sizeCode: string) => void;
  updateQuantity: (
    productId: string,
    colorCode: string,
    sizeCode: string,
    quantity: number
  ) => void;
  clear: () => void;
}

function sameLine(a: CartItem, productId: string, colorCode: string, sizeCode: string) {
  return (
    a.productId === productId &&
    a.colorCode === colorCode &&
    a.sizeCode === sizeCode
  );
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, item.colorCode, item.sizeCode)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.colorCode, item.sizeCode)
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, colorCode, sizeCode) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, productId, colorCode, sizeCode)
          ),
        })),
      updateQuantity: (productId, colorCode, sizeCode, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, colorCode, sizeCode)
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "letoms-cart" }
  )
);

// Derived selectors (call with the hook)
export const selectCartCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
