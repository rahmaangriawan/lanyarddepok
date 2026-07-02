"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

type PaymentMethodId = "bank" | "qris" | "virtual-account";

const bankAccounts = [
  { bank: "BCA", logo: "/uploads/bank-bca-logo.svg" },
  { bank: "Mandiri", logo: "/uploads/bank-mandiri-logo.svg" },
  { bank: "BRI", logo: "/uploads/bank-bri-logo.svg" },
  { bank: "BNI", logo: "/uploads/bank-bni-logo.svg" },
];

const paymentMethods: Array<{
  id: PaymentMethodId;
  icon: string;
  title: string;
  description: string;
  providers: string[];
}> = [
  {
    id: "bank",
    icon: "lucide:landmark",
    title: "Transfer Bank",
    description: "Transfer langsung ke rekening resmi kami melalui bank pilihan Anda.",
    providers: ["BCA", "Mandiri", "BRI", "BNI"],
  },
  {
    id: "qris",
    icon: "lucide:scan-line",
    title: "QRIS / E-Wallet",
    description: "Bayar mudah menggunakan QRIS atau e-wallet favorit Anda.",
    providers: ["GoPay", "ShopeePay", "OVO", "DANA"],
  },
  {
    id: "virtual-account",
    icon: "lucide:credit-card",
    title: "Virtual Account",
    description: "Gunakan Virtual Account untuk kemudahan identifikasi pembayaran.",
    providers: ["VA BCA", "VA Mandiri", "VA BRI", "VA BNI"],
  },
];

const ewalletOptions = [
  {
    name: "GoPay",
    favicon: "/uploads/ewallet-gopay-favicon.png",
    description: "Pembayaran melalui QRIS dari aplikasi GoPay.",
  },
  {
    name: "ShopeePay",
    favicon: "/uploads/ewallet-shopeepay-icon.svg",
    description: "Pembayaran melalui QRIS dari aplikasi ShopeePay.",
  },
  {
    name: "OVO",
    favicon: "/uploads/ewallet-ovo-icon.svg",
    description: "Pembayaran melalui QRIS dari aplikasi OVO.",
  },
  {
    name: "DANA",
    favicon: "/uploads/ewallet-dana-favicon.png",
    description: "Pembayaran melalui QRIS dari aplikasi DANA.",
  },
];

function BankLogo({ bank, logo }: { bank: string; logo: string }) {
  return (
    <div className="flex h-14 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={`Logo ${bank}`}
        width={112}
        height={40}
        className="max-h-10 w-auto object-contain object-left"
        style={{ height: "auto", width: "auto" }}
      />
    </div>
  );
}

export default function PaymentMethodsPanel() {
  const [activeMethod, setActiveMethod] = useState<PaymentMethodId>("bank");
  const active = paymentMethods.find((method) => method.id === activeMethod) ?? paymentMethods[0];

  return (
    <div className="mt-14 grid gap-8 rounded-2xl border border-public-border bg-white p-6 shadow-xs lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
      <div>
        <h2 className="text-3xl font-extrabold text-[#111827]">
          Pilih Metode Pembayaran
        </h2>
        <div className="mt-7 overflow-hidden rounded-2xl border border-public-border">
          {paymentMethods.map((method) => {
            const isActive = method.id === activeMethod;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setActiveMethod(method.id)}
                aria-pressed={isActive}
                className={`flex w-full cursor-pointer items-start gap-5 p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/25 ${
                  isActive
                    ? "border-l-4 border-public-amber bg-public-soft"
                    : "border-t border-public-border bg-white hover:bg-public-soft/50"
                }`}
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-public-border bg-white text-public-amber shadow-xs">
                  <Icon icon={method.icon} className="h-8 w-8" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-extrabold text-[#111827]">
                    {method.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[#475569]">
                    {method.description}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-2">
                    {method.providers.map((provider) => (
                      <span
                        key={provider}
                        className="rounded-full border border-public-border bg-white px-3 py-1 text-xs font-bold text-[#475569]"
                      >
                        {provider}
                      </span>
                    ))}
                  </span>
                </span>
                <Icon
                  icon={isActive ? "lucide:check" : "lucide:chevron-right"}
                  className="ml-auto mt-5 h-5 w-5 shrink-0 text-public-amber"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-public-amber/30 bg-white p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-public-amber text-[#111827]">
            <Icon icon={active.icon} className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-[#111827]">
              {activeMethod === "bank" ? "Rekening Resmi" : active.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              {activeMethod === "bank" &&
                "Transfer hanya ke rekening resmi yang dikonfirmasi oleh admin kami."}
              {activeMethod === "qris" &&
                "Gunakan QRIS dari aplikasi e-wallet pilihan Anda setelah nominal pembayaran dikonfirmasi admin."}
              {activeMethod === "virtual-account" &&
                "Virtual Account dibuat sesuai bank pilihan agar pembayaran lebih mudah diidentifikasi."}
            </p>
          </div>
        </div>

        {activeMethod === "bank" && (
          <div className="mt-6 divide-y divide-public-border">
            {bankAccounts.map((account) => (
              <div key={account.bank} className="grid gap-3 py-5 sm:grid-cols-[120px_1fr]">
                <BankLogo bank={account.bank} logo={account.logo} />
                <div>
                  <p className="text-sm font-bold text-[#111827]">{account.bank}</p>
                  <p className="mt-1 text-base font-extrabold text-[#111827]">
                    Hubungi admin untuk nomor rekening resmi
                  </p>
                  <p className="mt-1 text-sm text-[#64748b]">a.n. Lanyard Bogor</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMethod === "qris" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {ewalletOptions.map((option) => (
              <div key={option.name} className="rounded-xl border border-public-border bg-public-soft p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-public-amber">
                    <Image
                      src={option.favicon}
                      alt={`Favicon ${option.name}`}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-sm object-contain"
                    />
                  </span>
                  <p className="font-extrabold text-[#111827]">{option.name}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#475569]">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeMethod === "virtual-account" && (
          <div className="mt-6 divide-y divide-public-border">
            {bankAccounts.map((account) => (
              <div key={account.bank} className="grid gap-3 py-5 sm:grid-cols-[120px_1fr]">
                <BankLogo bank={account.bank} logo={account.logo} />
                <div>
                  <p className="text-sm font-bold text-[#111827]">VA {account.bank}</p>
                  <p className="mt-1 text-base font-extrabold text-[#111827]">
                    Nomor Virtual Account dikirim setelah invoice dibuat
                  </p>
                  <p className="mt-1 text-sm text-[#64748b]">
                    Identifikasi pembayaran otomatis sesuai pesanan.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-3 rounded-xl border border-public-amber/30 bg-public-soft p-4 text-sm leading-6 text-[#475569]">
          <Icon icon="lucide:shield-alert" className="mt-0.5 h-6 w-6 shrink-0 text-public-amber" />
          <p>
            Pastikan pembayaran dilakukan hanya melalui instruksi resmi dari admin
            Lanyard Bogor.
          </p>
        </div>
      </aside>
    </div>
  );
}
