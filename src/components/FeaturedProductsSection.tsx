import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { getProductListingHref } from "@/lib/product-links";
import type { UnifiedProduct } from "@/lib/products-service";

const FEATURED_PRODUCT = {
  name: "Lanyard Polyester",
  price: "Rp 6.000",
  image: "/uploads/cta-footer-lanyard-custom-mobile.webp",
  points: ["Min. order 20", "Bahan terbaik", "Kualitas premium"],
};

const MAIN_PRODUCT_NAME = "Lanyard Polyester";
const MAIN_PRODUCT_IMAGE = "/uploads/cta-footer-lanyard-custom-mobile.webp";
const MAIN_PRODUCT_POINTS = ["Min. order 20", "Bahan terbaik", "Kualitas premium"];
const FEATURED_SMALL_PRODUCT_SLUGS = ["ks-j-st-20", "kh-j-ss-25", "ky-j-ss-25"];
const FEATURED_SMALL_PRODUCT_FALLBACKS: Record<string, Pick<UnifiedProduct, "name" | "slug" | "sku" | "basePrice" | "featuredImage">> = {
  "ks-j-st-20": {
    name: "Tali Lanyard Custom Kait Standar Jahit Stopper Trisula 2 cm",
    slug: "ks-j-st-20",
    sku: "KS.J.ST-20",
    basePrice: "Rp 17.000",
    featuredImage: FEATURED_PRODUCT.image,
  },
  "kh-j-ss-25": {
    name: "Tali Lanyard Custom Kait Kawat Hitam Jahit Stopper Standar 2.5 cm",
    slug: "kh-j-ss-25",
    sku: "KH.J.SS-25",
    basePrice: "Rp 25.000",
    featuredImage: FEATURED_PRODUCT.image,
  },
  "ky-j-ss-25": {
    name: "Tali Lanyard Custom Kait Yoyo Jahit Stopper Standar 2.5 cm",
    slug: "ky-j-ss-25",
    sku: "KY.J.SS-25",
    basePrice: "Rp 29.000",
    featuredImage: FEATURED_PRODUCT.image,
  },
};

type FeaturedProductsSectionProps = {
  products?: UnifiedProduct[];
};

type ProductCardSource = Pick<UnifiedProduct, "name" | "slug" | "sku" | "basePrice" | "featuredImage">;

function productPrice(product: Pick<UnifiedProduct, "basePrice">, fallback: string) {
  return product.basePrice && product.basePrice !== "0" ? product.basePrice : fallback;
}

function productCardImage(product: Pick<UnifiedProduct, "featuredImage">) {
  if (!product.featuredImage) {
    return FEATURED_PRODUCT.image;
  }

  return product.featuredImage;
}

function getFeaturedSmallProducts(products: UnifiedProduct[]): ProductCardSource[] {
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  return FEATURED_SMALL_PRODUCT_SLUGS.map((slug) => productsBySlug.get(slug) || FEATURED_SMALL_PRODUCT_FALLBACKS[slug]);
}

export default function FeaturedProductsSection({ products = [] }: FeaturedProductsSectionProps) {
  const mainProduct = products[0]
    ? {
        name: MAIN_PRODUCT_NAME,
        price: productPrice(products[0], FEATURED_PRODUCT.price),
        image: MAIN_PRODUCT_IMAGE,
        href: getProductListingHref(products[0]),
        points: MAIN_PRODUCT_POINTS,
      }
    : {
        ...FEATURED_PRODUCT,
        name: MAIN_PRODUCT_NAME,
        image: MAIN_PRODUCT_IMAGE,
        points: MAIN_PRODUCT_POINTS,
        href: "/produk",
      };

  const smallProducts = getFeaturedSmallProducts(products)
    .map((product) => ({
      name: product.name,
      price: productPrice(product, "Rp 0"),
      image: productCardImage(product),
      href: getProductListingHref(product),
    }));

  return (
    <section className="featured-products-section">
      <div className="featured-products-container">
        <div className="featured-products-copy">
          <p className="featured-products-kicker">Produk Unggulan</p>
          <h2 className="featured-products-title">
            Lanyard Custom Pilihan Terbaik
          </h2>
          <p className="featured-products-description">
            Beragam pilihan tali lanyard dan aksesori dengan kualitas premium
            dan finishing rapi. Siap untuk segala kebutuhan branding anda.
          </p>
          <Link
            href="/produk"
            className="mt-11 inline-flex items-center justify-center gap-6 rounded-full bg-public-amber px-8 py-3 text-sm font-semibold text-[#111827] shadow-lg shadow-public-amber/20 transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus:ring-2 focus:ring-public-amber focus:ring-opacity-75"
          >
            <span>Lihat Semua Produk</span>
            <ArrowRight className="featured-products-button-icon" aria-hidden="true" />
          </Link>
        </div>

        <article className="featured-products-main-card">
          <div className="featured-products-badge">
            <Star className="featured-products-badge-icon" aria-hidden="true" />
            <span>Popular</span>
          </div>

          <div className="featured-products-main-content">
            <div className="featured-products-main-text">
              <h3>{mainProduct.name}</h3>
              <ul>
                {(mainProduct.points.length > 0 ? mainProduct.points : FEATURED_PRODUCT.points).map((point) => (
                  <li key={point}>
                    <Check aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p>Mulai dari</p>
              <strong>{mainProduct.price}</strong>
            </div>

            <div className="featured-products-main-visual">
              <Image
                src={mainProduct.image}
                alt={mainProduct.name}
                width={420}
                height={560}
                className="featured-products-main-image"
                sizes="(min-width: 1024px) 320px, 70vw"
                quality={58}
              />
            </div>
          </div>
        </article>

        <div className="featured-products-list">
          {smallProducts.map((product) => (
            <Link
              href={product.href}
              key={product.name}
              className="featured-products-small-card"
            >
              <div className="featured-products-small-image-wrap">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={320}
                  height={180}
                  className="featured-products-small-image"
                  sizes="(max-width: 720px) 112px, (max-width: 1100px) 44vw, 168px"
                  quality={56}
                />
              </div>
              <div className="featured-products-small-copy">
                <h3>{product.name}</h3>
                <span>
                  Mulai dari <strong>{product.price}</strong>
                </span>
              </div>
              <span className="featured-products-small-action">
                <ArrowRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
