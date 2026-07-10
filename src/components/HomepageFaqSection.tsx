"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type HomepageFaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: HomepageFaqItem[] = [
  {
    question: "Bagaimana cara pesan lanyard custom di Lanyard Depok?",
    answer:
      "Kirim kebutuhan Anda melalui WhatsApp, mulai dari jumlah, bahan, ukuran, warna, dan logo. Tim kami akan bantu rekomendasi spesifikasi, membuat estimasi harga, lalu menyiapkan mockup sebelum produksi.",
  },
  {
    question: "Berapa minimum order lanyard custom?",
    answer:
      "Minimum order fleksibel mulai dari 50 pcs untuk kebutuhan event, kantor, sekolah, komunitas, dan instansi. Untuk jumlah lebih besar, harga satuan bisa lebih hemat.",
  },
  {
    question: "Berapa lama proses produksi lanyard?",
    answer:
      "Estimasi produksi umumnya 1 sampai 3 hari kerja setelah desain disetujui, bergantung pada jumlah pesanan dan antrean produksi. Kebutuhan mendesak bisa dikonsultasikan lebih dulu.",
  },
  {
    question: "Apakah desain atau mockup bisa dibantu?",
    answer:
      "Bisa. Anda cukup mengirim logo, warna brand, dan referensi desain. Tim kami bantu membuat mockup agar tampilan lanyard lebih jelas sebelum naik cetak.",
  },
  {
    question: "Bagaimana sistem pembayarannya?",
    answer:
      "Pemesanan diproses setelah pembayaran tanda jadi sesuai invoice. Pelunasan dilakukan sebelum pesanan dikirim atau mengikuti kesepakatan untuk kebutuhan instansi.",
  },
  {
    question: "Apakah ada garansi jika hasil cetak bermasalah?",
    answer:
      "Ada. Jika ditemukan cacat produksi dari sisi kami, segera laporkan maksimal 3 hari setelah barang diterima agar tim kami bisa membantu pengecekan dan solusi terbaik.",
  },
  {
    question: "Apakah bisa kirim ke area Depok dan luar kota?",
    answer:
      "Bisa. Pesanan dapat dikirim ke area Depok, Jabodetabek, dan kota lain di Indonesia. Opsi pengiriman akan disesuaikan dengan jumlah pesanan, alamat tujuan, dan kebutuhan waktu Anda.",
  },
];

export default function HomepageFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-b border-border bg-[#fff] px-4 py-20 text-foreground sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12">
        <div className="flex min-w-0 flex-col">
          <div>
            <p className="text-xs font-extrabold uppercase leading-5 tracking-normal text-primary">
              Pertanyaan Umum
            </p>
            <h2 className="mt-6 max-w-xl text-[2rem] font-extrabold leading-[1.08] tracking-normal text-foreground sm:text-[2.4rem] lg:text-[2.75rem]">
              Hal yang sering ditanyakan sebelum pesan lanyard custom.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
              Jawaban singkat seputar proses pemesanan, produksi, desain,
              pembayaran, dan garansi.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/3] min-h-[15rem]">
              <Image
                src="/uploads/pengiriman-packaging-lanyarddepok.webp"
                alt="Pengemasan dan pengiriman lanyard custom Lanyard Depok"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 38vw, 100vw"
                loading="eager"
                quality={60}
              />
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `homepage-faq-content-${index}`;

            return (
              <article
                className="overflow-hidden rounded-2xl border border-border bg-card"
                key={item.question}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-5 p-5 text-left sm:p-6"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-base font-extrabold leading-snug tracking-normal text-foreground sm:text-lg">
                    {item.question}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                <div
                  id={contentId}
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-border px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
