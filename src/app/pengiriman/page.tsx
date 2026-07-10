import { Icon } from "@iconify/react";
import Image from "next/image";
import { Metadata } from "next";
import { createOpenGraphMetadata } from "@/lib/seo";
import ShippingOptionsPanel from "./ShippingOptionsPanel";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pengiriman Cepat dan Aman",
  description:
    "Informasi layanan pengiriman Lanyard Bogor, alur pengiriman, pilihan ekspedisi, standar pengemasan, estimasi, dan tracking pesanan.",
  alternates: {
    canonical: "/pengiriman",
  },
  ...createOpenGraphMetadata({
    title: "Pengiriman Cepat dan Aman",
    description:
      "Informasi layanan pengiriman Lanyard Bogor, alur pengiriman, pilihan ekspedisi, standar pengemasan, estimasi, dan tracking pesanan.",
    path: "/pengiriman",
    image: "/uploads/pengiriman-packaging-lanyarddepok.webp",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyarddepok.com";

const shippingSteps = [
  {
    icon: "lucide:package",
    title: "Packing",
    description: "Pesanan dikemas rapi dan diperiksa kualitasnya sebelum dikirim.",
  },
  {
    icon: "lucide:truck",
    title: "Pickup / Dispatch",
    description: "Paket dijemput kurir atau dikirim ke jasa ekspedisi pilihan.",
  },
  {
    icon: "lucide:map-pin",
    title: "Tracking",
    description: "Nomor resi diberikan untuk melacak status pengiriman.",
  },
  {
    icon: "lucide:badge-check",
    title: "Pesanan Diterima",
    description: "Paket sampai dengan aman dan pesanan siap digunakan.",
  },
];

const packagingStandards = [
  "Dikemas rapi dengan material berkualitas",
  "QC dilakukan sebelum paket dikirim",
  "Bubble wrap atau pelindung untuk keamanan ekstra",
  "Label pengiriman jelas dan tidak mudah rusak",
];

const importantNotes = [
  "Estimasi pengiriman dapat berubah tergantung tujuan dan ekspedisi.",
  "Risiko kerusakan atau kehilangan selama pengiriman mengikuti kebijakan ekspedisi.",
  "Packing aman disiapkan sebelum paket diserahkan ke kurir.",
  "Nomor resi diberikan setelah paket diproses oleh tim kami.",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/pengiriman/#webpage`,
      url: `${siteUrl}/pengiriman`,
      name: "Pengiriman Cepat dan Aman - Lanyard Bogor",
      description:
        "Informasi layanan pengiriman Lanyard Bogor, alur pengiriman, pilihan ekspedisi, standar pengemasan, estimasi, dan tracking pesanan.",
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
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/pengiriman/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pengiriman",
          item: `${siteUrl}/pengiriman`,
        },
      ],
    },
  ],
};

export default function PengirimanPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden border-b border-public-border/60 bg-white px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute right-[7%] top-28 hidden grid-cols-5 gap-3 opacity-45 sm:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-public-amber" />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-14 left-[6%] h-36 w-36 rounded-full bg-public-amber/10 blur-2xl" />

          <div className="relative mx-auto max-w-4xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.45em] text-public-amber">
              Pengiriman
            </p>
            <h1 className="mt-6 text-[42px] font-bold leading-[1.08] tracking-normal text-[#252525] md:text-7xl md:leading-[1.08]">
              Pengiriman Cepat &amp; Aman
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              Kami memastikan setiap pesanan lanyard dikirim dengan cepat,
              aman, dan sampai tepat waktu ke seluruh Indonesia.
            </p>
            <div className="mx-auto mt-7 h-1 w-16 rounded-full bg-public-amber" />
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-[#111827]">
                Alur Pengiriman
              </h2>
              <div className="mx-auto mt-4 h-0.5 w-12 rounded-full bg-public-amber" />
            </div>

            <div className="relative mt-8 grid gap-8 md:grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-1/2 hidden h-px -translate-y-1/2 bg-public-amber/50 md:block" />
              {shippingSteps.map((step, index) => (
                <article key={step.title} className="relative rounded-2xl border border-public-border bg-white p-6 text-center shadow-xs">
                  {index < shippingSteps.length - 1 ? (
                    <div className="absolute -right-9 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-public-border bg-white text-public-amber md:flex">
                      <Icon icon="lucide:arrow-right" className="h-5 w-5" />
                    </div>
                  ) : null}
                  <p className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-public-amber text-sm font-extrabold text-[#111827]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-public-soft text-public-amber">
                    <Icon icon={step.icon} className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 text-base font-extrabold text-[#111827]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#475569]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <ShippingOptionsPanel />

            <section className="mt-8 grid gap-8 rounded-2xl border border-public-border bg-white p-6 shadow-xs lg:grid-cols-[1fr_1fr] lg:p-8">
              <div className="overflow-hidden rounded-2xl bg-public-soft">
                <Image
                  src="/uploads/pengiriman-packaging-lanyarddepok.webp"
                  alt="Packing paket lanyard Lanyard Bogor"
                  width={1040}
                  height={720}
                  className="h-auto w-full object-contain"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-extrabold text-[#111827]">
                  Standar Pengemasan
                </h2>
                <div className="mt-4 h-0.5 w-12 rounded-full bg-public-amber" />
                <div className="mt-6 space-y-4">
                  {packagingStandards.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Icon icon="lucide:circle-check" className="mt-0.5 h-5 w-5 shrink-0 text-public-amber" />
                      <p className="text-sm font-semibold leading-6 text-[#475569]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-[#64748b]">
                  <Icon icon="lucide:lock" className="mt-0.5 h-5 w-5 shrink-0 text-public-amber" />
                  Kami memastikan paket Anda sampai dalam kondisi terbaik.
                </p>
              </div>
            </section>

            <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-public-border bg-white p-6 shadow-xs lg:p-8">
                <h2 className="text-2xl font-extrabold text-[#111827]">
                  Informasi Penting
                </h2>
                <div className="mt-4 h-0.5 w-12 rounded-full bg-public-amber" />
                <div className="mt-6 space-y-4">
                  {importantNotes.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-public-amber" />
                      <p className="text-sm leading-6 text-[#475569]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-2xl border border-public-amber/30 bg-public-soft p-6 text-center shadow-xs lg:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-public-amber">
                  <Icon icon="lucide:headphones" className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-extrabold text-[#111827]">
                  Ada Kendala Pengiriman?
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#475569]">
                  Tim kami siap membantu cek status paket, resi, atau kendala
                  pengiriman pesanan Anda.
                </p>
                <a
                  href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20bertanya%20tentang%20pengiriman%20pesanan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-public-amber px-5 text-sm font-extrabold text-[#111827] transition-colors hover:bg-public-amber-strong hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/25"
                >
                  <Icon icon="logos:whatsapp-icon" className="h-5 w-5" />
                  Hubungi Kami via WhatsApp
                </a>
                <p className="mt-5 text-xs font-semibold text-[#64748b]">
                  Layanan respon cepat - Senin sampai Sabtu
                </p>
              </aside>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
