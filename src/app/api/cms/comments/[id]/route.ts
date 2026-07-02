import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { POSTS_CACHE_TAG } from "@/lib/public-cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const commentId = parseInt(resolvedParams.id, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "ID Komentar tidak valid" }, { status: 400 });
    }

    const { approved } = await request.json();

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        approved: !!approved,
      },
    });

    revalidateTag(POSTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, comment: updatedComment });
  } catch (error: any) {
    console.error("Update Comment Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status komentar" }, { status: 500 });
  }
}

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
    const commentId = parseInt(resolvedParams.id, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "ID Komentar tidak valid" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidateTag(POSTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, message: "Komentar berhasil dihapus" });
  } catch (error: any) {
    console.error("Delete Comment Error:", error);
    return NextResponse.json({ error: "Gagal menghapus komentar" }, { status: 500 });
  }
}
