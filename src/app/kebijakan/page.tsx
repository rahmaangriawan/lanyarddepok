import { Icon } from "@iconify/react";
import Image from "next/image";
import type { Metadata } from "next";
import { createOpenGraphMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kebijakan Privasi Lanyard Bogor",
  description:
    "Pelajari bagaimana Lanyard Bogor mengumpulkan, menggunakan, melindungi, dan menjaga privasi data pelanggan.",
  alternates: {
    canonical: "/kebijakan",
  },
  ...createOpenGraphMetadata({
    title: "Kebijakan Privasi Lanyard Bogor",
    description:
      "Pelajari bagaimana Lanyard Bogor mengumpulkan, menggunakan, melindungi, dan menjaga privasi data pelanggan.",
    path: "/kebijakan",
    image: "/uploads/privacy-priority-lanyardbogor.webp",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardbogor.com";

const trustItems = [
  {
    icon: "lucide:shield-check",
    title: "Data Aman",
    description: "Kami menjaga keamanan data Anda dengan standar tinggi.",
  },
  {
    icon: "lucide:user-round-check",
    title: "Privasi Terlindungi",
    description: "Informasi pribadi Anda tidak akan dibagikan kepada pihak ketiga.",
  },
  {
    icon: "lucide:file-text",
    title: "Transparansi",
    description: "Kami selalu transparan mengenai data yang kami kelola.",
  },
  {
    icon: "lucide:lock-keyhole",
    title: "Kendali Pengguna",
    description: "Anda memiliki kendali penuh atas informasi pribadi Anda.",
  },
  {
    icon: "lucide:badge-check",
    title: "Kepatuhan",
    description: "Kami mematuhi peraturan perlindungan data yang berlaku.",
  },
];

const policySections = [
  {
    title: "Informasi yang Kami Kumpulkan",
    body: "Kami dapat mengumpulkan informasi pribadi yang Anda berikan secara sukarela, seperti nama, nomor telepon, alamat email, alamat pengiriman, serta informasi lain yang diperlukan untuk memproses pesanan dan memberikan layanan terbaik.",
  },
  {
    title: "Penggunaan Informasi",
    body: "Informasi yang kami kumpulkan digunakan untuk memproses pesanan, mengirimkan produk, memberikan layanan pelanggan, mengirimkan informasi terkait produk atau promo jika Anda setuju, serta meningkatkan pengalaman belanja Anda.",
  },
  {
    title: "Perlindungan Informasi",
    body: "Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data pribadi Anda dari akses yang tidak sah, penggunaan, atau pengungkapan yang tidak sah, termasuk enkripsi data dan pembatasan akses internal.",
  },
  {
    title: "Pembagian Informasi",
    body: "Kami tidak akan menjual, menukar, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Informasi hanya akan dibagikan kepada pihak yang terlibat dalam proses pengiriman atau layanan dengan tujuan yang telah disebutkan.",
  },
  {
    title: "Hak Pengguna",
    body: "Anda memiliki hak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda kapan saja. Anda juga dapat mengajukan permintaan untuk menolak penggunaan data tertentu sesuai kebutuhan.",
    points: [
      "Akses informasi pribadi Anda",
      "Memperbarui data yang tidak akurat",
      "Meminta penghapusan data",
      "Menolak penggunaan data untuk keperluan promosi",
    ],
  },
];

const contactItems = [
  {
    icon: "lucide:phone",
    label: "0822-1020-0700",
    href: "https://wa.me/6282210200700",
  },
  {
    icon: "lucide:mail",
    label: "info@lanyardbogor.com",
    href: "mailto:info@lanyardbogor.com",
  },
  {
    icon: "lucide:clock",
    label: "Senin - Sabtu 09.00 - 21.00 WIB",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/kebijakan/#webpage`,
      url: `${siteUrl}/kebijakan`,
      name: "Kebijakan Privasi Lanyard Bogor",
      description:
        "Pelajari bagaimana Lanyard Bogor mengumpulkan, menggunakan, melindungi, dan menjaga privasi data pelanggan.",
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
      "@id": `${siteUrl}/kebijakan/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Kebijakan Privasi",
          item: `${siteUrl}/kebijakan`,
        },
      ],
    },
  ],
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden border-b border-public-border/60 bg-white px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full border border-public-amber/10" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-public-soft/70" />
          <div className="pointer-events-none absolute left-[7%] top-28 hidden grid-cols-5 gap-3 opacity-45 sm:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-public-amber" />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-16 right-[9%] hidden grid-cols-5 gap-3 opacity-45 md:grid">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className="h-1 w-1 rounded-full bg-public-amber" />
            ))}
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.32em] text-public-amber">
              Kebijakan Privasi
            </p>
            <h1 className="mt-5 text-[42px] font-bold leading-[1.08] tracking-normal text-[#252525] md:text-7xl md:leading-[1.08]">
              Kebijakan Privasi Lanyard Bogor
            </h1>
            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-public-amber" />
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#475569] sm:text-base">
              Kami berkomitmen untuk melindungi privasi dan data pribadi Anda.
              Kebijakan ini menjelaskan bagaimana kami mengumpulkan,
              menggunakan, dan melindungi informasi Anda.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid overflow-hidden rounded-2xl border border-public-border bg-white shadow-xs sm:grid-cols-2 lg:grid-cols-5">
              {trustItems.map((item, index) => (
                <div
                  key={item.title}
                  className={`p-5 text-center ${
                    index > 0 ? "border-t border-public-border sm:border-l sm:border-t-0" : ""
                  } ${
                    index === 2 ? "sm:border-t lg:border-t-0" : ""
                  } ${
                    index === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-public-soft text-public-amber-strong">
                    <Icon icon={item.icon} className="h-7 w-7" />
                  </span>
                  <h2 className="mt-4 text-sm font-extrabold text-[#111827]">
                    {item.title}
                  </h2>
                  <p className="mx-auto mt-2 max-w-36 text-xs leading-5 text-[#475569]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.52fr]">
              <section className="rounded-2xl border border-public-border bg-white p-5 shadow-xs sm:p-7">
                <div className="divide-y divide-public-border">
                  {policySections.map((section, index) => (
                    <article
                      key={section.title}
                      className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr]"
                    >
                      <div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-public-amber text-sm font-extrabold text-[#111827]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#111827]">
                          {section.title}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#475569]">
                          {section.body}
                        </p>
                        {section.points ? (
                          <ul className="mt-4 space-y-2">
                            {section.points.map((point) => (
                              <li
                                key={point}
                                className="flex gap-2 text-sm leading-6 text-[#475569]"
                              >
                                <Icon
                                  icon="lucide:circle-check"
                                  className="mt-0.5 h-4 w-4 shrink-0 text-public-amber"
                                />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-public-border bg-public-soft/50 p-6 shadow-xs">
                  <div className="flex items-start gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-public-amber/25 bg-white text-public-amber-strong">
                      <Icon icon="lucide:shield-check" className="h-9 w-9" />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold text-[#111827]">
                        Perubahan Kebijakan
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-[#475569]">
                        Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu.
                        Perubahan akan diinformasikan melalui halaman ini.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-3 text-sm font-bold text-public-amber-strong">
                    <Icon icon="lucide:calendar-days" className="h-5 w-5" />
                    <span>Terakhir diperbarui: 24 Mei 2024</span>
                  </div>
                </section>

                <section className="rounded-2xl border border-public-border bg-white p-6 shadow-xs">
                  <h2 className="text-lg font-extrabold text-[#111827]">
                    Informasi Tambahan
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#475569]">
                    Jika Anda memiliki pertanyaan atau memerlukan bantuan terkait
                    kebijakan privasi ini, jangan ragu untuk menghubungi kami.
                  </p>
                  <div className="mt-6 space-y-4">
                    {contactItems.map((item) => {
                      const content = (
                        <>
                          <Icon
                            icon={item.icon}
                            className="h-5 w-5 shrink-0 text-public-amber"
                          />
                          <span>{item.label}</span>
                        </>
                      );

                      return item.href ? (
                        <a
                          key={item.label}
                          href={item.href}
                          className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#475569] transition-colors hover:text-public-amber-strong"
                        >
                          {content}
                        </a>
                      ) : (
                        <div
                          key={item.label}
                          className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#475569]"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-public-border bg-white shadow-xs">
                  <div className="bg-public-soft p-4">
                    <Image
                      src="/uploads/privacy-priority-lanyardbogor.webp"
                      alt="Ilustrasi perlindungan data dan privasi Lanyard Bogor"
                      width={1254}
                      height={1254}
                      sizes="(min-width: 1024px) 32vw, 100vw"
                      loading="lazy"
                      className="h-auto w-full rounded-xl object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-extrabold text-[#111827]">
                      Privasi Anda adalah Prioritas Kami
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#475569]">
                      Kepercayaan Anda sangat berarti bagi kami. Kami akan selalu
                      menjaga kerahasiaan dan keamanan data Anda.
                    </p>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
