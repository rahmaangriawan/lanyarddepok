"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogoLoop from "@/components/LogoLoop";

import dynamic from "next/dynamic";

import LanyardPreviewer from "@/components/LanyardPreviewer";
import LanyardProducts from "@/components/LanyardProducts";
import LanyardBranding from "@/components/LanyardBranding";
import Testimonials from "@/components/Testimonials";

const LanyardPortfolio = dynamic(() => import("@/components/LanyardPortfolio"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] sm:h-[550px] md:h-[600px] flex items-center justify-center bg-gray-50/50 rounded-2xl select-none">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e13b3d]"></div>
    </div>
  ),
});

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
      "@id": "https://lanyardjakarta.co.id/#organization",
      "name": "Lanyard Jakarta",
      "url": "https://lanyardjakarta.co.id",
      "logo": "https://lanyardjakarta.co.id/images/logo.webp",
      "image": "https://lanyardjakarta.co.id/images/logo.webp",
      "description": "Produsen cetak tali lanyard custom premium cepat dan murah di Jakarta.",
      "telephone": "+6282210200700",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jakarta",
        "addressLocality": "Jakarta",
        "addressRegion": "DKI Jakarta",
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
        "https://www.facebook.com/lanyardjakarta",
        "https://www.instagram.com/lanyardjakarta"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://lanyardjakarta.co.id/#website",
      "url": "https://lanyardjakarta.co.id",
      "name": "Lanyard Jakarta",
      "publisher": {
        "@id": "https://lanyardjakarta.co.id/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://lanyardjakarta.co.id/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export type HomepagePost = {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
  categoryName: string | null;
  createdAt: string;
  excerpt: string;
};

type HomeClientProps = {
  latestPosts?: HomepagePost[];
};

function LatestBlogSection({ posts }: { posts: HomepagePost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 text-center lg:text-left mb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center gap-3 text-brand-red">
              <span className="h-px w-8 bg-current" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Blog Terbaru</span>
              <span className="h-px w-8 bg-current" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#373f50] tracking-tight leading-tight">
              Insight & Tips <span className="text-brand-red">Lanyard</span>
            </h2>
            <p className="text-sm sm:text-base font-normal text-gray-500 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Baca panduan terbaru seputar desain, bahan, dan kebutuhan branding untuk lanyard custom.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center justify-center self-center lg:self-auto rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-extrabold text-[#373f50] hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <span>Lihat Semua Artikel</span>
            <Icon icon="lucide:arrow-right" className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
          {posts.map((post) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            });

            return (
              <article
                key={post.id}
                className="group flex h-full flex-col"
              >
                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-50 rounded-[10px] shrink-0">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      width={520}
                      height={292}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                      <Icon icon="lucide:image" className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute top-4 right-4 bg-white/80 backdrop-blur-xs text-[#373f50] text-sm font-medium px-4 py-1 rounded-full">
                    {post.categoryName || "Artikel"}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col justify-between pt-5 px-4 sm:px-5">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-[#111827] text-xl sm:text-2xl font-medium leading-snug tracking-normal group-hover:text-brand-red transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon icon="lucide:calendar-days" className="h-4 w-4 shrink-0 text-gray-500" />
                      <span className="truncate">{formattedDate}</span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex shrink-0 items-center gap-2 text-sm font-normal text-[#111827] hover:text-brand-red transition-colors"
                    >
                      <span>Read more</span>
                      <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomeClient({ latestPosts = [] }: HomeClientProps) {

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
    } catch (err) {
      setPreviewError("Gagal memuat pratinjau konten.");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (previewLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-red border-t-transparent" />
            <p className="text-sm font-semibold text-gray-500">Memuat pratinjau draf...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
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
        <Footer />
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
        <Header />
        
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
              dangerouslySetInnerHTML={{ __html: previewData.content }} 
            />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_SCHEMA) }}
      />
      <Header />

      <main className="flex-grow">
        
        {/* Modern 2-Column Hero Section */}
        <section id="hero" className="relative bg-[#FDFDFD] overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-72px)] lg:h-[calc(100vh-176px)] select-none">
          {/* Left Column - Content */}
          <div className="w-full lg:w-1/2 flex items-center justify-end py-12 lg:py-0 px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-[540px] w-full lg:pr-6 space-y-6 text-center lg:text-left">
              
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#373f50] leading-[1.15] tracking-tight">
                Cetak <span className="text-[#e13b3d]">Lanyard Jakarta</span> Premium & Custom Tanpa Batas
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
                Spesialis pembuatan tali gantungan ID card custom berkualitas tinggi untuk perkantoran, instansi pemerintah, dan berbagai event besar. Hasil cetak detail presisi dengan bahan premium yang nyaman dipakai sepanjang hari.
              </p>

              {/* 3 Key Advantages */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="bg-[#ffe3e3] p-1.5 rounded-full text-[#e13b3d] shrink-0">
                    <Icon icon="lucide:check" className="h-4 w-4" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#373f50]">Kualitas Cetak Premium & Tahan Lama</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="bg-[#ffe3e3] p-1.5 rounded-full text-[#e13b3d] shrink-0">
                    <Icon icon="lucide:check" className="h-4 w-4" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#373f50]">Proses Cepat & Tepat Waktu</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="bg-[#ffe3e3] p-1.5 rounded-full text-[#e13b3d] shrink-0">
                    <Icon icon="lucide:check" className="h-4 w-4" />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#373f50]">Minimal Order Fleksibel & Terjangkau</span>
                </div>
              </div>

              {/* 2 CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="https://wa.me/6282210200700"
                  target="_blank"
                  className="inline-flex w-full sm:w-auto items-center justify-center bg-[#e13b3d] hover:bg-[#c82a2c] text-white text-sm sm:text-base font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-[#e13b3d]/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
                >
                  <Icon icon="lucide:phone" className="mr-2 h-5 w-5" />
                  <span>Pesan via WhatsApp</span>
                </Link>
                <Link
                  href="/produk"
                  className="inline-flex w-full sm:w-auto items-center justify-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm sm:text-base font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Lihat Katalog</span>
                  <Icon icon="lucide:shopping-bag" className="ml-2 h-5 w-5 text-gray-400" />
                </Link>
              </div>

            </div>
          </div>

          {/* Right Column - Image (Stretching and flush to screen edge) */}
          <div className="w-full lg:w-1/2 relative min-h-[350px] lg:min-h-0 bg-gray-100 overflow-hidden">
            <Image
              src="/uploads/lanyard-jakarta-hero-1782129081107.webp"
              alt="Lanyard Jakarta Premium"
              className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
              draggable="false"
              priority
              width={964}
              height={1254}
            />
          </div>
        </section>

        {/* Brand Logo Loop Section */}
        <section className="bg-white py-6 border-b border-gray-100/60 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full overflow-hidden">
              <LogoLoop
                logos={PARTNER_LOGOS}
                speed={40}
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

        {/* Live Preview / Customizer Section */}
        <LanyardPreviewer />

        {/* Dynamic Pricing / Order Section */}
        <LanyardProducts />

        {/* Portfolio Section */}
        <LanyardPortfolio />

        {/* Branding Section */}
        <LanyardBranding />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Inquiry Form / Contact Section */}
        <OrderForm />

        {/* Latest Blog Section */}
        <LatestBlogSection posts={latestPosts} />
      </main>

      <Footer />
    </div>
  );
}
