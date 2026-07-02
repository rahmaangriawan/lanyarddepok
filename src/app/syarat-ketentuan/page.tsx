import { Icon } from "@iconify/react";
import { Metadata } from "next";
import Image from "next/image";
import SyaratKetentuanContent from "./SyaratKetentuanContent";
import { createOpenGraphMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan Pemesanan",
  description:
    "Pelajari syarat dan ketentuan pemesanan tali lanyard custom premium di Lanyard Bogor. Informasi MOQ, approval desain mockup, sistem pembayaran, dan garansi.",
  alternates: {
    canonical: "/syarat-ketentuan",
  },
  ...createOpenGraphMetadata({
    title: "Syarat dan Ketentuan Pemesanan",
    description:
      "Pelajari syarat dan ketentuan pemesanan tali lanyard custom premium di Lanyard Bogor. Informasi MOQ, approval desain mockup, sistem pembayaran, dan garansi.",
    path: "/syarat-ketentuan",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardbogor.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/syarat-ketentuan/#webpage`,
      url: `${siteUrl}/syarat-ketentuan`,
      name: "Syarat dan Ketentuan Pemesanan - Lanyard Bogor",
      description:
        "Pelajari syarat dan ketentuan pemesanan tali lanyard custom premium di Lanyard Bogor. Informasi MOQ, approval desain mockup, sistem pembayaran, dan garansi.",
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
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/syarat-ketentuan/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Syarat & Ketentuan",
          item: `${siteUrl}/syarat-ketentuan`,
        },
      ],
    },
  ],
};

const benefits = [
  {
    icon: "lucide:shield-check",
    title: "Transparan",
    desc: "Informasi jelas sejak awal tanpa biaya tersembunyi.",
  },
  {
    icon: "lucide:badge-check",
    title: "Kualitas Terjamin",
    desc: "Material premium dengan hasil cetak terbaik.",
  },
  {
    icon: "lucide:headphones",
    title: "Layanan Responsif",
    desc: "Tim kami siap membantu sepanjang proses pemesanan.",
  },
];

export default function SyaratKetentuanPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow overflow-hidden bg-white text-[#0f172a]">
        <section className="relative isolate overflow-hidden bg-white px-4 pb-12 pt-14 sm:px-6 sm:pt-18 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full border border-public-amber/20" />
          <div className="pointer-events-none absolute left-5 top-5 hidden h-28 w-28 rounded-full border-t border-public-amber/35 sm:block" />
          <div className="pointer-events-none absolute bottom-4 left-8 grid grid-cols-8 gap-2 opacity-60">
            {Array.from({ length: 32 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-public-amber/50" />
            ))}
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-public-amber-strong">
                Lanyard Bogor
              </p>
              <h1 className="mt-5 text-[2.35rem] font-extrabold leading-[1.12] tracking-normal text-[#111827] sm:text-[3.15rem] lg:text-[3.55rem]">
                Syarat dan Ketentuan{" "}
                <span className="text-public-amber-strong">Pemesanan Lanyard</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#64748b] sm:text-base">
                Terima kasih telah mempercayakan kebutuhan lanyard Anda kepada kami. Agar proses pemesanan berjalan lancar dan transparan, mohon baca syarat dan ketentuan berikut dengan seksama.
              </p>
            </div>

            <div className="relative min-h-[300px] sm:min-h-[400px] lg:min-h-[470px]">
              <div className="absolute inset-y-0 left-8 right-0 rounded-l-full bg-public-amber/10" />
              <div className="absolute right-0 top-10 hidden h-36 w-20 grid-cols-5 gap-2 sm:grid">
                {Array.from({ length: 35 }).map((_, index) => (
                  <span key={index} className="h-1 w-1 rounded-full bg-public-amber/45" />
                ))}
              </div>
              <Image
                src="/uploads/cta-footer-lanyard-custom.webp"
                alt="Lanyard custom Lanyard Bogor warna oranye dan putih"
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="relative z-10 object-contain object-center"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-public-border bg-white px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-0 py-7 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`flex items-center gap-4 px-2 py-5 md:px-8 md:py-4 ${
                  index > 0 ? "border-t border-public-border md:border-l md:border-t-0" : ""
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-public-amber-strong">
                  <Icon icon={benefit.icon} className="h-8 w-8" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-[#111827]">{benefit.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[#64748b]">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SyaratKetentuanContent />
      </main>
    </div>
  );
}
