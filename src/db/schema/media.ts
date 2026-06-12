import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./auth";

export const mediaFolders = pgTable("media_folders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const media = pgTable(
  "media",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    folderId: text("folder_id").references(() => mediaFolders.id, {
      onDelete: "set null",
    }),
    filename: text("filename").notNull(),
    url: text("url").notNull(), // public-served path
    mime: text("mime").notNull(),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes").notNull().default(0),
    alt: text("alt").notNull().default(""),
    title: text("title").notNull().default(""),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("media_folder_idx").on(t.folderId),
    index("media_created_idx").on(t.createdAt),
  ]
);

export type Media = typeof media.$inferSelect;
export type MediaFolder = typeof mediaFolders.$inferSelect;
