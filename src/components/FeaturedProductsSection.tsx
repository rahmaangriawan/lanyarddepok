import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductListingHref } from "@/lib/product-links";
import type { UnifiedProduct } from "@/lib/products-service";

type FeaturedProductsSectionProps = {
  products?: UnifiedProduct[];
};

type ProductShowcase = {
  title: string;
  description: string;
  image: string;
  href: string;
};

const FALLBACK_ITEMS: ProductShowcase[] = [
  {
    title: "Lanyard Printing",
    description: "Hasil cetak tajam dengan pilihan warna lengkap.",
    image: "/uploads/featured-lanyard-polyester-main.webp",
    href: "/produk",
  },
  {
    title: "Lanyard Event",
    description: "Cocok untuk acara, seminar, dan kegiatan komunitas.",
    image: "/uploads/hero-lanyard-slider-01.webp",
    href: "/produk",
  },
  {
    title: "Lanyard ID Card",
    description: "Praktis dengan berbagai aksesoris pendukung.",
    image: "/uploads/hero-lanyard-slider-02.webp",
    href: "/produk",
  },
  {
    title: "Lanyard Premium",
    description: "Material dan finishing premium untuk kesan eksklusif.",
    image: "/uploads/cta-footer-lanyard-custom-home.webp",
    href: "/produk",
  },
];

const SHOWCASE_IMAGE = "/uploads/featured-products-showcase-lanyarddepok-v2.webp";

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength = 72) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function normalizeBrandText(value: string) {
  return value.replace(/\bBogor\b/g, "Depok");
}

function getProductDescription(product: UnifiedProduct) {
  const description =
    product.metaDescription ||
    product.description ||
    product.specs ||
    product.category?.name ||
    "Pilihan lanyard custom untuk kebutuhan brand dan event Anda.";

  return normalizeBrandText(truncateText(stripHtml(description)));
}

function getShowcaseItems(products: UnifiedProduct[]): ProductShowcase[] {
  const dynamicItems = products.slice(0, 4).map((product) => ({
    title: normalizeBrandText(product.name || "Produk Lanyard"),
    description: getProductDescription(product),
    image: product.featuredImage || "/uploads/featured-lanyard-polyester-main.webp",
    href: getProductListingHref(product),
  }));

  if (dynamicItems.length === 0) {
    return FALLBACK_ITEMS;
  }

  return dynamicItems;
}

export default function FeaturedProductsSection({
  products = [],
}: FeaturedProductsSectionProps) {
  const showcaseItems = getShowcaseItems(products);

  return (
    <section className="border-b border-border bg-[#fff] px-4 py-20 text-foreground sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
        <div className="flex min-w-0 flex-col">
          <div>
            <p className="text-xs font-extrabold uppercase leading-5 tracking-normal text-primary">
              Pilihan Produk
            </p>
            <h2 className="mt-6 max-w-xl text-[2rem] font-extrabold leading-[1.08] tracking-normal text-foreground sm:text-[2.4rem] lg:text-[2.75rem]">
              Beragam pilihan untuk{" "}
              <span className="text-primary">kebutuhan Anda.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
              Temukan lanyard yang sesuai dengan acara, identitas, dan
              kebutuhan Anda.
            </p>
            <Link
              href="/produk"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-4 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-16 lg:mt-20">
            <div className="relative aspect-[4/3] min-h-[15rem] sm:min-h-[18rem]">
              <Image
                src={SHOWCASE_IMAGE}
                alt="Pilihan lanyard custom Lanyard Depok"
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 38vw, 100vw"
                loading="eager"
                quality={60}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {showcaseItems.map(({ title, description, image, href }, index) => (
            <Link
              href={href}
              key={title}
              className="group grid overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 md:grid-cols-[0.85fr_1fr]"
            >
              <div className="relative min-h-[9rem] overflow-hidden md:min-h-[7.5rem]">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={60}
                />
              </div>

              <div className="flex min-h-[7.5rem] items-center gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-extrabold leading-none text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <span className="mt-2.5 block h-0.5 w-7 rounded-full bg-primary" />
                  <h3 className="mt-3 text-lg font-extrabold leading-tight tracking-normal text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
