import Link from "next/link";

import { getStoreCategories } from "@/modules/categories/storefront";

const CATEGORY_NAV_LIMIT = 8;

export const HeaderNav = async () => {
  const categories = await getStoreCategories({ limit: CATEGORY_NAV_LIMIT });

  if (!categories.length) {
    return null;
  }

  return (
    <nav className="hidden border-t border-foreground/10 lg:block">
      <ul className="mx-auto flex max-w-screen-2xl items-center justify-center gap-12 px-10 py-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={{
                pathname: "/products",
                query: { categoryId: category.id },
              }}
              className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const HeaderNavSkeleton = () => {
  return (
    <nav
      aria-hidden="true"
      className="hidden border-t border-foreground/10 lg:block">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-center gap-12 px-10 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded-full bg-linear-to-r from-foreground/5 via-foreground/15 to-foreground/5"
            style={{
              width: `${index % 2 === 0 ? 4.75 : 6.25}rem`,
            }}
          />
        ))}
      </div>
    </nav>
  );
};
