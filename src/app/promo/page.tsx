import { Icon } from "@iconify/react";
import { Metadata } from "next";
import Image from "next/image";
import { createOpenGraphMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Promo Spesial Lanyard Custom",
  description:
    "Dapatkan penawaran eksklusif cetak lanyard custom premium di Lanyard Bogor. Gratis jasa desain mockup, diskon volume besar, dan paket bundling card holder.",
  alternates: {
    canonical: "/promo",
  },
  ...createOpenGraphMetadata({
    title: "Promo Spesial Lanyard Custom",
    description:
      "Dapatkan penawaran eksklusif cetak lanyard custom premium di Lanyard Bogor. Gratis jasa desain mockup, diskon volume besar, dan paket bundling card holder.",
    path: "/promo",
    image: "/uploads/promo-hero-lanyarddepok.webp",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyarddepok.com";

const whatsappUrl =
  "https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20klaim%20promo%20lanyard%20custom.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/promo/#webpage`,
      url: `${siteUrl}/promo`,
      name: "Promo Spesial Lanyard Custom - Lanyard Bogor",
      description:
        "Dapatkan penawaran eksklusif cetak lanyard custom premium di Lanyard Bogor. Gratis jasa desain mockup, diskon volume besar, dan paket bundling card holder.",
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
      "@id": `${siteUrl}/promo/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Promo",
          item: `${siteUrl}/promo`,
        },
      ],
    },
  ],
};

const promoItems = [
  {
    number: "01",
    eyebrow: "Gratis Desain",
    title: "Gratis layanan jasa desain mockup",
    description:
      "Kirimkan logo resmi dan preferensi warna instansi Anda. Tim kami akan menyiapkan mockup layout lanyard tanpa biaya tambahan, termasuk maksimal 3x revisi.",
    image: "/uploads/promo-special-desain-mockup.webp",
    alt: "Gratis layanan jasa desain mockup lanyard custom Lanyard Bogor",
    highlights: [
      { icon: "lucide:pencil-ruler", label: "Layout rapi" },
      { icon: "lucide:badge-check", label: "Tanpa biaya" },
      { icon: "lucide:rotate-ccw", label: "3x revisi" },
    ],
  },
  {
    number: "02",
    eyebrow: "Order Volume",
    title: "Diskon volume untuk pemesanan besar",
    description:
      "Untuk kebutuhan event, perusahaan, sekolah, atau komunitas dengan jumlah besar, kami siapkan harga khusus yang lebih hemat dan tetap transparan.",
    image: "/uploads/promo-special-diskon-volume.webp",
    alt: "Diskon volume pemesanan skala besar lanyard custom Lanyard Bogor",
    highlights: [
      { icon: "lucide:boxes", label: "500+ pcs" },
      { icon: "lucide:percent", label: "Harga khusus" },
      { icon: "lucide:file-check-2", label: "Quotation jelas" },
    ],
  },
  {
    number: "03",
    eyebrow: "Paket Hemat",
    title: "Bundling lanyard dan holder premium",
    description:
      "Pesan lanyard sublimasi full color sekaligus card holder premium dalam satu paket yang praktis untuk kebutuhan identitas tim dan acara.",
    image: "/uploads/promo-special-bundling-holder.webp",
    alt: "Paket bundling lanyard dan holder premium Lanyard Bogor",
    highlights: [
      { icon: "lucide:shield", label: "Holder premium" },
      { icon: "lucide:layers-3", label: "Paket lengkap" },
      { icon: "lucide:sparkles", label: "Tampilan profesional" },
    ],
  },
];

export default function PromoPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="overflow-hidden">
        <section className="border-b border-public-border/70 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-public-amber/25 bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-public-amber-strong shadow-xs">
                <Icon icon="lucide:badge-percent" className="h-3.5 w-3.5" />
                Promo Spesial
              </span>
              <h1 className="mt-6 text-[2.45rem] font-extrabold leading-[1.08] tracking-normal text-[#111827] sm:text-[3.35rem] lg:text-[4rem]">
                Penawaran eksklusif untuk lanyard custom Anda
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#64748b] sm:text-base">
                Hemat anggaran produksi tanpa mengorbankan kualitas. Pilih promo yang paling sesuai untuk kebutuhan perusahaan, instansi, komunitas, atau event Anda.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-public-amber px-6 text-sm font-bold text-[#111827] shadow-lg shadow-public-amber/20 transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus:ring-4 focus:ring-public-amber/20"
                >
                  Klaim Promo Sekarang
                  <Icon icon="lucide:arrow-right" className="h-4.5 w-4.5" />
                </a>
                <a
                  href="#promo-spesial"
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full border border-public-border bg-white px-6 text-sm font-bold text-[#111827] shadow-xs transition-colors hover:bg-public-soft focus:outline-none focus:ring-4 focus:ring-public-amber/20"
                >
                  Lihat Detail Promo
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[620px]">
              <Image
                src="/uploads/promo-hero-lanyarddepok.webp"
                alt="Promo spesial lanyard custom Lanyard Bogor"
                width={1254}
                height={1254}
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </section>

        <section
          id="promo-spesial"
          className="bg-white px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-public-amber-strong">
                Promo Spesial
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
                Pilih promo yang paling pas untuk pesanan Anda
              </h2>
            </div>

            <div className="mt-10 space-y-6 lg:space-y-8">
              {promoItems.map((promo, index) => (
                <article
                  key={promo.number}
                  className="overflow-hidden rounded-[24px] border border-public-border bg-white shadow-xs"
                >
                  <div className="grid items-start lg:grid-cols-2">
                    <div
                      className={`relative bg-white ${
                        index % 2 === 1 ? "lg:order-2" : ""
                      }`}
                    >
                      <Image
                        src={promo.image}
                        alt={promo.alt}
                        width={1672}
                        height={941}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="h-auto w-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-public-amber text-sm font-extrabold text-[#111827]">
                          {promo.number}
                        </span>
                        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-public-amber-strong">
                          {promo.eyebrow}
                        </span>
                      </div>
                      <h3 className="mt-5 text-2xl font-extrabold leading-tight text-[#111827] sm:text-3xl">
                        {promo.title}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-[#64748b] sm:text-base">
                        {promo.description}
                      </p>
                      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                        {promo.highlights.map((highlight) => (
                          <div
                            key={highlight.label}
                            className="flex min-h-12 items-center gap-2.5 rounded-xl border border-public-border bg-public-soft px-3 py-2.5"
                          >
                            <Icon
                              icon={highlight.icon}
                              className="h-4.5 w-4.5 shrink-0 text-public-amber-strong"
                            />
                            <span className="text-[13px] font-extrabold leading-tight text-[#111827]">
                              {highlight.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
