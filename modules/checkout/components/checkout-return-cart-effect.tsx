"use client";

import { useEffect } from "react";
import { useCartStore } from "@/modules/cart/hooks";

export const CheckoutReturnCartEffect = ({
  shouldClear,
}: {
  shouldClear: boolean;
}) => {
  const clearCart = useCartStore((state) => state.clearCart);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && shouldClear) clearCart();
  }, [clearCart, hasHydrated, shouldClear]);

  return null;
};
