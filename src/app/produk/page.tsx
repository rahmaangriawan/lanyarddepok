import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import ProdukListing from "./ProdukListing";

export const metadata: Metadata = {
  title: "Katalog Produk Tali Lanyard Custom",
  description:
    "Jelajahi berbagai pilihan cetak tali gantungan lanyard custom premium kualitas terbaik di Lanyard Jakarta. Lanyard sublimasi, rajut woven, bundling holder, harga murah.",
  alternates: {
    canonical: "/produk",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/produk/#webpage`,
      url: `${siteUrl}/produk`,
      name: "Katalog Produk Tali Lanyard Custom - Lanyard Jakarta",
      description:
        "Jelajahi berbagai pilihan cetak tali gantungan lanyard custom premium kualitas terbaik di Lanyard Jakarta. Lanyard sublimasi, rajut woven, bundling holder, harga murah.",
      publisher: {
        "@type": "Organization",
        name: "Lanyard Jakarta",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/logo.webp`,
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/produk/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Katalog Produk", item: `${siteUrl}/produk` },
      ],
    },
  ],
};

export default function ProdukListingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* ─── Hero Section ─── */}
      <section className="relative w-full bg-white border-b border-gray-100 pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
        {/* Background Image / Confetti Decoration */}
        <div 
          className="absolute inset-0 bg-[url('/uploads/aset-lanyard-7-1782202689750.webp')] bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        />
        
        {/* Hero Content aligned to max-w-7xl */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest select-none">
              Katalog Lanyard
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
              Pilihan Produk Lanyard<br />Custom Terbaik
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Temukan berbagai jenis tali gantungan lanyard berkualitas tinggi untuk menunjang kebutuhan identitas instansi, kepanitiaan event, maupun promosi branding corporate Anda.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content Listing ─── */}
      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <ProdukListing />

        </div>
      </main>

      <Footer />
    </div>
  );
}
