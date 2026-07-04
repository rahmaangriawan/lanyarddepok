import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { shouldSkipDbDuringBuild } from "@/lib/build-env";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "./products-service";

export const PRODUCTS_CACHE_TAG = "products";

const productOrderBy = [
  { sortOrder: "asc" as const },
  { createdAt: "desc" as const },
];

async function getProductsFromDb(): Promise<UnifiedProduct[]> {
  if (shouldSkipDbDuringBuild()) {
    return DEFAULT_PRODUCTS;
  }

  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        specs: true,
        accessories: true,
        basePrice: true,
        minOrder: true,
        shortDescription: true,
        sheetStatus: true,
        sites: true,
        sortOrder: true,
        featuredImage: true,
        categoryId: true,
        description: true,
        published: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: productOrderBy,
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
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.warn(`Products DB fetch failed; using fallback products. ${message}`);
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

async function getHomepageProductsFromDb(): Promise<UnifiedProduct[]> {
  if (shouldSkipDbDuringBuild()) {
    return DEFAULT_PRODUCTS.slice(0, 4);
  }

  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        specs: true,
        accessories: true,
        basePrice: true,
        minOrder: true,
        shortDescription: true,
        sheetStatus: true,
        sites: true,
        sortOrder: true,
        featuredImage: true,
        categoryId: true,
        published: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: productOrderBy,
      take: 4,
    });

    if (products.length === 0) {
      return DEFAULT_PRODUCTS.slice(0, 4);
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
      description: product.shortDescription || "",
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
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.warn(`Homepage products DB fetch failed; using fallback products. ${message}`);
    return DEFAULT_PRODUCTS.slice(0, 4);
  }
}

const getCachedHomepageProducts = unstable_cache(getHomepageProductsFromDb, ["homepage-products"], {
  revalidate: 600,
  tags: [PRODUCTS_CACHE_TAG],
});

export async function getHomepageProducts(): Promise<UnifiedProduct[]> {
  return getCachedHomepageProducts();
}
