import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products-server";

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesSearchQuery(productText: string, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const normalizedText = normalizeSearchText(productText);
  const compactText = normalizedText.replace(/\s+/g, "");
  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const queryTokens = normalizedQuery.split(/\s+/).filter((token) => token.length >= 2);

  return (
    normalizedText.includes(normalizedQuery) ||
    (compactQuery.length >= 3 && compactText.includes(compactQuery)) ||
    (queryTokens.length >= 2 && queryTokens.every((token) => normalizedText.includes(token)))
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    const allProducts = await getProducts();

    let filtered = allProducts;
    if (query) {
      filtered = allProducts.filter((product) => {
        const productText = [
          product.name,
          product.sku,
          product.specs,
          product.accessories,
          product.description,
          product.category?.name,
        ]
          .filter(Boolean)
          .join(" ");

        return matchesSearchQuery(productText, query);
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
