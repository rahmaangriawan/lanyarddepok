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

function uniquePaths(paths: string[]) {
  return Array.from(new Set(paths.map((item) => path.resolve(item))));
}

export function getUploadRootCandidates() {
  const configuredRoot = process.env.MEDIA_UPLOAD_DIR || process.env.UPLOADS_DIR;
  const cwd = process.cwd();
  const appRoot = process.env.APP_ROOT || process.env.NEXT_PUBLIC_APP_ROOT;
  const remotePath = process.env.REMOTE_PATH;
  const home = process.env.HOME || process.env.USERPROFILE;

  return uniquePaths(
    [
      configuredRoot || "",
      path.join(cwd, "public", "uploads"),
      path.join(cwd, "..", "public", "uploads"),
      path.join(cwd, "..", "..", "public", "uploads"),
      appRoot ? path.join(appRoot, "public", "uploads") : "",
      home && remotePath ? path.join(home, remotePath, "public", "uploads") : "",
      home ? path.join(home, "htdocs", "lanyarddepok.com", "public", "uploads") : "",
    ].filter(Boolean),
  );
}

export async function resolveUploadsRoot() {
  const candidates = getUploadRootCandidates();

  for (const candidate of candidates) {
    const candidateStat = await stat(candidate).catch(() => null);
    if (candidateStat?.isDirectory()) {
      return candidate;
    }
  }

  return candidates[0] || path.join(process.cwd(), "public", "uploads");
}

async function getExistingUploadRoots() {
  const roots: string[] = [];

  for (const candidate of getUploadRootCandidates()) {
    const candidateStat = await stat(candidate).catch(() => null);
    if (candidateStat?.isDirectory()) {
      roots.push(candidate);
    }
  }

  return roots;
}

export async function resolveUploadFilePath(parts: string[]) {
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

  for (const root of getUploadRootCandidates()) {
    const resolvedPath = path.resolve(root, ...parts);
    const relativePath = path.relative(root, resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      continue;
    }

    const fileStat = await stat(resolvedPath).catch(() => null);
    if (fileStat?.isFile()) {
      return { filePath: resolvedPath, root };
    }
  }

  return null;
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
  const roots = await getExistingUploadRoots();
  const fallbackRoot = await resolveUploadsRoot();
  const scanRoots = roots.length > 0 ? roots : [fallbackRoot];
  const normalizedSearch = search.trim().toLowerCase();
  const recordsByUrl = new Map<string, MediaFileRecord>();

  for (const root of scanRoots) {
    const entries = await readdir(root, { withFileTypes: true }).catch(() => []);

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
      if (!matchesType(record, type)) continue;

      const existing = recordsByUrl.get(record.url);
      if (
        !existing ||
        new Date(record.createdAt).getTime() > new Date(existing.createdAt).getTime()
      ) {
        recordsByUrl.set(record.url, record);
      }
    }
  }

  const records = Array.from(recordsByUrl.values());
  records.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 10000));
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
    uploadRoot: scanRoots[0],
    activeUploadRoots: scanRoots,
    scannedRoots: getUploadRootCandidates(),
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
