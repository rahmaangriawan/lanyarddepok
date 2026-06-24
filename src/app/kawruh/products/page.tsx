"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { getSavedThemeId, getThemeById } from "@/lib/dashboard-theme";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

interface Product {
  sku: string;
  name: string;
  specs: string;
  accessories: string;
  basePrice: string;
  minOrder: string;
  id: number | null;
  featuredImage: string | null;
  categoryId: number | null;
  category: Category | null;
  description: string;
  published: boolean;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterCategory]);

  // Theme support
  const [themeAccent, setThemeAccent] = useState("#ec2028"); // default red
  const [themeLight50, setThemeLight50] = useState("#fef2f2");

  useEffect(() => {
    document.title = "Produk Lanyard | Kawruh Admin";
    const themeId = getSavedThemeId();
    const theme = getThemeById(themeId);
    setThemeAccent(theme.accent);
    setThemeLight50(theme.light50);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const [productsRes, catsRes] = await Promise.all([
        fetch("/api/cms/products"),
        fetch("/api/cms/categories"),
      ]);

      const productsData = await productsRes.json();
      const catsData = await catsRes.json();

      if (productsRes.ok) {
        if (productsData.notConfigured) {
          setNotConfigured(true);
        } else if (productsData.success) {
          setProducts(productsData.products || []);
        } else {
          setError(productsData.error || "Gagal mengambil data produk.");
        }
      } else {
        setError("Gagal menghubungi server API produk.");
      }

      if (catsRes.ok) {
        setCategories(catsData.categories || []);
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.specs.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((p) =>
        filterStatus === "published" ? p.published : !p.published
      );
    }

    if (filterCategory !== "all") {
      result = result.filter((p) => p.categoryId?.toString() === filterCategory);
    }

    return result;
  }, [products, searchQuery, filterStatus, filterCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{ borderColor: `${themeAccent} transparent ${themeAccent} transparent` }}
          />
          <p className="text-sm font-bold text-gray-900">Mensinkronisasi dengan Google Spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (notConfigured) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
          <div className="bg-blue-50 h-16 w-16 rounded-full flex items-center justify-center text-blue-600 mx-auto">
            <Icon icon="lucide:cpu" className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Integrasi Google Spreadsheet Belum Dikonfigurasi</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Daftar produk disinkronkan secara otomatis dari Google Spreadsheet. Harap masukkan kredensial Service Account JSON dan Google Spreadsheet ID di halaman pengaturan terlebih dahulu.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Link
              href="/kawruh/settings"
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-red text-white rounded-xl text-xs font-bold shadow-xs hover:bg-brand-dark transition-colors"
              style={{ backgroundColor: themeAccent }}
            >
              <Icon icon="lucide:settings" className="h-4 w-4" />
              <span>Konfigurasi Sekarang</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Katalog Produk</h1>
          <p className="text-xs font-normal text-gray-400 mt-1">
            Data dasar disinkronkan otomatis dari Google Spreadsheet. Anda bisa menambahkan gambar, kategori, dan deskripsi produk di sini.
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
        >
          <Icon icon="lucide:refresh-cw" className="h-3.5 w-3.5" />
          <span>Sinkron Ulang</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <Icon icon="lucide:alert-circle" className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU, nama produk atau spesifikasi..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-brand-red focus:border-brand-red"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2.5 focus:ring-brand-red focus:border-brand-red cursor-pointer min-w-[130px]"
          >
            <option value="all">Semua Status</option>
            <option value="published">Tampil di Web</option>
            <option value="draft">Draft (Disembunyikan)</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2.5 focus:ring-brand-red focus:border-brand-red cursor-pointer min-w-[140px]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/40 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3.5 px-5 w-24">SKU</th>
                <th className="py-3.5 px-5 w-44">Gambar & Nama</th>
                <th className="py-3.5 px-5">Spesifikasi Dasar (Spreadsheet)</th>
                <th className="py-3.5 px-5 w-32">Kategori (Lokal)</th>
                <th className="py-3.5 px-5 w-28 text-center">Status</th>
                <th className="py-3.5 px-5 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.sku} className="hover:bg-gray-50/30 transition-colors font-medium">
                    <td className="py-3.5 px-5 font-mono text-gray-700 font-bold">{p.sku}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-50 border border-gray-150 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {p.featuredImage ? (
                            <img src={p.featuredImage} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <Icon icon="lucide:image" className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-gray-900 font-bold truncate max-w-[150px] leading-tight" title={p.name}>
                            {p.name}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 font-semibold leading-none">
                            Min. {p.minOrder} pcs • Rp {p.basePrice}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 leading-normal text-[11px]">
                      <div><strong className="text-gray-600 font-bold">Spek:</strong> {p.specs || "-"}</div>
                      <div className="mt-0.5"><strong className="text-gray-600 font-bold">Aksesoris:</strong> {p.accessories || "-"}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      {p.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          {p.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic text-[10px]">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {p.published ? (
                        <span
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ color: themeAccent, backgroundColor: themeLight50 }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeAccent }} />
                          <span>Tampil</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-150">
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Link
                        href={`/kawruh/products/edit/${encodeURIComponent(p.sku)}`}
                        className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-800 bg-gray-50 border border-gray-150 rounded-lg hover:shadow-2xs transition-all"
                        title="Edit Pengayaan Produk"
                      >
                        <Icon icon="lucide:edit-3" className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between select-none">
            <div className="text-xs text-gray-400 font-medium">
              Menampilkan <span className="font-bold text-gray-700">{Math.min(filteredProducts.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> sampai <span className="font-bold text-gray-700">{Math.min(filteredProducts.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-gray-700">{filteredProducts.length}</span> produk
            </div>
            <div className="flex items-center space-x-1.5">
              {currentPage > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white"
                  aria-label="Previous Page"
                >
                  <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                </button>
              ) : (
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                  aria-disabled="true"
                >
                  <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                </span>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                const isCurrent = pageNumber === currentPage;
                return (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "text-white shadow-xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    style={isCurrent ? { backgroundColor: themeAccent, borderColor: themeAccent } : undefined}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer bg-white"
                  aria-label="Next Page"
                >
                  <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                </button>
              ) : (
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                  aria-disabled="true"
                >
                  <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
