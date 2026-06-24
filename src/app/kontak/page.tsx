import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak Kami - Hubungi Kami untuk Pemesanan",
  description:
    "Hubungi tim Lanyard Jakarta untuk konsultasi, pemesanan, dan informasi harga lanyard custom premium. WhatsApp, email, atau kunjungi workshop kami di Jakarta Pusat.",
  alternates: {
    canonical: "/kontak",
  },
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${siteUrl}/kontak/#contactpage`,
      url: `${siteUrl}/kontak`,
      name: "Kontak Lanyard Jakarta",
      description:
        "Halaman kontak resmi Lanyard Jakarta. Hubungi kami via WhatsApp, email, atau kunjungi workshop produksi kami.",
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
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#localbusiness`,
      name: "Lanyard Jakarta",
      image: `${siteUrl}/uploads/lanyard-jakarta-hero-1782129081107.webp`,
      telephone: "+6282210200700",
      email: "info@lanyardjakarta.co.id",
      url: siteUrl,
      address: {
        "@type": "PostalAddress",
        addressRegion: "DKI Jakarta",
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

interface ContactLine {
  text: string;
  href?: string;
  isLink: boolean;
  muted?: boolean;
}

const contactChannels: { icon: string; title: string; lines: ContactLine[] }[] = [
  {
    icon: "lucide:phone",
    title: "WhatsApp (Hotline)",
    lines: [
      {
        text: "+62 822-1020-0700",
        href: "https://wa.me/6282210200700",
        isLink: true,
      },
    ],
  },
  {
    icon: "lucide:mail",
    title: "Email Resmi",
    lines: [
      {
        text: "info@lanyardjakarta.co.id",
        href: "mailto:info@lanyardjakarta.co.id",
        isLink: true,
      },
    ],
  },
  {
    icon: "lucide:clock",
    title: "Jam Operasional",
    lines: [
      { text: "Senin - Sabtu", isLink: false },
      { text: "Pukul 09.00 - 21.00 WIB", isLink: false },
      { text: "(Minggu & Hari Libur Nasional tutup)", isLink: false, muted: true },
    ],
  },
];

const stats = [
  { icon: "lucide:badge-check", value: "100%", label: "Kualitas Terjamin" },
  { icon: "lucide:users", value: "5000+", label: "Klien Terpercaya" },
  { icon: "lucide:timer", value: "On Time", label: "Pengerjaan Tepat Waktu" },
  {
    icon: "lucide:headphones",
    value: "Fast Response",
    label: "Layanan Ramah",
  },
];

export default function KontakPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* ─── Hero ─── */}
      <section className="bg-[#FDFDFD] border-b border-gray-100 pt-10 pb-14 sm:pt-14 sm:pb-18 text-center select-none relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-brand-light-50 opacity-60" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-light-50 opacity-40" />

        <div className="relative max-w-3xl mx-auto px-5 space-y-4">
          <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest">
            Hubungi Kami
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
            Kontak Lanyard Jakarta
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Tim layanan pelanggan Lanyard Jakarta siap membantu Anda merancang
            desain, memilih bahan, hingga proses kalkulasi harga terbaik untuk
            kebutuhan promosi corporate Anda.
          </p>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="flex-grow bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
          {/* ─── Section 1: Informasi Kontak Resmi ─── */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] leading-tight">
                Informasi Kontak Resmi
              </h2>
              <p className="text-sm text-gray-500 font-normal leading-relaxed">
                Silakan hubungi kami melalui salah satu saluran komunikasi di
                bawah ini untuk respon cepat:
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {contactChannels.map((ch, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded-2xl hover:border-brand-light-200 hover:shadow-sm transition-all duration-200 space-y-3 group"
                >
                  <div className="h-11 w-11 rounded-xl bg-brand-light-50 border border-brand-light-100 flex items-center justify-center group-hover:bg-brand-light-100 transition-colors">
                    <Icon
                      icon={ch.icon}
                      className="h-5 w-5 text-brand-red"
                    />
                  </div>
                  <h3 className="text-xs font-extrabold text-[#1a202c] uppercase tracking-wide">
                    {ch.title}
                  </h3>
                  <div className="space-y-0.5">
                    {ch.lines.map((line, j) =>
                      line.isLink ? (
                        <a
                          key={j}
                          href={line.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-semibold text-brand-red hover:underline"
                        >
                          {line.text}
                        </a>
                      ) : (
                        <p
                          key={j}
                          className={`text-sm ${line.muted ? "text-gray-400 text-xs mt-1" : "text-gray-600"} font-medium`}
                        >
                          {line.text}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ─── Section 2: Kantor & Workshop ─── */}
          <section className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Info */}
                <div className="p-6 sm:p-8 flex flex-col justify-center space-y-5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] leading-tight">
                    Kantor &amp; Workshop Produksi
                  </h2>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed">
                    Anda juga dapat mengunjungi store utama kami untuk melihat
                    langsung sampel bahan tali dan portofolio cetak yang telah
                    kami kerjakan sebelumnya.
                  </p>

                  {/* Address */}
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-light-50 border border-brand-light-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon
                        icon="lucide:map-pin"
                        className="h-4 w-4 text-brand-red"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-brand-red uppercase tracking-wider">
                        Alamat
                      </span>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        Indonesia, DKI Jakarta
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Map embed */}
                <div className="relative min-h-[280px] md:min-h-0">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.28959556901!2d106.7271528!3d-6.2297419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta!5e0!3m2!1sid!2sid!4v1"
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Lanyard Jakarta"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ─── Section 3: CTA — Kirim Pesan Instan ─── */}
          <section>
            <div className="bg-brand-light-50 border border-brand-light-100 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5">
                {/* Left: CTA text */}
                <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center space-y-5">
                  <div className="space-y-1">
                    <span className="inline-block text-brand-red text-[10px] font-extrabold uppercase tracking-widest">
                      Kontak Cepat
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a202c] leading-tight">
                      Kirim Pesan{" "}
                      <span className="italic text-brand-red">Instan</span>
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed">
                    Jika Anda memiliki pertanyaan spesifik mengenai penawaran
                    harga formal (quotation), pembuatan desain mockup gratis,
                    atau sampel fisik, jangan ragu untuk menghubungi layanan
                    WhatsApp customer service kami.
                  </p>
                  <p className="text-sm text-gray-500 font-normal leading-relaxed">
                    Kami akan merespons pertanyaan Anda sesegera mungkin selama
                    jam kerja operasional.
                  </p>

                  {/* WhatsApp CTA */}
                  <div className="space-y-2 pt-1">
                    <a
                      href="https://wa.me/6282210200700"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-brand-red hover:bg-[#e04e4f] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-brand-red/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <Icon
                        icon="lucide:message-circle"
                        className="mr-2 h-4.5 w-4.5"
                      />
                      Chat via WhatsApp
                    </a>
                    <p className="flex items-center text-xs text-gray-400 font-medium">
                      <Icon
                        icon="lucide:check-circle"
                        className="mr-1.5 h-3.5 w-3.5 text-green-500"
                      />
                      Respon cepat selama jam operasional
                    </p>
                  </div>
                </div>

                {/* Right: Product image */}
                <div className="md:col-span-2 relative min-h-[260px] flex items-center justify-center p-6">
                  <Image
                    src="/uploads/aset-lanyard-4-1782114161098.webp"
                    alt="Produk Lanyard Jakarta Premium Custom"
                    width={400}
                    height={400}
                    className="object-contain max-h-[320px] drop-shadow-lg"
                    priority={false}
                  />
                </div>
              </div>
            </div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
