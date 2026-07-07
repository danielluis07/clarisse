"use client";

import "client-only";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, CartState } from "@/types/cart";

const CART_STORAGE_KEY = "clarisse-cart-v1";
const MAX_CART_QUANTITY = 99;

const clampQuantity = (quantity: number, maxQuantity: number | null) => {
  const normalized = Number.isFinite(quantity) ? Math.trunc(quantity) : 1;
  const upperBound =
    typeof maxQuantity === "number"
      ? Math.max(1, Math.min(maxQuantity, MAX_CART_QUANTITY))
      : MAX_CART_QUANTITY;

  return Math.max(1, Math.min(normalized, upperBound));
};

const canStoreItem = (maxQuantity: number | null) =>
  typeof maxQuantity !== "number" || maxQuantity > 0;

export const getCartItemCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const getCartSubtotalCents = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);

export const getCartLineTotalCents = (item: CartItem) =>
  item.unitPriceCents * item.quantity;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      addItem: (item, quantity = 1) => {
        if (!canStoreItem(item.maxQuantity)) return;

        const now = new Date().toISOString();

        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.productVariantId === item.productVariantId,
          );

          if (!existing) {
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  quantity: clampQuantity(quantity, item.maxQuantity),
                  addedAt: now,
                  updatedAt: now,
                },
              ],
            };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.productVariantId === item.productVariantId
                ? {
                    ...cartItem,
                    ...item,
                    quantity: clampQuantity(
                      cartItem.quantity + quantity,
                      item.maxQuantity,
                    ),
                    addedAt: cartItem.addedAt,
                    updatedAt: now,
                  }
                : cartItem,
            ),
          };
        });
      },
      updateItemQuantity: (productVariantId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productVariantId === productVariantId
              ? {
                  ...item,
                  quantity: clampQuantity(quantity, item.maxQuantity),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        }));
      },
      incrementItem: (productVariantId) => {
        const item = get().items.find(
          (cartItem) => cartItem.productVariantId === productVariantId,
        );

        if (!item) return;
        get().updateItemQuantity(productVariantId, item.quantity + 1);
      },
      decrementItem: (productVariantId) => {
        const item = get().items.find(
          (cartItem) => cartItem.productVariantId === productVariantId,
        );

        if (!item) return;
        if (item.quantity <= 1) {
          get().removeItem(productVariantId);
          return;
        }

        get().updateItemQuantity(productVariantId, item.quantity - 1);
      },
      removeItem: (productVariantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.productVariantId !== productVariantId,
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCartOpen: (isOpen) => set({ isOpen }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
