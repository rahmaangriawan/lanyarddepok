import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const mediaId = parseInt(resolvedParams.id, 10);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    // Delete file from disk
    try {
      if (media.filepath) {
        // Resolve path dynamically to handle absolute Windows/Linux paths and relative paths
        let resolvedPath = media.filepath;
        const relativeMatch = media.filepath.match(/public[/\\]uploads[/\\](.+)/);
        if (relativeMatch) {
          resolvedPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", relativeMatch[1]);
        } else {
          const filename = path.basename(media.filepath);
          resolvedPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", filename);
        }

        if (fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
      }
    } catch (err: any) {
      console.warn(`File unlink failed for path: ${media.filepath}`, err);
    }

    // Delete record from database
    await prisma.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    console.error("Delete Media Error:", error);
    return NextResponse.json({ 
      error: "Failed to delete media file", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
