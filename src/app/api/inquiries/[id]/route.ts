import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

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
    const inquiryId = parseInt(resolvedParams.id, 10);
    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 });
    }

    // Verify existence of inquiry
    const existing = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pesan tidak ditemukan." }, { status: 404 });
    }

    await prisma.inquiry.delete({
      where: { id: inquiryId },
    });

    return NextResponse.json({ success: true, message: "Pesan berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete Inquiry Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pesan." },
      { status: 500 }
    );
  }
}
