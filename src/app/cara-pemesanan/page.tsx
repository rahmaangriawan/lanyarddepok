import { Icon } from "@iconify/react";
import { Metadata } from "next";
import CaraPemesananContent from "./CaraPemesananContent";
import { createOpenGraphMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cara Pemesanan Lanyard Custom",
  description:
    "Panduan lengkap cara memesan lanyard custom di Lanyard Bogor. Proses mudah: konsultasi, desain dan penawaran, approval pembayaran, hingga produksi dan pengiriman.",
  alternates: {
    canonical: "/cara-pemesanan",
  },
  ...createOpenGraphMetadata({
    title: "Cara Pemesanan Lanyard Custom",
    description:
      "Pesan lanyard custom di Lanyard Bogor sangat mudah. Ikuti proses pemesanan yang sederhana, cepat, dan transparan.",
    path: "/cara-pemesanan",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyarddepok.com";

const orderingSteps = [
  {
    icon: "lucide:message-square-more",
    title: "Konsultasi & Brief",
    description:
      "Sampaikan kebutuhan, jumlah, penggunaan, dan konsep desain Anda kepada tim kami.",
  },
  {
    icon: "lucide:pencil-line",
    title: "Desain & Penawaran",
    description:
      "Kami buatkan desain sesuai brief dan kirimkan penawaran harga terbaik untuk Anda.",
  },
  {
    icon: "lucide:file-check-2",
    title: "Approval & Pembayaran",
    description:
      "Setelah desain disetujui, kami siapkan mockup final sebelum produksi dan proses pembayaran.",
  },
  {
    icon: "lucide:truck",
    title: "Produksi & Pengiriman",
    description:
      "Pesanan diproduksi dengan quality control ketat dan dikirim ke alamat Anda dengan aman.",
  },
];

const benefits = [
  {
    icon: "lucide:shield-check",
    title: "Kualitas Terjamin",
    description: "Bahan premium dan hasil cetak tajam untuk tampilan profesional.",
  },
  {
    icon: "lucide:timer",
    title: "Proses Cepat",
    description: "Pengerjaan tepat waktu sesuai komitmen agar kebutuhan Anda terpenuhi.",
  },
  {
    icon: "lucide:badge-dollar-sign",
    title: "Harga Kompetitif",
    description: "Harga terbaik untuk kualitas terbaik tanpa mengorbankan kualitas.",
  },
  {
    icon: "lucide:headphones",
    title: "Layanan Responsif",
    description: "Tim kami siap membantu Anda dengan cepat dan ramah.",
  },
];

const faqs = [
  {
    question: "Berapa minimal pemesanan lanyard?",
    answer:
      "Minimal pemesanan lanyard custom adalah 50 pcs. Untuk kebutuhan khusus di bawah jumlah tersebut, silakan konsultasikan terlebih dahulu dengan tim kami.",
  },
  {
    question: "Berapa lama waktu produksi?",
    answer:
      "Estimasi produksi umumnya 1 hingga 3 hari kerja setelah desain disetujui dan pembayaran awal dikonfirmasi, tergantung kuantitas dan spesifikasi.",
  },
  {
    question: "Apakah bisa request desain sendiri?",
    answer:
      "Bisa. Anda dapat mengirim logo, referensi visual, warna brand, atau file desain. Tim kami akan membantu menyesuaikannya untuk kebutuhan produksi.",
  },
  {
    question: "Apakah bisa request warna khusus?",
    answer:
      "Bisa. Warna dapat disesuaikan dengan identitas brand atau kode warna yang Anda miliki, dengan hasil akhir mengikuti karakter bahan dan metode cetak.",
  },
  {
    question: "Bagaimana cara pembayaran?",
    answer:
      "Pembayaran dilakukan dengan DP sebagai tanda jadi produksi, lalu pelunasan setelah pesanan selesai dan siap dikirim.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/cara-pemesanan/#howto`,
      name: "Cara Memesan Lanyard Custom di Lanyard Bogor",
      description:
        "Panduan langkah demi langkah cara memesan lanyard custom di Lanyard Bogor, mulai dari konsultasi brief hingga produksi dan pengiriman.",
      totalTime: "P1D",
      step: orderingSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
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

export default function CaraPemesananPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-white px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute left-[7%] top-32 hidden grid-cols-5 gap-3 opacity-45 sm:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-public-amber" />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-24 right-[9%] hidden grid-cols-5 gap-3 opacity-45 md:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-public-amber" />
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 hidden h-64 w-80 opacity-30 lg:block">
            <div className="absolute right-4 top-4 h-56 w-56 rounded-full border border-public-amber/20" />
            <div className="absolute right-10 top-10 h-56 w-56 rounded-full border border-public-amber/15" />
            <div className="absolute right-16 top-16 h-56 w-56 rounded-full border border-public-amber/10" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-sm font-extrabold uppercase tracking-normal text-public-amber">
              Cara Pemesanan
            </p>
            <h1 className="mt-5 text-[42px] font-bold leading-[1.08] tracking-normal text-[#252525] md:text-7xl md:leading-[1.08]">
              Proses Mudah,{" "}
              <span className="block">
                Hasil Memuaskan
              </span>
            </h1>
            <div className="mx-auto mt-7 h-1 w-16 rounded-full bg-public-amber" />
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              Kami membuat proses pemesanan lanyard custom menjadi lebih mudah,
              cepat, dan transparan untuk Anda.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-6">
              <div className="hidden h-px w-40 bg-public-border sm:block" />
              <span className="hidden h-2 w-2 rounded-full bg-public-amber sm:block" />
              <h2 className="text-center text-2xl font-extrabold text-[#111827]">
                Langkah Pemesanan
              </h2>
              <span className="hidden h-2 w-2 rounded-full bg-public-amber sm:block" />
              <div className="hidden h-px w-40 bg-public-border sm:block" />
            </div>

            <div className="mt-9 grid gap-5 lg:grid-cols-4">
              {orderingSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative flex min-h-72 flex-col items-center rounded-2xl border border-public-border bg-white p-7 text-center shadow-xs"
                >
                  <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-public-amber text-lg font-extrabold text-[#111827]">
                    {index + 1}
                  </span>
                  {index < orderingSteps.length - 1 && (
                    <span
                      className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-public-border bg-white text-public-amber shadow-xs lg:flex"
                      aria-hidden="true"
                    >
                      <Icon icon="lucide:chevron-right" className="h-6 w-6" />
                    </span>
                  )}
                  <span className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-public-soft text-[#111827]">
                    <Icon icon={step.icon} className="h-12 w-12" />
                  </span>
                  <h3 className="mt-7 text-xl font-extrabold text-[#111827]">
                    {step.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-[#475569]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <section className="mt-16">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
                  Kenapa Pesan di{" "}
                  <span className="text-public-amber">Lanyard Bogor?</span>
                </h2>
                <div className="mx-auto mt-4 h-0.5 w-10 rounded-full bg-public-amber" />
              </div>

              <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-2">
                {benefits.map((benefit) => (
                  <article
                    key={benefit.title}
                    className="flex items-center gap-6 rounded-2xl border border-public-border bg-white p-7 shadow-xs"
                  >
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-public-soft text-[#111827]">
                      <Icon icon={benefit.icon} className="h-11 w-11" />
                    </span>
                    <span>
                      <span className="block text-xl font-extrabold text-[#111827]">
                        {benefit.title}
                      </span>
                      <span className="mt-3 block text-sm leading-7 text-[#475569]">
                        {benefit.description}
                      </span>
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-16">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#111827] sm:text-3xl">
                  Pertanyaan yang Sering Diajukan
                </h2>
                <div className="mx-auto mt-4 h-0.5 w-10 rounded-full bg-public-amber" />
              </div>

              <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[1fr_330px]">
                <CaraPemesananContent faqs={faqs} />

                <aside className="flex flex-col items-center justify-center rounded-2xl border border-public-amber/20 bg-public-soft p-8 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-public-amber text-[#111827]">
                    <Icon icon="lucide:message-square-more" className="h-8 w-8" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-[#111827]">
                    Masih ada pertanyaan?
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#475569]">
                    Tim kami siap membantu Anda menemukan solusi terbaik.
                  </p>
                  <a
                    href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20bertanya%20tentang%20cara%20pemesanan%20lanyard."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-public-amber/60 bg-white px-5 text-sm font-extrabold text-public-amber transition-colors hover:bg-public-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20"
                  >
                    <Icon icon="lucide:phone" className="h-5 w-5" />
                    Hubungi Kami via WhatsApp
                  </a>
                </aside>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
