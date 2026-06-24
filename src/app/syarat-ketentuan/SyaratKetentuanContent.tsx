"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

export default function SyaratKetentuanContent() {
  return (
    <ScrollStack 
      useWindowScroll={true} 
      itemDistance={40} 
      itemScale={0.02} 
      baseScale={0.94} 
      itemStackDistance={24}
    >
      
      {/* ─── 01: Jumlah Minimum Pemesanan (MOQ) ─── */}
      <ScrollStackItem>
        <div className="flex flex-col space-y-4">
          {/* Badge Number */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F0] text-brand-red text-xs font-extrabold select-none">
            01
          </div>
          
          {/* Card Layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            {/* Left Content Area (Icon + Text) */}
            <div className="flex items-start space-x-5 flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] border border-red-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:boxes" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Jumlah Minimum Pemesanan (MOQ)
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Kami melayani pemesanan tali lanyard custom dengan ketentuan minimum order yang fleksibel. Jumlah harga satuan yang tertera pada sistem kalkulator akan secara otomatis menyesuaikan dengan volume pesanan Anda (makin banyak kuantitas, harga per pcs akan semakin murah).
                </p>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/moq-1782195695075.webp"
                alt="Jumlah Minimum Pemesanan MOQ Lanyard Jakarta"
                fill
                sizes="(max-w-768px) 100vw, 300px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 02: Persetujuan Mockup Desain (Approval) ─── */}
      <ScrollStackItem>
        <div className="flex flex-col space-y-4">
          {/* Badge Number */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F0] text-brand-red text-xs font-extrabold select-none">
            02
          </div>
          
          {/* Card Layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            {/* Left Content Area (Icon + Text) */}
            <div className="flex items-start space-x-5 flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] border border-red-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:edit-3" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Persetujuan Mockup Desain (Approval)
                </h3>
                <ul className="space-y-2.5 text-sm sm:text-base text-gray-500 font-normal leading-relaxed list-disc pl-5">
                  <li>
                    Proses cetak baru akan dimulai setelah pelanggan menyetujui mockup desain visual (layout gambar) yang dikirimkan oleh tim desainer kami via WhatsApp atau email.
                  </li>
                  <li>
                    Kami tidak bertanggung jawab atas kesalahan ejaan kata, penulisan nama, tata letak logo, atau spesifikasi aksesoris setelah pelanggan memberikan konfirmasi persetujuan cetak (mockup approved).
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/persetujuan-mockup-1782195889939.webp"
                alt="Persetujuan Mockup Desain Approval Lanyard Jakarta"
                fill
                sizes="(max-w-768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 03: Sistem Pembayaran ─── */}
      <ScrollStackItem>
        <div className="flex flex-col space-y-4">
          {/* Badge Number */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F0] text-brand-red text-xs font-extrabold select-none">
            03
          </div>
          
          {/* Card Layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            {/* Left Content Area (Icon + Text) */}
            <div className="flex items-start space-x-5 flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] border border-red-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:credit-card" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Sistem Pembayaran
                </h3>
                <ul className="space-y-2.5 text-sm sm:text-base text-gray-500 font-normal leading-relaxed list-disc pl-5">
                  <li>
                    Pemesanan wajib disertai dengan pembayaran Down Payment (DP) minimal sebesar 50% dari total nilai tagihan invoice sebagai tanda jadi produksi.
                  </li>
                  <li>
                    Sisa pelunasan (50%) wajib dibayarkan secara penuh setelah barang dinyatakan selesai diproduksi dan siap dikirim ke alamat tujuan.
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/sistem-pembayaran-1782195950038.webp"
                alt="Sistem Pembayaran DP Lanyard Jakarta"
                fill
                sizes="(max-w-768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 04: Pengiriman & Garansi Kualitas ─── */}
      <ScrollStackItem>
        <div className="flex flex-col space-y-4">
          {/* Badge Number */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F0] text-brand-red text-xs font-extrabold select-none">
            04
          </div>
          
          {/* Card Layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            {/* Left Content Area (Icon + Text) */}
            <div className="flex items-start space-x-5 flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] border border-red-100 flex items-center justify-center shrink-0">
                <Icon icon="lucide:truck" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Pengiriman &amp; Garansi Kualitas
                </h3>
                <ul className="space-y-2.5 text-sm sm:text-base text-gray-500 font-normal leading-relaxed list-disc pl-5">
                  <li>
                    Kami mengirimkan pesanan menggunakan ekspedisi terpercaya (JNE, J&amp;T, Sicepat, Lalamove, GoSend, dsb.).
                  </li>
                  <li>
                    Segala kerusakan atau cacat produksi akibat kelalaian tim kami wajib dilaporkan maksimal 3 hari sejak barang diterima untuk mendapatkan fasilitas klaim penggantian atau perbaikan gratis.
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/pengiriman-dan-garansi-1782196021934.webp"
                alt="Pengiriman dan Garansi Kualitas Lanyard Jakarta"
                fill
                sizes="(max-w-768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>
      
    </ScrollStack>
  );
}
