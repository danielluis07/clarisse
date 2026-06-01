<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Dev Server

I prefer to run the dev server myself when I’m ready to test changes.

# Project Overview

This project is a fictional Brazilian women's editorial fashion e-commerce called Clarisse.

The goal is to build a modern, production-ready e-commerce platform inspired by Shopify-like experiences. The application includes a public storefront and an admin dashboard where the store owner can manage products, categories, collections, product variants, inventory, images, content sections, and store settings.

The project uses a fullstack TypeScript stack with tools like Next.js, Drizzle ORM, Neon Database, tRPC, Zod, React Hook Form, Tailwind CSS, shadcn/ui, Better Auth, Date Fns and AWS S3.

Clarisse should feel like a premium, minimal, editorial fashion brand. The storefront should focus on women's fashion products such as blazers, tailored pants, minimalist dresses, oversized shirts, sophisticated bags, skirts, and premium basics.

# App API pattern

This app uses React Server Components, the fetch adapter, and @trpc/tanstack-react-query.

Key features:

Server Components - Prefetch data on the server and stream it to the client
Streaming - Leverage Next.js streaming for optimal loading performance
Suspense - Use useSuspenseQuery with Suspense boundaries for loading states

# Core Storefront Concept

The public storefront is the customer-facing part of the application.

It should present Clarisse as a sophisticated women's fashion brand with a clean, editorial, premium shopping experience.

The storefront should include:

- Home page with hero sections, featured collections, editorial banners, and highlighted products.
- Product listing pages.
- Product detail pages.
- Category pages.
- Collection pages.
- Search and filtering experiences.
- Cart experience.
- Checkout flow, even if initially simulated or simplified.
- Order success page.

The storefront should not feel like a generic CRUD interface. It should feel like a real fashion e-commerce website.

# Categories vs Collections

Categories and collections have different responsibilities.

## Categories

Categories represent the actual product type.

A product should usually belong to one primary category.

Examples:

- Blazers
- Pants
- Dresses
- Shirts
- Bags
- Skirts
- Tops

Use categories for structural navigation and filtering.

Example:

- Product: Blazer Aurora
- Category: Blazers

## Collections

Collections represent commercial, editorial, seasonal, or curated groupings.

A product may belong to multiple collections.

Examples:

- Office Essentials
- Soft Tailoring
- Minimal Dresses
- Evening Edit
- Capsule Wardrobe
- New Arrivals
- Best Sellers

Use collections for homepage sections, campaign pages, editorial navigation, and merchandising.

Example:

- Product: Blazer Aurora
- Category: Blazers
- Collections: Office Essentials, Soft Tailoring, Capsule Wardrobe

# Admin Dashboard Overview

The admin dashboard is the store management area.

It should allow the store owner or admin user to manage the data and content shown in the public storefront.

The admin should be able to customize and manage:

- Products.
- Product variants.
- Product inventory.
- Product images.
- Categories.
- Collections.
- Orders.
- Customers.
- Coupons.
- Media assets.
- Storefront banners.
- Store settings.
- Admin users, when user management is implemented.

The dashboard should be organized in a way that resembles a real e-commerce CMS/admin panel.

# What Admin Can Customize

The admin dashboard should control the main data that powers the storefront.

## Products

Admins should be able to:

- Create products.
- Edit products.
- Archive products.
- Publish and unpublish products.
- Set product name, slug, subtitle, and description.
- Assign a primary category.
- Assign one or more collections.
- Set base price, compare-at price, and internal cost.
- Mark products as featured.
- Configure material, fit, and care instructions.
- Configure SEO title and SEO description.
- Manage product images.
- Manage product variants.

Products should support the statuses:

- `draft`
- `active`
- `archived`

Only active products should appear in the public storefront by default.

## Variants

Admins should be able to create and edit variants for each product.

A variant is the actual purchasable unit.

Admins should be able to manage:

- SKU.
- Color name.
- Color hex value.
- Size.
- Variant-specific price.
- Variant-specific compare-at price.
- Stock quantity.
- Weight in grams.
- Active/inactive status.

The admin UI should support generating variants from selected colors and sizes.

Examples:

- Black / S
- Black / M
- Beige / S
- Beige / M

For bags or simple accessories, variants may use `One Size` or a similar default value.

## Inventory

Inventory should be managed at the variant level, not only at the product level.

The inventory page should display variant-level rows such as:

- Product name.
- SKU.
- Color.
- Size.
- Stock.
- Status.

Low-stock states can be shown in the dashboard and inventory table.

## Categories

Admins should be able to:

- Create categories.
- Edit categories.
- Set category name and slug.
- Add optional category description.
- Add optional category image.
- Activate or deactivate categories.

Categories should be used for product type navigation in the storefront.

## Collections

Admins should be able to:

- Create collections.
- Edit collections.
- Set collection name and slug.
- Add collection description.
- Add collection image or banner.
- Activate or deactivate collections.
- Assign products to collections.
- Mark collections as featured when needed.

Collections should be used for editorial and commercial storefront sections.

## Media

Admins should be able to upload and manage media assets, especially product and banner images.

Media should be stored externally, such as in AWS S3.

The media area may support:

- Uploading images.
- Listing uploaded images.
- Copying image URLs.
- Selecting images for products, categories, collections, and banners.
- Deleting unused assets when safe.

## Banners

Admins should be able to customize storefront banners and editorial sections.

Banners may include:

- Hero banner.
- Collection banner.
- Promotional banner.
- Editorial content block.

Banner fields may include:

- Title.
- Subtitle.
- Description.
- Image.
- CTA label.
- CTA URL.
- Placement.
- Status.
- Display order.

Banners should power sections on the homepage and other storefront pages.

## Orders

Admins should be able to view and manage orders.

Orders may include:

- Order number.
- Customer information.
- Purchased items.
- Variant details.
- Payment status.
- Fulfillment status.
- Total amount.
- Shipping address.
- Created date.

Common order statuses:

- `pending`
- `paid`
- `processing`
- `shipped`
- `delivered`
- `canceled`
- `refunded`

## Customers

Admins should be able to view customers when customer accounts or checkout customer data are implemented.

Customer data may include:

- Name.
- Email.
- Phone.
- Total orders.
- Total spent.
- Created date.

## Coupons

Admins should be able to create and manage discount coupons.

Coupon fields may include:

- Code.
- Discount type.
- Discount value.
- Start date.
- Expiration date.
- Usage limit.
- Active/inactive status.

Supported discount types may include:

- `percentage`
- `fixed_amount`
- `free_shipping`

## Store Settings

Admins should be able to customize general store information.

Store settings may include:

- Store name.
- Store description.
- Contact email.
- WhatsApp number.
- Instagram URL.
- Logo.
- Currency.
- Country.
- Default shipping information.
- SEO defaults.

Store settings should be used by the storefront whenever possible instead of hardcoded values.

# Product Modeling

Products are modeled in a realistic e-commerce structure.

A product represents the general item, while product variants represent the actual purchasable units.

Every product must have at least one variant, even if it is a simple product without visible options.

Examples:

- Blazer Aurora / Black / S
- Blazer Aurora / Black / M
- Élise Bag / Black / One Size

The cart, checkout, and order items should reference `productVariantId`, not only `productId`.

# Variants

Not every product has both color and size variants.

Examples:

- Clothing products may have color and size variants.
- Bags may have only color variants.
- Simple accessories may have a single internal variant.

For simple products, create one default variant using values like:

- colorName: `Default`, `One Color`, or the actual color name.
- size: `One Size`.

Avoid implementing separate cart logic for products with and without variants. Always use variants.
