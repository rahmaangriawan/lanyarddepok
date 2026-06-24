"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  featuredImage: string | null;
  createdAt: string;
  category: { id: number; name: string } | null;
}

export default function BlogListPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterCategory, filterDate]);

  // Delete confirmation modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch("/api/cms/posts"),
        fetch("/api/cms/categories"),
      ]);
      const postsData = await postsRes.json();
      const catsData = await catsRes.json();
      if (postsRes.ok) setPosts(postsData.posts || []);
      if (catsRes.ok) setCategories(catsData.categories || []);
    } catch (err) {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    document.title = "Blog Posts | Kawruh Admin";
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") {
      result = result.filter((p) => (filterStatus === "published" ? p.published : !p.published));
    }
    if (filterCategory !== "all") {
      result = result.filter((p) => p.category?.id?.toString() === filterCategory);
    }
    if (filterDate !== "all") {
      const now = new Date();
      result = result.filter((p) => {
        const d = new Date(p.createdAt);
        if (filterDate === "today") return d.toDateString() === now.toDateString();
        if (filterDate === "week") return d >= new Date(now.getTime() - 7 * 86400000);
        if (filterDate === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
    }
    return result;
  }, [posts, searchQuery, filterStatus, filterCategory, filterDate]);

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    try {
      const res = await fetch(`/api/cms/posts/${itemToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Postingan berhasil dihapus.");
        setPosts((prev) => prev.filter((p) => p.id !== itemToDelete));
      } else {
        toast.error(data.error || "Gagal menghapus postingan.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi.");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-900">Memuat Blog Posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Blog Posts</h1>
          <p className="text-xs font-normal text-gray-400 mt-1">Buat dan kelola artikel blog untuk website Anda.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari postingan..." className="w-full pl-9 pr-14 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-brand-red focus:border-brand-red" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">⌘K</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2.5 focus:ring-brand-red focus:border-brand-red appearance-none cursor-pointer min-w-[130px]">
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2.5 focus:ring-brand-red focus:border-brand-red appearance-none cursor-pointer min-w-[140px]">
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (<option key={c.id} value={c.id.toString()}>{c.name}</option>))}
          </select>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2.5 focus:ring-brand-red focus:border-brand-red appearance-none cursor-pointer min-w-[140px]">
            <option value="all">Semua Tanggal</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>
          <button onClick={() => { setSearchQuery(""); setFilterStatus("all"); setFilterCategory("all"); setFilterDate("all"); }} className="flex items-center space-x-1.5 px-3.5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0">
            <Icon icon="lucide:sliders-horizontal" className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Posts Table / Empty */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="py-16 px-8 text-center">
            <img src="/images/empty-posts.webp" alt="Belum ada postingan" className="mx-auto h-36 w-auto mb-6" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada postingan</h3>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">Anda belum membuat artikel blog apa pun.<br />Klik tombol di bawah untuk membuat artikel pertama Anda.</p>
            <Link href="/kawruh/blog/new" className="mt-6 inline-flex items-center space-x-2 bg-brand-red hover:bg-brand-dark text-white font-bold rounded-full text-sm px-6 py-3 cursor-pointer transition-all shadow-sm">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              <span>Buat Postingan Baru</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{filteredPosts.length} Postingan</h3>
              <Link href="/kawruh/blog/new" className="flex items-center space-x-1.5 bg-brand-red hover:bg-brand-dark text-white font-bold rounded-lg text-[11px] px-3.5 py-2 cursor-pointer transition-colors">
                <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
                <span>Postingan Baru</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Judul</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-500 font-medium">
                  {paginatedPosts.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => router.push(`/kawruh/blog/edit/${p.id}`)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          {p.featuredImage && <img src={p.featuredImage} alt="thumb" className="h-9 w-9 object-cover rounded-lg shrink-0" />}
                          <div>
                            <div className="font-bold text-gray-900 text-[13px]">{p.title}</div>
                            <div className="text-[10px] text-gray-300 font-mono mt-0.5">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.category ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wider">{p.category.name}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.published ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>{p.published ? "Published" : "Draft"}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-400">{new Date(p.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" })}</td>
                      <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/kawruh/blog/edit/${p.id}`); }} className="text-gray-400 hover:text-blue-600 p-1 cursor-pointer transition-colors" title="Edit"><Icon icon="lucide:edit-2" className="h-3.5 w-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors" title="Hapus"><Icon icon="lucide:trash-2" className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between select-none">
                <div className="text-xs text-gray-400 font-medium">
                  Menampilkan <span className="font-bold text-gray-700">{Math.min(filteredPosts.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> sampai <span className="font-bold text-gray-700">{Math.min(filteredPosts.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-gray-700">{filteredPosts.length}</span> postingan
                </div>
                <div className="flex items-center space-x-1.5">
                  {currentPage > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red hover:bg-gray-50 transition-all cursor-pointer bg-white"
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
                            ? "bg-brand-red border-brand-red text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red hover:bg-gray-50"
                        }`}
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
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red hover:bg-gray-50 transition-all cursor-pointer bg-white"
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
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-full text-red-500">
                <Icon icon="lucide:alert-triangle" className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus postingan blog ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
