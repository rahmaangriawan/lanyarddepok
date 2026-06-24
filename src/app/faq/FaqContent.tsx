"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Bagaimana cara memesan tali lanyard custom di Lanyard Jakarta?",
    answer: "Anda dapat memesan langsung melalui kalkulator instan di halaman utama website kami dengan memilih spesifikasi lebar, bahan, dan aksesoris. Alternatif lainnya, Anda bisa menghubungi tim Customer Service kami via WhatsApp untuk konsultasi desain dan penawaran langsung.",
  },
  {
    question: "Berapa jumlah minimum pemesanan (MOQ)?",
    answer: "Kami melayani pemesanan dengan minimum order yang sangat fleksibel mulai dari 50 pcs untuk tali lanyard sublimasi full color. Jumlah harga satuan otomatis menyesuaikan dengan volume pesanan Anda (makin banyak kuantitas, harga per pcs makin murah).",
  },
  {
    question: "Berapa lama proses pengerjaan produksi lanyard?",
    answer: "Proses pengerjaan standar kami berkisar antara 1 hingga 3 hari kerja tergantung pada kuantitas pesanan dan antrean produksi. Kami juga menyediakan opsi pengerjaan kilat (express) untuk event darurat atau kebutuhan mendesak.",
  },
  {
    question: "Apakah saya bisa mendapatkan mockup desain sebelum naik cetak?",
    answer: "Ya! Kami memberikan layanan jasa desain mockup visual secara GRATIS (maksimal 3x revisi) setelah Anda mengirimkan file logo resmi beserta preferensi warna instansi Anda. Produksi cetak baru dimulai setelah Anda menyetujui mockup desain tersebut.",
  },
  {
    question: "Bagaimana sistem pembayaran di Lanyard Jakarta?",
    answer: "Kami menerapkan sistem Down Payment (DP) sebesar 50% dari total nilai tagihan invoice sebagai tanda jadi produksi. Sisa pelunasan sebesar 50% dibayarkan secara penuh setelah pesanan selesai diproduksi dan siap dikirim ke alamat tujuan.",
  },
  {
    question: "Apakah ada garansi jika hasil cetak cacat atau rusak?",
    answer: "Ya, kami memberikan garansi kualitas 100%. Segala kerusakan atau cacat produksi akibat kelalaian tim kami wajib dilaporkan maksimal 3 hari setelah barang Anda terima untuk mendapatkan fasilitas klaim cetak ulang atau penggantian gratis.",
  }
];

export default function FaqContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xs hover:shadow-xs"
          >
            <button
              onClick={() => toggleFaq(i)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-[#373f50] hover:text-brand-red transition-colors duration-200 focus:outline-none"
            >
              <span className="text-base pr-4 leading-snug">{faq.question}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 shrink-0 text-[#373f50] transition-transform duration-300 ${isOpen ? "rotate-180 bg-red-50 text-brand-red border-red-100" : ""}`}>
                <Icon icon="lucide:chevron-down" className="w-4 h-4" />
              </div>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[500px] border-t border-gray-50" : "max-h-0"
              }`}
            >
              <div className="p-5 text-sm sm:text-base text-gray-500 font-normal leading-relaxed bg-[#FCFCFC]">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
