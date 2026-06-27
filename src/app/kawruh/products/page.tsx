"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { getSavedThemeId, getThemeById } from "@/lib/dashboard-theme";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  type: string;
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

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page++) {
    pages.add(page);
  }

  if (currentPage <= 4) {
    [2, 3, 4, 5].forEach((page) => pages.add(page));
  }

  if (currentPage >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach(
      (page) => pages.add(page),
    );
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];
  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push(page < currentPage ? "ellipsis-left" : "ellipsis-right");
    }
    items.push(page);
  });

  return items;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState("");

  // Bulk Edit States
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page and selection when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedSkus(new Set());
  }, [searchQuery, filterStatus, filterCategory]);

  const handleBulkChangeCategory = async () => {
    try {
      setIsBulkSaving(true);
      const res = await fetch("/api/cms/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skus: Array.from(selectedSkus),
          action: "CHANGE_CATEGORY",
          newCategoryId: bulkCategoryId ? Number(bulkCategoryId) : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${data.count} kategori produk berhasil diperbarui.`);
        setSelectedSkus(new Set());
        setBulkModalOpen(false);
        setBulkCategoryId("");
        fetchAll();
      } else {
        toast.error(data.error || "Gagal memperbarui kategori masal.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat memperbarui kategori masal.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsBulkSaving(true);
      const res = await fetch("/api/cms/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skus: Array.from(selectedSkus),
          action: "DELETE",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${data.count} produk berhasil dihapus secara permanen.`);
        setSelectedSkus(new Set());
        setShowBulkDeleteConfirm(false);
        fetchAll();
      } else {
        toast.error(data.error || "Gagal menghapus produk masal.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat menghapus produk masal.");
    } finally {
      setIsBulkSaving(false);
    }
  };

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
        const allCats = catsData.categories || [];
        setCategories(allCats.filter((c: any) => c.type === "PRODUCT"));
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
          p.specs.toLowerCase().includes(q),
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((p) =>
        filterStatus === "published" ? p.published : !p.published,
      );
    }

    if (filterCategory !== "all") {
      result = result.filter(
        (p) => p.categoryId?.toString() === filterCategory,
      );
    }

    return result;
  }, [products, searchQuery, filterStatus, filterCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

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
            style={{
              borderColor: `${themeAccent} transparent ${themeAccent} transparent`,
            }}
          />
          <p className="text-sm font-bold text-gray-900">
            Mensinkronisasi dengan Google Spreadsheet...
          </p>
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
            <h2 className="text-xl font-bold text-gray-900">
              Integrasi Google Spreadsheet Belum Dikonfigurasi
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Daftar produk disinkronkan secara otomatis dari Google
              Spreadsheet. Harap masukkan kredensial Service Account JSON dan
              Google Spreadsheet ID di halaman pengaturan terlebih dahulu.
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
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Katalog Produk
          </h1>
          <p className="text-xs font-normal text-gray-400 mt-1">
            Data dasar disinkronkan otomatis dari Google Spreadsheet. Anda bisa
            menambahkan gambar, kategori, dan deskripsi produk di sini.
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

      {/* Search & Filters & Bulk Actions */}
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Icon
              icon="lucide:search"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            />
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

        {/* Bulk Action Toolbar */}
        {selectedSkus.size > 0 && (
          <div className="bg-brand-light-50 border border-red-100 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
              <Icon
                icon="lucide:check-square"
                className="h-4.5 w-4.5 text-brand-red"
              />
              <span>{selectedSkus.size} produk terpilih</span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 cursor-pointer shadow-xs transition-all text-gray-700"
              >
                <Icon icon="lucide:tag" className="h-4 w-4 text-gray-500" />
                <span>Ubah Kategori (Masal)</span>
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-bold text-brand-red hover:bg-red-100/50 cursor-pointer shadow-xs transition-all animate-pulse"
              >
                <Icon icon="lucide:trash-2" className="h-4 w-4" />
                <span>Hapus Masal</span>
              </button>
              <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
              <button
                onClick={() => setSelectedSkus(new Set())}
                className="text-xs text-gray-400 font-bold hover:text-gray-600 px-2 py-2 cursor-pointer transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/40 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) => selectedSkus.has(p.sku))
                    }
                    onChange={(e) => {
                      const newSelected = new Set(selectedSkus);
                      if (e.target.checked) {
                        paginatedProducts.forEach((p) =>
                          newSelected.add(p.sku),
                        );
                      } else {
                        paginatedProducts.forEach((p) =>
                          newSelected.delete(p.sku),
                        );
                      }
                      setSelectedSkus(newSelected);
                    }}
                    className="h-4 w-4 bg-gray-50 border-gray-300 text-brand-red rounded focus:ring-brand-red cursor-pointer accent-brand-red"
                  />
                </th>
                <th className="py-3.5 px-5 w-24">SKU</th>
                <th className="py-3.5 px-5 w-56">Gambar & Nama</th>
                <th className="py-3.5 px-5">Spesifikasi Dasar (Spreadsheet)</th>
                <th className="py-3.5 px-5 w-32">Kategori (Lokal)</th>
                <th className="py-3.5 px-5 w-28 text-center">Status</th>
                <th className="py-3.5 px-5 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.sku}
                    className={`hover:bg-gray-50/30 transition-colors font-medium ${selectedSkus.has(p.sku) ? "bg-brand-light-50/40 hover:bg-brand-light-50/60" : ""}`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSkus.has(p.sku)}
                        onChange={() => {
                          const newSelected = new Set(selectedSkus);
                          if (newSelected.has(p.sku)) {
                            newSelected.delete(p.sku);
                          } else {
                            newSelected.add(p.sku);
                          }
                          setSelectedSkus(newSelected);
                        }}
                        className="h-4 w-4 bg-gray-50 border-gray-300 text-brand-red rounded focus:ring-brand-red cursor-pointer accent-brand-red"
                      />
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-700 font-bold">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-14 w-14 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {p.featuredImage ? (
                            <img
                              src={p.featuredImage}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon
                              icon="lucide:image"
                              className="h-6 w-6 text-gray-300"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div
                            className="text-gray-900 font-bold truncate max-w-[150px] leading-tight"
                            title={p.name}
                          >
                            {p.name}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1 font-semibold leading-none">
                            Min. {p.minOrder} pcs • Rp {p.basePrice}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 leading-normal text-[11px]">
                      <div>
                        <strong className="text-gray-600 font-bold">
                          Spek:
                        </strong>{" "}
                        {p.specs || "-"}
                      </div>
                      <div className="mt-0.5">
                        <strong className="text-gray-600 font-bold">
                          Aksesoris:
                        </strong>{" "}
                        {p.accessories || "-"}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {p.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          {p.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic text-[10px]">
                          Uncategorized
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {p.published ? (
                        <span
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: themeAccent,
                            backgroundColor: themeLight50,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: themeAccent }}
                          />
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
              Menampilkan{" "}
              <span className="font-bold text-gray-700">
                {Math.min(
                  filteredProducts.length,
                  (currentPage - 1) * ITEMS_PER_PAGE + 1,
                )}
              </span>{" "}
              sampai{" "}
              <span className="font-bold text-gray-700">
                {Math.min(
                  filteredProducts.length,
                  currentPage * ITEMS_PER_PAGE,
                )}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-700">
                {filteredProducts.length}
              </span>{" "}
              produk
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

              {paginationItems.map((pageNumber) => {
                if (typeof pageNumber === "string") {
                  return (
                    <span
                      key={pageNumber}
                      className="inline-flex items-center justify-center w-8 h-8 text-gray-300 text-xs font-bold"
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  );
                }

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
                    style={
                      isCurrent
                        ? {
                            backgroundColor: themeAccent,
                            borderColor: themeAccent,
                          }
                        : undefined
                    }
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

      {/* Bulk Category Action Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Ubah Kategori Masal
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-1">
                Ubah kategori lokal untuk{" "}
                <span className="font-extrabold text-brand-red">
                  {selectedSkus.size}
                </span>{" "}
                produk terpilih sekaligus.
              </p>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Pilih Kategori Baru
              </label>
              <select
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:ring-brand-red focus:border-brand-red cursor-pointer"
              >
                <option value="">-- Tanpa Kategori (Uncategorized) --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => {
                  setBulkModalOpen(false);
                  setBulkCategoryId("");
                }}
                className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isBulkSaving}
                onClick={handleBulkChangeCategory}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                style={{ backgroundColor: themeAccent }}
              >
                {isBulkSaving && (
                  <Icon
                    icon="lucide:loader-2"
                    className="h-3.5 w-3.5 animate-spin"
                  />
                )}
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="bg-red-50 h-10 w-10 rounded-lg flex items-center justify-center text-brand-red border border-red-100">
              <Icon icon="lucide:alert-triangle" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Ubah & Hapus Produk Terpilih?
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed mt-1">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-extrabold text-brand-red">
                  {selectedSkus.size}
                </span>{" "}
                produk terpilih secara permanen? Tindakan ini akan menghapus
                pengayaan data lokal produk tersebut dari database.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isBulkSaving}
                onClick={handleBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-xs bg-[#ec2028] disabled:opacity-50 hover:bg-[#d01820] transition-colors"
              >
                {isBulkSaving && (
                  <Icon
                    icon="lucide:loader-2"
                    className="h-3.5 w-3.5 animate-spin"
                  />
                )}
                <span>Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
