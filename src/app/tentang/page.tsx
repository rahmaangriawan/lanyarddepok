import { Icon } from "@iconify/react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createOpenGraphMetadata } from "@/lib/seo";

export const revalidate = 3600; // Cache page for 1 hour

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Temukan profil lengkap Lanyard Bogor, penyedia layanan cetak tali gantungan lanyard custom kualitas premium terpercaya dengan teknologi cetak digital sublimasi terbaik.",
  alternates: {
    canonical: "/tentang",
  },
  ...createOpenGraphMetadata({
    title: "Tentang Kami",
    description:
      "Temukan profil lengkap Lanyard Bogor, penyedia layanan cetak tali gantungan lanyard custom kualitas premium terpercaya dengan teknologi cetak digital sublimasi terbaik.",
    path: "/tentang",
  }),
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardbogor.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${siteUrl}/tentang/#aboutpage`,
      url: `${siteUrl}/tentang`,
      name: "Tentang Lanyard Bogor",
      description:
        "Profil lengkap Lanyard Bogor, produsen spesialis cetak tali lanyard custom premium terpercaya di Indonesia.",
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
      "@id": `${siteUrl}/tentang/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Tentang Kami", item: `${siteUrl}/tentang` },
      ],
    },
  ],
};

const whatsappUrl =
  "https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20minta%20quotation%20untuk%20lanyard%20custom.";

const stats = [
  {
    icon: "lucide:award",
    value: "5+",
    title: "Tahun",
    label: "Pengalaman",
    desc: "Melayani berbagai brand dan instansi di Indonesia",
  },
  {
    icon: "lucide:users",
    value: "1.000+",
    title: "",
    label: "Klien Puas",
    desc: "Dipercaya oleh perusahaan, komunitas, & event besar",
  },
  {
    icon: "lucide:shield-check",
    value: "98%",
    title: "",
    label: "Kualitas Terjamin",
    desc: "Material pilihan & proses kontrol kualitas di setiap tahap",
  },
  {
    icon: "lucide:timer",
    value: "3-5",
    title: "Hari",
    label: "Produksi Cepat",
    desc: "Proses cepat tanpa mengurangi kualitas produk",
  },
];

const missionItems = [
  "Memberikan produk lanyard custom berkualitas tinggi.",
  "Memberikan pelayanan cepat, ramah, dan responsif.",
  "Terus berinovasi dalam desain, proses, dan teknologi produksi.",
  "Membangun hubungan jangka panjang yang saling menguntungkan.",
];

const advantages = [
  {
    icon: "lucide:gem",
    title: "Kualitas Premium",
    desc: "Material pilihan & nyaman dipakai dalam waktu lama.",
  },
  {
    icon: "lucide:pencil-ruler",
    title: "Custom Sesuai Kebutuhan",
    desc: "Desain, warna, ukuran & aksesoris sesuai identitas Anda.",
  },
  {
    icon: "lucide:badge-percent",
    title: "Harga Kompetitif",
    desc: "Kualitas terbaik dengan harga yang bersahabat.",
  },
  {
    icon: "lucide:headphones",
    title: "Layanan Cepat & Responsif",
    desc: "Tim kami siap memberikan solusi konsultasi hingga after sales.",
  },
];

const processSteps = [
  {
    image: "/uploads/about-process-consultation-design.webp",
    number: "01",
    title: "Konsultasi & Desain",
    desc: "Sampaikan kebutuhan Anda, kami bantu ide dan desain terbaik untuk brand Anda.",
  },
  {
    image: "/uploads/about-process-production-qc.webp",
    number: "02",
    title: "Produksi & Quality Control",
    desc: "Diproduksi dengan material terbaik dan melalui proses kontrol kualitas ketat.",
  },
  {
    image: "/uploads/about-process-finishing-shipping.webp",
    number: "03",
    title: "Finishing & Pengiriman",
    desc: "Finishing rapi, dikemas aman, dan dikirim tepat waktu ke tempat Anda.",
  },
];

const testimonials = [
  {
    quote: "Kualitas lanyard sangat bagus, sablon rapi dan warna tajam. Pelayanannya juga cepat dan ramah!",
    name: "Rizky Pratama",
    role: "Event Organizer - Jakarta",
  },
  {
    quote: "Sudah beberapa kali order di Lanyard Bogor, hasil selalu konsisten dan memuaskan.",
    name: "Dewi Lestari",
    role: "HRD - PT Maju Sejahtera Indonesia",
  },
];

export default function TentangPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow overflow-hidden bg-white text-[#0f172a]">
        <section className="relative isolate px-4 pt-12 pb-9 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-public-amber/25 bg-public-amber/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-public-amber-strong">
                <Icon icon="lucide:sparkles" className="h-3.5 w-3.5" />
                Tentang Lanyard Bogor
              </span>
              <h1 className="mt-6 text-[2.55rem] font-extrabold leading-[1.12] tracking-normal text-[#111827] sm:text-[3.4rem] lg:text-[3.75rem]">
                Lebih Dekat dengan Lanyard Bogor
              </h1>
              <p className="mt-6 max-w-[34rem] text-base font-normal leading-8 text-[#64748b]">
                Kami membantu perusahaan, instansi, komunitas, dan event mewujudkan identitas profesional melalui lanyard custom yang premium, fungsional, dan tepat waktu.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-public-amber px-8 py-3 text-sm font-semibold text-[#111827] shadow-lg shadow-public-amber/20 transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus:ring-2 focus:ring-public-amber focus:ring-opacity-75"
                >
                  Minta Quotation
                  <Icon icon="lucide:arrow-right" className="h-4.5 w-4.5" />
                </a>
                <Link
                  href="/produk"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-public-border bg-white px-8 py-3 text-sm font-semibold text-[#111827] shadow-xs transition-colors hover:bg-public-soft focus:outline-none focus:ring-2 focus:ring-public-amber focus:ring-opacity-75"
                >
                  <Icon icon="lucide:layout-grid" className="h-4.5 w-4.5" />
                  Lihat Produk
                </Link>
              </div>
            </div>

            <div className="relative min-h-[340px] sm:min-h-[430px] lg:min-h-[500px]">
              <div className="absolute -right-8 top-1/2 hidden h-36 w-20 -translate-y-1/2 grid-cols-5 gap-2 sm:grid">
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
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="relative z-10 object-contain object-center"
              />
            </div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[22px] border border-public-border bg-white shadow-xs sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={item.label}
                className={`flex gap-5 p-6 sm:p-7 ${index > 0 ? "border-t border-public-border sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-t lg:border-t-0" : ""}`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-public-amber/20 bg-public-amber/10 text-public-amber-strong">
                  <Icon icon={item.icon} className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold leading-none text-[#111827] sm:text-3xl">
                      {item.value}
                    </span>
                    {item.title && (
                      <span className="text-xl font-extrabold leading-none text-[#111827]">
                        {item.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-extrabold text-[#111827]">{item.label}</p>
                  <p className="mt-2 text-xs font-normal leading-5 text-[#64748b]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="lg:order-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-public-amber-strong">
                Siapa Kami
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl">
                Lebih dari Sekadar Lanyard, Kami Bangun Identitas.
              </h2>
              <div className="mt-6 space-y-5 text-sm font-normal leading-7 text-[#64748b] sm:text-base">
                <p>
                  Lanyard Bogor berdiri sejak 2019 dengan komitmen memberikan solusi lanyard custom berkualitas tinggi. Kami percaya bahwa lanyard bukan hanya aksesori, tetapi representasi profesionalisme dan citra sebuah brand.
                </p>
                <p>
                  Dari desain, material, printing, hingga finishing, setiap detail dikerjakan dengan teliti agar Anda mendapatkan hasil yang memuaskan dan berkesan.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[640px] lg:order-1">
              <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-white shadow-xl shadow-black/[0.05] sm:min-h-[430px]">
                <div className="absolute left-0 top-10 h-16 w-36 rounded-xl bg-public-amber/12" />
                <div className="absolute bottom-0 right-0 h-32 w-64 rounded-tl-[64px] bg-public-amber/25" />
                <Image
                  src="/uploads/about-lanyard-identity-showcase.webp"
                  alt="Showcase lanyard custom Lanyard Bogor untuk identitas brand"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="relative z-0 object-contain object-center p-7 sm:p-10"
                />
              </div>

              <div className="absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-3 rounded-2xl border border-public-border bg-white px-5 py-4 shadow-lg shadow-black/[0.06] sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-public-amber/10 text-public-amber-strong">
                  <Icon icon="lucide:shield-check" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#111827]">Material Premium</p>
                  <p className="text-xs font-medium text-[#64748b]">Nyaman & Awet</p>
                </div>
              </div>
              <div className="absolute -right-3 top-16 z-20 hidden items-center gap-3 rounded-2xl border border-public-border bg-white px-5 py-4 shadow-lg shadow-black/[0.06] sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-public-amber/10 text-public-amber-strong">
                  <Icon icon="lucide:palette" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#111827]">Desain Custom</p>
                  <p className="text-xs font-medium text-[#64748b]">Sesuai Kebutuhan</p>
                </div>
              </div>
              <div className="absolute -right-3 bottom-16 z-20 hidden items-center gap-3 rounded-2xl border border-public-border bg-white px-5 py-4 shadow-lg shadow-black/[0.06] sm:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-public-amber/10 text-public-amber-strong">
                  <Icon icon="lucide:gem" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#111827]">Hasil Rapi</p>
                  <p className="text-xs font-medium text-[#64748b]">Kualitas Terjamin</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-2">
            <div className="rounded-[22px] border border-public-amber/15 bg-gradient-to-br from-public-amber/12 via-white to-public-amber/5 p-7 sm:p-9">
              <div className="flex items-center gap-4">
                <Icon icon="lucide:target" className="h-10 w-10 text-public-amber-strong" />
                <h3 className="text-lg font-extrabold uppercase tracking-[0.08em] text-public-amber-strong">
                  Misi Kami
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {missionItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[#475569]">
                    <Icon icon="lucide:check" className="mt-1 h-4 w-4 shrink-0 text-public-amber-strong" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[22px] border border-public-amber/15 bg-gradient-to-br from-public-amber/10 via-white to-[#fff8ed] p-7 sm:p-9">
              <div className="flex items-center gap-4">
                <Icon icon="lucide:eye" className="h-10 w-10 text-public-amber-strong" />
                <h3 className="text-lg font-extrabold uppercase tracking-[0.08em] text-public-amber-strong">
                  Visi Kami
                </h3>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#475569]">
                Menjadi penyedia lanyard custom terdepan di Indonesia yang dipercaya karena kualitas, kecepatan, dan pelayanan terbaik.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-public-amber-strong">
                Keunggulan Kami
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#111827] sm:text-4xl">
                Keunggulan yang Membuat Kami Berbeda
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((item) => (
                <div key={item.title} className="rounded-[18px] border border-public-border bg-white p-6 shadow-xs">
                  <Icon icon={item.icon} className="h-9 w-9 text-public-amber-strong" />
                  <h3 className="mt-5 text-sm font-extrabold text-[#111827]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#64748b]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-public-amber-strong">
                Cara Kami Bekerja
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#111827] sm:text-4xl">
                Proses Mudah, Hasil Maksimal
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-4">
              <div className="relative overflow-hidden rounded-[22px] bg-public-amber p-8 text-[#111827] shadow-lg shadow-public-amber/20">
                <h3 className="text-2xl font-extrabold leading-tight">
                  Dari Ide Hingga Jadi, Kami Tangani dengan Profesional
                </h3>
                <p className="mt-6 text-sm font-medium leading-7">
                  Kami memastikan setiap pesanan dikerjakan dengan standar kualitas terbaik dan komunikasi yang jelas dari awal hingga selesai.
                </p>
                <Icon icon="lucide:badge-alert" className="absolute -bottom-6 right-6 h-28 w-28 text-white/30" />
              </div>

              {processSteps.map((step, index) => (
                <div key={step.number} className="relative rounded-[22px] border border-public-border bg-white p-5 shadow-xs">
                  {index > 0 && (
                    <div className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-public-amber text-white shadow-md lg:flex">
                      <Icon icon="lucide:arrow-right" className="h-5 w-5" />
                    </div>
                  )}
                  <div className="relative aspect-[1.65/1] overflow-hidden rounded-xl bg-public-soft">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="mt-6 block text-lg font-extrabold text-public-amber-strong">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-base font-extrabold text-[#111827]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#64748b]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-center text-xs font-extrabold uppercase tracking-[0.2em] text-public-amber-strong">
              Apa Kata Mereka
            </p>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-[20px] border border-public-border bg-white p-7 shadow-xs">
                  <div className="flex gap-1 text-public-amber">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Icon key={index} icon="lucide:star" className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#475569]">&quot;{item.quote}&quot;</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-public-amber/10 text-sm font-extrabold text-public-amber-strong">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#111827]">{item.name}</p>
                      <p className="text-xs text-[#64748b]">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
