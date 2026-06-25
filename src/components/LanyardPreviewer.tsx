"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
export default function LanyardPreviewer() {
  const items = [
    {
      id: 1,
      title: "Kualitas Terjamin",
      desc: "Kami menggunakan bahan pilihan yang kuat, nyaman, dan tahan lama untuk pemakaian jangka panjang.",
      icon: "lucide:award",
      top: 16,     // y = 56px (center) -> top = 16px (for 80px container height)
      left: 196,   // x = 236px (center) -> left = 196px (for 80px container width)
    },
    {
      id: 2,
      title: "Desain Bebas & Modern",
      desc: "Desain custom sesuai identitas brand Anda. Tampil beda, lebih profesional.",
      icon: "lucide:pencil-ruler",
      top: 132,    // y = 172px -> top = 132px
      left: 119,   // x = 159px -> left = 119px
    },
    {
      id: 3,
      title: "Proses Cepat & Efisien",
      desc: "Pengerjaan cepat dengan kontrol kualitas ketat di setiap prosesnya.",
      icon: "lucide:timer",
      top: 260,    // y = 300px -> top = 260px
      left: 90,    // x = 130px -> left = 90px
    },
    {
      id: 4,
      title: "Layanan Responsif",
      desc: "Tim kami siap membantu dari konsultasi, desain, hingga after sales.",
      icon: "lucide:headset",
      top: 388,    // y = 428px -> top = 388px
      left: 119,   // x = 159px -> left = 119px
    },
    {
      id: 5,
      title: "Min. Order Fleksibel",
      desc: "Cocok untuk kebutuhan kecil maupun besar, tanpa kompromi kualitas.",
      icon: "lucide:package",
      top: 504,    // y = 544px -> top = 504px
      left: 196,   // x = 236px -> left = 196px
    },
  ];

  return (
    <section id="why-choose-us" className="relative overflow-hidden bg-white py-20 lg:py-28">
      {/* Background Soft Blobs */}
      <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full bg-[#e13b3d]/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[50px] right-[-50px] w-[400px] h-[400px] rounded-full bg-[#e13b3d]/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Decorative Grid of Dots (Bottom Left) */}
        <div className="absolute bottom-[20px] left-[20px] lg:left-[-40px] grid grid-cols-6 gap-2 opacity-40 pointer-events-none -z-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#e13b3d]" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & Lanyard Image */}
          <div className="lg:col-span-6 relative pb-16 lg:pb-0 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-3 text-[#e13b3d]">
              <span className="h-px w-8 bg-current" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em]">Kenapa Memilih Kami?</span>
              <span className="h-px w-8 bg-current" />
            </div>
            
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight mb-5">
              Lanyard Bukan <br />
              <span className="text-[#e13b3d]">Tali Biasa Saja</span>
            </h2>
            
            {/* Description */}
            <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Kami menggabungkan kualitas terbaik, desain modern, dan layanan profesional untuk memberikan pengalaman terbaik bagi setiap pelanggan.
            </p>
            
            {/* Button */}
            <Link
              href="#calculator"
              className="inline-flex items-center justify-center bg-[#e13b3d] hover:bg-[#c82a2c] text-white text-base font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#e13b3d]/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#e13b3d]/30 cursor-pointer"
            >
              <span>Lihat Selengkapnya</span>
              <Icon icon="lucide:arrow-right" className="ml-2 h-5 w-5" />
            </Link>

            {/* Desktop Lanyard Image (Absolute Positioned for overlapping layout) */}
            <div className="absolute bottom-[-160px] left-[-80px] w-[540px] pointer-events-none -z-5 hidden lg:block">
              <Image
                src="/uploads/aset-lanyard-3-1782112472764.webp"
                className="w-full h-auto transition-transform duration-500 hover:rotate-1"
                alt="Lanyard Custom Premium"
                width={800}
                height={450}
              />
            </div>

            {/* Mobile Lanyard Image (In-flow layout for mobile rendering) */}
            <div className="w-full max-w-sm mx-auto mt-10 lg:hidden pointer-events-none">
              <Image
                src="/uploads/aset-lanyard-3-1782112472764.webp"
                className="w-full h-auto"
                alt="Lanyard Custom Premium"
                width={800}
                height={450}
              />
            </div>
          </div>

          {/* Right Column: Features with Curved Dashed Line */}
          <div className="lg:col-span-6 flex justify-center items-center relative overflow-visible">
            
            {/* Desktop Curved Layout */}
            <div className="relative w-[600px] h-[600px] hidden lg:block scale-[0.8] xl:scale-100 origin-center shrink-0">
              
              {/* SVG Curved Dashed Line */}
              <svg
                className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 280,10 Q -20,300 280,590"
                  stroke="#e13b3d"
                  strokeWidth="1.5"
                  strokeDasharray="6,6"
                  className="opacity-40"
                />
              </svg>

              {/* Items List */}
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: "absolute",
                    top: `${item.top}px`,
                    left: `${item.left}px`,
                  }}
                  className="flex items-center w-[380px] h-20 transition-all duration-300 group hover:translate-x-1"
                >
                  {/* Concentric Circle Badge */}
                  <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                    {/* Outer Dashed Ring */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#e13b3d]/30 transition-transform duration-500 group-hover:rotate-45" />
                    
                    {/* Inner Solid Circle Badge */}
                    <div className="w-14 h-14 rounded-full bg-[#e13b3d] border-4 border-white shadow-[0_0_15px_rgba(254,105,106,0.35)] flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-105">
                      <Icon icon={item.icon} className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Text Container */}
                  <div className="ml-4 flex flex-col justify-center select-none">
                    <h3 className="font-bold text-[#373f50] text-lg leading-snug mb-1 transition-colors duration-300 group-hover:text-[#e13b3d]">
                      {item.title}
                    </h3>
                    <div className="flex items-start text-sm text-gray-500 font-normal leading-relaxed">
                      {/* Red bullet indicator */}
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e13b3d] mt-2 mr-2 shrink-0" />
                      <p className="max-w-[280px]">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Stacked Layout */}
            <div className="block lg:hidden w-full space-y-8 mt-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  {/* Circle Badge (No concentric circles on mobile for simplicity) */}
                  <div className="w-12 h-12 rounded-full bg-[#e13b3d] border-2 border-white shadow-md flex items-center justify-center shrink-0">
                    <Icon icon={item.icon} className="h-5 w-5 text-white" />
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col">
                    <h3 className="font-bold text-[#373f50] text-base leading-snug mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-start text-sm text-gray-500 font-normal leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e13b3d] mt-1.5 mr-2 shrink-0" />
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
