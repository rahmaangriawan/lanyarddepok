"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <section className="w-full max-w-2xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-red">500</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#373f50] sm:text-5xl">
            Ada kendala di server
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
            Maaf, halaman ini belum bisa dimuat dengan normal. Coba ulangi sekali lagi atau kembali beberapa saat lagi.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-red px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#c82a2c]"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition-colors hover:border-brand-red hover:text-brand-red"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
