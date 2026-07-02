"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

type ShippingOptionId = "regular" | "express" | "cargo";

const shippingOptions: Array<{
  id: ShippingOptionId;
  icon: string;
  title: string;
  description: string;
  estimate: string;
}> = [
  {
    id: "regular",
    icon: "lucide:truck",
    title: "Regular",
    description: "Opsi standar dengan tarif ekonomis untuk pengiriman aman.",
    estimate: "Estimasi 2-4 hari",
  },
  {
    id: "express",
    icon: "lucide:send",
    title: "Express",
    description: "Pengiriman lebih cepat untuk pesanan yang butuh segera.",
    estimate: "Estimasi 1-2 hari",
  },
  {
    id: "cargo",
    icon: "lucide:package-open",
    title: "Cargo / Jumlah Besar",
    description: "Solusi khusus untuk pengiriman dalam jumlah besar atau luar pulau.",
    estimate: "Estimasi 3-7 hari",
  },
];

const optionDetails: Record<
  ShippingOptionId,
  {
    title: string;
    summary: string;
    details: Array<{ icon: string; title: string; description: string }>;
  }
> = {
  regular: {
    title: "Estimasi & Cakupan Regular",
    summary: "Cocok untuk pesanan harian dengan biaya pengiriman yang efisien.",
    details: [
      { icon: "lucide:clock-3", title: "Estimasi Waktu", description: "2-4 hari kerja tergantung kota tujuan dan ekspedisi." },
      { icon: "lucide:map", title: "Cakupan Pengiriman", description: "Menjangkau kota besar dan area reguler di seluruh Indonesia." },
      { icon: "lucide:scan-line", title: "Tracking Resi", description: "Nomor resi diberikan agar status paket bisa dipantau." },
      { icon: "lucide:shield-check", title: "Aman & Terpercaya", description: "Paket dikemas rapi sebelum diserahkan ke ekspedisi." },
    ],
  },
  express: {
    title: "Estimasi & Cakupan Express",
    summary: "Dipilih untuk kebutuhan mendesak setelah produksi selesai dan pelunasan terkonfirmasi.",
    details: [
      { icon: "lucide:clock-3", title: "Estimasi Waktu", description: "1-2 hari kerja untuk area yang mendukung layanan cepat." },
      { icon: "lucide:map", title: "Cakupan Pengiriman", description: "Tersedia untuk kota dan rute tertentu sesuai ekspedisi." },
      { icon: "lucide:scan-line", title: "Tracking Real-time", description: "Nomor resi dikirim agar perjalanan paket dapat dipantau." },
      { icon: "lucide:shield-check", title: "Prioritas Aman", description: "Packing dicek sebelum dispatch agar paket siap dikirim cepat." },
    ],
  },
  cargo: {
    title: "Estimasi & Cakupan Cargo",
    summary: "Untuk pesanan volume besar, pengiriman luar pulau, atau paket berdimensi besar.",
    details: [
      { icon: "lucide:clock-3", title: "Estimasi Waktu", description: "3-7 hari kerja tergantung volume, rute, dan armada cargo." },
      { icon: "lucide:map", title: "Cakupan Pengiriman", description: "Mendukung pengiriman antarkota dan antarpulau." },
      { icon: "lucide:scan-line", title: "Tracking Cargo", description: "Nomor surat jalan atau resi cargo diberikan setelah dispatch." },
      { icon: "lucide:shield-check", title: "Proteksi Paket", description: "Packing disesuaikan dengan jumlah dan karakter paket." },
    ],
  },
};

export default function ShippingOptionsPanel() {
  const [activeOption, setActiveOption] = useState<ShippingOptionId>("regular");
  const activeDetail = optionDetails[activeOption];

  return (
    <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-public-border bg-white p-6 shadow-xs lg:p-8">
        <h2 className="text-2xl font-extrabold text-[#111827]">
          Pilihan Pengiriman
        </h2>
        <div className="mt-6 space-y-3">
          {shippingOptions.map((option) => {
            const isActive = option.id === activeOption;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveOption(option.id)}
                aria-pressed={isActive}
                className={`flex w-full cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/25 ${
                  isActive
                    ? "border-public-amber bg-public-soft"
                    : "border-public-border bg-white hover:bg-public-soft/50"
                }`}
              >
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-public-amber">
                  <Icon icon={option.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-[#111827]">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[#475569]">
                    {option.description}
                  </span>
                  <span className="mt-3 inline-flex rounded-full border border-public-border bg-white px-3 py-1 text-xs font-bold text-[#475569]">
                    {option.estimate}
                  </span>
                </span>
                <Icon
                  icon={isActive ? "lucide:check" : "lucide:chevron-right"}
                  className="mt-3 h-5 w-5 shrink-0 text-public-amber"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#64748b]">
          <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-public-amber" />
          Estimasi dapat berbeda tergantung kota tujuan, volume paket, dan kebijakan ekspedisi.
        </p>
      </div>

      <aside className="rounded-2xl border border-public-border bg-white p-6 shadow-xs lg:p-8">
        <h2 className="text-2xl font-extrabold text-[#111827]">
          {activeDetail.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#475569]">
          {activeDetail.summary}
        </p>
        <div className="mt-6 grid gap-3">
          {activeDetail.details.map((detail) => (
            <div key={detail.title} className="rounded-xl border border-public-border bg-white p-4">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-public-soft text-public-amber">
                  <Icon icon={detail.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#111827]">
                    {detail.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#475569]">
                    {detail.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
