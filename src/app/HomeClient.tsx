"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import LogoLoop from "@/components/LogoLoop";

import dynamic from "next/dynamic";

import AnimatedTestimonialsSection from "@/components/AnimatedTestimonialsSection";
import HomepageFaqSection from "@/components/HomepageFaqSection";
import HomeHero from "@/components/HomeHero";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import WhyChooseLanyardBogor from "@/components/WhyChooseLanyardBogor";
import ProductBenefitsStrip from "@/components/ProductBenefitsStrip";
import LanyardRadialGallerySection from "@/components/LanyardRadialGallerySection";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";
import type { UnifiedProduct } from "@/lib/products-service";

const OrderForm = dynamic(() => import("@/components/OrderForm"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-gray-50/50 rounded-2xl">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e13b3d]"></div>
    </div>
  ),
});


const PARTNER_LOGOS = [
  { src: "/images/logos/bank-indonesia.svg", alt: "Bank Indonesia", href: "https://www.bi.go.id", width: 112, height: 32 },
  { src: "/images/logos/telkomsel.svg", alt: "Telkomsel", href: "https://www.telkomsel.com", width: 96, height: 32 },
  { src: "/images/logos/kemenkes.svg", alt: "Kemenkes RI", href: "https://www.kemkes.go.id", width: 96, height: 32 },
  { src: "/images/logos/bca.svg", alt: "BCA", href: "https://www.bca.co.id", width: 96, height: 32 },
  { src: "/images/logos/universitas-indonesia.png", alt: "Universitas Indonesia", href: "https://www.ui.ac.id", width: 104, height: 32 },
  { src: "/images/logos/bumn.svg", alt: "BUMN", href: "https://www.bumn.go.id", width: 80, height: 32 },
  { src: "/images/logos/biznet.svg", alt: "Biznet", href: "https://www.biznetnetworks.com", width: 96, height: 32 },
  { src: "/images/logos/komdigi.svg", alt: "Komdigi", href: "https://www.kominfo.go.id", width: 96, height: 32 }
];

const HOMEPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://lanyardbogor.com/#organization",
      "name": "Lanyard Bogor",
      "url": "https://lanyardbogor.com",
      "logo": "https://lanyardbogor.com/uploads/lanyardbogor-logo.webp",
      "image": "https://lanyardbogor.com/uploads/lanyardbogor-logo.webp",
      "description": "Produsen cetak tali lanyard custom premium cepat dan murah di Bogor.",
      "telephone": "+6282210200700",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Bogor",
        "addressLocality": "Bogor",
        "addressRegion": "Bogor",
        "postalCode": "10000",
        "addressCountry": "ID"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+6282210200700",
        "contactType": "customer service",
        "areaServed": "ID",
        "availableLanguage": ["id", "en"]
      },
      "sameAs": [
        "https://www.facebook.com/lanyardbogor",
        "https://www.instagram.com/lanyardbogor"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://lanyardbogor.com/#website",
      "url": "https://lanyardbogor.com",
      "name": "Lanyard Bogor",
      "publisher": {
        "@id": "https://lanyardbogor.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://lanyardbogor.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://lanyardbogor.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Beranda",
          "item": "https://lanyardbogor.com"
        }
      ]
    }
  ]
};

export type HomepagePost = {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
};

