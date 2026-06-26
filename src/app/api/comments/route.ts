import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertSameOrigin, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const ip = getClientIp(request);
    if (!checkRateLimit(`comment:${ip}`, 5, 10 * 60 * 1000)) {
      return rateLimitResponse("Terlalu banyak mengirim komentar. Silakan coba lagi nanti.");
    }

    const { postId, name, email, content } = await request.json();

    if (!postId || !name || !email || !content) {
      return NextResponse.json({ error: "Semua kolom harus diisi" }, { status: 400 });
    }

    const id = parseInt(postId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID Post tidak valid" }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Alamat email tidak valid" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        content: content.trim(),
        approved: false, // requires admin approval
      },
    });

    return NextResponse.json({
      success: true,
      message: "Komentar berhasil dikirim dan menunggu persetujuan admin.",
      comment,
    });
  } catch (error: any) {
    console.error("Create Comment Error:", error);
    return NextResponse.json({ error: "Gagal mengirim komentar" }, { status: 500 });
  }
}
