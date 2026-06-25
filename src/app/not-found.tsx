import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <section className="w-full max-w-2xl text-center">
          <p className="text-7xl sm:text-8xl md:text-9xl font-black tracking-wider text-brand-red leading-none select-none animate-pulse">404</p>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#373f50] sm:text-5xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
            Link yang Anda buka mungkin sudah berubah, terhapus, atau alamatnya kurang tepat.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-red px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#c82a2c]"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/produk"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-bold text-gray-700 transition-colors hover:border-brand-red hover:text-brand-red"
            >
              Lihat Produk
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
