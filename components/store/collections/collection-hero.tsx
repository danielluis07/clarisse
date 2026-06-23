import Image from "next/image";

import type { StoreCollection } from "@/modules/collections/types";
import {
  formatPieceCount,
  getCollectionDescription,
  getCollectionEyebrow,
  getCollectionImage,
} from "@/components/store/collections/collection-utils";

export const CollectionHero = ({
  collection,
}: {
  collection: StoreCollection;
}) => {
  const image = getCollectionImage(collection);

  return (
    <section className="relative isolate flex min-h-[68svh] w-full items-end overflow-hidden bg-neutral-900">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-black/5"
      />
      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-28 md:px-10 md:pb-20">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.36em] text-white/75">
            {getCollectionEyebrow(collection)} · Curadoria
          </p>
          <h1 className="mt-6 font-heading text-5xl font-light leading-[0.95] tracking-tight text-white md:text-7xl">
            {collection.name}
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
            {getCollectionDescription(collection)}
          </p>
        </div>
      </div>
      <span className="absolute bottom-8 right-6 hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/55 md:right-10 md:flex">
        <span className="h-px w-10 bg-white/40" />
        {formatPieceCount(collection.productCount)}
      </span>
    </section>
  );
};
