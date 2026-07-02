"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
};

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "pemesanan",
    label: "Pemesanan",
    icon: "lucide:message-square",
    items: [
      {
        question: "Berapa minimal pemesanan lanyard custom?",
        answer:
          "Minimal pemesanan di Lanyard Bogor adalah 50 pcs untuk semua jenis lanyard custom. Namun, kami tetap melayani pemesanan dalam jumlah kecil dengan harga yang menyesuaikan.",
      },
      {
        question: "Bagaimana cara order lanyard di Lanyard Bogor?",
        answer:
          "Anda dapat menghubungi tim kami melalui WhatsApp, menyampaikan kebutuhan produk, mengirimkan logo atau referensi desain, lalu kami bantu siapkan penawaran dan mockup sebelum produksi.",
      },
      {
        question: "Apakah bisa pesan untuk event mendadak?",
        answer:
          "Bisa dikonsultasikan. Kami akan mengecek antrean produksi, jumlah pesanan, dan spesifikasi terlebih dahulu sebelum memberi estimasi waktu express.",
      },
      {
        question: "Apakah bisa request aksesoris khusus?",
        answer:
          "Bisa. Kami menyediakan beberapa pilihan kait, stopper, safety breakaway, buckle, card holder, dan aksesoris lain sesuai kebutuhan pemakaian.",
      },
    ],
  },
  {
    id: "desain-produksi",
    label: "Desain & Produksi",
    icon: "lucide:scissors",
    items: [
      {
        question: "Apakah bisa pesan lanyard dengan desain sendiri?",
        answer:
          "Bisa. Anda dapat mengirimkan file desain, logo, atau referensi warna. Tim kami akan membantu menyesuaikannya ke layout produksi yang tepat.",
      },
      {
        question: "Apakah ada biaya desain?",
        answer:
          "Kami menyediakan bantuan mockup desain gratis maksimal 3x revisi untuk membantu memastikan tampilan lanyard sesuai sebelum naik produksi.",
      },
      {
        question: "Apakah bisa request warna khusus?",
        answer:
          "Bisa. Warna dapat disesuaikan dengan identitas brand, file logo, atau kode warna yang Anda miliki. Hasil akhir tetap mengikuti karakter material dan metode cetak.",
      },
      {
        question: "Berapa lama proses produksi lanyard?",
        answer:
          "Proses standar berkisar 1 hingga 3 hari kerja tergantung kuantitas, spesifikasi, approval desain, dan antrean produksi saat pemesanan.",
      },
    ],
  },
  {
    id: "pembayaran",
    label: "Pembayaran",
    icon: "lucide:wallet-cards",
    items: [
      {
        question: "Bagaimana sistem pembayaran di Lanyard Bogor?",
        answer:
          "Sistem pembayaran menggunakan DP 50% sebagai tanda jadi produksi, lalu pelunasan 50% setelah pesanan selesai dan siap dikirim.",
      },
      {
        question: "Apakah bisa mendapatkan invoice resmi?",
        answer:
          "Bisa. Kami dapat menyiapkan invoice sesuai detail pesanan, nama pemesan, dan kebutuhan administrasi perusahaan atau instansi.",
      },
      {
        question: "Apakah harga sudah termasuk desain?",
        answer:
          "Untuk pesanan lanyard custom, bantuan mockup desain sudah termasuk dalam layanan selama masih dalam batas revisi yang wajar.",
      },
    ],
  },
  {
    id: "pengiriman",
    label: "Pengiriman",
    icon: "lucide:truck",
    items: [
      {
        question: "Apakah pesanan bisa dikirim ke luar Bogor?",
        answer:
          "Bisa. Kami melayani pengiriman ke berbagai kota di Indonesia melalui jasa ekspedisi yang disesuaikan dengan alamat tujuan.",
      },
      {
        question: "Kapan pesanan dikirim?",
        answer:
          "Pesanan dikirim setelah produksi selesai, quality control dilakukan, dan pelunasan telah dikonfirmasi oleh tim kami.",
      },
      {
        question: "Apakah tersedia pengiriman instan?",
        answer:
          "Untuk area tertentu, pengiriman instan dapat dikonsultasikan dengan admin. Ketersediaannya bergantung pada lokasi dan waktu pesanan selesai.",
      },
    ],
  },
  {
    id: "produk-bahan",
    label: "Produk & Bahan",
    icon: "lucide:medal",
    items: [
      {
        question: "Bahan lanyard apa saja yang tersedia?",
        answer:
          "Pilihan umum meliputi polyester, tisu, nylon, dan bahan lain sesuai kebutuhan. Tim kami dapat membantu merekomendasikan bahan berdasarkan pemakaian dan budget.",
      },
      {
        question: "Apakah hasil cetak full color?",
        answer:
          "Ya, untuk tipe sublimasi digital, desain dapat dicetak full color dengan hasil tajam dan cocok untuk logo atau pattern brand.",
      },
      {
        question: "Apakah tersedia paket dengan ID card holder?",
        answer:
          "Tersedia. Anda dapat memesan paket lanyard dengan card holder, casing, atau aksesoris tambahan agar siap digunakan.",
      },
    ],
  },
  {
    id: "lainnya",
    label: "Lainnya",
    icon: "lucide:ellipsis",
    items: [
      {
        question: "Apakah ada garansi untuk produk?",
        answer:
          "Ada. Jika terjadi cacat produksi dari pihak kami, laporan maksimal 3 hari setelah barang diterima akan kami bantu proses klaim sesuai ketentuan.",
      },
      {
        question: "Apakah bisa konsultasi dulu sebelum order?",
        answer:
          "Tentu. Tim kami siap membantu menjelaskan pilihan bahan, ukuran, finishing, aksesoris, dan estimasi harga sebelum Anda memutuskan pemesanan.",
      },
      {
        question: "Apakah promo bisa berubah?",
        answer:
          "Promo dapat berubah sewaktu-waktu mengikuti periode program dan ketersediaan produksi. Silakan hubungi admin untuk konfirmasi promo aktif.",
      },
    ],
  },
];

