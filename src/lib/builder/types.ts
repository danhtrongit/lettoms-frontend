import type { Data } from "@puckeditor/core";

/** Every widget key available in the builder. Single source of truth. */
export const WIDGET_TYPES = [
  // layout
  "section", "columns", "spacer", "divider",
  // basic
  "heading", "richText", "button", "iconList", "faqAccordion", "testimonial",
  // media
  "hero", "heroCarousel", "bannerImage", "image", "gallery", "videoEmbed", "logoMarquee",
  // commerce
  "productGrid", "productCarousel", "featuredCategories", "categoryTiles",
  // marketing
  "countdown", "newsletter", "promoBanner", "articleStrip", "htmlEmbed",
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export type PuckData = Data;
