"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

export default function CaraPemesananContent() {
  return (
    <ScrollStack 
      useWindowScroll={true} 
      itemDistance={40} 
      itemScale={0.02} 
      baseScale={0.94} 
      itemStackDistance={24}
    >
      
      {/* ─── 01: Konsultasi & Spesifikasi ─── */}
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
                <Icon icon="lucide:message-circle" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Konsultasi &amp; Spesifikasi
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Hubungi tim marketing kami via WhatsApp untuk menentukan spesifikasi lengkap tali lanyard custom yang Anda butuhkan. Anda dapat memilih lebar tali (1.5cm, 2cm, atau 2.5cm), bahan tisu premium lembut, aksesoris kait stopper pengunci, dan jumlah order.
                </p>
                <ul className="flex flex-wrap gap-2 pt-2">
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Konsultasi Gratis
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Fast Response WA
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Penawaran Resmi (Quotation)
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/moq-1782195695075.webp"
                alt="Konsultasi Spesifikasi Lanyard"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
                preload
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 02: Desain Mockup Gratis ─── */}
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
                <Icon icon="lucide:pen-tool" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Desain Mockup Gratis
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Kirimkan file logo resmi perusahaan Anda (format vektor seperti CDR, AI, PDF, atau PNG beresolusi tinggi) beserta preferensi warna dasar. Tim desainer profesional kami siap membuatkan mockup visual layout tali lanyard secara gratis.
                </p>
                <ul className="flex flex-wrap gap-2 pt-2">
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Jasa Desain Profesional
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Revisi Mockup Desain
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Tanpa Biaya Tambahan
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/gratis-layanan-desain-mockup-1782194427111.webp"
                alt="Layanan Desain Mockup Gratis Lanyard"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 03: Pembayaran DP 50% & Approval ─── */}
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
                  Pembayaran DP &amp; Approval Cetak
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Setelah mockup layout visual disetujui, invoice resmi akan diterbitkan. Lakukan pembayaran uang muka (DP) sebesar 50% sebagai tanda jadi produksi. Tim kami akan segera menjadwalkan pesanan Anda masuk ke antrean mesin cetak.
                </p>
                <ul className="flex flex-wrap gap-2 pt-2">
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    DP Minimal 50%
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Pembayaran Bank Resmi
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Persetujuan Tertulis
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/sistem-pembayaran-1782195950038.webp"
                alt="Sistem Pembayaran DP Lanyard"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 04: Produksi Kilat Sublimasi ─── */}
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
                <Icon icon="lucide:zap" className="w-6 h-6 text-brand-red" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#373f50] leading-tight">
                  Produksi Kilat 1–3 Hari Kerja
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Lanyard Anda akan diproduksi menggunakan mesin cetak sublimasi digital premium dengan tinta berkualitas tinggi untuk menghasilkan detail warna tajam, presisi, dan tahan luntur. Proses pengerjaan 1–3 hari kerja setelah desain disepakati.
                </p>
                <ul className="flex flex-wrap gap-2 pt-2">
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Cetak Sublimasi Modern
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Estimasi 1-3 Hari Kerja
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Kontrol Mutu (QC) Ketat
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/persetujuan-mockup-1782195889939.webp"
                alt="Proses Produksi Lanyard"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>

      {/* ─── 05: Pelunasan & Pengiriman ─── */}
      <ScrollStackItem>
        <div className="flex flex-col space-y-4">
          {/* Badge Number */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F0] text-brand-red text-xs font-extrabold select-none">
            05
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
                  Pelunasan &amp; Pengiriman Aman
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
                  Setelah produksi selesai dan lolos inspeksi QC, kami akan mengirimkan foto/video dokumentasi produk jadi. Anda melakukan pelunasan sisa 50% tagihan, lalu barang akan kami kemas rapi menggunakan bubble wrap dan kardus tebal untuk dikirim ke ekspedisi.
                </p>
                <ul className="flex flex-wrap gap-2 pt-2">
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Garansi Kualitas 100%
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Ekspedisi Terpercaya
                  </li>
                  <li className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-[#FAFAFA] border border-gray-100 rounded-full px-3 py-1">
                    <Icon icon="lucide:check" className="h-3.5 w-3.5 text-brand-red" />
                    Packing Aman Rapi
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right Image Area */}
            <div className="w-full md:w-[220px] lg:w-[260px] h-[160px] md:h-[180px] relative shrink-0 rounded-2xl overflow-hidden shadow-xs">
              <Image
                src="/uploads/pengiriman-dan-garansi-1782196021934.webp"
                alt="Pengiriman dan Garansi Kualitas"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollStackItem>
      
    </ScrollStack>
  );
}
