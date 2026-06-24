import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import CaraPemesananContent from "./CaraPemesananContent";

export const metadata: Metadata = {
  title: "Cara Pemesanan Lanyard Custom",
  description:
    "Panduan lengkap cara memesan lanyard custom di Lanyard Jakarta. Proses mudah 5 langkah: konsultasi, desain gratis, pembayaran DP, produksi kilat, hingga pengiriman ke seluruh Indonesia.",
  alternates: {
    canonical: "/cara-pemesanan",
  },
  openGraph: {
    title: "Cara Pemesanan Lanyard Custom",
    description:
      "Pesan lanyard custom di Lanyard Jakarta sangat mudah! Ikuti 5 langkah sederhana dan dapatkan produk lanyard premium berkualitas tinggi.",
    type: "website",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/cara-pemesanan/#howto`,
      name: "Cara Memesan Lanyard Custom di Lanyard Jakarta",
      description:
        "Panduan langkah demi langkah cara memesan lanyard custom di Lanyard Jakarta, mulai dari konsultasi spesifikasi hingga pengiriman produk jadi.",
      totalTime: "P1D",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Konsultasi & Spesifikasi",
          text: "Hubungi tim kami via WhatsApp untuk konsultasi kebutuhan lanyard Anda: ukuran, bahan, jumlah, dan desain.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Desain Gratis",
          text: "Tim desainer kami akan membuat mockup desain lanyard sesuai brief Anda tanpa biaya tambahan.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Pembayaran DP",
          text: "Setujui desain final dan lakukan pembayaran uang muka (DP) 50% untuk memulai proses produksi.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Produksi Kilat",
          text: "Lanyard Anda diproduksi menggunakan mesin cetak sublimasi premium. Estimasi produksi 1–3 hari kerja.",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Pengiriman & Pelunasan",
          text: "Produk dikemas dengan aman dan dikirim ke seluruh Indonesia. Pelunasan dilakukan setelah barang siap kirim.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/cara-pemesanan/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cara Pemesanan",
          item: `${siteUrl}/cara-pemesanan`,
        },
      ],
    },
  ],
};

const faqs = [
  {
    q: "Berapa minimum order lanyard?",
    a: "Minimum order kami sangat fleksibel, mulai dari 50 pcs. Semakin banyak jumlah order, semakin hemat harga per satuannya.",
  },
  {
    q: "Berapa lama estimasi produksi?",
    a: "Produksi normal membutuhkan 1–3 hari kerja setelah desain disetujui dan DP diterima. Tersedia juga layanan ekspres untuk kebutuhan mendadak.",
  },
  {
    q: "Apakah bisa kirim ke luar kota?",
    a: "Ya, kami melayani pengiriman ke seluruh wilayah Indonesia menggunakan jasa ekspedisi terpercaya seperti JNE, J&T, SiCepat, dan Wahana.",
  },
  {
    q: "Apakah ada biaya desain?",
    a: "Desain GRATIS! Tim desainer kami akan membantu membuat mockup lanyard sesuai kebutuhan Anda tanpa biaya tambahan.",
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Pembayaran DP 50% di awal produksi, sisa 50% setelah produk selesai dan siap kirim. Transfer via rekening bank BCA, Mandiri, atau BRI.",
  },
  {
    q: "Apakah ada garansi produk?",
    a: "Kami memberikan jaminan kualitas produk. Jika ada cacat produksi dari pihak kami, kami siap mengganti atau memperbaiki tanpa biaya.",
  },
];

export default function CaraPemesananPage() {
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
          className="absolute inset-0 bg-[url('/uploads/aset-lanyard-7-1782202689750.webp')] bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        />
        
        {/* Hero Content aligns with Header container width */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest select-none">
              Cara Pemesanan
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
              Panduan Cara Pemesanan<br />Lanyard Custom
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Pesan lanyard custom instansi atau corporate Anda di Lanyard Jakarta sangat mudah. Harap pelajari alur dan langkah-langkah pemesanan di bawah ini untuk memulai:
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container with Stacking Cards ─── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-grow">
        
        {/* Render the Client Component with ScrollStack cards */}
        <CaraPemesananContent />

        {/* ─── FAQ Section ─── */}
        <div className="max-w-3xl mx-auto mt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-[#373f50] tracking-tight">
              Tanya &amp; Jawab Pemesanan
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Jawaban ringkas atas berbagai pertanyaan yang paling sering diajukan pelanggan kami.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xs transition-shadow duration-200 space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-md bg-[#FFF0F0] border border-red-100 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black text-brand-red select-none">
                    Q
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#373f50] leading-tight">
                    {faq.q}
                  </h3>
                </div>
                <div className="flex items-start gap-2.5 pt-2 border-t border-gray-50">
                  <div className="h-5 w-5 rounded-md bg-gray-100 border border-gray-200/60 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black text-gray-500 select-none">
                    A
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Bottom Penting untuk Diperhatikan Banner ─── */}
        <div className="bg-[#FFF5F5] border border-red-100 rounded-3xl p-6 sm:p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xs transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
              <Icon icon="lucide:message-square" className="w-6 h-6 text-brand-red" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#1a202c]">
                Masih punya pertanyaan lain?
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Hubungi tim Customer Service kami langsung untuk konsultasi gratis dan penawaran khusus.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-auto space-y-2 shrink-0">
            <a
              href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Jakarta%2C%20saya%20tertarik%20dengan%20cetak%20lanyard%20custom..."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center bg-[#FF4C4C] hover:bg-[#e03d3d] text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-md shadow-red-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Icon icon="lucide:phone" className="mr-2 h-4.5 w-4.5" />
              Hubungi CS WhatsApp
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
