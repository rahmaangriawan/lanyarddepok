import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import SyaratKetentuanContent from "./SyaratKetentuanContent";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan Pemesanan",
  description:
    "Pelajari syarat dan ketentuan pemesanan tali lanyard custom premium di Lanyard Jakarta. Informasi MOQ, approval desain mockup, sistem pembayaran, dan garansi.",
  alternates: {
    canonical: "/syarat-ketentuan",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/syarat-ketentuan/#webpage`,
      url: `${siteUrl}/syarat-ketentuan`,
      name: "Syarat dan Ketentuan Pemesanan - Lanyard Jakarta",
      description:
        "Pelajari syarat dan ketentuan pemesanan tali lanyard custom premium di Lanyard Jakarta. Informasi MOQ, approval desain mockup, sistem pembayaran, dan garansi.",
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
      "@id": `${siteUrl}/syarat-ketentuan/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Syarat & Ketentuan", item: `${siteUrl}/syarat-ketentuan` },
      ],
    },
  ],
};

export default function SyaratKetentuanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* ─── Hero Section (Full-Width Background) ─── */}
      <section className="relative w-full bg-white border-b border-gray-100 pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
        {/* Background Image spans full screen width */}
        <div 
          className="absolute inset-0 bg-[url('/uploads/aset-lanyard-7-1782202689750.webp')] bg-cover bg-center bg-no-repeat opacity-95 pointer-events-none"
        />
        
        {/* Hero Content aligns with Header container width */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest select-none">
              Syarat &amp; Ketentuan
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
              Syarat dan Ketentuan<br />Pemesanan Lanyard
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Terima kasih telah mempercayakan pengerjaan tali lanyard corporate Anda kepada Lanyard Jakarta. Harap membaca Syarat &amp; Ketentuan di bawah ini sebelum menyetujui pemesanan barang:
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container with Stacking Cards ─── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-grow">
        
        {/* Render the Client Component with ScrollStack cards */}
        <SyaratKetentuanContent />

        {/* ─── Bottom Penting untuk Diperhatikan Banner ─── */}
        <div className="bg-[#FFF5F5] border border-red-100 rounded-3xl p-6 sm:p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xs transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
              <Icon icon="lucide:info" className="w-8 h-8 text-brand-red" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1a202c]">
                Penting untuk Diperhatikan
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Dengan melakukan pemesanan, berarti Anda telah membaca, memahami, dan menyetujui seluruh syarat &amp; ketentuan yang berlaku.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-auto space-y-2 shrink-0">
            <a
              href="https://wa.me/6282210200700"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center bg-[#FF4C4C] hover:bg-[#e03d3d] text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md shadow-red-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Icon icon="lucide:phone" className="mr-2 h-4.5 w-4.5" />
              Hubungi WhatsApp Sekarang
            </a>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Tim kami siap membantu Anda!
            </span>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
