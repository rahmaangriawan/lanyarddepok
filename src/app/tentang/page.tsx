import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Temukan profil lengkap Lanyard Jakarta, penyedia layanan cetak tali gantungan lanyard custom kualitas premium terpercaya dengan teknologi cetak digital sublimasi terbaik.",
  alternates: {
    canonical: "/tentang",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${siteUrl}/tentang/#aboutpage`,
      url: `${siteUrl}/tentang`,
      name: "Tentang Lanyard Jakarta",
      description:
        "Profil lengkap Lanyard Jakarta, produsen spesialis cetak tali lanyard custom premium terpercaya di Indonesia.",
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
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/tentang/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Tentang Kami", item: `${siteUrl}/tentang` },
      ],
    },
  ],
};

const features = [
  {
    icon: "lucide:layout-grid",
    title: "Bahan Tissue Premium",
    desc: "Kami menggunakan bahan kain lanyard berstruktur lembut (tipe tissue polyester) yang sangat nyaman di kulit leher, tidak menyebabkan gatal, serta tebal dan tahan lama.",
  },
  {
    icon: "lucide:printer",
    title: "Cetak Sublimasi Full Color",
    desc: "Menggunakan printer khusus sublimasi modern beresolusi tinggi dengan tinta impor premium, menghasilkan degradasi warna yang halus, detail yang tajam, dan tidak luntur meski dicuci berkali-kali.",
  },
  {
    icon: "lucide:shield-check",
    title: "Aksesoris Berkualitas Tinggi",
    desc: "Pilihan kait besi stainless steel tebal anti karat, stopper plastik pengunci kuat (mutu ekspor), serta card holder tebal berkualitas tinggi.",
  },
  {
    icon: "lucide:timer",
    title: "Pengerjaan Kilat & Tepat Waktu",
    desc: "Didukung oleh kapasitas produksi harian yang besar dan tim profesional, kami memastikan pesanan Anda selesai tepat sesuai jadwal kesepakatan.",
  },
];

const stats = [
  { icon: "lucide:badge-check", value: "100%", label: "Produk Berkualitas" },
  { icon: "lucide:users", value: "+5000", label: "Klien Terpercaya" },
  { icon: "lucide:package", value: "1-3 Hari", label: "Proses Produksi" },
  { icon: "lucide:headphones", value: "Fast Response", label: "Layanan Konsultasi" },
];

export default function TentangPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* ─── Hero ─── */}
      <section className="bg-[#FDFDFD] border-b border-gray-100 pt-10 pb-14 sm:pt-14 sm:pb-18 text-center select-none relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-brand-light-50 opacity-60" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-light-50 opacity-40" />

        <div className="relative max-w-3xl mx-auto px-5 space-y-4">
          <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest">
            Halaman Resmi
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
            Tentang Lanyard Jakarta
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Temukan profil lengkap Lanyard Jakarta, penyedia layanan cetak tali gantungan lanyard
            custom kualitas premium terpercaya dengan teknologi cetak digital sublimasi terbaik.
          </p>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="flex-grow bg-white">

        {/* Sections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-14">

          {/* ─── Section 1: Profil ─── */}
          <section className="space-y-5">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-light-50 border border-brand-light-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:building-2" className="h-5 w-5 text-brand-red" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] leading-tight">
                Profil Lanyard Jakarta
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
              Lanyard Jakarta adalah produsen spesialis cetak tali gantungan ID card / lanyard
              premium custom terpercaya di Indonesia. Kami berdedikasi untuk memberikan hasil cetak
              kualitas terbaik bagi kebutuhan branding perusahaan, instansi pemerintahan, kepanitiaan
              event, organisasi, maupun penggunaan personal.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* ─── Section 2: Mengapa Memilih Kami ─── */}
          <section className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-light-50 border border-brand-light-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:heart" className="h-5 w-5 text-brand-red" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] leading-tight">
                Mengapa Memilih Kami?
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed -mt-2">
              Kami memahami bahwa tali gantungan ID card bukan sekadar alat bantu membawa kartu
              identitas, melainkan media representasi brand Anda. Oleh karena itu, kami memberikan
              beberapa keunggulan utama:
            </p>

            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-4 p-5 bg-gray-50/70 border border-gray-100 rounded-2xl hover:border-brand-light-100 hover:bg-brand-light-50 transition-all duration-200 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-white border border-brand-light-100 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-light-50 transition-colors">
                    <Icon icon={f.icon} className="h-4.5 w-4.5 text-brand-red" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-[#1a202c]">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Blockquote */}
            <blockquote className="bg-brand-light-50 border-l-4 border-brand-red rounded-r-2xl p-5 sm:p-6 space-y-2">
              <Icon icon="lucide:quote" className="h-5 w-5 text-brand-red opacity-60" />
              <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed italic">
                Komitmen kami adalah menyajikan produk berkualitas tinggi dengan pelayanan prima untuk
                mendukung kesuksesan promosi dan branding instansi Anda.
              </p>
            </blockquote>
          </section>

          <hr className="border-gray-100" />

          {/* ─── Section 3: Visi & Misi ─── */}
          <section className="space-y-5">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-brand-light-50 border border-brand-light-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:target" className="h-5 w-5 text-brand-red" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] leading-tight">
                Visi &amp; Misi Kami
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
              Menjadi mitra tepercaya nomor satu di Indonesia dalam penyediaan media promosi dan
              perlengkapan identitas corporate, dengan mengutamakan kepuasan pelanggan, kualitas
              produk, dan ketepatan waktu pengiriman.
            </p>
          </section>

          {/* ─── Stats Bar ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-brand-light-100 hover:bg-brand-light-50 transition-all duration-200 space-y-2 group"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-brand-light-100 flex items-center justify-center shadow-xs group-hover:border-brand-light-200 transition-colors">
                  <Icon icon={s.icon} className="h-5 w-5 text-brand-red" />
                </div>
                <span className="text-base sm:text-lg font-extrabold text-[#1a202c] leading-tight">
                  {s.value}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* ─── CTA ─── */}
          <div className="text-center pt-2">
            <a
              href="https://wa.me/6282210200700"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-brand-red hover:bg-[#e04e4f] text-white text-sm font-bold px-7 py-3.5 rounded-xl shadow-md shadow-brand-red/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Icon icon="lucide:phone" className="mr-2 h-4.5 w-4.5" />
              Konsultasikan Kebutuhan Anda
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
