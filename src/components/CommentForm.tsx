"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface CommentFormProps {
  postId: number;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  content?: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!name.trim()) {
      errors.name = "Nama lengkap wajib diisi";
    } else if (name.trim().length < 2) {
      errors.name = "Nama minimal terdiri dari 2 karakter";
    }

    if (!email.trim()) {
      errors.email = "Alamat email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Format email tidak valid";
    }

    if (!content.trim()) {
      errors.content = "Isi komentar wajib diisi";
    } else if (content.trim().length < 5) {
      errors.content = "Komentar minimal terdiri dari 5 karakter";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, name, email, content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim komentar.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setContent("");
      setFieldErrors({});
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 mt-8">
      <h4 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">
        Tinggalkan Komentar
      </h4>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-emerald-800 animate-fade-in">
          <Icon icon="lucide:check-circle" className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed">
            Komentar Anda berhasil dikirim! Komentar Anda akan tampil setelah diverifikasi dan disetujui oleh admin.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800 animate-fade-in">
          <Icon icon="lucide:alert-triangle" className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="commentName" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
              Nama Lengkap
            </label>
            <input
              id="commentName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Masukkan nama Anda..."
              className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3 transition-all outline-none ${
                fieldErrors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs font-semibold text-red-500 flex items-center space-x-1">
                <Icon icon="lucide:alert-circle" className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="commentEmail" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
              Alamat Email
            </label>
            <input
              id="commentEmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="nama@email.com..."
              className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3 transition-all outline-none ${
                fieldErrors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs font-semibold text-red-500 flex items-center space-x-1">
                <Icon icon="lucide:alert-circle" className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="commentContent" className="block mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
            Isi Komentar
          </label>
          <textarea
            id="commentContent"
            rows={4}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (fieldErrors.content) setFieldErrors((prev) => ({ ...prev, content: undefined }));
            }}
            placeholder="Tulis pendapat atau pertanyaan Anda di sini..."
            className={`bg-white border text-gray-900 text-sm rounded-xl focus:ring-brand-red focus:border-brand-red block w-full p-3 transition-all outline-none resize-none ${
              fieldErrors.content ? "border-red-500" : "border-gray-200"
            }`}
          />
          {fieldErrors.content && (
            <p className="mt-1 text-xs font-semibold text-red-500 flex items-center space-x-1">
              <Icon icon="lucide:alert-circle" className="h-3 w-3 shrink-0" />
              <span>{fieldErrors.content}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center bg-[#e13b3d] hover:bg-[#c82a2c] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-xs transition-all select-none cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <Icon icon="lucide:send" className="mr-2 h-4 w-4" />
              <span>Kirim Komentar</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
