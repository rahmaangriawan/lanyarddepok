import { Icon } from "@iconify/react";
import { Metadata } from "next";
import { createOpenGraphMetadata } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontak Kami - Hubungi Kami untuk Pemesanan",
  description:
    "Hubungi tim Lanyard Bogor untuk konsultasi, pemesanan, dan informasi harga lanyard custom premium di Bogor, Indonesia.",
  alternates: {
    canonical: "/kontak",
  },
  ...createOpenGraphMetadata({
    title: "Kontak Kami - Hubungi Kami untuk Pemesanan",
    description:
      "Hubungi tim Lanyard Bogor untuk konsultasi, pemesanan, dan informasi harga lanyard custom premium di Bogor, Indonesia.",
    path: "/kontak",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardbogor.com";

const mapsSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=Kabupaten%20Bogor%2C%20Jawa%20Barat";
const mapEmbedUrl =
  "https://www.google.com/maps?q=Kabupaten%20Bogor%2C%20Jawa%20Barat&output=embed";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${siteUrl}/kontak/#contactpage`,
      url: `${siteUrl}/kontak`,
      name: "Kontak Lanyard Bogor",
      description:
        "Halaman kontak resmi Lanyard Bogor. Hubungi kami via WhatsApp, email, atau kunjungi workshop produksi kami.",
      publisher: {
        "@type": "Organization",
        name: "Lanyard Bogor",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/uploads/lanyardbogor-logo.webp`,
        },
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#localbusiness`,
      name: "Lanyard Bogor",
      image: `${siteUrl}/uploads/lanyard-bogor-hero-1782129081107.webp`,
      telephone: "+6282210200700",
      email: "info@lanyardbogor.com",
      url: siteUrl,
      address: {
        "@type": "PostalAddress",
        addressRegion: "Bogor",
        addressCountry: "ID",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/kontak/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Kontak",
          item: `${siteUrl}/kontak`,
        },
      ],
    },
  ],
};

const contactCards = [
  {
    icon: "lucide:phone-call",
    title: "WhatsApp",
    description: "Respon cepat via WhatsApp",
    value: "0822-1020-0700",
    href: "https://wa.me/6282210200700",
  },
  {
    icon: "lucide:mail",
    title: "Email",
    description: "Kirim detail kebutuhan Anda",
    value: "info@lanyardbogor.com",
    href: "mailto:info@lanyardbogor.com",
  },
  {
    icon: "lucide:clock-3",
    title: "Jam Operasional",
    description: "Senin - Sabtu",
    value: "09.00 - 21.00 WIB",
  },
  {
    icon: "lucide:map-pin",
    title: "Lokasi",
    description: "Kabupaten Bogor, Jawa Barat",
    value: "Lihat di Maps",
    href: mapsSearchUrl,
  },
];

const instantMessages = [
  {
    icon: "lucide:message-square-text",
    title: "Minta Penawaran (Quotation)",
    description: "Dapatkan penawaran harga terbaik sesuai kebutuhan Anda.",
  },
  {
    icon: "lucide:pencil-line",
    title: "Mockup Gratis",
    description: "Kami bantu buatkan desain mockup gratis sebelum produksi.",
  },
  {
    icon: "lucide:package-open",
    title: "Sampel Fisik",
    description: "Butuh referensi bahan? Tim kami bisa bantu arahkan pilihan.",
  },
];

const trustItems = [
  {
    icon: "lucide:shield-check",
    title: "Aman & Terpercaya",
    description: "Transaksi aman dan data pelanggan terjaga.",
  },
  {
    icon: "lucide:badge-check",
    title: "Kualitas Terjamin",
    description: "Bahan premium dan hasil cetakan terbaik.",
  },
  {
    icon: "lucide:truck",
    title: "Pengiriman Cepat",
    description: "Proses cepat dan aman ke seluruh Indonesia.",
  },
  {
    icon: "lucide:headphones",
    title: "Layanan Responsif",
    description: "Tim kami siap membantu setiap saat.",
  },
];

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-white px-4 py-18 text-center sm:px-6 sm:py-22 lg:px-8 lg:py-28">
          <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute bottom-16 left-[8%] hidden grid-cols-5 gap-3 opacity-35 sm:grid">
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
              Hubungi Kami
            </p>
            <h1 className="mt-5 text-[42px] font-bold leading-[1.08] tracking-normal text-[#252525] md:text-7xl md:leading-[1.08]">
              Layanan Konsultasi{" "}
              <span className="block">&amp; Pemesanan</span>
            </h1>
            <div className="mx-auto mt-7 h-1 w-16 rounded-full bg-public-amber" />
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              Kami siap membantu Anda untuk konsultasi kebutuhan, pemesanan
              lanyard custom, hingga informasi produk.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {contactCards.map((card) => {
                const content = (
                  <>
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-public-soft text-public-amber">
                      <Icon icon={card.icon} className="h-10 w-10" />
                    </span>
                    <span className="mt-6 block text-xl font-extrabold text-[#111827]">
                      {card.title}
                    </span>
                    <span className="mt-2 block text-sm text-[#64748b]">
                      {card.description}
                    </span>
                    <span className="mt-7 inline-flex min-h-10 items-center rounded-full border border-public-amber/50 px-6 text-sm font-extrabold text-public-amber">
                      {card.value}
                    </span>
                  </>
                );

                if (card.href) {
                  return (
                    <a
                      key={card.title}
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-72 cursor-pointer flex-col items-center rounded-2xl border border-public-border bg-white p-7 text-center shadow-xs transition-colors hover:border-public-amber/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div
                    key={card.title}
                    className="flex min-h-72 flex-col items-center rounded-2xl border border-public-border bg-white p-7 text-center shadow-xs"
                  >
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
              <ContactForm />

              <aside className="overflow-hidden rounded-2xl border border-public-border bg-white shadow-xs">
                <div className="p-7 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-[#111827]">
                    Kirim Pesan Instan
                  </h2>
                  <div className="mt-6 space-y-6">
                    {instantMessages.map((item, index) => (
                      <div
                        key={item.title}
                        className={`flex gap-5 ${
                          index > 0 ? "border-t border-public-border pt-6" : ""
                        }`}
                      >
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-public-soft text-public-amber">
                          <Icon icon={item.icon} className="h-7 w-7" />
                        </span>
                        <span>
                          <span className="block text-base font-extrabold text-[#111827]">
                            {item.title}
                          </span>
                          <span className="mt-2 block text-sm leading-6 text-[#64748b]">
                            {item.description}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-public-border p-7 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-[#111827]">
                    Lokasi Kami
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#475569]">
                    Kabupaten Bogor, Jawa Barat
                    <br />
                    Melayani pemesanan lanyard custom untuk kebutuhan
                    perusahaan, instansi, sekolah, komunitas, dan event.
                  </p>
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-public-amber/50 px-4 text-sm font-extrabold text-public-amber transition-colors hover:bg-public-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20"
                  >
                    Lihat di Google Maps
                    <Icon icon="lucide:external-link" className="h-4 w-4" />
                  </a>
                </div>
              </aside>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-public-border bg-white shadow-xs">
              <iframe
                src={mapEmbedUrl}
                className="h-72 w-full border-0 sm:h-80"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Lanyard Bogor"
              />
            </div>

            <div className="mt-8 grid gap-5 rounded-2xl border border-public-border bg-white p-5 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex gap-4 p-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-public-amber">
                    <Icon icon={item.icon} className="h-8 w-8" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-[#111827]">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#64748b]">
                      {item.description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
