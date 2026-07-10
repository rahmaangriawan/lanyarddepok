import { Icon } from "@iconify/react";
import { Metadata } from "next";
import { createOpenGraphMetadata } from "@/lib/seo";
import PaymentMethodsPanel from "./PaymentMethodsPanel";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pembayaran Mudah dan Aman",
  description:
    "Informasi metode pembayaran resmi Lanyard Bogor, alur pembayaran, rekening resmi, dan kebijakan pembayaran pesanan lanyard custom.",
  alternates: {
    canonical: "/pembayaran",
  },
  ...createOpenGraphMetadata({
    title: "Pembayaran Mudah dan Aman",
    description:
      "Informasi metode pembayaran resmi Lanyard Bogor, alur pembayaran, rekening resmi, dan kebijakan pembayaran pesanan lanyard custom.",
    path: "/pembayaran",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyarddepok.com";

const paymentSteps = [
  {
    icon: "lucide:file-text",
    title: "Kirim Invoice",
    description: "Kami kirim invoice resmi sesuai detail pesanan Anda.",
  },
  {
    icon: "lucide:wallet-cards",
    title: "Pembayaran DP",
    description: "Lakukan pembayaran DP minimal 50% untuk memulai produksi.",
  },
  {
    icon: "lucide:settings",
    title: "Produksi & Pelunasan",
    description: "Produksi berjalan setelah DP. Lakukan pelunasan sebelum pengiriman.",
  },
  {
    icon: "lucide:truck",
    title: "Pengiriman",
    description: "Pesanan dikirim setelah pelunasan terkonfirmasi.",
  },
];

const policies = [
  "DP minimal 50% untuk memulai produksi",
  "Pelunasan dilakukan sebelum pengiriman",
  "Konfirmasi pembayaran via WhatsApp atau email",
  "Invoice resmi diberikan di awal",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/pembayaran/#webpage`,
      url: `${siteUrl}/pembayaran`,
      name: "Pembayaran Mudah dan Aman - Lanyard Bogor",
      description:
        "Informasi metode pembayaran resmi Lanyard Bogor, alur pembayaran, rekening resmi, dan kebijakan pembayaran pesanan lanyard custom.",
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
      "@id": `${siteUrl}/pembayaran/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pembayaran",
          item: `${siteUrl}/pembayaran`,
        },
      ],
    },
  ],
};

export default function PembayaranPage() {
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
              Pembayaran
            </p>
            <h1 className="mt-6 text-[42px] font-bold leading-[1.08] tracking-normal text-[#252525] md:text-7xl md:leading-[1.08]">
              Pembayaran Mudah &amp; Aman
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              Kami menyediakan berbagai metode pembayaran yang fleksibel dan
              terjamin keamanannya untuk kenyamanan Anda.
            </p>
            <div className="mx-auto mt-7 h-1 w-16 rounded-full bg-public-amber" />
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative grid gap-8 md:grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-12 hidden h-px bg-public-amber/50 md:block" />
              {paymentSteps.map((step, index) => (
                <article key={step.title} className="relative text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-public-soft text-public-amber shadow-xs">
                    <Icon icon={step.icon} className="h-10 w-10" />
                  </div>
                  <p className="mt-5 text-sm font-extrabold text-public-amber">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 text-lg font-extrabold text-[#111827]">
                    {step.title}
                  </h2>
                  <p className="mx-auto mt-3 max-w-56 text-sm leading-6 text-[#475569]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <PaymentMethodsPanel />

            <section className="mt-8 rounded-2xl border border-public-border bg-white p-6 shadow-xs lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-public-amber/30 bg-public-soft text-public-amber-strong">
                    <Icon icon="lucide:shield-check" className="h-11 w-11" />
                  </span>
                  <h2 className="mt-6 text-3xl font-extrabold text-[#111827]">
                    Kebijakan Pembayaran
                  </h2>
                  <div className="mt-4 h-0.5 w-12 rounded-full bg-public-amber" />
                  <p className="mt-5 text-sm leading-7 text-[#475569]">
                    Untuk menjaga kelancaran proses pemesanan, mohon perhatikan
                    kebijakan pembayaran berikut.
                  </p>
                </div>

                <div className="divide-y divide-public-border">
                  {policies.map((policy) => (
                    <div key={policy} className="flex items-center gap-4 py-4">
                      <Icon
                        icon="lucide:circle-check"
                        className="h-6 w-6 shrink-0 text-public-amber"
                      />
                      <p className="text-sm font-semibold leading-6 text-[#475569]">
                        {policy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
