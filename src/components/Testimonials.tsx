"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  stars: number;
  initials: string;
  bgColor: string;
  textColor: string;
}

export default function Testimonials() {
  const reviews: Testimonial[] = [
    {
      id: 0,
      name: "Rizky Pratama",
      role: "Event Officer",
      company: "Bank Indonesia",
      text: "Lanyard dari sini kualitasnya luar biasa! Hasil printing tajam, bahan nyaman dipakai, dan pengerjaan sangat cepat. Recommended!",
      stars: 5,
      initials: "BI",
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    {
      id: 1,
      name: "Dewi Lestari",
      role: "Marketing Communication",
      company: "Telkomsel",
      text: "Desain sesuai request dan hasilnya bahkan lebih bagus dari ekspektasi. Timnya responsif dan prosesnya mudah.",
      stars: 5,
      initials: "T",
      bgColor: "bg-red-600",
      textColor: "text-white",
    },
    {
      id: 2,
      name: "Farhan Ramadhan",
      role: "Koordinator Acara",
      company: "Universitas Indonesia",
      text: "Pesan untuk event kampus, hasilnya memuaskan! Warna cerah, bahan tebal, dan semua tepat waktu. Terima kasih!",
      stars: 5,
      initials: "UI",
      bgColor: "bg-yellow-500",
      textColor: "text-gray-900",
    },
    {
      id: 3,
      name: "Budi Santoso",
      role: "Procurement Specialist",
      company: "BCA",
      text: "Sangat puas dengan hasilnya! Pelayanan ramah, cetakan rapi, dan pengiriman aman sampai tujuan. Mantap!",
      stars: 5,
      initials: "BCA",
      bgColor: "bg-blue-800",
      textColor: "text-white",
    },
    {
      id: 4,
      name: "Amanda Putri",
      role: "Humas Kesehatan",
      company: "Kemenkes RI",
      text: "Pemesanan lanyard instansi dalam jumlah besar selesai tepat waktu dengan kualitas yang seragam. Sangat profesional.",
      stars: 5,
      initials: "K",
      bgColor: "bg-emerald-600",
      textColor: "text-white",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(1); // Default to Telkomsel (Dewi Lestari)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  // Get the three reviews to show
  const getVisibleReviews = () => {
    const prev = (activeIndex - 1 + reviews.length) % reviews.length;
    const current = activeIndex;
    const next = (activeIndex + 1) % reviews.length;
    return [reviews[prev], reviews[current], reviews[next]];
  };

  const visibleReviews = getVisibleReviews();

  return (
    <section id="testimonials" className="bg-[#fafafa] py-16 sm:py-20 border-t border-gray-100 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 select-none">
          <span className="inline-flex items-center text-[#e13b3d] text-xs font-bold tracking-widest uppercase gap-2 mb-2">
            <span className="w-4 h-[1px] bg-[#e13b3d]" />
            TESTIMONI
            <span className="w-4 h-[1px] bg-[#e13b3d]" />
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight mt-2">
            Apa Kata Mereka <br />
            <span className="text-[#e13b3d]">Tentang Layanan Kami</span>
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-3">
            Kepuasan pelanggan adalah prioritas kami.
          </p>
        </div>

        {/* Slider Controls & Carousel */}
        <div className="relative flex items-center justify-between gap-4 mt-8 select-none">
          
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#e13b3d] hover:bg-[#ffe3e3]/20 shadow-xs cursor-pointer shrink-0 transition-colors z-20"
            aria-label="Previous review"
          >
            <Icon icon="lucide:chevron-left" className="h-5 w-5" />
          </button>

          {/* Cards Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {visibleReviews.map((item, index) => {
              const isMiddle = index === 1;
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 relative min-h-[300px] ${
                    isMiddle
                      ? "border-[#e13b3d]/20 shadow-xl md:scale-105 md:z-10 bg-white"
                      : "border-gray-100 shadow-xs md:scale-95 md:z-0 opacity-70 hidden md:flex"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Double Quote Icon */}
                    <Icon
                      icon="lucide:quote"
                      className={`text-[#e13b3d]/15 shrink-0 ${isMiddle ? "h-11 w-11" : "h-9 w-9"}`}
                    />
                    {/* Review Text */}
                    <p className="text-sm font-medium text-gray-500 leading-relaxed select-text">
                      {item.text}
                    </p>
                  </div>

                  <div className="mt-8">
                    {/* Divider */}
                    <div className="border-t border-gray-100 w-full mb-4" />
                    
                    {/* Reviewer Details */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Styled Avatar initials logo */}
                        <div className={`w-10 h-10 rounded-full ${item.bgColor} ${item.textColor} flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
                          {item.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-[10px] font-bold text-gray-500 truncate uppercase mt-0.5">
                            {item.role}
                          </p>
                          <p className="text-[10px] font-bold text-[#e13b3d] truncate uppercase mt-0.5">
                            {item.company}
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: item.stars }).map((_, s) => (
                          <Icon key={s} icon="lucide:star" className="h-3.5 w-3.5 text-[#e13b3d] fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#e13b3d] hover:bg-[#ffe3e3]/20 shadow-xs cursor-pointer shrink-0 transition-colors z-20"
            aria-label="Next review"
          >
            <Icon icon="lucide:chevron-right" className="h-5 w-5" />
          </button>

        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-1 mt-6 select-none">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="w-11 h-11 flex items-center justify-center cursor-pointer transition-all focus:outline-none"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === i ? "w-6 bg-[#e13b3d]" : "w-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Stats Block */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 mt-16 flex justify-center shadow-xs select-none">
          
          {/* Three Stats */}
          <div className="w-full max-w-3xl flex items-center justify-around gap-6 sm:gap-12">
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-[#ffe3e3]/50 flex items-center justify-center text-[#e13b3d] mb-2 shadow-xs">
                <Icon icon="lucide:smile" className="h-5 w-5" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">1.000+</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1.5">Pelanggan Puas</span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-[#ffe3e3]/50 flex items-center justify-center text-[#e13b3d] mb-2 shadow-xs">
                <Icon icon="lucide:award" className="h-5 w-5" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">5.000+</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1.5">Proyek Selesai</span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-[#ffe3e3]/50 flex items-center justify-center text-[#e13b3d] mb-2 shadow-xs">
                <Icon icon="lucide:star" className="h-5 w-5" />
              </div>
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">4.9/5</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1.5">Rating Pelanggan</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
