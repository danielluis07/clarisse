import { db } from "@/db";
import { collections } from "@/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed collections");
  }

  await db
    .insert(collections)
    .values({
      name: "Inverno",
      slug: "inverno",
      description: "Curated winter essentials and cold-weather tailoring",
      imageId: null,
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
      seoTitle: "Inverno Collection | Clarisse",
      seoDescription:
        "Discover the Inverno collection with refined winter pieces and elevated layers.",
    })
    .onConflictDoNothing({ target: collections.slug });

  console.log('Seeded collection "Inverno"');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
