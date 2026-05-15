<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Overview

This project is a fictional brazilian women's editorial fashion e-commerce called Clarisse.

The goal is to build a modern, production-ready e-commerce platform inspired by Shopify-like experiences. The application includes a public storefront and an admin dashboard where the store owner can manage products, categories, collections, product variants, inventory, images, and other store data.

The project uses a fullstack TypeScript stack with tools like Next.js, Drizzle ORM, Neon Database, tRPC, Zod, React Hook Form, Tailwind CSS, shadcn/ui, Better Auth and AWS S3.

# Product Modeling

Products are modeled in a realistic e-commerce structure.

A product represents the general item, while product variants represent the actual purchasable units.

Every product must have at least one variant, even if it is a simple product without visible options.

Examples:

- Blazer Aurora / Black / S
- Blazer Aurora / Black / M
- Élise Bag / Black / One Size

# Variants

Not every product has both color and size variants.

Examples:

- Clothing products may have color and size variants.
- Bags may have only color variants.
- Simple accessories may have a single internal variant.

For simple products, create one default variant using values like:

- colorName: "Default" or "One Color"
- size: "One Size"

Avoid implementing separate cart logic for products with and without variants. Always use variants.
