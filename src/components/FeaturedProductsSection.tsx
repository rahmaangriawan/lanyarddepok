import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { getProductListingHref } from "@/lib/product-links";
import { DEFAULT_PRODUCTS, type UnifiedProduct } from "@/lib/products-service";

const FEATURED_PRODUCT = {
  name: "Lanyard Polyester",
  price: "Rp 6.000",
  image: "/uploads/cta-footer-lanyard-custom-mobile.webp",
  points: ["Min. order 20", "Bahan terbaik", "Kualitas premium"],
};

const MAIN_PRODUCT_NAME = "Lanyard Polyester";
const MAIN_PRODUCT_IMAGE = "/uploads/cta-footer-lanyard-custom-mobile.webp";
const MAIN_PRODUCT_POINTS = ["Min. order 20", "Bahan terbaik", "Kualitas premium"];

type FeaturedProductsSectionProps = {
  products?: UnifiedProduct[];
};

function productPrice(product: UnifiedProduct, fallback: string) {
  return product.basePrice && product.basePrice !== "0" ? product.basePrice : fallback;
}

function productCardImage(product: UnifiedProduct) {
  if (!product.featuredImage) {
    return FEATURED_PRODUCT.image;
  }

  return product.featuredImage;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getShuffledSmallProducts(products: UnifiedProduct[]) {
  const mainSlug = products[0]?.slug;
  const mergedProducts = [...products];
  const existingSlugs = new Set(mergedProducts.map((product) => product.slug));

  for (const product of DEFAULT_PRODUCTS) {
    if (existingSlugs.has(product.slug)) continue;
    mergedProducts.push(product);
    existingSlugs.add(product.slug);
  }

  return mergedProducts
    .filter((product) => product.slug !== mainSlug)
    .sort((firstProduct, secondProduct) => {
      const firstScore = hashString(`${firstProduct.slug}:${firstProduct.name}:featured-products`);
      const secondScore = hashString(`${secondProduct.slug}:${secondProduct.name}:featured-products`);

      return firstScore - secondScore;
    });
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

  const smallProducts = getShuffledSmallProducts(products)
    .slice(0, 3)
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
