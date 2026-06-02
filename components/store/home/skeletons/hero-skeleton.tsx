import { HERO_SECTION_ASPECT_CLASS } from "@/modules/banners/hero-layout";

/**
 * Loading state for the home hero. Mirrors the real hero's geometry and
 * bottom-left content layout (eyebrow → title → description → CTAs) so the
 * swap to the loaded hero is seamless rather than a jarring block-to-content
 * pop. Same aspect ratio + `min-h-112` as `Hero`, so there's no layout shift.
 */
export const HeroSkeleton = () => (
  <section
    aria-hidden="true"
    className={`relative isolate flex ${HERO_SECTION_ASPECT_CLASS} min-h-112 w-full items-end overflow-hidden bg-neutral-900`}>
    {/* Soft animated wash standing in for the image. */}
    <div className="absolute inset-0 -z-10 animate-pulse bg-linear-to-br from-neutral-800 via-neutral-900 to-neutral-950" />
    {/* Match the hero scrim so the loaded state feels continuous. */}
    <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/15 to-black/5" />

    <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-28 md:px-10 md:pb-24">
      <div className="flex max-w-2xl flex-col gap-6">
        {/* eyebrow */}
        <div className="h-2.5 w-44 animate-pulse rounded-full bg-white/15" />

        {/* title (two lines) */}
        <div className="flex flex-col gap-3">
          <div className="h-11 w-4/5 animate-pulse rounded-md bg-white/15 md:h-16" />
          <div className="h-11 w-3/5 animate-pulse rounded-md bg-white/15 md:h-16" />
        </div>

        {/* description */}
        <div className="flex max-w-md flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
        </div>

        {/* CTAs — sharp-cornered to match the real buttons */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="h-12 w-44 animate-pulse bg-white/20" />
          <div className="h-12 w-40 animate-pulse bg-white/10" />
        </div>
      </div>
    </div>
  </section>
);
