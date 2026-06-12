import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

/**
 * Serves runtime-uploaded media from public/uploads.
 *
 * `next start` only serves public/ assets that existed at BUILD time —
 * files written at runtime (admin uploads onto the mounted volume) 404
 * without this route. Static files from the build still win over the
 * route, so it only handles the runtime-added ones.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  const rel = segments.join("/");
  const abs = path.normalize(path.join(UPLOAD_DIR, rel));
  // Path-traversal guard: the resolved path must stay inside UPLOAD_DIR.
  if (!abs.startsWith(UPLOAD_DIR + path.sep)) {
    return new NextResponse(null, { status: 400 });
  }

  const mime = MIME[path.extname(abs).toLowerCase()];
  if (!mime) {
    return new NextResponse(null, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await fs.readFile(abs);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      // Filenames carry a uuid suffix, so contents never change in place.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
