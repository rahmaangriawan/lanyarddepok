"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

export default function LanyardBranding() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.15,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);



  return (
    <section
      ref={sectionRef}
      id="branding"
      className="relative bg-gradient-to-b from-white to-[#fff9f9] py-20 sm:py-24 overflow-hidden"
    >
      {/* Subtle Glowing Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e13b3d]/3 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
        
        {/* Tagline */}
        <div className={`inline-flex items-center justify-center gap-3 text-[#e13b3d] transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}>
          <span className="h-px w-8 bg-current" />
          <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Lanyard Jakarta Branding</span>
          <span className="h-px w-8 bg-current" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#373f50] tracking-tight leading-tight select-none max-w-3xl mx-auto">
          Setiap Detail Tali, Cerminan <span className="text-[#e13b3d]">Integritas Brand</span> Anda.
        </h2>

        {/* Description Fade Up */}
        <p className={`text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto transition-all duration-1000 delay-[500ms] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          Lanyard Jakarta bukan sekadar penyangga kartu identitas. Kami merancang media promosi bergerak yang melambangkan profesionalisme, mempererat kesatuan tim, dan menyampaikan nilai-nilai brand Anda secara elegan di setiap kesempatan.
        </p>

        {/* Horizontal Highlights Fade Up */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4 transition-all duration-1000 delay-[700ms] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}>
          <div className="flex items-center space-x-2 bg-white/80 border border-gray-100/60 px-4 py-2 rounded-full shadow-xs">
            <Icon icon="lucide:check-circle-2" className="text-[#e13b3d] h-4.5 w-4.5 shrink-0" />
            <span className="text-xs text-gray-600 font-bold">Bahan Premium Lembut</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 border border-gray-100/60 px-4 py-2 rounded-full shadow-xs">
            <Icon icon="lucide:check-circle-2" className="text-[#e13b3d] h-4.5 w-4.5 shrink-0" />
            <span className="text-xs text-gray-600 font-bold">Cetak Sublimasi Tajam</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 border border-gray-100/60 px-4 py-2 rounded-full shadow-xs">
            <Icon icon="lucide:check-circle-2" className="text-[#e13b3d] h-4.5 w-4.5 shrink-0" />
            <span className="text-xs text-gray-600 font-bold">Aksesori Logam Kokoh</span>
          </div>
        </div>

      </div>
    </section>
  );
}
