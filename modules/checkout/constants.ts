export const CHECKOUT_MAX_ITEM_QUANTITY = 99;
export const FREE_SHIPPING_THRESHOLD_CENTS = 80000;
export const STANDARD_SHIPPING_CENTS = 2900;
export const CHECKOUT_INSTALLMENTS = 6;

export const getCheckoutShippingCents = (subtotalCents: number) =>
  subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
