import { beforeEach, describe, expect, test } from "bun:test";
import type { AddCartItemInput, CartItem } from "@/types/cart";

const storage = new Map<string, string>();

globalThis.localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, value),
  removeItem: (key: string) => void storage.delete(key),
  clear: () => void storage.clear(),
  key: (index: number) => [...storage.keys()][index] ?? null,
  get length() {
    return storage.size;
  },
} as Storage;

const {
  useCartStore,
  getCartItemCount,
  getCartSubtotalCents,
  getCartLineTotalCents,
} = await import("@/hooks/cart");

const makeItem = (
  overrides: Partial<AddCartItemInput> = {},
): AddCartItemInput => ({
  productVariantId: "variant-1",
  productId: "product-1",
  productName: "Blazer Aurora",
  productSlug: "blazer-aurora",
  imageUrl: null,
  imageAlt: "Blazer Aurora",
  sku: "SKU-001",
  colorName: "Black",
  colorHex: "#111111",
  size: "M",
  unitPriceCents: 19990,
  compareAtPriceCents: 24990,
  maxQuantity: 10,
  ...overrides,
});

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  ...makeItem(),
  quantity: 1,
  addedAt: "2026-06-16T00:00:00.000Z",
  updatedAt: "2026-06-16T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  storage.clear();
  useCartStore.setState({ items: [] });
});

describe("cart math", () => {
  test("computes item count, subtotal, and line totals in cents", () => {
    const first = makeCartItem({
      productVariantId: "variant-1",
      unitPriceCents: 19990,
      quantity: 2,
    });
    const second = makeCartItem({
      productVariantId: "variant-2",
      productId: "product-2",
      productName: "Tailored Pant",
      productSlug: "tailored-pant",
      imageAlt: "Tailored Pant",
      sku: "SKU-002",
      colorName: "Beige",
      colorHex: "#d9cbb8",
      size: "S",
      unitPriceCents: 12500,
      compareAtPriceCents: null,
      quantity: 3,
    });

    expect(getCartItemCount([])).toBe(0);
    expect(getCartSubtotalCents([])).toBe(0);
    expect(getCartLineTotalCents(first)).toBe(39980);
    expect(getCartItemCount([first, second])).toBe(5);
    expect(getCartSubtotalCents([first, second])).toBe(77480);
  });

  test("addItem clamps quantities to at least one", () => {
    useCartStore
      .getState()
      .addItem(makeItem({ productVariantId: "variant-2" }), 0);
    const firstItem = useCartStore.getState().items[0];

    useCartStore
      .getState()
      .addItem(makeItem({ productVariantId: "variant-3" }), -5);
    const secondItem = useCartStore.getState().items[1];

    expect(firstItem.quantity).toBe(1);
    expect(secondItem.quantity).toBe(1);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  test("addItem merges existing variants and respects maxQuantity", () => {
    const item = makeItem({ productVariantId: "variant-4", maxQuantity: 4 });

    useCartStore.getState().addItem(item, 2);
    useCartStore.getState().addItem(item, 3);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  test("addItem ignores variants that cannot store any quantity", () => {
    useCartStore
      .getState()
      .addItem(makeItem({ productVariantId: "variant-5", maxQuantity: 0 }), 2);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  test("updateItemQuantity caps quantities at the cart maximum", () => {
    useCartStore
      .getState()
      .addItem(
        makeItem({ productVariantId: "variant-6", maxQuantity: null }),
        1,
      );
    useCartStore.getState().updateItemQuantity("variant-6", 500);

    expect(useCartStore.getState().items[0].quantity).toBe(99);
  });

  test("updateItemQuantity normalizes non-finite quantities to one", () => {
    useCartStore
      .getState()
      .addItem(makeItem({ productVariantId: "variant-7" }), 2);
    useCartStore.getState().updateItemQuantity("variant-7", Number.NaN);

    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  test("decrementItem removes single-quantity items and incrementItem ignores missing items", () => {
    useCartStore
      .getState()
      .addItem(makeItem({ productVariantId: "variant-8" }), 1);
    useCartStore.getState().decrementItem("variant-8");
    useCartStore.getState().incrementItem("missing-variant");

    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
