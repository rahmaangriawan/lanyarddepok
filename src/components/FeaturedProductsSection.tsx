"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { UnifiedProduct } from "@/lib/products-service";

const FEATURED_PRODUCT = {
  name: "Lanyard Polyester",
  price: "Rp 6.000",
  image: "/uploads/featured-lanyard-polyester-main.webp",
  points: ["min. order 20", "Bahan terbaik", "Kualitas premium"],
};

const MAIN_PRODUCT_NAME = "Lanyard Polyester";
const MAIN_PRODUCT_IMAGE = "/uploads/cta-footer-lanyard-custom.webp";
const MAIN_PRODUCT_POINTS = ["min. order 20", "Bahan terbaik", "Kualitas premium"];

const PRODUCT_LIST = [
  {
    name: "Keychain Lanyard",
    desc: "Lembut & mengkilap",
    price: "Rp 7.000",
    image: "/uploads/hero-lanyard-slider-04.webp",
  },
  {
    name: "Lanyard Printing 2 Sisi",
    desc: "Desain terlihat dari kedua sisi",
    price: "Rp 7.500",
    image: "/uploads/hero-lanyard-slider-03.webp",
  },
  {
    name: "Aksesoris & ID Card",
    desc: "Lengkapi lanyard anda",
    price: "Rp 2.000",
    image: "/uploads/paket-bundling-1782194588004.webp",
  },
  {
    name: "Wristband Lanyard",
    desc: "Cocok untuk event & akses tamu",
    price: "Rp 3.000",
    image: "/uploads/1781967181944-wristband.webp",
  },
];

type FeaturedProductsSectionProps = {
  products?: UnifiedProduct[];
};

function productPrice(product: UnifiedProduct, fallback: string) {
  return product.basePrice && product.basePrice !== "0" ? product.basePrice : fallback;
}

export default function FeaturedProductsSection({ products = [] }: FeaturedProductsSectionProps) {
  const mainProduct = products[0]
    ? {
        name: MAIN_PRODUCT_NAME,
        price: productPrice(products[0], FEATURED_PRODUCT.price),
        image: MAIN_PRODUCT_IMAGE,
        href: `/produk/${products[0].slug}`,
        points: MAIN_PRODUCT_POINTS,
      }
    : {
        ...FEATURED_PRODUCT,
        name: MAIN_PRODUCT_NAME,
        image: MAIN_PRODUCT_IMAGE,
        points: MAIN_PRODUCT_POINTS,
        href: "/produk",
      };

  const smallProducts = products.length > 1
    ? products.slice(1, 5).map((product, index) => ({
        name: product.name,
        desc: product.metaDescription || product.specs || PRODUCT_LIST[index]?.desc || "Lanyard custom premium",
        price: productPrice(product, PRODUCT_LIST[index]?.price || "Rp 0"),
        image: product.featuredImage || PRODUCT_LIST[index]?.image || FEATURED_PRODUCT.image,
        href: `/produk/${product.slug}`,
      }))
    : PRODUCT_LIST.map((product) => ({ ...product, href: "/produk" }));

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
            <Icon icon="lucide:arrow-right" className="featured-products-button-icon" />
          </Link>
        </div>

        <article className="featured-products-main-card">
          <div className="featured-products-badge">
            <Icon icon="lucide:star" className="featured-products-badge-icon" />
            <span>Popular</span>
          </div>

          <div className="featured-products-main-content">
            <div className="featured-products-main-text">
              <h3>{mainProduct.name}</h3>
              <ul>
                {(mainProduct.points.length > 0 ? mainProduct.points : FEATURED_PRODUCT.points).map((point) => (
                  <li key={point}>
                    <Icon icon="lucide:check" />
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
                sizes="(min-width: 1024px) 28vw, 70vw"
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
                  sizes="(min-width: 1024px) 12vw, 34vw"
                />
              </div>
              <div className="featured-products-small-copy">
                <h3>{product.name}</h3>
                <span>
                  Mulai dari <strong>{product.price}</strong>
                </span>
              </div>
              <span className="featured-products-small-action">
                <Icon icon="lucide:arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
