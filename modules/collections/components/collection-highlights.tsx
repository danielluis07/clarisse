import type { StoreCollection } from "@/modules/collections/types";
import { getCollectionHighlights } from "@/modules/collections/components/collection-utils";

export const CollectionHighlights = ({
  collection,
}: {
  collection: StoreCollection;
}) => {
  const highlights = getCollectionHighlights(collection);

  return (
    <section className="border-b border-foreground/10 bg-secondary">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <ul className="grid grid-cols-1 divide-y divide-foreground/10 sm:grid-cols-3 sm:divide-y-0">
          {highlights.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-4 py-8 sm:border-l sm:border-foreground/10 sm:px-8 sm:first:border-l-0 sm:first:pl-0">
              <span className="font-heading text-2xl font-light text-foreground/30 tabular-nums">
                0{index + 1}
              </span>
              <span className="text-sm text-foreground/75">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
