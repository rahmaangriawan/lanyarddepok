"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
export default function LanyardCalculator() {
  const [lanyardWidth, setLanyardWidth] = useState("2.0cm");
  const [printingType, setPrintingType] = useState("Full-color Sublimation");
  const [attachment, setAttachment] = useState("Hook & Buckle");
  const [quantity, setQuantity] = useState(100);
  const [notes, setNotes] = useState("");
  
  const [unitPrice, setUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

  // Check session status
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setIsLoggedIn(!!data.user);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  // Calculate prices dynamically
  useEffect(() => {
    // Base unit price by printing type
    let basePrice = printingType === "Full-color Sublimation" ? 12000 : 8000;

    // Additional cost by attachment
    let attachmentCost = 0;
    if (attachment === "Hook & Buckle") attachmentCost = 1500;
    if (attachment === "Hook & Card Holder") attachmentCost = 2500;

    // Multiplier by width
    let widthMultiplier = 1.0;
    if (lanyardWidth === "1.5cm") widthMultiplier = 0.9;
    if (lanyardWidth === "2.5cm") widthMultiplier = 1.2;

    // Unit price before discount
    const initialUnit = Math.round((basePrice + attachmentCost) * widthMultiplier);

    // Quantity discounts
    let discount = 0;
    if (quantity >= 50 && quantity < 100) discount = 0;
    else if (quantity >= 100 && quantity < 300) discount = 0.10; // 10%
    else if (quantity >= 300 && quantity < 500) discount = 0.18; // 18%
    else if (quantity >= 500 && quantity < 1000) discount = 0.25; // 25%
    else if (quantity >= 1000) discount = 0.35; // 35%

    setDiscountPercent(discount * 100);

    const finalUnit = Math.round(initialUnit * (1 - discount));
    setUnitPrice(finalUnit);
    setTotalPrice(finalUnit * quantity);
  }, [lanyardWidth, printingType, attachment, quantity]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Anda harus masuk (login) terlebih dahulu untuk mengirim pesanan.");
      return;
    }

    if (quantity < 50) {
      setError("Jumlah pemesanan minimum (MOQ) adalah 50 pcs.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lanyardWidth,
          printingType,
          attachment,
          quantity,
          totalPrice,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan");
      }

      setSuccess(true);
      setNotes("");
      router.refresh();
      // Auto redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/kawruh");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div id="calculator" className="bg-[#f3f5f9] py-16 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="bg-red-150 text-brand-red text-xs font-semibold px-3 py-1.5 rounded-full">
            Kalkulator Harga Instan
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
            Hitung Anggaran & Pesan Lanyard Anda
          </h2>
          <p className="text-sm font-medium text-gray-500 max-w-xl mx-auto mt-2">
            Pilih spesifikasi lanyard kustom Anda dan lihat kalkulasi harga secara transparan sesuai jumlah pesanan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Selector */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lanyard Width */}
                <div>
                  <label htmlFor="lanyardWidth" className="block mb-2 text-sm font-bold text-gray-700">
                    Lebar Tali Lanyard
                  </label>
                  <select
                    id="lanyardWidth"
                    value={lanyardWidth}
                    onChange={(e) => setLanyardWidth(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  >
                    <option value="1.5cm">1.5 cm (Hemat)</option>
                    <option value="2.0cm">2.0 cm (Standard Populer)</option>
                    <option value="2.5cm">2.5 cm (Lebar/Eksklusif)</option>
                  </select>
                </div>

                {/* Printing Type */}
                <div>
                  <label htmlFor="printingType" className="block mb-2 text-sm font-bold text-gray-700">
                    Metode Cetak
                  </label>
                  <select
                    id="printingType"
                    value={printingType}
                    onChange={(e) => setPrintingType(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  >
                    <option value="Full-color Sublimation">Cetak Sublim (Full Color/Gradasi)</option>
                    <option value="1-color Screen Printing">Sablon Manual (1 Warna Dominan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Attachment */}
                <div>
                  <label htmlFor="attachment" className="block mb-2 text-sm font-bold text-gray-700">
                    Aksesoris Pengait
                  </label>
                  <select
                    id="attachment"
                    value={attachment}
                    onChange={(e) => setAttachment(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  >
                    <option value="Hook Standard">Kait Metal Standard</option>
                    <option value="Hook & Buckle">Kait Metal + Stopper Putar (Stopper)</option>
                    <option value="Hook & Card Holder">Kait Metal + Casing ID Card (Holder)</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block mb-2 text-sm font-bold text-gray-700">
                    Jumlah Pesanan (Pcs)
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(50, parseInt(e.target.value) || 50))}
                    className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimal pemesanan: 50 Pcs</p>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label htmlFor="notes" className="block mb-2 text-sm font-bold text-gray-700">
                  Catatan Tambahan untuk Desain / Pengiriman
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Warna tali biru dongker, logo diulangi setiap 10cm..."
                  className="bg-gray-50 border border-gray-300 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 placeholder-gray-400"
                />
              </div>

              {/* Messages Box */}
              {error && (
                <div className="flex p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
                  <Icon icon="lucide:alert-circle" className="flex-shrink-0 inline w-5 h-5 mr-3 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {error}
                    {!isLoggedIn && (
                      <span className="block mt-1 font-semibold">
                        <Link href="/login/blackout" className="underline hover:text-red-900">
                          Silakan login terlebih dahulu untuk menyimpan pesanan.
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200" role="alert">
                  <Icon icon="lucide:check-circle" className="flex-shrink-0 inline w-5 h-5 mr-3 mt-0.5" />
                  <div>
                    <span className="font-bold">Sukses!</span> Pesanan kustom Anda telah berhasil didaftarkan. Mengalihkan ke dashboard Anda...
                  </div>
                </div>
              )}

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full text-white bg-brand-red hover:bg-brand-dark focus:ring-4 focus:ring-red-300 font-bold rounded-lg text-sm px-5 py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase flex items-center justify-center space-x-2"
              >
                <Icon icon="lucide:shopping-cart" className="h-5 w-5" />
                <span>{loading ? "Memproses..." : "Pesan Lanyard Sekarang"}</span>
              </button>
            </form>
          </div>

          {/* Pricing Quote Display */}
          <div className="lg:col-span-5 bg-[#2b3445] text-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-800 space-y-6">
            <h3 className="text-base font-bold uppercase tracking-widest text-brand-red flex items-center space-x-2 border-b border-gray-800 pb-3">
              <Icon icon="lucide:calculator" className="h-5 w-5" />
              <span>Rincian Estimasi Biaya</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Lebar Lanyard:</span>
                <span>{lanyardWidth}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Metode Cetak:</span>
                <span>{printingType === "Full-color Sublimation" ? "Sublimasi" : "Sablon"}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Pengait/Aksesoris:</span>
                <span className="text-right">{attachment}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Jumlah Cetak:</span>
                <span>{quantity} Pcs</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-sm font-bold text-green-400 bg-green-500/10 px-2 py-1.5 rounded-lg border border-green-500/20">
                  <span>Diskon Kuantitas:</span>
                  <span>-{discountPercent}%</span>
                </div>
              )}
            </div>

            <hr className="border-gray-800" />

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Harga Satuan:</span>
                <span className="text-lg font-extrabold text-brand-red">{formatRupiah(unitPrice)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Biaya:</span>
                <span className="text-2xl font-extrabold text-white">{formatRupiah(totalPrice)}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-semibold italic text-right mt-1">
                *Harga sudah termasuk tali lanyard, cetak dua sisi, aksesoris terpasang, dan tidak ada biaya tambahan.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-start space-x-2 text-xs">
              <Icon icon="lucide:info" className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
              <p className="leading-relaxed text-gray-300 font-medium">
                Pemesanan Anda akan diverifikasi oleh Admin melalui WhatsApp setelah dikirim. Pembayaran dilakukan via transfer bank setelah menyetujui approval layout desain final.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
