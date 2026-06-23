import { describe, expect, test } from "bun:test";
import type { StoreCollection } from "@/modules/collections/types";
import {
  formatPieceCount,
  getCollectionDescription,
  getCollectionEyebrow,
  getCollectionImage,
} from "@/components/store/collections/collection-utils";

const makeStoreCollection = (
  overrides: Partial<StoreCollection> = {},
): StoreCollection => ({
  id: "col-1",
  name: "Soft Tailoring",
  slug: "soft-tailoring",
  description: "Alfaiataria repensada para o dia a dia",
  isFeatured: false,
  displayOrder: 0,
  seoTitle: "Soft Tailoring Collection",
  seoDescription: "Shop our soft tailoring collection",
  productCount: 18,
  image: {
    id: "img-1",
    url: "https://example.com/image.jpg",
    filename: "image.jpg",
    altText: "Soft tailoring model",
    mimeType: "image/jpeg",
    width: 1920,
    height: 1080,
  },
  ...overrides,
});

describe("collection-utils", () => {
  describe("formatPieceCount", () => {
    test("returns singular form for 1 piece", () => {
      expect(formatPieceCount(1)).toBe("1 peça");
    });

    test("returns plural form for multiple pieces", () => {
      expect(formatPieceCount(2)).toBe("2 peças");
      expect(formatPieceCount(18)).toBe("18 peças");
      expect(formatPieceCount(100)).toBe("100 peças");
    });

    test("returns plural form for zero pieces", () => {
      expect(formatPieceCount(0)).toBe("0 peças");
    });
  });

  describe("getCollectionDescription", () => {
    test("returns collection description when present", () => {
      const collection = makeStoreCollection({
        description: "Custom collection description",
      });
      expect(getCollectionDescription(collection)).toBe(
        "Custom collection description",
      );
    });

    test("returns default description when description is null", () => {
      const collection = makeStoreCollection({ description: null });
      const result = getCollectionDescription(collection);
      expect(result).toContain("Uma curadoria Clarisse de peças essenciais");
    });
  });

  describe("getCollectionEyebrow", () => {
    test("returns 'Coleção em destaque' for featured collections", () => {
      const collection = makeStoreCollection({ isFeatured: true });
      expect(getCollectionEyebrow(collection)).toBe("Coleção em destaque");
    });

    test("returns 'Coleção Clarisse' for non-featured collections", () => {
      const collection = makeStoreCollection({ isFeatured: false });
      expect(getCollectionEyebrow(collection)).toBe("Coleção Clarisse");
    });
  });

  describe("getCollectionImage", () => {
    test("returns collection image URL and alt text when image exists", () => {
      const collection = makeStoreCollection({
        image: {
          id: "img-1",
          url: "https://example.com/collection.jpg",
          filename: "collection.jpg",
          altText: "Collection alt text",
          mimeType: "image/jpeg",
          width: 1920,
          height: 1080,
        },
      });
      const result = getCollectionImage(collection);
      expect(result.src).toBe("https://example.com/collection.jpg");
      expect(result.alt).toBe("Collection alt text");
    });

    test("returns fallback image when image is null", () => {
      const collection = makeStoreCollection({ image: null, displayOrder: 0 });
      const result = getCollectionImage(collection);
      expect(result.src).toContain("unsplash.com");
      expect(result.alt).toContain("Editorial da coleção");
      expect(result.alt).toContain(collection.name);
    });

    test("cycles through fallback images based on displayOrder", () => {
      const collection1 = makeStoreCollection({
        image: null,
        displayOrder: 0,
      });
      const collection2 = makeStoreCollection({
        image: null,
        displayOrder: 1,
      });
      const collection3 = makeStoreCollection({
        image: null,
        displayOrder: 2,
      });
      const collection4 = makeStoreCollection({
        image: null,
        displayOrder: 3,
      });

      const src1 = getCollectionImage(collection1).src;
      const src2 = getCollectionImage(collection2).src;
      const src3 = getCollectionImage(collection3).src;
      const src4 = getCollectionImage(collection4).src;

      expect(src1).not.toBe(src2);
      expect(src2).not.toBe(src3);
      expect(src1).toBe(src4); // displayOrder 0 and 3 should wrap around
    });

    test("returns computed alt text with fallback image", () => {
      const collection = makeStoreCollection({
        name: "Office Essentials",
        image: null,
      });
      const result = getCollectionImage(collection);
      expect(result.alt).toBe("Editorial da coleção Office Essentials");
    });
  });
});
