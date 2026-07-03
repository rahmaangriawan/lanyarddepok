"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

interface FooterCategory {
  id: number;
  name: string;
  slug: string;
}

const FOOTER_CTA_WHATSAPP_URL =
  "https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20minta%20quotation%20untuk%20lanyard%20custom.";

const FOOTER_CTA_BENEFITS = [
  {
    icon: "lucide:award",
    title: "Kualitas Premium",
    description: "Nyaman, kuat, dan tahan lama",
  },
  {
    icon: "lucide:clock-3",
    title: "Produksi Cepat",
    description: "Proses cepat & tepat waktu",
  },
  {
    icon: "lucide:shield-check",
    title: "Terpercaya",
    description: "Dipercaya banyak brand",
  },
];

export default function Footer() {
  const [productCategories, setProductCategories] = useState<FooterCategory[]>([
    { id: 1, name: "Lanyard Custom", slug: "lanyard-custom" },
    { id: 2, name: "ID Card", slug: "id-card" },
    { id: 3, name: "Holder ID Card", slug: "holder-id-card" },
    { id: 4, name: "Aksesoris", slug: "aksesoris" },
    { id: 5, name: "Cetak Kartu PVC", slug: "cetak-kartu-pvc" },
  ]);

  // Fetch product categories from public API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?type=PRODUCT");
        const data = await res.json();
        if (res.ok && data.success && data.categories && data.categories.length > 0) {
          setProductCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load footer categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="w-full bg-white text-gray-600 border-t border-gray-100 pt-12 pb-8 relative z-30">
      {/* ─── Top CTA Banner (Before Main Footer Content) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 lg:mb-24">
        <section className="relative isolate overflow-hidden rounded-[24px] border border-public-border/70 bg-white select-none">
          <div className="grid min-h-[300px] grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
            <div className="relative flex min-w-0 flex-col justify-center px-4 py-8 text-center sm:px-8 lg:px-9 lg:py-10 lg:text-left lg:after:absolute lg:after:right-0 lg:after:top-1/2 lg:after:h-1/2 lg:after:w-px lg:after:-translate-y-1/2 lg:after:bg-public-border/80 xl:px-10">
              <h2 className="max-w-full break-words text-[1.55rem] font-extrabold leading-[1.16] tracking-normal text-[#111827] min-[360px]:text-[1.75rem] sm:text-[2.4rem] lg:text-[1.82rem] xl:text-[1.95rem]">
                <span className="block sm:whitespace-nowrap">Siap Cetak Lanyard Custom</span>
                <span className="block text-public-amber-strong sm:whitespace-nowrap">untuk Brand Anda?</span>
              </h2>
              <p className="mt-5 max-w-[31rem] text-sm font-normal leading-7 text-[#64748b] sm:text-base lg:max-w-[34rem]">
                Desain bebas, kualitas premium, dan hasil cepat. Kami siap wujudkan lanyard yang merepresentasikan brand Anda.
              </p>
              <div className="mt-7 flex justify-center lg:justify-start">
                <a
                  href={FOOTER_CTA_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 max-w-full items-center justify-center gap-3 rounded-full border border-transparent bg-public-amber px-4 text-center text-sm font-bold leading-5 text-[#111827] shadow-xs transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus:ring-4 focus:ring-public-amber/20"
                >
                  <span>
                    Minta Quotation <span className="hidden min-[360px]:inline">Sekarang</span>
                  </span>
                  <Icon icon="lucide:arrow-right" className="h-5 w-5 shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 border-t border-public-border/70 px-5 py-7 sm:px-8 lg:border-t-0 lg:px-8 lg:py-10">
              {FOOTER_CTA_BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex w-full max-w-[15rem] items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-public-amber/20 bg-public-amber/10 text-public-amber-strong">
                    <Icon icon={benefit.icon} className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold leading-tight text-[#111827] sm:text-base">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-xs font-normal leading-5 text-[#64748b] sm:text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative min-h-[250px] overflow-hidden bg-white lg:min-h-full">
              <div className="absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3e6] sm:h-[118%] sm:w-[118%] lg:left-[92%] lg:h-[164%] lg:w-[164%]" />
              <Image
                src="/uploads/cta-footer-lanyard-custom-mobile.webp"
                alt="Lanyard custom Lanyard Bogor warna oranye dan putih"
                width={360}
                height={294}
                className="relative z-10 mx-auto h-full max-h-[330px] w-full object-contain object-center px-6 py-5 sm:px-10 lg:absolute lg:inset-0 lg:max-h-none lg:px-0 lg:py-5 xl:px-2"
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 48vw, 86vw"
                quality={58}
                style={{ height: "auto" }}
                loading="eager"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ─── Main Footer Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-9 mb-12">
          
          {/* Column 1: Brand Info (4 cols) */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-2 select-none">
              <Image
                src="/uploads/lanyardbogor-logo-mobile.webp"
                alt="Lanyard Bogor Logo"
                width={148}
                height={36}
                className="object-contain"
                quality={60}
              />
            </div>
            <p className="text-sm text-gray-500 font-normal leading-relaxed max-w-sm">
              Pusatnya Lanyard Custom berkualitas untuk perusahaan, instansi, sekolah, komunitas, dan event di seluruh Indonesia.
            </p>
          </div>

          {/* Column 2: PRODUK (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-[13px] sm:text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Produk</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-normal">
              {productCategories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/produk?category=${encodeURIComponent(cat.name)}`} className="hover:text-public-amber-strong transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: INFORMASI (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-[13px] sm:text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Informasi</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-normal">
              <li>
                <Link href="/tentang" className="hover:text-public-amber-strong transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-public-amber-strong transition-colors">
                  Artikel
                </Link>
              </li>
              <li>
                <Link href="/promo" className="hover:text-public-amber-strong transition-colors">
                  Promo
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-public-amber-strong transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-public-amber-strong transition-colors">
                  Kontak Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: BANTUAN (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-[13px] sm:text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Bantuan</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-normal">
              <li>
                <Link href="/faq" className="hover:text-public-amber-strong transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/cara-pemesanan" className="hover:text-public-amber-strong transition-colors">
                  Cara Pemesanan
                </Link>
              </li>
              <li>
                <Link href="/pembayaran" className="hover:text-public-amber-strong transition-colors">
                  Pembayaran
                </Link>
              </li>
              <li>
                <Link href="/pengiriman" className="hover:text-public-amber-strong transition-colors">
                  Pengiriman
                </Link>
              </li>
              <li>
                <Link href="/kebijakan" className="hover:text-public-amber-strong transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: KONTAK (2 cols) */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-[13px] sm:text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Kontak</h3>
            <ul className="space-y-3.5 text-[13px] sm:text-sm text-gray-500 font-normal">
              <li className="flex items-start gap-2">
                <Icon icon="lucide:phone" className="h-4.5 w-4.5 text-public-amber-strong shrink-0" />
                <a href="https://wa.me/6282210200700" target="_blank" rel="noopener noreferrer" className="min-w-0 hover:text-public-amber-strong transition-colors">
                  0822-1020-0700
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="lucide:mail" className="h-4.5 w-4.5 text-public-amber-strong shrink-0" />
                <a href="mailto:info@lanyardbogor.com" className="min-w-0 break-words hover:text-public-amber-strong transition-colors">
                  info@lanyardbogor.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="lucide:map-pin" className="h-4.5 w-4.5 text-public-amber-strong shrink-0 mt-0.5" />
                <span className="min-w-0 leading-relaxed">
                  Bogor, Indonesia
                </span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-gray-100" />

        {/* Bottom copyright line (centered) */}
        <div className="text-center text-xs text-gray-600 font-semibold pt-6 select-none">
          © {new Date().getFullYear()} <span className="font-extrabold text-gray-500">Lanyard Bogor</span>. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
