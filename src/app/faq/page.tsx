import { Metadata } from "next";
import { createOpenGraphMetadata } from "@/lib/seo";
import FaqContent from "./FaqContent";

export const revalidate = 3600; // Cache page for 1 hour

export const metadata: Metadata = {
  title: "Tanya Jawab (FAQ) Pemesanan Tali Lanyard",
  description:
    "Temukan jawaban atas pertanyaan umum seputar pemesanan tali lanyard custom premium di Lanyard Bogor. Info MOQ, pengerjaan kilat, desain mockup, dan pengiriman.",
  alternates: {
    canonical: "/faq",
  },
  ...createOpenGraphMetadata({
    title: "Tanya Jawab (FAQ) Pemesanan Tali Lanyard",
    description:
      "Temukan jawaban atas pertanyaan umum seputar pemesanan tali lanyard custom premium di Lanyard Bogor. Info MOQ, pengerjaan kilat, desain mockup, dan pengiriman.",
    path: "/faq",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyarddepok.com";

const faqs = [
  {
    question: "Berapa minimal pemesanan lanyard custom?",
    answer:
      "Minimal pemesanan di Lanyard Bogor adalah 50 pcs untuk semua jenis lanyard custom. Kami tetap dapat membantu kebutuhan jumlah kecil dengan harga yang menyesuaikan.",
  },
  {
    question: "Apakah bisa pesan lanyard dengan desain sendiri?",
    answer:
      "Bisa. Anda dapat mengirimkan file logo, desain, atau referensi warna. Tim kami akan membantu menyesuaikannya ke format produksi lanyard.",
  },
  {
    question: "Berapa lama proses produksi lanyard?",
    answer:
      "Proses produksi standar berkisar 1 hingga 3 hari kerja tergantung kuantitas, spesifikasi, dan antrean produksi. Opsi express dapat dikonsultasikan untuk kebutuhan mendesak.",
  },
  {
    question: "Apakah ada biaya desain?",
    answer:
      "Kami menyediakan bantuan mockup desain gratis maksimal 3x revisi setelah Anda mengirimkan logo resmi dan arahan desain.",
  },
  {
    question: "Bagaimana sistem pembayaran di Lanyard Bogor?",
    answer:
      "Sistem pembayaran menggunakan DP 50% sebagai tanda jadi produksi, lalu pelunasan 50% setelah pesanan selesai dan siap dikirim.",
  },
  {
    question: "Apakah pesanan bisa dikirim ke luar Bogor?",
    answer:
      "Bisa. Kami melayani pengiriman ke berbagai kota di Indonesia melalui jasa ekspedisi yang disesuaikan dengan alamat dan kebutuhan pengiriman Anda.",
  },
  {
    question: "Apakah ada garansi untuk produk?",
    answer:
      "Ada. Jika terjadi cacat produksi dari pihak kami, laporan maksimal 3 hari setelah barang diterima akan kami bantu proses klaim atau penggantian sesuai ketentuan.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/faq/#webpage`,
      url: `${siteUrl}/faq`,
      name: "Tanya Jawab (FAQ) Pemesanan Tali Lanyard - Lanyard Bogor",
      description:
        "Temukan jawaban atas pertanyaan umum seputar pemesanan tali lanyard custom premium di Lanyard Bogor. Info MOQ, pengerjaan kilat, desain mockup, dan pengiriman.",
      publisher: {
        "@type": "Organization",
        name: "Lanyard Bogor",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/uploads/lanyarddepok-logo.webp`,
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Tanya Jawab (FAQ)",
          item: `${siteUrl}/faq`,
        },
      ],
    },
  ],
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden border-b border-public-border/60 bg-public-soft px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full border border-public-amber/20" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-public-amber/20" />
          <div className="pointer-events-none absolute left-[8%] top-28 hidden grid-cols-5 gap-3 opacity-45 sm:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={index}
                className="h-1 w-1 rounded-full bg-public-amber"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-28 right-[10%] hidden grid-cols-5 gap-3 opacity-45 md:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={index}
                className="h-1 w-1 rounded-full bg-public-amber"
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="text-[2.5rem] font-extrabold leading-[1.12] tracking-normal text-[#111827] sm:text-[3.5rem] lg:text-[4rem]">
              Pertanyaan Seputar
              <span className="block">Pemesanan Lanyard</span>
            </h1>
            <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-public-amber" />
            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              Temukan jawaban singkat untuk pertanyaan seputar pemesanan lanyard custom di Lanyard Bogor.
            </p>
          </div>
        </section>

        <FaqContent />
      </main>
    </div>
  );
}
