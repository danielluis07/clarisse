import { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Fragment, type CSSProperties } from "react";

import { getStoreHeroBanner } from "@/modules/banners/storefront";
import {
  focalToPosition,
  HERO_IMAGE_FOCAL_CLASS,
  HERO_SECTION_ASPECT_CLASS,
  toFocalPoint,
} from "@/modules/banners/hero-layout";
import type { StoreBannersOutput } from "@/modules/banners/types";

type StoreBanner = StoreBannersOutput[number];
type StoreBannerImage = NonNullable<StoreBanner["image"]>;

const fallbackHero = {
  eyebrow: "Coleção Outono · Inverno 2026",
  title: "A elegância\ndo essencial",
  description:
    "Alfaiataria precisa, vestidos minimalistas e básicos elevados para uma rotina que pede presença, conforto e intenção.",
  image:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2400&auto=format&fit=crop",
  alt: "Modelo vestindo a nova coleção Outono Inverno da Clarisse",
  ctaLabel: "Ver novidades",
  ctaUrl: "/novidades",
};

const getHeroImageProps = ({
  desktopImage,
  mobileImage,
}: {
  desktopImage: StoreBannerImage | null;
  mobileImage: StoreBannerImage | null;
}) => {
  const desktopSrc = desktopImage?.url ?? mobileImage?.url ?? fallbackHero.image;
  const mobileSrc = mobileImage?.url ?? desktopSrc;
  const alt = desktopImage?.altText ?? mobileImage?.altText ?? fallbackHero.alt;
  const common = {
    alt,
    sizes: "100vw",
    className: `absolute inset-0 -z-10 size-full animate-in fade-in object-cover ${HERO_IMAGE_FOCAL_CLASS} duration-1600 ease-out`,
    fetchPriority: "high" as const,
  };

  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    src: desktopSrc,
    width: desktopImage?.width ?? 2400,
    height: desktopImage?.height ?? 1320,
    quality: 82,
  });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    src: mobileSrc,
    width: mobileImage?.width ?? 1080,
    height: mobileImage?.height ?? 1920,
    quality: 78,
  });

  return { desktop, mobile, imageProps: rest };
};

export const Hero = async () => {
  const banner = await getStoreHeroBanner();
  const { desktop, mobile, imageProps } = getHeroImageProps({
    desktopImage: banner?.image ?? null,
    mobileImage: banner?.mobileImage ?? null,
  });
  const title = banner?.title ?? fallbackHero.title;
  const titleLines = title.split(/\r?\n/).filter(Boolean);

  // Per-breakpoint focal point → `object-position`, applied via CSS variables so
  // the single <img> can anchor differently for the desktop and mobile crops.
  const focalStyle = {
    "--hero-focal-desktop": focalToPosition(
      toFocalPoint(banner?.focalX, banner?.focalY),
    ),
    "--hero-focal-mobile": focalToPosition(
      toFocalPoint(banner?.mobileFocalX, banner?.mobileFocalY),
    ),
  } as CSSProperties;

  return (
    <section
      className={`relative isolate flex ${HERO_SECTION_ASPECT_CLASS} min-h-136 w-full items-end overflow-hidden bg-neutral-900`}>
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop} />
        <source srcSet={mobile} />
        <img
          {...imageProps}
          alt={imageProps.alt}
          style={{ ...imageProps.style, ...focalStyle }}
        />
      </picture>
      {/* Scrim for legibility — anchored bottom-left where the copy sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/15 to-black/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-black/35 to-transparent"
      />

      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <div className="max-w-2xl">
          <p className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both text-[11px] uppercase tracking-[0.42em] text-white/80 delay-150 duration-700">
            {banner?.subtitle ?? fallbackHero.eyebrow}
          </p>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-6 font-heading text-5xl font-light leading-[0.95] tracking-tight text-white delay-200 duration-1000 md:text-7xl lg:text-[88px]">
            {titleLines.map((line, index) => (
              <Fragment key={`${line}-${index}`}>
                {line}
                {index < titleLines.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-7 max-w-md text-sm leading-relaxed text-white/75 delay-300 duration-1000 md:text-base">
            {banner?.description ?? fallbackHero.description}
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-10 flex flex-col gap-3 delay-500 duration-1000 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href={banner?.ctaUrl ?? fallbackHero.ctaUrl}
              className="group inline-flex items-center justify-center gap-3 bg-white px-9 py-4 text-[11px] uppercase tracking-[0.25em] text-black transition-colors hover:bg-white/90"
            >
              {banner?.ctaLabel ?? fallbackHero.ctaLabel}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/colecoes"
              className="group inline-flex items-center justify-center gap-2 px-2 py-4 text-[11px] uppercase tracking-[0.25em] text-white"
            >
              <span className="border-b border-white/40 pb-1 transition-colors group-hover:border-white">
                Explorar a coleção
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Discreet editorial marker, bottom-right. */}
      <span className="absolute bottom-8 right-6 hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/55 md:right-10 md:flex">
        <span className="h-px w-10 bg-white/40" />
        Editorial Nº 01
      </span>
    </section>
  );
};
