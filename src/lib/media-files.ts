import { readdir, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface MediaFileRecord {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: Date | string;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function uploadsRoot() {
  return path.join(process.cwd(), "public", "uploads");
}

export function getFilesystemMediaId(filename: string) {
  const hash = crypto.createHash("sha1").update(filename).digest("hex");
  return parseInt(hash.slice(0, 8), 16);
}

export function buildFilesystemMediaRecord(
  filename: string,
  size: number,
  createdAt: Date | string = new Date(),
): MediaFileRecord {
  return {
    id: getFilesystemMediaId(filename),
    filename,
    filepath: `public/uploads/${filename}`,
    mimetype: MIME_BY_EXTENSION[path.extname(filename).toLowerCase()] || "application/octet-stream",
    size,
    url: `/uploads/${filename}`,
    createdAt,
  };
}

function matchesType(record: MediaFileRecord, type: string) {
  if (type === "all") return true;
  const isImage = record.mimetype.startsWith("image/");
  return type === "image" ? isImage : !isImage;
}

export async function scanUploadsMedia({
  page,
  limit,
  search,
  type,
}: {
  page: number;
  limit: number;
  search: string;
  type: string;
}) {
  const root = uploadsRoot();
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const normalizedSearch = search.trim().toLowerCase();
  const records: MediaFileRecord[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!MIME_BY_EXTENSION[ext]) continue;
    if (normalizedSearch && !entry.name.toLowerCase().includes(normalizedSearch)) {
      continue;
    }

    const filePath = path.join(root, entry.name);
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat) continue;

    const record = buildFilesystemMediaRecord(entry.name, fileStat.size, fileStat.mtime);
    if (matchesType(record, type)) {
      records.push(record);
    }
  }

  records.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const start = (safePage - 1) * safeLimit;
  const mediaList = records.slice(start, start + safeLimit);
  const totalPages = Math.ceil(records.length / safeLimit);

  return {
    mediaList,
    pagination: {
      total: records.length,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasMore: safePage < totalPages,
    },
  };
}

export async function findUploadMediaById(id: number) {
  const { mediaList } = await scanUploadsMedia({
    page: 1,
    limit: 10000,
    search: "",
    type: "all",
  });

  return mediaList.find((item) => item.id === id) || null;
}
