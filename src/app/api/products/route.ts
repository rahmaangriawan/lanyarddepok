import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    const allProducts = await getProducts();

    let filtered = allProducts;
    if (query) {
      filtered = allProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.specs.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      });
    }

    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return NextResponse.json(
      { success: true, products: filtered },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("API GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
