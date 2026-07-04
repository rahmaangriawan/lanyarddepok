import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { PRODUCTS_CACHE_TAG } from "@/lib/products-server";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skus, action, newCategoryId } = await request.json();

    if (!Array.isArray(skus) || skus.length === 0) {
      return NextResponse.json({ error: "SKU tidak valid" }, { status: 400 });
    }

    if (action === "CHANGE_CATEGORY") {
      if (!newCategoryId) {
        return NextResponse.json({ error: "Kategori baru diperlukan" }, { status: 400 });
      }

      const count = await prisma.product.updateMany({
        where: { sku: { in: skus } },
        data: { categoryId: Number(newCategoryId) || null },
      });

      revalidateTag(PRODUCTS_CACHE_TAG, "max");

      return NextResponse.json({ success: true, count: count.count });
    } else if (action === "DELETE") {
      const count = await prisma.product.deleteMany({
        where: { sku: { in: skus } },
      });

      revalidateTag(PRODUCTS_CACHE_TAG, "max");

      return NextResponse.json({ success: true, count: count.count });
    } else {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Bulk Action API Error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
