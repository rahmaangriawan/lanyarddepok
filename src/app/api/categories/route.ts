import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "PRODUCT";

    const categories = await prisma.category.findMany({
      where: { type },
      take: 5,
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Public API GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
