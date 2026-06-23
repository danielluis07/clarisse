"use client";

import { useEffect } from "react";
import { useCartStore } from "@/hooks/cart";

export const CheckoutReturnCartEffect = ({
  shouldClear,
}: {
  shouldClear: boolean;
}) => {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (shouldClear) clearCart();
  }, [clearCart, shouldClear]);

  return null;
};
