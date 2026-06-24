"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function OrderForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Name validation
    if (!name.trim()) {
      errors.name = "Nama lengkap wajib diisi";
    } else if (name.trim().length < 3) {
      errors.name = "Nama minimal terdiri dari 3 karakter";
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Alamat email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Format email tidak valid (contoh: nama@email.com)";
    }

    // Phone validation
    if (!phone.trim()) {
      errors.phone = "Nomor telepon / WhatsApp wajib diisi";
    } else {
      const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
      if (!/^\d+$/.test(cleanPhone)) {
        errors.phone = "Nomor telepon hanya boleh berisi angka dan karakter +, -, ()";
      } else if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        errors.phone = "Nomor telepon harus berkisar antara 8 hingga 15 digit";
      }
    }

    // Message validation
    if (!message.trim()) {
      errors.message = "Pesan Anda wajib diisi";
    } else if (message.trim().length < 10) {
      errors.message = "Pesan minimal terdiri dari 10 karakter";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate form fields first
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setFieldErrors({});
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="bg-white py-20 scroll-mt-16 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-block bg-[#FFF0F0] text-brand-red text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">
                Hubungi Kami
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-4 tracking-tight leading-tight">
                Ada Pertanyaan?<br />
                Hubungi <span className="text-brand-red">Kami</span>
              </h2>
              <p className="text-[13px] font-medium text-gray-500 mt-4 leading-relaxed">
                Butuh bantuan mengenai spesifikasi desain, penawaran harga khusus instansi
                pemerintah/perusahaan skala besar, atau info stok aksesoris? Kirimkan pesan Anda langsung
                di samping.
              </p>
            </div>

            <hr className="border-gray-200 my-6" />

            <div className="space-y-6">
              {/* Alamat Produksi */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#FFF0F0] p-3 rounded-xl text-brand-red shrink-0 flex items-center justify-center">
                  <Icon icon="lucide:map-pin" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Alamat Produksi</h4>
                  <p className="text-xs font-semibold text-gray-500 leading-relaxed mt-1">
                    Jl. Salemba Raya No. 34-36, Senen,
                    <br />
                    Jakarta Pusat, DKI Jakarta 10430
                  </p>
                </div>
              </div>

              {/* WhatsApp HotLine */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#FFF0F0] p-3 rounded-xl text-brand-red shrink-0 flex items-center justify-center">
                  <Icon icon="lucide:phone" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">WhatsApp HotLine</h4>
                  <a
                    href="https://wa.me/6282210200700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-extrabold text-brand-red hover:underline block mt-1"
                  >
                    +62 822-1020-0700
                  </a>
                </div>
              </div>

              {/* Email Support */}
              <div className="flex items-start space-x-4">
                <div className="bg-[#FFF0F0] p-3 rounded-xl text-brand-red shrink-0 flex items-center justify-center">
                  <Icon icon="lucide:mail" className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Email Support</h4>
                  <a
                    href="mailto:info@lanyardjakarta.co.id"
                    className="text-xs font-semibold text-gray-500 hover:text-brand-red block mt-1"
                  >
                    info@lanyardjakarta.co.id
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-[#F8F9FA] p-6 sm:p-10 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="inquiryName" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    id="inquiryName"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Masukkan nama Anda..."
                    className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3.5 transition-all outline-none ${
                      fieldErrors.name ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                      <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiryEmail" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Alamat Email
                  </label>
                  <input
                    id="inquiryEmail"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="nama@email.com..."
                    className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3.5 transition-all outline-none ${
                      fieldErrors.email ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                      <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="inquiryPhone" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Nomor Telepon / WhatsApp (Aktif)
                </label>
                <input
                  id="inquiryPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="Contoh: 0812XXXXXXXX..."
                  className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3.5 transition-all outline-none ${
                    fieldErrors.phone ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                    <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="inquiryMessage" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Pesan Anda
                </label>
                <textarea
                  id="inquiryMessage"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) setFieldErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder="Ketik detail pertanyaan Anda..."
                  className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3.5 transition-all outline-none resize-y placeholder-gray-400 ${
                    fieldErrors.message ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {fieldErrors.message && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                    <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.message}</span>
                  </p>
                )}
              </div>

              {error && (
                <div className="flex p-4 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-150" role="alert">
                  <Icon icon="lucide:alert-triangle" className="flex-shrink-0 inline w-4.5 h-4.5 mr-2.5 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal mengirim:</span> {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex p-4 text-xs font-semibold text-green-800 rounded-xl bg-green-50 border border-green-150" role="alert">
                  <Icon icon="lucide:check-circle-2" className="flex-shrink-0 inline w-4.5 h-4.5 mr-2.5 mt-0.5" />
                  <div>
                    <span className="font-bold">Pesan Terkirim!</span> Tim Lanyard Jakarta akan segera menghubungi Anda melalui nomor telepon / WhatsApp yang dicantumkan. Terima kasih.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-brand-red hover:bg-[#D9383D] active:bg-[#C22F34] focus:ring-4 focus:ring-red-200 font-bold rounded-xl text-[13px] px-6 py-4 text-center disabled:opacity-50 cursor-pointer uppercase flex items-center justify-center space-x-2.5 tracking-wider transition-all"
              >
                <Icon icon="lucide:send" className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                <span>{loading ? "Mengirim..." : "Kirim Pertanyaan"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

