import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AddressSnapshot } from "@/types/db";
import { id, timestamps } from "@/lib/db-utils";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const mediaAssetTypeEnum = pgEnum("media_asset_type", [
  "image",
  "video",
  "document",
]);

export const bannerPlacementEnum = pgEnum("banner_placement", [
  "home_hero",
  "home_featured",
  "collection_page",
  "category_page",
  "product_page",
  "promotional",
  "editorial",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "active",
  "archived",
]);

export const cartStatusEnum = pgEnum("cart_status", [
  "active",
  "converted",
  "abandoned",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "returned",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed_amount",
  "free_shipping",
]);

export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "adjustment",
  "restock",
  "sale",
  "return",
  "correction",
]);

// ============================================================================
// AUTH TABLES AND USER
// ============================================================================

export const user = pgTable("user", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const session = pgTable("session", {
  id: id(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  impersonatedBy: text("impersonated_by"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: id(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const verification = pgTable("verification", {
  id: id(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// MEDIA AND CONTENT
// ============================================================================

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: id(),
    key: text("key").notNull(),
    url: text("url").notNull(),
    bucket: text("bucket"),
    filename: text("filename").notNull(),
    altText: text("alt_text"),
    mimeType: text("mime_type").notNull(),
    type: mediaAssetTypeEnum("type").notNull().default("image"),
    sizeBytes: integer("size_bytes"),
    width: integer("width"),
    height: integer("height"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("media_assets_key_idx").on(table.key),
    index("media_assets_created_by_id_idx").on(table.createdById),
    index("media_assets_type_idx").on(table.type),
    check(
      "media_assets_size_bytes_non_negative",
      sql`${table.sizeBytes} is null or ${table.sizeBytes} >= 0`,
    ),
    check(
      "media_assets_width_non_negative",
      sql`${table.width} is null or ${table.width} >= 0`,
    ),
    check(
      "media_assets_height_non_negative",
      sql`${table.height} is null or ${table.height} >= 0`,
    ),
  ],
);

export const banners = pgTable(
  "banners",
  {
    id: id(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    imageId: text("image_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    mobileImageId: text("mobile_image_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    ctaLabel: text("cta_label"),
    ctaUrl: text("cta_url"),
    placement: bannerPlacementEnum("placement").notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index("banners_placement_status_idx").on(table.placement, table.status),
    index("banners_display_order_idx").on(table.displayOrder),
    check(
      "banners_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);

export const storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("store_settings"),
  storeName: text("store_name").notNull().default("Clarisse"),
  storeDescription: text("store_description"),
  contactEmail: text("contact_email"),
  whatsappNumber: text("whatsapp_number"),
  instagramUrl: text("instagram_url"),
  logoId: text("logo_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  currency: text("currency").notNull().default("BRL"),
  country: text("country").notNull().default("BR"),
  defaultShippingInfo: text("default_shipping_info"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ...timestamps(),
});

// ============================================================================
// CATALOG
// ============================================================================

export const categories = pgTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageId: text("image_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_is_active_idx").on(table.isActive),
    index("categories_display_order_idx").on(table.displayOrder),
    check(
      "categories_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);

export const collections = pgTable(
  "collections",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageId: text("image_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("collections_slug_idx").on(table.slug),
    index("collections_is_active_idx").on(table.isActive),
    index("collections_is_featured_idx").on(table.isFeatured),
    index("collections_display_order_idx").on(table.displayOrder),
    check(
      "collections_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);

export const products = pgTable(
  "products",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    status: productStatusEnum("status").notNull().default("draft"),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    basePriceCents: integer("base_price_cents").notNull(),
    compareAtPriceCents: integer("compare_at_price_cents"),
    costCents: integer("cost_cents"),
    currency: text("currency").notNull().default("BRL"),
    isFeatured: boolean("is_featured").notNull().default(false),
    material: text("material"),
    fit: text("fit"),
    careInstructions: text("care_instructions"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, ''))`,
    ),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    index("products_status_published_at_idx").on(
      table.status,
      table.publishedAt,
    ),
    index("products_category_id_idx").on(table.categoryId),
    index("products_featured_status_idx").on(table.isFeatured, table.status),
    index("products_created_at_idx").on(table.createdAt),
    index("products_search_vector_idx").using("gin", table.searchVector),
    check(
      "products_base_price_cents_non_negative",
      sql`${table.basePriceCents} >= 0`,
    ),
    check(
      "products_compare_at_price_cents_non_negative",
      sql`${table.compareAtPriceCents} is null or ${table.compareAtPriceCents} >= 0`,
    ),
    check(
      "products_compare_at_price_cents_gte_base",
      sql`${table.compareAtPriceCents} is null or ${table.compareAtPriceCents} >= ${table.basePriceCents}`,
    ),
    check(
      "products_cost_cents_non_negative",
      sql`${table.costCents} is null or ${table.costCents} >= 0`,
    ),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    colorName: text("color_name").notNull().default("Default"),
    colorHex: text("color_hex"),
    size: text("size").notNull().default("One Size"),
    priceCents: integer("price_cents"),
    compareAtPriceCents: integer("compare_at_price_cents"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    weightGrams: integer("weight_grams"),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("product_variants_sku_idx").on(table.sku),
    unique("product_variants_product_color_size_unique").on(
      table.productId,
      table.colorName,
      table.size,
    ),
    unique("product_variants_id_product_id_unique").on(
      table.id,
      table.productId,
    ),
    index("product_variants_product_id_idx").on(table.productId),
    index("product_variants_is_active_idx").on(table.isActive),
    check(
      "product_variants_price_cents_non_negative",
      sql`${table.priceCents} is null or ${table.priceCents} >= 0`,
    ),
    check(
      "product_variants_compare_at_price_cents_non_negative",
      sql`${table.compareAtPriceCents} is null or ${table.compareAtPriceCents} >= 0`,
    ),
    check(
      "product_variants_compare_at_price_cents_gte_price",
      sql`${table.compareAtPriceCents} is null or ${table.priceCents} is null or ${table.compareAtPriceCents} >= ${table.priceCents}`,
    ),
    check(
      "product_variants_stock_quantity_non_negative",
      sql`${table.stockQuantity} >= 0`,
    ),
    check(
      "product_variants_low_stock_threshold_non_negative",
      sql`${table.lowStockThreshold} >= 0`,
    ),
    check(
      "product_variants_weight_grams_non_negative",
      sql`${table.weightGrams} is null or ${table.weightGrams} >= 0`,
    ),
    check(
      "product_variants_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    colorName: text("color_name"),
    colorHex: text("color_hex"),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    altText: text("alt_text"),
    position: integer("position").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId),
    index("product_images_variant_id_idx").on(table.variantId),
    index("product_images_product_color_idx").on(
      table.productId,
      table.colorName,
    ),
    unique("product_images_product_media_asset_unique").on(
      table.productId,
      table.mediaAssetId,
    ),
    uniqueIndex("product_images_one_primary_per_product_idx")
      .on(table.productId)
      .where(sql`${table.isPrimary} = true`),
    check("product_images_position_non_negative", sql`${table.position} >= 0`),
    check(
      "product_images_color_hex_format",
      sql`${table.colorHex} is null or ${table.colorHex} ~ '^#[0-9a-fA-F]{6}$'`,
    ),
  ],
);

export const productsToCollections = pgTable(
  "products_to_collections",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
    featuredAt: timestamp("featured_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "products_to_collections_pk",
      columns: [table.productId, table.collectionId],
    }),
    index("products_to_collections_collection_id_idx").on(table.collectionId),
    check(
      "products_to_collections_display_order_non_negative",
      sql`${table.displayOrder} >= 0`,
    ),
  ],
);

// ============================================================================
// CUSTOMERS, COUPONS, CARTS, AND ORDERS
// ============================================================================

export const customers = pgTable(
  "customers",
  {
    id: id(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    acceptsMarketing: boolean("accepts_marketing").notNull().default(false),
    ordersCount: integer("orders_count").notNull().default(0),
    totalSpentCents: integer("total_spent_cents").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("customers_email_idx").on(table.email),
    uniqueIndex("customers_user_id_idx").on(table.userId),
    check(
      "customers_orders_count_non_negative",
      sql`${table.ordersCount} >= 0`,
    ),
    check(
      "customers_total_spent_cents_non_negative",
      sql`${table.totalSpentCents} >= 0`,
    ),
  ],
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: id(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    label: text("label"),
    recipientName: text("recipient_name").notNull(),
    phone: text("phone"),
    country: text("country").notNull().default("BR"),
    postalCode: text("postal_code").notNull(),
    state: text("state").notNull(),
    city: text("city").notNull(),
    neighborhood: text("neighborhood"),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    number: text("number"),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),
    ...timestamps(),
  },
  (table) => [
    index("customer_addresses_customer_id_idx").on(table.customerId),
    uniqueIndex("customer_addresses_one_default_shipping_idx")
      .on(table.customerId)
      .where(sql`${table.isDefaultShipping} = true`),
    uniqueIndex("customer_addresses_one_default_billing_idx")
      .on(table.customerId)
      .where(sql`${table.isDefaultBilling} = true`),
  ],
);

export const coupons = pgTable(
  "coupons",
  {
    id: id(),
    code: text("code").notNull(),
    description: text("description"),
    discountType: discountTypeEnum("discount_type").notNull(),
    value: integer("value").notNull().default(0),
    minimumSubtotalCents: integer("minimum_subtotal_cents")
      .notNull()
      .default(0),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("coupons_code_idx").on(sql`lower(${table.code})`),
    index("coupons_is_active_idx").on(table.isActive),
    check(
      "coupons_value_matches_discount_type",
      sql`(
        (${table.discountType} = 'percentage' and ${table.value} between 1 and 100)
        or (${table.discountType} = 'fixed_amount' and ${table.value} > 0)
        or (${table.discountType} = 'free_shipping' and ${table.value} = 0)
      )`,
    ),
    check(
      "coupons_minimum_subtotal_cents_non_negative",
      sql`${table.minimumSubtotalCents} >= 0`,
    ),
    check(
      "coupons_usage_limit_non_negative",
      sql`${table.usageLimit} is null or ${table.usageLimit} >= 0`,
    ),
    check("coupons_usage_count_non_negative", sql`${table.usageCount} >= 0`),
    check(
      "coupons_usage_count_within_limit",
      sql`${table.usageLimit} is null or ${table.usageCount} <= ${table.usageLimit}`,
    ),
    check(
      "coupons_date_range_valid",
      sql`${table.startsAt} is null or ${table.expiresAt} is null or ${table.expiresAt} >= ${table.startsAt}`,
    ),
  ],
);

export const carts = pgTable(
  "carts",
  {
    id: id(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    couponId: text("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    status: cartStatusEnum("status").notNull().default("active"),
    email: text("email"),
    currency: text("currency").notNull().default("BRL"),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    index("carts_user_id_idx").on(table.userId),
    index("carts_customer_id_idx").on(table.customerId),
    index("carts_status_idx").on(table.status),
    check(
      "carts_subtotal_cents_non_negative",
      sql`${table.subtotalCents} >= 0`,
    ),
    check(
      "carts_discount_cents_non_negative",
      sql`${table.discountCents} >= 0`,
    ),
    check(
      "carts_shipping_cents_non_negative",
      sql`${table.shippingCents} >= 0`,
    ),
    check("carts_total_cents_non_negative", sql`${table.totalCents} >= 0`),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: id(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productVariantId: text("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    ...timestamps(),
  },
  (table) => [
    unique("cart_items_cart_variant_unique").on(
      table.cartId,
      table.productVariantId,
    ),
    index("cart_items_cart_id_idx").on(table.cartId),
    index("cart_items_product_variant_id_idx").on(table.productVariantId),
    check("cart_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "cart_items_unit_price_cents_non_negative",
      sql`${table.unitPriceCents} >= 0`,
    ),
    check(
      "cart_items_line_total_cents_non_negative",
      sql`${table.lineTotalCents} >= 0`,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number").notNull(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    cartId: text("cart_id").references(() => carts.id, {
      onDelete: "set null",
    }),
    couponId: text("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    couponCode: text("coupon_code"),
    status: orderStatusEnum("status").notNull().default("pending"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status")
      .notNull()
      .default("unfulfilled"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    currency: text("currency").notNull().default("BRL"),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    shippingAddress: jsonb("shipping_address")
      .$type<AddressSnapshot>()
      .notNull(),
    billingAddress: jsonb("billing_address").$type<AddressSnapshot>(),
    notes: text("notes"),
    placedAt: timestamp("placed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    index("orders_user_id_idx").on(table.userId),
    index("orders_customer_id_idx").on(table.customerId),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_fulfillment_status_idx").on(table.fulfillmentStatus),
    index("orders_created_at_idx").on(table.createdAt),
    check(
      "orders_subtotal_cents_non_negative",
      sql`${table.subtotalCents} >= 0`,
    ),
    check(
      "orders_discount_cents_non_negative",
      sql`${table.discountCents} >= 0`,
    ),
    check(
      "orders_shipping_cents_non_negative",
      sql`${table.shippingCents} >= 0`,
    ),
    check("orders_tax_cents_non_negative", sql`${table.taxCents} >= 0`),
    check("orders_total_cents_non_negative", sql`${table.totalCents} >= 0`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productVariantId: text("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    variantSku: text("variant_sku").notNull(),
    colorName: text("color_name").notNull(),
    colorHex: text("color_hex"),
    size: text("size").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    compareAtPriceCents: integer("compare_at_price_cents"),
    lineTotalCents: integer("line_total_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_product_id_idx").on(table.productId),
    index("order_items_product_variant_id_idx").on(table.productVariantId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "order_items_unit_price_cents_non_negative",
      sql`${table.unitPriceCents} >= 0`,
    ),
    check(
      "order_items_compare_at_price_cents_non_negative",
      sql`${table.compareAtPriceCents} is null or ${table.compareAtPriceCents} >= 0`,
    ),
    check(
      "order_items_line_total_cents_non_negative",
      sql`${table.lineTotalCents} >= 0`,
    ),
  ],
);

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: id(),
    couponId: text("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "restrict" }),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("coupon_redemptions_order_id_idx").on(table.orderId),
    index("coupon_redemptions_coupon_id_idx").on(table.couponId),
    index("coupon_redemptions_customer_id_idx").on(table.customerId),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: id(),
    productVariantId: text("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    orderItemId: text("order_item_id").references(() => orderItems.id, {
      onDelete: "set null",
    }),
    type: inventoryMovementTypeEnum("type").notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    reason: text("reason"),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inventory_movements_product_variant_id_idx").on(
      table.productVariantId,
    ),
    index("inventory_movements_order_item_id_idx").on(table.orderItemId),
    index("inventory_movements_created_at_idx").on(table.createdAt),
    check(
      "inventory_movements_quantity_delta_non_zero",
      sql`${table.quantityDelta} <> 0`,
    ),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  customer: one(customers),
  mediaAssets: many(mediaAssets),
  carts: many(carts),
  orders: many(orders),
  inventoryMovements: many(inventoryMovements),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const mediaAssetRelations = relations(mediaAssets, ({ many, one }) => ({
  createdBy: one(user, {
    fields: [mediaAssets.createdById],
    references: [user.id],
  }),
  productImages: many(productImages),
  categoryImages: many(categories),
  collectionImages: many(collections),
  banners: many(banners, { relationName: "bannerImage" }),
  mobileBanners: many(banners, { relationName: "bannerMobileImage" }),
  storeSettingsLogos: many(storeSettings),
}));

export const bannerRelations = relations(banners, ({ one }) => ({
  image: one(mediaAssets, {
    fields: [banners.imageId],
    references: [mediaAssets.id],
    relationName: "bannerImage",
  }),
  mobileImage: one(mediaAssets, {
    fields: [banners.mobileImageId],
    references: [mediaAssets.id],
    relationName: "bannerMobileImage",
  }),
}));

export const storeSettingsRelations = relations(storeSettings, ({ one }) => ({
  logo: one(mediaAssets, {
    fields: [storeSettings.logoId],
    references: [mediaAssets.id],
  }),
}));

export const categoryRelations = relations(categories, ({ many, one }) => ({
  image: one(mediaAssets, {
    fields: [categories.imageId],
    references: [mediaAssets.id],
  }),
  products: many(products),
}));

export const collectionRelations = relations(collections, ({ many, one }) => ({
  image: one(mediaAssets, {
    fields: [collections.imageId],
    references: [mediaAssets.id],
  }),
  productsToCollections: many(productsToCollections),
}));

export const productRelations = relations(products, ({ many, one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  productsToCollections: many(productsToCollections),
  orderItems: many(orderItems),
}));

export const productVariantRelations = relations(
  productVariants,
  ({ many, one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    images: many(productImages),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
    inventoryMovements: many(inventoryMovements),
  }),
);

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [productImages.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const productsToCollectionsRelations = relations(
  productsToCollections,
  ({ one }) => ({
    product: one(products, {
      fields: [productsToCollections.productId],
      references: [products.id],
    }),
    collection: one(collections, {
      fields: [productsToCollections.collectionId],
      references: [collections.id],
    }),
  }),
);

export const customerRelations = relations(customers, ({ many, one }) => ({
  user: one(user, {
    fields: [customers.userId],
    references: [user.id],
  }),
  addresses: many(customerAddresses),
  carts: many(carts),
  orders: many(orders),
  couponRedemptions: many(couponRedemptions),
}));

export const customerAddressRelations = relations(
  customerAddresses,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerAddresses.customerId],
      references: [customers.id],
    }),
  }),
);

export const couponRelations = relations(coupons, ({ many }) => ({
  carts: many(carts),
  orders: many(orders),
  redemptions: many(couponRedemptions),
}));

export const cartRelations = relations(carts, ({ many, one }) => ({
  user: one(user, {
    fields: [carts.userId],
    references: [user.id],
  }),
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  coupon: one(coupons, {
    fields: [carts.couponId],
    references: [coupons.id],
  }),
  items: many(cartItems),
  orders: many(orders),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  productVariant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const orderRelations = relations(orders, ({ many, one }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  cart: one(carts, {
    fields: [orders.cartId],
    references: [carts.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  items: many(orderItems),
  couponRedemptions: many(couponRedemptions),
}));

export const orderItemRelations = relations(orderItems, ({ many, one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
  inventoryMovements: many(inventoryMovements),
}));

export const couponRedemptionRelations = relations(
  couponRedemptions,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponRedemptions.couponId],
      references: [coupons.id],
    }),
    customer: one(customers, {
      fields: [couponRedemptions.customerId],
      references: [customers.id],
    }),
    order: one(orders, {
      fields: [couponRedemptions.orderId],
      references: [orders.id],
    }),
  }),
);

export const inventoryMovementRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    productVariant: one(productVariants, {
      fields: [inventoryMovements.productVariantId],
      references: [productVariants.id],
    }),
    orderItem: one(orderItems, {
      fields: [inventoryMovements.orderItemId],
      references: [orderItems.id],
    }),
    createdBy: one(user, {
      fields: [inventoryMovements.createdById],
      references: [user.id],
    }),
  }),
);
