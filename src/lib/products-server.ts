import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { shouldSkipDbDuringBuild } from "@/lib/build-env";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "./products-service";

export const PRODUCTS_CACHE_TAG = "products";

async function getProductsFromDb(): Promise<UnifiedProduct[]> {
  if (shouldSkipDbDuringBuild()) {
    return DEFAULT_PRODUCTS;
  }

  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    if (products.length === 0) {
      return DEFAULT_PRODUCTS;
    }

    return products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name || "Produk Lanyard",
      slug: product.slug || product.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      specs: product.specs || "",
      accessories: product.accessories || "",
      basePrice: product.basePrice || "0",
      minOrder: product.minOrder || "0",
      featuredImage: product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp",
      description: product.description || product.shortDescription || "",
      published: product.published,
      metaTitle: product.metaTitle || product.name || "Lanyard Custom",
      metaDescription: product.metaDescription || product.shortDescription || product.name || "",
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
      sheetStatus: product.sheetStatus || "",
      sites: product.sites || "",
      order: product.sortOrder,
      categoryId: product.categoryId,
      category: product.category,
    }));
  } catch (error) {
    console.error("Error in products-server getProducts:", error);
    return DEFAULT_PRODUCTS;
  }
}

const getCachedProducts = unstable_cache(getProductsFromDb, ["public-products"], {
  revalidate: 600,
  tags: [PRODUCTS_CACHE_TAG],
});

export async function getProducts(): Promise<UnifiedProduct[]> {
  return getCachedProducts();
}
