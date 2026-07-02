"use client";

import { Icon } from "@iconify/react";

const terms = [
  {
    number: "01",
    icon: "lucide:package",
    title: "Minimum Order Quantity (MOQ)",
    description:
      "Jumlah pemesanan minimum menyesuaikan jenis produk. Informasi MOQ tercantum di setiap halaman produk atau dapat ditanyakan ke tim kami.",
  },
  {
    number: "02",
    icon: "lucide:file-check-2",
    title: "Desain & Approval",
    description:
      "Desain akan dikirimkan untuk approval sebelum produksi. Setelah desain disetujui, segala bentuk kesalahan pada desain bukan menjadi tanggung jawab kami.",
  },
  {
    number: "03",
    icon: "lucide:wallet",
    title: "Pembayaran",
    items: [
      "Pembayaran dilakukan dengan sistem DP (Uang Muka) untuk memulai proses produksi.",
      "Pelunasan dilakukan sebelum pesanan dikirim.",
      "Pembayaran dapat melalui transfer bank atau metode lain yang disepakati.",
    ],
  },
  {
    number: "04",
    icon: "lucide:calendar-days",
    title: "Waktu Produksi",
    description:
      "Waktu produksi terhitung setelah desain disetujui dan pembayaran DP diterima. Estimasi waktu produksi dapat berbeda sesuai jumlah dan jenis pesanan.",
  },
  {
    number: "05",
    icon: "lucide:palette",
    title: "Warna",
    description:
      "Warna hasil cetak dapat berbeda +-10% dari tampilan layar karena perbedaan setting monitor dan proses cetak.",
  },
  {
    number: "06",
    icon: "lucide:package-check",
    title: "Pengiriman",
    description:
      "Pengiriman dilakukan setelah pelunasan. Risiko kerusakan atau kehilangan selama pengiriman menjadi tanggung jawab ekspedisi.",
  },
  {
    number: "07",
    icon: "lucide:refresh-cw",
    title: "Retur & Komplain",
    description:
      "Komplain hanya berlaku jika ada kesalahan dari pihak kami dan wajib disertai bukti foto/video saat barang diterima. Komplain diterima maksimal 2x24 jam setelah barang tiba.",
  },
  {
    number: "08",
    icon: "lucide:percent",
    title: "Pembatalan Pesanan",
    description:
      "Pembatalan hanya dapat dilakukan sebelum produksi dimulai. DP yang sudah dibayarkan tidak dapat dikembalikan jika pesanan dibatalkan sepihak oleh customer.",
  },
];

const importantNotes = [
  "Pastikan semua data, logo, dan ejaan yang dikirimkan sudah benar.",
  "Kami tidak bertanggung jawab atas kesalahan penulisan yang dikirimkan oleh customer.",
  "Dengan melakukan pemesanan, Anda telah menyetujui seluruh syarat dan ketentuan di atas.",
];

export default function SyaratKetentuanContent() {
  return (
    <section className="bg-white px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="relative inline-flex text-2xl font-extrabold tracking-normal text-[#111827] sm:text-3xl">
            Ketentuan Pemesanan
            <span className="absolute -bottom-4 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-public-amber" />
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {terms.map((term) => (
            <article
              key={term.number}
              className="relative flex gap-5 rounded-[18px] border border-public-border bg-white p-5 shadow-xs transition-colors hover:border-public-amber/35 sm:p-6"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-public-amber/10 text-public-amber-strong">
                <Icon icon={term.icon} className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-public-amber px-1.5 text-[10px] font-extrabold leading-none text-white">
                    {term.number}
                  </span>
                  <h3 className="text-sm font-extrabold leading-6 text-[#111827] sm:text-base">
                    {term.title}
                  </h3>
                </div>
                {term.items ? (
                  <ul className="mt-3 space-y-1.5 text-sm leading-6 text-[#64748b]">
                    {term.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-public-amber" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[#64748b]">{term.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="relative mt-7 overflow-hidden rounded-[18px] border border-public-amber/20 bg-gradient-to-br from-public-amber/8 via-white to-public-amber/5 p-6 sm:p-8">
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-public-amber-strong shadow-xs">
                <Icon icon="lucide:info" className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-base font-extrabold text-[#111827]">Catatan Penting</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[#64748b]">
              {importantNotes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-public-amber" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
          <Icon
            icon="lucide:clipboard-check"
            className="absolute -right-2 bottom-2 hidden h-36 w-36 text-public-amber/20 md:block"
          />
        </div>
      </div>
    </section>
  );
}
