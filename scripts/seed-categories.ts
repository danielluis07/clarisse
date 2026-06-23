import { env } from "@/lib/env";
import { db } from "@/db";
import { categories } from "@/db/schema";

type CategorySeed = {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
};

const categorySeeds: CategorySeed[] = [
  {
    name: "Blazers",
    slug: "blazers",
    description:
      "Tailored blazers and structured jackets for a sophisticated look",
    isActive: true,
    displayOrder: 1,
    seoTitle: "Women's Blazers | Clarisse",
    seoDescription:
      "Discover our curated collection of tailored blazers designed for the modern woman",
  },
  {
    name: "Pants",
    slug: "pants",
    description: "Elegant trousers and tailored pants in premium fabrics",
    isActive: true,
    displayOrder: 2,
    seoTitle: "Women's Pants | Clarisse",
    seoDescription:
      "Shop our collection of expertly tailored pants and trousers",
  },
  {
    name: "Dresses",
    slug: "dresses",
    description: "Minimalist and sophisticated dresses for every occasion",
    isActive: true,
    displayOrder: 3,
    seoTitle: "Women's Dresses | Clarisse",
    seoDescription:
      "Explore our editorial collection of minimal, elegant dresses",
  },
  {
    name: "Shirts",
    slug: "shirts",
    description: "Oversized and fitted shirts in premium materials",
    isActive: true,
    displayOrder: 4,
    seoTitle: "Women's Shirts | Clarisse",
    seoDescription: "Browse premium women's shirts and blouses from Clarisse",
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Sophisticated bags and accessories for the discerning woman",
    isActive: true,
    displayOrder: 5,
    seoTitle: "Women's Bags | Clarisse",
    seoDescription: "Discover our curated selection of designer-inspired bags",
  },
];

async function main() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed categories");
  }

  const rows = categorySeeds.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    imageId: null,
    isActive: category.isActive ?? true,
    displayOrder: category.displayOrder ?? 0,
    seoTitle: category.seoTitle ?? null,
    seoDescription: category.seoDescription ?? null,
  }));

  await db
    .insert(categories)
    .values(rows)
    .onConflictDoNothing({ target: categories.slug });

  console.log(`Seeded ${rows.length} categories`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
