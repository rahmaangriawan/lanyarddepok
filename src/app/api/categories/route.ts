import { NextResponse } from "next/server";
import { getCachedCategoriesByType } from "@/lib/public-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "PRODUCT";

    const categories = await getCachedCategoriesByType(type, 5);

    return NextResponse.json(
      { success: true, categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("Public API GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