type HomeClientProps = {
  latestPosts?: HomepagePost[];
  homepageProducts?: UnifiedProduct[];
};

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
              <Icon icon="lucide:arrow-right" />
            </Link>
          </div>

          {posts.slice(0, 5).map((post) => {
            return (
              <article key={post.id} className="homepage-blog-card">
                <Link href={`/blog/${post.slug}`} className="homepage-blog-media" aria-label={post.title}>
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      className="homepage-blog-image"
                      width={520}
                      height={292}
                    />
                  ) : (
                    <div className="homepage-blog-placeholder">
                      <Icon icon="lucide:image" className="h-10 w-10" />
                    </div>
                  )}
                </Link>

                <div className="homepage-blog-content">
                  <Link href={`/blog/${post.slug}`} className="homepage-blog-title-link">
                    <h3>{post.title}</h3>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomeClient({ latestPosts = [], homepageProducts = [] }: HomeClientProps) {

  // Preview states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewData, setPreviewData] = useState<{
    title: string;
    content: string;
    category?: string;
    date: string;
    type: "post" | "page";
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      const match = search.match(/^\?preview-(\d+)$/);
      if (match) {
        const id = parseInt(match[1], 10);
        loadPreview(id);
      }
    }
  }, []);

  const loadPreview = async (id: number) => {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      // First try posts
      let res = await fetch(`/api/cms/posts/${id}`);
      let data = await res.json();
      if (res.ok && data.post) {
        setPreviewData({
          title: data.post.title,
          content: data.post.content,
          category: data.post.category?.name || "Uncategorized",
          date: new Date(data.post.createdAt).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }),
          type: "post"
        });
        return;
      }

      // If not post, try pages
      res = await fetch(`/api/cms/pages/${id}`);
      data = await res.json();
      if (res.ok && data.page) {
        setPreviewData({
          title: data.page.title,
          content: data.page.content,
          category: "Halaman Statis",
          date: new Date(data.page.createdAt).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }),
          type: "page"
        });
        return;
      }

      setPreviewError("Konten pratinjau tidak ditemukan atau Anda tidak memiliki akses admin.");
    } catch {
      setPreviewError("Gagal memuat pratinjau konten.");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (previewLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-red border-t-transparent" />
            <p className="text-sm font-semibold text-gray-500">Memuat pratinjau draf...</p>
          </div>
        </div>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center py-20 px-5">
          <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-lg space-y-4">
            <div className="inline-flex p-3 rounded-full bg-red-50 text-red-500">
              <Icon icon="lucide:alert-triangle" className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">Gagal Memuat Pratinjau</h2>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">{previewError}</p>
            <div className="pt-2">
              <Link href="/" className="inline-block w-full bg-brand-red hover:bg-brand-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase transition-colors">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (previewData) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_SCHEMA) }}
        />
        
        {/* Draft Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-5 text-center text-xs text-amber-800 font-bold flex items-center justify-center space-x-2 animate-pulse mt-[72px] md:mt-[80px]">
          <Icon icon="lucide:eye" className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Mode Pratinjau: Halaman draf ini hanya dapat dilihat oleh Administrator.</span>
        </div>

        <main className="flex-grow max-w-4xl w-full mx-auto px-5 py-12">
          {/* Article Header */}
          <div className="space-y-4 pb-8 border-b border-gray-100 mt-6">
            {previewData.type === "post" && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-light-50 text-brand-red uppercase tracking-wider">
                {previewData.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              {previewData.title}
            </h1>
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-400">
              <Icon icon="lucide:calendar" className="h-3.5 w-3.5" />
              <span>Dibuat: {previewData.date}</span>
              <span className="text-gray-200">|</span>
              <Icon icon="lucide:user" className="h-3.5 w-3.5" />
              <span>Oleh: Admin</span>
            </div>
          </div>

          {/* Article Content rendered with Quill styling container class */}
          <div className="py-8 prose max-w-none">
            <div 
              className="ql-editor !p-0 !min-h-0 text-gray-700 leading-relaxed text-base" 
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(previewData.content) }} 
            />
          </div>
        </main>

      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_SCHEMA) }}
      />

      <main className="flex-grow">
        
        <HomeHero />

        <FeaturedProductsSection products={homepageProducts} />

        <ProductBenefitsStrip />

        <WhyChooseLanyardBogor />

        {/* Brand Logo Loop Section */}
        <section className="bg-white pt-6 pb-[60px] border-b border-gray-100/60 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <LanyardRadialGallerySection />

        <AnimatedTestimonialsSection />

        <HomepageFaqSection />

        {/* Latest Blog Section */}
        <LatestBlogSection posts={latestPosts} />

        {/* Inquiry Form / Contact Section */}
        <OrderForm />
      </main>

    </div>
  );
}
