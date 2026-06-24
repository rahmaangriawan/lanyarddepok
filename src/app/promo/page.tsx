import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Promo Spesial Lanyard Custom",
  description:
    "Dapatkan penawaran eksklusif cetak lanyard custom premium di Lanyard Jakarta. Gratis jasa desain mockup, diskon volume besar, dan paket bundling card holder.",
  alternates: {
    canonical: "/promo",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/promo/#webpage`,
      url: `${siteUrl}/promo`,
      name: "Promo Spesial Lanyard Custom - Lanyard Jakarta",
      description:
        "Dapatkan penawaran eksklusif cetak lanyard custom premium di Lanyard Jakarta. Gratis jasa desain mockup, diskon volume besar, dan paket bundling card holder.",
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
      "@id": `${siteUrl}/promo/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Promo", item: `${siteUrl}/promo` },
      ],
    },
  ],
};

const stats = [
  { icon: "lucide:badge-check", value: "100%", label: "Produk Berkualitas" },
  { icon: "lucide:users", value: "5000+", label: "Klien Terpercaya" },
  { icon: "lucide:clock", value: "On Time", label: "Pengerjaan Tepat Waktu" },
  { icon: "lucide:headphones", value: "Fast Response", label: "Layanan Ramah" },
];

export default function PromoPage() {
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
          className="absolute inset-0 bg-[url('/uploads/aset-hero-promo-1782194196413.webp')] bg-cover bg-center bg-no-repeat opacity-95 pointer-events-none"
        />
        
        {/* Hero Content aligns with Header container width */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest select-none">
              Promo Spesial
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
              Dapatkan Penawaran<br />Eksklusif <span className="text-brand-red">Lanyard Jakarta</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Kami selalu menghadirkan berbagai program promo menarik khusus untuk membantu menghemat pengeluaran anggaran promosi dan operasional corporate Anda. Berikut adalah beberapa promo aktif saat ini:
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container (Aligns with Header container width) ─── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 sm:space-y-14 flex-grow">
        <main className="space-y-10 sm:space-y-14">
          
          {/* ─── Promo 01: Jasa Desain Mockup ─── */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF0F0] text-brand-red text-sm font-extrabold">
                  01
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] leading-tight">
                  <span className="text-brand-red">Gratis</span> Layanan Jasa Desain Mockup
                </h2>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Kesulitan membuat desain layout lanyard? Jangan khawatir! Kirimkan file logo resmi beserta preferensi warna instansi Anda, dan tim desainer profesional kami akan membuatkan mockup desain layout visual lanyard secara <span className="text-brand-red font-bold">GRATIS</span> tanpa dipungut biaya sepeser pun (Maksimal 3x revisi).
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Icon icon="lucide:pencil-ruler" className="w-5 h-5 text-brand-red" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#373f50]">Desain Profesional</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Icon icon="lucide:badge-percent" className="w-5 h-5 text-brand-red" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#373f50]">Gratis Tanpa Biaya</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Icon icon="lucide:rotate-ccw" className="w-5 h-5 text-brand-red" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#373f50]">Maksimal 3x Revisi</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 relative w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src="/uploads/gratis-layanan-desain-mockup-1782194427111.webp"
                  alt="Gratis Layanan Jasa Desain Mockup Lanyard Jakarta"
                  fill
                  sizes="(max-w-768px) 100vw, 400px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </div>

          {/* ─── Promo 02: Diskon Volume Pemesanan ─── */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 order-last md:order-first relative w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src="/uploads/diskon-volume-pemesanan-1782194540663.webp"
                  alt="Diskon Volume Pemesanan Skala Besar Lanyard Jakarta"
                  fill
                  sizes="(max-w-768px) 100vw, 400px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF0F0] text-brand-red text-sm font-extrabold">
                  02
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] leading-tight">
                  <span className="text-brand-red">Diskon</span> Volume Pemesanan Skala Besar
                </h2>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Dapatkan harga khusus super hemat untuk pemesanan cetak tali lanyard dalam volume besar (lebih dari 500 pcs). Silakan berkonsultasi langsung dengan admin customer service kami untuk mendapatkan harga penawaran resmi (Quotation proposal) dengan potongan diskon yang melimpah.
                </p>
                <div className="flex items-center space-x-3 p-4 bg-[#FFF5F5] text-brand-red rounded-2xl border border-red-100">
                  <Icon icon="lucide:percent" className="w-5 h-5 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Semakin banyak order, semakin besar diskonnya</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Promo 03: Paket Bundling Lanyard & Holder Premium ─── */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF0F0] text-brand-red text-sm font-extrabold">
                  03
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a202c] leading-tight">
                  Paket <span className="text-brand-red">Bundling</span> Lanyard &amp; Holder Premium
                </h2>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Nikmati harga paket hemat terjangkau untuk setiap pemesanan tali lanyard sublimasi full color yang langsung sepaket dengan casing / wadah pelindung ID Card (Card Holder) kualitas premium tebal. Pilihan casing karet, akrilik transparan, hingga wadah kulit sintetis elegan.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Icon icon="lucide:shield" className="w-5 h-5 text-brand-red" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#373f50]">Casing Karet</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Icon icon="lucide:layers" className="w-5 h-5 text-brand-red" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#373f50]">Akrilik Transparan</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Icon icon="lucide:pocket" className="w-5 h-5 text-brand-red" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#373f50]">Kulit Sintetis Elegan</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5 relative w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src="/uploads/paket-bundling-1782194588004.webp"
                  alt="Paket Bundling Lanyard & Holder Premium Lanyard Jakarta"
                  fill
                  sizes="(max-w-768px) 100vw, 400px"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* ─── Bottom CTA Banner ─── */}
          <div className="bg-[#FFF5F5] border border-red-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xs transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-xs relative">
                <Image
                  src="/uploads/hadiah-promo-1782195317024.webp"
                  alt="Hadiah Promo Lanyard Jakarta"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#1a202c]">
                  Promo menarik lainnya menanti Anda!
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Syarat dan ketentuan berlaku. Promo dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.
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
                Klaim promo Anda hari ini juga!
              </span>
            </div>
          </div>

          {/* ─── Stats Bar ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-gray-100">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-red-100 hover:bg-[#FFFDFD] transition-all duration-200 space-y-2 group shadow-2xs"
              >
                <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-3xs group-hover:border-red-200 group-hover:bg-white transition-all">
                  <Icon icon={s.icon} className="h-5 w-5 text-brand-red" />
                </div>
                <span className="text-sm sm:text-base font-extrabold text-[#1a202c] leading-tight">
                  {s.value}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
