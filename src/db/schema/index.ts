import { relations } from "drizzle-orm";
import {
  products,
  productVariants,
  productImages,
  productColors,
  productSizes,
  categories,
  colors,
  sizes,
} from "./catalog";
import { articles, articleCategories } from "./content";
import { orders, orderItems, addresses } from "./commerce";
import { users } from "./auth";

export * from "./auth";
export * from "./catalog";
export * from "./content";
export * from "./media";
export * from "./commerce";
export * from "./cms";

// ---- Relations (for db.query.* convenience) ----
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  colors: many(productColors),
  sizes: many(productSizes),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    color: one(colors, {
      fields: [productVariants.colorCode],
      references: [colors.code],
    }),
    size: one(sizes, {
      fields: [productVariants.sizeCode],
      references: [sizes.code],
    }),
  })
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productColorsRelations = relations(productColors, ({ one }) => ({
  product: one(products, {
    fields: [productColors.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [productColors.colorCode],
    references: [colors.code],
  }),
}));

export const productSizesRelations = relations(productSizes, ({ one }) => ({
  product: one(products, {
    fields: [productSizes.productId],
    references: [products.id],
  }),
  size: one(sizes, {
    fields: [productSizes.sizeCode],
    references: [sizes.code],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, { relationName: "category_parent" }),
  products: many(products),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(articleCategories, {
    fields: [articles.categoryId],
    references: [articleCategories.id],
  }),
}));

export const articleCategoriesRelations = relations(
  articleCategories,
  ({ many }) => ({
    articles: many(articles),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));
