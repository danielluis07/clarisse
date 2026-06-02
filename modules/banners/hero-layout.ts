/**
 * Single source of truth for the home hero geometry.
 *
 * Both the live storefront hero (`components/store/home/hero.tsx`) and the
 * admin preview (`modules/banners/components/banner-form-grid.tsx`) consume
 * these constants so the crop the merchant sees in the editor is exactly what
 * renders on the site (WYSIWYG).
 *
 * The hero is aspect-ratio driven — not viewport-height driven — so a
 * correctly-sized upload crops identically on every screen of a given
 * breakpoint instead of depending on the visitor's window height.
 *
 * NOTE: Tailwind scans source files for *literal* class strings, so the
 * arbitrary `aspect-[…]` / `[object-position:…]` classes must appear verbatim
 * here. Build them dynamically and they won't be generated.
 */

/** Desktop crop ratio — matches the 2400x960 (5:2) desktop upload guidance. */
export const HERO_DESKTOP_ASPECT_CLASS = "aspect-5/2";

/** Mobile crop ratio — matches the 1080x1350 (4:5) mobile upload guidance. */
export const HERO_MOBILE_ASPECT_CLASS = "aspect-4/5";

/**
 * Responsive aspect for the full-bleed hero section: editorial portrait on
 * mobile, wide from `md` up. `max-h-[86svh]` is a safety cap so the hero
 * never grows taller than the viewport on ultrawide monitors (where it crops
 * the sides, guided by the focal point).
 */
export const HERO_SECTION_ASPECT_CLASS =
  "aspect-4/5 md:aspect-5/2 max-h-[86svh]";

/**
 * Object-position classes wired to per-breakpoint CSS variables. The variables
 * themselves are set inline from the banner's focal point — keeping the dynamic
 * percentages out of the class names so Tailwind can still generate the rules.
 */
export const HERO_IMAGE_FOCAL_CLASS =
  "[object-position:var(--hero-focal-mobile)] md:[object-position:var(--hero-focal-desktop)]";

/** Default focal point (percent) — dead center, matching `object-center`. */
export const DEFAULT_FOCAL_POINT = { x: 50, y: 50 } as const;

export type FocalPoint = { x: number; y: number };

/** Clamp a possibly-missing focal coordinate to the valid 0–100 range. */
export const clampFocalCoord = (value: number | null | undefined): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_FOCAL_POINT.x;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
};

/** Build a normalized focal point from raw (nullable) coordinates. */
export const toFocalPoint = (
  x: number | null | undefined,
  y: number | null | undefined,
): FocalPoint => ({ x: clampFocalCoord(x), y: clampFocalCoord(y) });

/** Render a focal point as a CSS `object-position` / `background-position` value. */
export const focalToPosition = (focal: FocalPoint): string =>
  `${clampFocalCoord(focal.x)}% ${clampFocalCoord(focal.y)}%`;
