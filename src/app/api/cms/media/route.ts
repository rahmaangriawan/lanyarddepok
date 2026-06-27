import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import { assertSameOrigin } from "@/lib/security";

const WEBP_CONVERTIBLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const runtime = "nodejs";

function sanitizeFilenameBase(filename: string) {
  const ext = path.extname(filename);
  const baseNameWithoutExt = path.basename(filename || "upload", ext);
  const sanitizedBase = baseNameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitizedBase || "upload";
}

function detectImageMime(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
    return "image/jpeg";
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  if (buffer.subarray(4, 12).toString("ascii") === "ftypavif")
    return "image/avif";
  if (
    buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
    buffer.subarray(0, 6).toString("ascii") === "GIF89a"
  )
    return "image/gif";
  return null;
}

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.filename = {
        contains: search,
      };
    }

    if (type !== "all") {
      if (type === "image") {
        where.mimetype = {
          startsWith: "image/",
        };
      } else if (type === "document") {
        where.mimetype = {
          not: {
            startsWith: "image/",
          },
        };
      }
    }

    // Get total count matching query
    const total = await prisma.media.count({ where });

    const mediaList = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      mediaList,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    });
  } catch (error: any) {
    console.error("Fetch Media Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media files" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);
    const declaredType = file.type.toLowerCase();

    if (originalBuffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 8MB." },
        { status: 413 },
      );
    }

    if (
      declaredType === "image/svg+xml" ||
      path.extname(file.name).toLowerCase() === ".svg"
    ) {
      return NextResponse.json(
        { error: "Upload SVG tidak diizinkan." },
        { status: 400 },
      );
    }

    const detectedType = detectImageMime(originalBuffer);
    if (!detectedType || !WEBP_CONVERTIBLE_TYPES.has(detectedType)) {
      return NextResponse.json(
        { error: "Tipe file gambar tidak valid." },
        { status: 400 },
      );
    }

    // Sanitize filename
    const originalName = file.name;
    const sanitizedBase = sanitizeFilenameBase(originalName);
    const uniqueFilename = `${sanitizedBase}-${crypto.randomUUID()}.webp`;

    let outputBuffer: Buffer<ArrayBufferLike> = originalBuffer;
    let outputMimeType = "image/webp";

    outputBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    // Path resolution
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, outputBuffer);

    const fileUrl = `/uploads/${uniqueFilename}`;
    const relativePath = `public/uploads/${uniqueFilename}`;

    // Create database record
    const media = await prisma.media.create({
      data: {
        filename: uniqueFilename,
        filepath: relativePath,
        mimetype: outputMimeType,
        size: outputBuffer.length,
        url: fileUrl,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    console.error("Upload Media Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
