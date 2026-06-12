import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Storage abstraction so we can swap local FS for S3/R2 later
 * without touching the upload routes or admin UI.
 */
export interface StoredFile {
  /** public URL to serve the file */
  url: string;
  /** storage key / relative path */
  key: string;
}

export interface StorageProvider {
  save(file: {
    buffer: Buffer;
    filename: string;
    mime: string;
  }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function safeName(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const base = path
    .basename(filename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `${base || "file"}-${randomUUID().slice(0, 8)}${ext}`;
}

class LocalStorageProvider implements StorageProvider {
  async save(file: {
    buffer: Buffer;
    filename: string;
    mime: string;
  }): Promise<StoredFile> {
    // Partition by year/month to keep folders manageable.
    const now = new Date();
    const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dir = path.join(UPLOAD_DIR, sub);
    await fs.mkdir(dir, { recursive: true });

    const name = safeName(file.filename);
    const abs = path.join(dir, name);
    await fs.writeFile(abs, file.buffer);

    const key = `${sub}/${name}`;
    return { url: `/uploads/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    const abs = path.join(UPLOAD_DIR, key);
    try {
      await fs.unlink(abs);
    } catch {
      /* already gone */
    }
  }
}

export const storage: StorageProvider = new LocalStorageProvider();
