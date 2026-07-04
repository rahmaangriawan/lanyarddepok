import type { UnifiedProduct } from "@/lib/products-service";

export function getProductListingHref(product: Pick<UnifiedProduct, "name" | "sku" | "slug">) {
  if (product.slug) {
    return `/produk/${product.slug}`;
  }

  const searchValue = product.name || product.sku;

  return `/produk?search=${encodeURIComponent(searchValue)}`;
}
