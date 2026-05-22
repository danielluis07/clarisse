export type CartItem = {
  productVariantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  imageAlt: string;
  sku: string;
  colorName: string;
  colorHex: string | null;
  size: string;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  maxQuantity: number | null;
  quantity: number;
  addedAt: string;
  updatedAt: string;
};

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  addItem: (item: AddCartItemInput, quantity?: number) => void;
  updateItemQuantity: (productVariantId: string, quantity: number) => void;
  incrementItem: (productVariantId: string) => void;
  decrementItem: (productVariantId: string) => void;
  removeItem: (productVariantId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export type AddCartItemInput = Omit<
  CartItem,
  "quantity" | "addedAt" | "updatedAt"
>;
