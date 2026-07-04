import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { getProducts } from "@/lib/products-server";
import type { UnifiedProduct } from "@/lib/products-service";
import { getCachedHomepagePosts } from "@/lib/public-cache";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import HomeHero from "@/components/HomeHero";
import LogoLoop from "@/components/LogoLoop";
import ProductBenefitsStrip from "@/components/ProductBenefitsStrip";
import WhyChooseLanyardBogor from "@/components/WhyChooseLanyardBogor";
import DeferredHomeSections from "./DeferredHomeSections";
import HomePreviewClient from "./HomePreviewClient";

type HomepagePost = {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
};

const PARTNER_LOGOS = [
  { src: "/images/logos/bank-indonesia.svg", alt: "Bank Indonesia", href: "https://www.bi.go.id", width: 112, height: 32 },
  { src: "/images/logos/telkomsel.svg", alt: "Telkomsel", href: "https://www.telkomsel.com", width: 96, height: 32 },
  { src: "/images/logos/kemenkes.svg", alt: "Kemenkes RI", href: "https://www.kemkes.go.id", width: 96, height: 32 },
  { src: "/images/logos/bca.svg", alt: "BCA", href: "https://www.bca.co.id", width: 96, height: 32 },
  { src: "/images/logos/universitas-indonesia.png", alt: "Universitas Indonesia", href: "https://www.ui.ac.id", width: 104, height: 32 },
  { src: "/images/logos/bumn.svg", alt: "BUMN", href: "https://www.bumn.go.id", width: 80, height: 32 },
  { src: "/images/logos/biznet.svg", alt: "Biznet", href: "https://www.biznetnetworks.com", width: 96, height: 32 },
  { src: "/images/logos/komdigi.svg", alt: "Komdigi", href: "https://www.kominfo.go.id", width: 96, height: 32 },
];

const HOMEPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://lanyardbogor.com/#organization",
      name: "Lanyard Bogor",
      url: "https://lanyardbogor.com",
      logo: "https://lanyardbogor.com/uploads/lanyardbogor-logo.webp",
      image: "https://lanyardbogor.com/uploads/lanyardbogor-logo.webp",
      description: "Produsen cetak tali lanyard custom premium cepat dan murah di Bogor.",
      telephone: "+6282210200700",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bogor",
        addressLocality: "Bogor",
        addressRegion: "Bogor",
        postalCode: "10000",
        addressCountry: "ID",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+6282210200700",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: ["id", "en"],
      },
      sameAs: [
        "https://www.facebook.com/lanyardbogor",
        "https://www.instagram.com/lanyardbogor",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://lanyardbogor.com/#website",
      url: "https://lanyardbogor.com",
      name: "Lanyard Bogor",
      publisher: {
        "@id": "https://lanyardbogor.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://lanyardbogor.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://lanyardbogor.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: "https://lanyardbogor.com",
        },
      ],
    },
  ],
};

export const revalidate = 600;

function LatestBlogSection({ posts }: { posts: HomepagePost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="homepage-blog-section">
      <div className="homepage-blog-container">
        <div className="homepage-blog-grid">
          <div className="homepage-blog-intro">
            <p className="homepage-blog-kicker">Blog Terbaru</p>
            <h2>
              <span>Artikel &amp; Insight</span>
              <span>Terbaru</span>
            </h2>
            <p>
              Baca panduan terbaru seputar desain, bahan, dan kebutuhan branding untuk lanyard custom.
            </p>
            <Link href="/blog" className="homepage-blog-browse">
              <span>Lihat Semua</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {posts.slice(0, 5).map((post) => (
            <article key={post.id} className="homepage-blog-card">
              <Link href={`/blog/${post.slug}`} className="homepage-blog-media" aria-label={post.title}>
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    className="homepage-blog-image"
                    width={520}
                    height={292}
                    loading="lazy"
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 46vw, 320px"
                    quality={56}
                  />
                ) : (
                  <div className="homepage-blog-placeholder">
                    <ImageIcon className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
              </Link>

              <div className="homepage-blog-content">
                <Link href={`/blog/${post.slug}`} className="homepage-blog-title-link">
                  <h3>{post.title}</h3>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  let posts: HomepagePost[] = [];
  let homepageProducts: UnifiedProduct[] = [];

  try {
    posts = await getCachedHomepagePosts();
  } catch (err) {
    console.error("Failed to fetch homepage posts:", err);
  }

  try {
    homepageProducts = await getProducts();
  } catch (err) {
    console.error("Failed to fetch homepage products:", err);
  }

  const latestPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    featuredImage: post.featuredImage,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_SCHEMA) }}
      />
      <HomePreviewClient />

      <main className="flex-grow">
        <HomeHero />
        <FeaturedProductsSection products={homepageProducts} />
        <ProductBenefitsStrip />
        <WhyChooseLanyardBogor />

        <section className="select-none border-b border-gray-100/60 bg-white pb-[60px] pt-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="w-full overflow-hidden">
              <LogoLoop
                logos={PARTNER_LOGOS}
                speed={40}
                direction="right"
                logoHeight={32}
                gap={48}
                fadeOut
                fadeOutColor="#ffffff"
                pauseOnHover
                scaleOnHover
              />
            </div>
          </div>
        </section>

        <DeferredHomeSections />
        <LatestBlogSection posts={latestPosts} />
      </main>
    </div>
  );
}
