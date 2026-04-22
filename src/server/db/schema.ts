import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const productCategoryEnum = pgEnum("product_category", [
  "perfumes",
  "cosmetics",
  "jewelry",
  "gift_sets",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const inventoryLogTypeEnum = pgEnum("inventory_log_type", [
  "restock",
  "sale",
  "adjustment",
  "return",
]);

// ─── NextAuth Tables ──────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id:            text("id").primaryKey(),
  name:          text("name"),
  email:         text("email").unique(),
  emailVerified: timestamp("email_verified"),
  image:         text("image"),
  role:          text("role").default("USER"),
  password:      text("password"),
});

export const accounts = pgTable("accounts", {
  userId:            text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull(),
  expires:    timestamp("expires").notNull(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id:               uuid("id").primaryKey().defaultRandom(),
  slug:             text("slug").unique().notNull(),
  name:             text("name").notNull(),
  shortDescription: text("short_description"),
  description:      text("description"),
  aiDescription:    text("ai_description"),
  price:            integer("price").notNull(),
  compareAtPrice:   integer("compare_at_price"),
  category:         productCategoryEnum("category").notNull(),
  subcategory:      text("subcategory"),
  images:           jsonb("images").$type<string[]>().default([]),
  tags:             jsonb("tags").$type<string[]>().default([]),
  ingredients:      text("ingredients"),
  scentNotes:       jsonb("scent_notes").$type<ScentNotes>(),
  isActive:         boolean("is_active").default(true),
  isFeatured:       boolean("is_featured").default(false),
  metaTitle:        text("meta_title"),
  metaDescription:  text("meta_description"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const productVariants = pgTable("product_variants", {
  id:                uuid("id").primaryKey().defaultRandom(),
  productId:         uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  sku:               text("sku").unique().notNull(),
  name:              text("name").notNull(),
  price:             integer("price"),
  stock:             integer("stock").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  weight:            integer("weight"),
  createdAt:         timestamp("created_at").defaultNow(),
  updatedAt:         timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = pgTable("customers", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      text("user_id").references(() => users.id),
  email:       text("email").unique().notNull(),
  name:        text("name"),
  phone:       text("phone"),
  totalOrders: integer("total_orders").default(0),
  totalSpent:  integer("total_spent").default(0),
  aiProfile:   jsonb("ai_profile").$type<AIProfile>(),
  tags:        jsonb("tags").$type<string[]>().default([]),
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id:               uuid("id").primaryKey().defaultRandom(),
  orderNumber:      text("order_number").unique().notNull(),
  customerId:       uuid("customer_id").references(() => customers.id),
  email:            text("email").notNull(),
  status:           orderStatusEnum("status").default("pending"),
  paymentStatus:    paymentStatusEnum("payment_status").default("pending"),
  payfastPaymentId: text("payfast_payment_id"),
  subtotal:         integer("subtotal").notNull(),
  discountTotal:    integer("discount_total").default(0),
  shippingTotal:    integer("shipping_total").default(0),
  taxTotal:         integer("tax_total").default(0),
  total:            integer("total").notNull(),
  shippingAddress:  jsonb("shipping_address").$type<Address>(),
  trackingNumber:   text("tracking_number"),
  notes:            text("notes"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const orderItems = pgTable("order_items", {
  id:         uuid("id").primaryKey().defaultRandom(),
  orderId:    uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId:  uuid("product_id").references(() => products.id).notNull(),
  variantId:  uuid("variant_id").references(() => productVariants.id),
  name:       text("name").notNull(),
  sku:        text("sku").notNull(),
  quantity:   integer("quantity").notNull(),
  unitPrice:  integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  image:      text("image"),
});

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventoryLogs = pgTable("inventory_logs", {
  id:             uuid("id").primaryKey().defaultRandom(),
  variantId:      uuid("variant_id").references(() => productVariants.id).notNull(),
  type:           inventoryLogTypeEnum("type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  newQuantity:    integer("new_quantity").notNull(),
  note:           text("note"),
  createdAt:      timestamp("created_at").defaultNow(),
});

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export type ScentNotes = {
  top:    string[];
  middle: string[];
  base:   string[];
};

export type Address = {
  firstName:  string;
  lastName:   string;
  line1:      string;
  line2?:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
};

export type AIProfile = {
  scentFamily:     string;
  preferences:     string[];
  recommendations: string[];
  generatedAt:     string;
};

export type CartItem = {
  id:           string;
  productId:    string;
  variantId?:   string;
  name:         string;
  image:        string;
  price:        number;
  quantity:     number;
  slug:         string;
  variantName?: string;
};
