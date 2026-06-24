"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import CircularGallery from "@/components/CircularGallery";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  logoUrl: string | null;
  logoText: string | null;
  link: string | null;
}

export default function LanyardPortfolio() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback data matching the screenshot if database is empty
  const fallbacks: PortfolioItem[] = [
    {
      id: -1,
      title: "Bank Indonesia",
      description: "Lanyard custom dengan sablon logo untuk kebutuhan event dan identitas karyawan.",
      imageUrl: "/uploads/aset-lanyard-4-1782114161098.webp",
      logoUrl: null,
      logoText: "Bank Indonesia",
      link: "https://wa.me/6282210200700",
    },
    {
      id: -2,
      title: "Telkomsel",
      description: "Lanyard printing dengan warna khas Telkomsel untuk kebutuhan event internal.",
      imageUrl: "/uploads/aset-lanyard-2-1782111030729.webp",
      logoUrl: null,
      logoText: "Telkomsel",
      link: "https://wa.me/6282210200700",
    },
    {
      id: -3,
      title: "Kemenkes RI",
      description: "Lanyard dengan sublimasi full color untuk kebutuhan identitas dan kegiatan instansi.",
      imageUrl: "/uploads/aset-lanyard-4-1782114161098.webp",
      logoUrl: null,
      logoText: "Kemenkes RI",
      link: "https://wa.me/6282210200700",
    },
    {
      id: -4,
      title: "Universitas Indonesia",
      description: "Lanyard custom sebagai identitas mahasiswa dan kebutuhan acara kampus.",
      imageUrl: "/uploads/aset-lanyard-2-1782111030729.webp",
      logoUrl: null,
      logoText: "Universitas Indonesia",
      link: "https://wa.me/6282210200700",
    },
  ];

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch("/api/cms/portofolio");
        const data = await res.json();
        if (res.ok && data.success && data.portfolios && data.portfolios.length > 0) {
          setPortfolios(data.portfolios);
        }
      } catch (err) {
        console.error("Failed to load portfolios, using fallbacks.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  const displayedPortfolios = portfolios.length > 0 ? portfolios : fallbacks;

  const galleryItems = useMemo(() => {
    return displayedPortfolios.map((item) => ({
      image: item.imageUrl,
      text: item.title,
    }));
  }, [displayedPortfolios]);

  return (
    <section id="portfolio" className="relative bg-white py-16 sm:py-20 border-t border-gray-100">
      
      {/* Decorative Dotted Grid (Top Right) */}
      <div className="absolute top-[40px] right-[20px] grid grid-cols-6 gap-2 opacity-30 pointer-events-none -z-10">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#fe696a]" />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-6 select-none">
          <span className="inline-flex items-center text-[#fe696a] text-xs font-bold tracking-widest uppercase gap-2 mb-2">
            <span className="w-4 h-[1px] bg-[#fe696a]" />
            PORTOFOLIO KAMI
            <span className="w-4 h-[1px] bg-[#fe696a]" />
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight mt-2">
            Dipercaya Berbagai <span className="text-[#fe696a]">Brand & Instansi</span>
          </h2>
          <p className="text-gray-400 text-sm font-medium mt-3">
            Gunakan mouse drag atau swipe jari Anda untuk memutar portofolio lanyard kami.
          </p>
        </div>
      </div>

      {/* Circular Gallery Container - Full Width */}
      <div className="relative w-full h-[450px] sm:h-[550px] md:h-[600px] overflow-hidden select-none bg-radial from-transparent to-transparent my-6">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fe696a]"></div>
          </div>
        ) : (
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#373f50"
            borderRadius={0.06}
            scrollEase={0.03}
            fontUrl="https://fonts.googleapis.com/css2?family=Rubik:wght@700&display=swap"
            font="bold 22px Rubik"
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bottom CTA Button */}
        <div className="flex justify-center mt-6 select-none">
          <Link
            href="https://wa.me/6282210200700"
            target="_blank"
            className="inline-flex items-center justify-center bg-white border border-[#fe696a] text-[#fe696a] hover:bg-[#ffe3e3]/20 text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Lihat Portofolio Lainnya</span>
            <Icon icon="lucide:arrow-right" className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
