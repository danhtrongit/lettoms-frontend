import { desc, eq, ilike, and } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import type { Media } from "@/db/schema/media";

export interface MediaListParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listMedia(
  params: MediaListParams = {}
): Promise<{ items: Media[]; total: number }> {
  const { search, limit = 60, offset = 0 } = params;
  const where = search ? ilike(media.filename, `%${search}%`) : undefined;

  const items = await db
    .select()
    .from(media)
    .where(where ? and(where) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(limit)
    .offset(offset);

  const all = await db.select({ id: media.id }).from(media).where(where);
  return { items, total: all.length };
}

export async function createMedia(input: {
  filename: string;
  url: string;
  mime: string;
  width?: number | null;
  height?: number | null;
  sizeBytes: number;
  alt?: string;
  title?: string;
  createdBy?: string | null;
}): Promise<Media> {
  const [row] = await db
    .insert(media)
    .values({
      filename: input.filename,
      url: input.url,
      mime: input.mime,
      width: input.width ?? null,
      height: input.height ?? null,
      sizeBytes: input.sizeBytes,
      alt: input.alt ?? "",
      title: input.title ?? "",
      createdBy: input.createdBy ?? null,
    })
    .returning();
  return row;
}

export async function getMedia(id: string): Promise<Media | undefined> {
  return db.query.media.findFirst({ where: eq(media.id, id) });
}

export async function updateMedia(
  id: string,
  patch: { alt?: string; title?: string }
): Promise<void> {
  await db.update(media).set(patch).where(eq(media.id, id));
}

export async function deleteMedia(id: string): Promise<Media | undefined> {
  const [row] = await db.delete(media).where(eq(media.id, id)).returning();
  return row;
}
