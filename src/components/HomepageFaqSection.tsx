"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

type HomepageFaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: HomepageFaqItem[] = [
  {
    question: "Bagaimana cara memesan tali lanyard custom di Lanyard Bogor?",
    answer:
      "Anda dapat memesan langsung melalui kalkulator instan di halaman utama website kami dengan memilih spesifikasi lebar, bahan, dan aksesoris. Alternatif lainnya, Anda bisa menghubungi tim Customer Service kami via WhatsApp untuk konsultasi desain dan penawaran langsung.",
  },
  {
    question: "Berapa jumlah minimum pemesanan (MOQ)?",
    answer:
      "Kami melayani pemesanan dengan minimum order yang sangat fleksibel mulai dari 50 pcs untuk tali lanyard sublimasi full color. Jumlah harga satuan otomatis menyesuaikan dengan volume pesanan Anda (makin banyak kuantitas, harga per pcs makin murah).",
  },
  {
    question: "Berapa lama proses pengerjaan produksi lanyard?",
    answer:
      "Proses pengerjaan standar kami berkisar antara 1 hingga 3 hari kerja tergantung pada kuantitas pesanan dan antrean produksi. Kami juga menyediakan opsi pengerjaan kilat (express) untuk event darurat atau kebutuhan mendesak.",
  },
  {
    question: "Apakah saya bisa mendapatkan mockup desain sebelum naik cetak?",
    answer:
      "Ya! Kami memberikan layanan jasa desain mockup visual secara GRATIS (maksimal 3x revisi) setelah Anda mengirimkan file logo resmi beserta preferensi warna instansi Anda. Produksi cetak baru dimulai setelah Anda menyetujui mockup desain tersebut.",
  },
  {
    question: "Bagaimana sistem pembayaran di Lanyard Bogor?",
    answer:
      "Kami menerapkan sistem Down Payment (DP) sebesar 50% dari total nilai tagihan invoice sebagai tanda jadi produksi. Sisa pelunasan sebesar 50% dibayarkan secara penuh setelah pesanan selesai diproduksi dan siap dikirim ke alamat tujuan.",
  },
  {
    question: "Apakah ada garansi jika hasil cetak cacat atau rusak?",
    answer:
      "Ya, kami memberikan garansi kualitas 100%. Segala kerusakan atau cacat produksi akibat kelalaian tim kami wajib dilaporkan maksimal 3 hari setelah barang Anda terima untuk mendapatkan fasilitas klaim cetak ulang atau penggantian gratis.",
  },
];

export default function HomepageFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="homepage-faq-section homepage-deferred-section" id="faq-home">
      <div className="homepage-faq-container">
        <div className="homepage-faq-heading">
          <p>Pertanyaan Umum</p>
          <h2>Pertanyaan Umum dari Customer</h2>
        </div>

        <div className="homepage-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `homepage-faq-content-${index}`;

            return (
              <article className="homepage-faq-item" key={item.question}>
                <button
                  type="button"
                  className="homepage-faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <Icon
                    icon="lucide:chevron-down"
                    className="homepage-faq-icon"
                    aria-hidden="true"
                  />
                </button>

                <div
                  className="homepage-faq-content"
                  id={contentId}
                  data-open={isOpen}
                >
                  <div className="homepage-faq-answer">{item.answer}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
