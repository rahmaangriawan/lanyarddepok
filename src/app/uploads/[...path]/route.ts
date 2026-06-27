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

  return path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    "uploads",
    ...parts,
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: requestedPath } = await params;
  const filePath = getUploadPath(requestedPath);

  if (!filePath) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return new Response("Not Found", { status: 404 });
    }

    const file = await readFile(filePath);
    const contentType =
      CONTENT_TYPES[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream";

    return new Response(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileStat.size.toString(),
        "Content-Type": contentType,
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
