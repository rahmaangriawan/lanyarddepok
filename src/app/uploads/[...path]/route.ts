import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webp": "image/webp",
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(CONTENT_TYPES));
const UPLOAD_ROOT = path.resolve("public", "uploads");

function getUploadPath(parts: string[]) {
  const isSafePath = parts.every(
    (part) =>
      part &&
      part !== "." &&
      part !== ".." &&
      !part.includes("/") &&
      !part.includes("\\"),
  );

  if (!isSafePath) {
    return null;
  }

  const resolvedPath = path.resolve(UPLOAD_ROOT, ...parts);
  const relativePath = path.relative(UPLOAD_ROOT, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return resolvedPath;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: requestedPath } = await params;
  const filePath = getUploadPath(requestedPath);
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
