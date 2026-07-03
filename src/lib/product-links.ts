import type { UnifiedProduct } from "@/lib/products-service";

export function getProductListingHref(product: Pick<UnifiedProduct, "name" | "sku">) {
  const searchValue = product.name || product.sku;

  return `/produk?search=${encodeURIComponent(searchValue)}`;
}
