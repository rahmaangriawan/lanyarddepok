import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const WEBP_CONVERTIBLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

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
    return NextResponse.json({ error: "Failed to fetch media files" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    // Sanitize filename
    const originalName = file.name;
    const originalExt = path.extname(originalName).toLowerCase() || "";
    const sanitizedBase = sanitizeFilenameBase(originalName);
    const shouldConvertToWebp = WEBP_CONVERTIBLE_TYPES.has(file.type.toLowerCase());
    const outputExt = shouldConvertToWebp ? ".webp" : originalExt || ".bin";
    const uniqueFilename = `${sanitizedBase}-${Date.now()}${outputExt}`;

    let outputBuffer: Buffer<ArrayBufferLike> = originalBuffer;
    let outputMimeType = file.type || "application/octet-stream";

    if (shouldConvertToWebp) {
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
      outputMimeType = "image/webp";
    }

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
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
