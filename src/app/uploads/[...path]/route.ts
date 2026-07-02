import { readFile, stat } from "fs/promises";
import path from "path";
import { resolveUploadFilePath } from "@/lib/media-files";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(CONTENT_TYPES));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: requestedPath } = await params;
  const resolvedUpload = await resolveUploadFilePath(requestedPath);
  const filePath = resolvedUpload?.filePath || null;
  const extension = filePath ? path.extname(filePath).toLowerCase() : "";

  if (!filePath || !ALLOWED_EXTENSIONS.has(extension)) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return new Response("Not Found", { status: 404 });
    }

    const file = await readFile(filePath);
    const contentType = CONTENT_TYPES[extension];

    return new Response(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
        "Content-Length": fileStat.size.toString(),
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
