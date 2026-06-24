"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Footer() {
  const [productCategories, setProductCategories] = useState<any[]>([
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative overflow-hidden rounded-tl-[30px] rounded-bl-[30px] rounded-tr-[50px] rounded-br-[50px] bg-white p-4 sm:p-12 flex flex-col items-center justify-center w-full aspect-[1672/600] select-none">
          {/* Background image covering the banner exactly matching the image's aspect ratio */}
          <div 
            className="absolute inset-0 bg-[url('/uploads/asset-cta-footer-atas-1782202378317.webp')] bg-cover bg-center bg-no-repeat pointer-events-none"
          />

          {/* Centered Content Column */}
          <div className="relative z-10 max-w-2xl text-center space-y-2 sm:space-y-4 md:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-lg sm:text-[26px] md:text-[34px] lg:text-[40px] font-extrabold text-[#373f50] leading-tight tracking-tight">
                Siap Bikin Lanyard Custom<br />
                <span className="text-brand-red">Bersama Kami?</span>
              </h2>
              <p className="text-gray-500 text-[11px] sm:text-[13px] md:text-[15px] font-normal max-w-[180px] sm:max-w-[280px] md:max-w-[320px] mx-auto leading-relaxed">
                Konsultasikan kebutuhan Anda sekarang dan dapatkan penawaran terbaik.
              </p>
            </div>

            {/* Centered Buttons */}
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full">
              <a
                href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Jakarta%2C%20saya%20ingin%20berkonsultasi%20mengenai%20pemesanan%20lanyard..."
                target="_blank"
                rel="noopener noreferrer"
                className="w-auto inline-flex items-center justify-center bg-[#FF4C4D] hover:bg-[#e03d3d] text-white text-[9px] sm:text-xs md:text-sm font-bold px-3 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl shadow-xs transition-colors"
              >
                <Icon icon="logos:whatsapp-icon" className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 mr-1 sm:mr-2 shrink-0" />
                WhatsApp Kami
              </a>
              <Link
                href="/produk"
                className="w-auto inline-flex items-center justify-center bg-white hover:bg-gray-50 text-brand-red text-[9px] sm:text-xs md:text-sm font-bold px-3 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl border border-brand-red/35 shadow-xs transition-colors"
              >
                <Icon icon="lucide:shopping-bag" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0 text-brand-red" />
                Lihat Produk
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-2 select-none">
              <img src="/images/logo.webp" alt="Lanyard Jakarta Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-500 font-normal leading-relaxed max-w-sm">
              Pusatnya Lanyard Custom berkualitas untuk perusahaan, instansi, sekolah, komunitas, dan event di seluruh Indonesia.
            </p>
          </div>

          {/* Column 2: PRODUK (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Produk</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-500 font-normal">
              {productCategories.map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/produk?category=${encodeURIComponent(cat.name)}`} className="hover:text-brand-red transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: INFORMASI (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Informasi</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-500 font-normal">
              <li>
                <Link href="/tentang" className="hover:text-brand-red transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand-red transition-colors">
                  Artikel
                </Link>
              </li>
              <li>
                <Link href="/promo" className="hover:text-brand-red transition-colors">
                  Promo
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-brand-red transition-colors">
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-brand-red transition-colors">
                  Kontak Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: BANTUAN (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Bantuan</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-gray-500 font-normal">
              <li>
                <Link href="/faq" className="hover:text-brand-red transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/cara-pemesanan" className="hover:text-brand-red transition-colors">
                  Cara Pemesanan
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-brand-red transition-colors">
                  Pembayaran
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-brand-red transition-colors">
                  Pengiriman
                </Link>
              </li>
              <li>
                <Link href="/kebijakan" className="hover:text-brand-red transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: KONTAK (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-4 tracking-wider uppercase text-gray-800">Kontak</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-gray-500 font-normal">
              <li className="flex items-center space-x-2">
                <Icon icon="lucide:phone" className="h-4.5 w-4.5 text-brand-red shrink-0" />
                <a href="https://wa.me/6282210200700" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">
                  0822-1020-0700
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Icon icon="lucide:mail" className="h-4.5 w-4.5 text-brand-red shrink-0" />
                <a href="mailto:info@lanyardjakarta.co.id" className="hover:text-brand-red transition-colors truncate">
                  info@lanyardjakarta.co.id
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Icon icon="lucide:map-pin" className="h-4.5 w-4.5 text-brand-red shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Jl. Raya Kalibata No.10, Pancoran, Jakarta Selatan, DKI Jakarta 12740
                </span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-gray-100" />

        {/* Bottom copyright line (centered) */}
        <div className="text-center text-xs text-gray-400 font-semibold pt-6 select-none">
          © {new Date().getFullYear()} <span className="font-extrabold text-gray-500">Lanyard Jakarta</span>. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