const TOP_CATEGORY_IDS = [
  "pemesanan",
  "desain-produksi",
  "pembayaran",
  "pengiriman",
  "lainnya",
];

export default function FaqContent() {
  const [activeCategoryId, setActiveCategoryId] = useState("pemesanan");
  const [openIndex, setOpenIndex] = useState(0);

  const activeCategory = useMemo(
    () =>
      FAQ_CATEGORIES.find((category) => category.id === activeCategoryId) ||
      FAQ_CATEGORIES[0],
    [activeCategoryId],
  );

  const topCategories = useMemo(
    () =>
      TOP_CATEGORY_IDS.map((id) =>
        FAQ_CATEGORIES.find((category) => category.id === id),
      ).filter(Boolean) as FaqCategory[],
    [],
  );

  const selectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setOpenIndex(0);
  };

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold leading-tight text-[#111827] sm:text-3xl">
            Pilih Topik yang Ingin Anda Ketahui
          </h2>
          <div className="mx-auto mt-4 h-0.5 w-10 rounded-full bg-public-amber" />
        </div>

        <div className="mt-8 overflow-x-auto pb-2">
          <div className="mx-auto flex w-max min-w-full justify-start gap-3 sm:justify-center">
            {topCategories.map((category) => {
              const isActive = category.id === activeCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={`inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-3 rounded-full border px-5 text-sm font-extrabold shadow-none transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20 ${
                    isActive
                      ? "border-public-amber bg-white text-public-amber"
                      : "border-public-border bg-white text-[#111827] hover:border-public-amber hover:text-public-amber-strong"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon icon={category.icon} className="h-5 w-5" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-[24px] border border-public-border bg-public-soft p-7">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-public-amber/30 bg-white text-public-amber">
                <Icon icon="lucide:messages-square" className="h-11 w-11" />
              </div>
              <h3 className="mt-7 text-xl font-extrabold text-[#111827]">
                Kategori FAQ
              </h3>
              <div className="mt-6 space-y-2">
                {FAQ_CATEGORIES.map((category) => {
                  const isActive = category.id === activeCategoryId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => selectCategory(category.id)}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20 ${
                        isActive
                          ? "bg-white text-public-amber shadow-xs"
                          : "text-[#334155] hover:bg-white hover:text-public-amber-strong"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`h-5 w-1 rounded-full ${
                          isActive ? "bg-public-amber" : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />
                      <Icon icon={category.icon} className="h-5 w-5 shrink-0" />
                      {category.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[22px] bg-white/70 p-5">
                <p className="text-sm font-extrabold text-[#111827]">
                  Masih punya pertanyaan?
                </p>
                <p className="mt-2 text-xs leading-5 text-[#64748b]">
                  Tim kami siap membantu Anda.
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {activeCategory.items.map((faq, index) => {
              const isOpen = openIndex === index;
              const contentId = `faq-${activeCategory.id}-${index}`;
              return (
                <article
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-public-border bg-white shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className={`flex min-h-16 w-full cursor-pointer items-center justify-between gap-5 px-5 py-4 text-left transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20 sm:px-7 ${
                      isOpen ? "text-public-amber" : "text-[#111827]"
                    }`}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                  >
                    <span className="text-sm font-extrabold leading-snug sm:text-base">
                      {faq.question}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`h-5 w-5 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={contentId}
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-72" : "max-h-0"
                    }`}
                  >
                    <div className="border-t border-public-border/70 px-5 pb-6 pt-4 text-sm leading-7 text-[#475569] sm:px-7">
                      {faq.answer}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-[24px] border border-public-border bg-public-soft p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#111827]">
              Masih Butuh Bantuan?
            </h2>
            <p className="mt-2 text-sm text-[#64748b]">
              Jangan ragu untuk menghubungi kami melalui channel berikut.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <a
              href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20bertanya%20mengenai%20pemesanan%20lanyard."
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-24 items-center gap-4 rounded-2xl border border-public-border bg-white p-5 transition-colors hover:border-public-amber focus:outline-none focus:ring-4 focus:ring-public-amber/20"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white">
                <Icon icon="logos:whatsapp-icon" className="h-8 w-8" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-[#111827]">
                  WhatsApp
                </span>
                <span className="mt-1 block text-sm text-[#64748b]">
                  0822-1020-0700
                </span>
                <span className="mt-1 block text-xs font-bold text-[#16a34a]">
                  Fast response
                </span>
              </span>
            </a>

            <a
              href="mailto:info@lanyardbogor.com"
              className="flex min-h-24 items-center gap-4 rounded-2xl border border-public-border bg-white p-5 transition-colors hover:border-public-amber focus:outline-none focus:ring-4 focus:ring-public-amber/20"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-public-amber/30 text-public-amber">
                <Icon icon="lucide:mail" className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-[#111827]">
                  Email
                </span>
                <span className="mt-1 block text-sm text-[#64748b]">
                  info@lanyardbogor.com
                </span>
                <span className="mt-1 block text-xs text-[#64748b]">
                  Kami siap membantu
                </span>
              </span>
            </a>

            <div className="flex min-h-24 items-center gap-4 rounded-2xl border border-public-border bg-white p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-public-amber/30 text-public-amber">
                <Icon icon="lucide:clock-3" className="h-7 w-7" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-[#111827]">
                  Jam Operasional
                </span>
                <span className="mt-1 block text-sm text-[#64748b]">
                  Senin - Sabtu
                </span>
                <span className="mt-1 block text-xs text-[#64748b]">
                  09.00 - 17.00 WIB
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
