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
    <div className="mt-8 rounded-2xl border border-public-border bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:p-8">
      <h4 className="mb-2 text-xl font-extrabold text-gray-950">
        Tinggalkan Komentar
      </h4>
      <p className="mb-6 text-sm font-medium leading-6 text-gray-600">
        Email Anda tidak akan dipublikasikan. Kolom bertanda wajib diisi.
      </p>

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800 animate-fade-in">
          <Icon icon="lucide:check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="text-xs font-semibold leading-relaxed">
            Komentar Anda berhasil dikirim! Komentar Anda akan tampil setelah diverifikasi dan disetujui oleh admin.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-public-border bg-public-soft p-4 text-gray-800 animate-fade-in">
          <Icon icon="lucide:alert-triangle" className="mt-0.5 h-5 w-5 shrink-0 text-public-amber-strong" />
          <div className="text-xs font-semibold leading-relaxed">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="commentName" className="mb-2 block text-xs font-extrabold text-gray-900">
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
              className={`block w-full rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-public-amber focus:ring-2 focus:ring-public-amber/20 ${
                fieldErrors.name ? "border-public-amber" : "border-gray-200"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-public-amber-strong">
                <Icon icon="lucide:alert-circle" className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="commentEmail" className="mb-2 block text-xs font-extrabold text-gray-900">
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
              className={`block w-full rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-public-amber focus:ring-2 focus:ring-public-amber/20 ${
                fieldErrors.email ? "border-public-amber" : "border-gray-200"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-public-amber-strong">
                <Icon icon="lucide:alert-circle" className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="commentContent" className="mb-2 block text-xs font-extrabold text-gray-900">
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
            className={`block w-full resize-none rounded-xl border bg-white p-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-public-amber focus:ring-2 focus:ring-public-amber/20 ${
              fieldErrors.content ? "border-public-amber" : "border-gray-200"
            }`}
          />
          {fieldErrors.content && (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-public-amber-strong">
              <Icon icon="lucide:alert-circle" className="h-3 w-3 shrink-0" />
              <span>{fieldErrors.content}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 cursor-pointer select-none items-center justify-center rounded-xl bg-public-amber px-6 py-3 text-xs font-extrabold text-gray-950 transition-all hover:bg-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
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
