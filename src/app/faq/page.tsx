import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "Tanya Jawab (FAQ) Pemesanan Tali Lanyard",
  description:
    "Temukan jawaban atas pertanyaan umum seputar pemesanan tali lanyard custom premium di Lanyard Jakarta. Info MOQ, pengerjaan kilat, desain mockup, dan pengiriman.",
  alternates: {
    canonical: "/faq",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const faqs = [
  {
    question: "Bagaimana cara memesan tali lanyard custom di Lanyard Jakarta?",
    answer: "Anda dapat memesan langsung melalui kalkulator instan di halaman utama website kami dengan memilih spesifikasi lebar, bahan, dan aksesoris. Alternatif lainnya, Anda bisa menghubungi tim Customer Service kami via WhatsApp untuk konsultasi desain dan penawaran langsung.",
  },
  {
    question: "Berapa jumlah minimum pemesanan (MOQ)?",
    answer: "Kami melayani pemesanan dengan minimum order yang sangat fleksibel mulai dari 50 pcs untuk tali lanyard sublimasi full color. Jumlah harga satuan otomatis menyesuaikan dengan volume pesanan Anda (makin banyak kuantitas, harga per pcs makin murah).",
  },
  {
    question: "Berapa lama proses pengerjaan produksi lanyard?",
    answer: "Proses pengerjaan standar kami berkisar antara 1 hingga 3 hari kerja tergantung pada kuantitas pesanan dan antrean produksi. Kami juga menyediakan opsi pengerjaan kilat (express) untuk event darurat atau kebutuhan mendesak.",
  },
  {
    question: "Apakah saya bisa mendapatkan mockup desain sebelum naik cetak?",
    answer: "Ya! Kami memberikan layanan jasa desain mockup visual secara GRATIS (maksimal 3x revisi) setelah Anda mengirimkan file logo resmi beserta preferensi warna instansi Anda. Produksi cetak baru dimulai setelah Anda menyetujui mockup desain tersebut.",
  },
  {
    question: "Bagaimana sistem pembayaran di Lanyard Jakarta?",
    answer: "Kami menerapkan sistem Down Payment (DP) sebesar 50% dari total nilai tagihan invoice sebagai tanda jadi produksi. Sisa pelunasan sebesar 50% dibayarkan secara penuh setelah pesanan selesai diproduksi dan siap dikirim ke alamat tujuan.",
  },
  {
    question: "Apakah ada garansi jika hasil cetak cacat atau rusak?",
    answer: "Ya, kami memberikan garansi kualitas 100%. Segala kerusakan atau cacat produksi akibat kelalaian tim kami wajib dilaporkan maksimal 3 hari setelah barang Anda terima untuk mendapatkan fasilitas klaim cetak ulang atau penggantian gratis.",
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/faq/#webpage`,
      url: `${siteUrl}/faq`,
      name: "Tanya Jawab (FAQ) Pemesanan Tali Lanyard - Lanyard Jakarta",
      description:
        "Temukan jawaban atas pertanyaan umum seputar pemesanan tali lanyard custom premium di Lanyard Jakarta. Info MOQ, pengerjaan kilat, desain mockup, dan pengiriman.",
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
      "@type": "FAQPage",
      "@id": `${siteUrl}/faq/#faqpage`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/faq/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Tanya Jawab (FAQ)", item: `${siteUrl}/faq` },
      ],
    },
  ],
};

export default function FaqPage() {
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
              Tanya Jawab
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
              Frequently Asked Questions<br />(FAQ) Lanyard Jakarta
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Temukan jawaban atas pertanyaan umum seputar pengerjaan tali lanyard, minimal pemesanan, sistem pengiriman, dan garansi kualitas kami.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ Main List ─── */}
      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FaqContent />

          {/* ─── Bottom CTA Box ─── */}
          <div className="max-w-3xl mx-auto mt-12 bg-[#FFF5F5] border border-red-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xs transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
                <Icon icon="lucide:message-square" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#1a202c]">
                  Masih punya pertanyaan lain?
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Hubungi tim CS kami langsung untuk bantuan lebih lanjut.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Jakarta%2C%20saya%20ingin%20bertanya%20mengenai..."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#FF4C4C] hover:bg-[#e03d3d] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-red-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Icon icon="lucide:phone" className="mr-2 h-4.5 w-4.5" />
              Hubungi CS WhatsApp
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
