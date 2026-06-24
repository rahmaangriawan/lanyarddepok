"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { getSavedThemeId, getThemeById } from "@/lib/dashboard-theme";
import Link from "next/link";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  logoUrl: string | null;
  logoText: string | null;
  link: string | null;
  createdAt: string;
}

interface MediaItem {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

export default function PortfolioPage() {
  const { toast } = useToast();

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoText, setLogoText] = useState("");
  const [link, setLink] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Media Library states
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"image" | "logo" | null>(null);
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaDragActive, setMediaDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Theme accent support
  const [themeAccent, setThemeAccent] = useState("#fe696a");
  const [themeLight50, setThemeLight50] = useState("#fef2f2");

  useEffect(() => {
    document.title = "Portofolio Kami | Kawruh Admin";
    const themeId = getSavedThemeId();
    const theme = getThemeById(themeId);
    setThemeAccent(theme.accent);
    setThemeLight50(theme.light50);
  }, []);

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/cms/portofolio");
      const data = await res.json();
      if (res.ok && data.success) {
        setPortfolios(data.portfolios || []);
      } else {
        setError(data.error || "Gagal memuat portofolio.");
      }
    } catch (err) {
      setError("Kesalahan koneksi saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Media Library logic
  const fetchMedia = useCallback(async () => {
    try {
      setMediaLoading(true);
      const res = await fetch("/api/cms/media");
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaList(data.mediaList || []);
      }
    } catch (err) {
      console.error("Gagal memuat media files", err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  const openMediaModal = (target: "image" | "logo") => {
    setMediaTarget(target);
    setMediaPage(1);
    setMediaModalOpen(true);
    fetchMedia();
  };

  const handleMediaUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaList((prev) => [data.media, ...prev]);
        if (mediaTarget === "image") {
          setImageUrl(data.media.url);
          toast.success("Gambar utama berhasil diunggah dan dipilih!");
        } else if (mediaTarget === "logo") {
          setLogoUrl(data.media.url);
          toast.success("Logo berhasil diunggah dan dipilih!");
        }
        setMediaModalOpen(false);
      } else {
        toast.error(data.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleMediaDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setMediaDragActive(false);
    if (e.dataTransfer.files) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        await handleMediaUpload(file);
      }
    }
  };

  // Pagination for media library
  const imagesOnly = mediaList;
  const paginatedImages = useMemo(() => {
    const start = (mediaPage - 1) * 20;
    return imagesOnly.slice(start, start + 20);
  }, [imagesOnly, mediaPage]);

  const totalPages = Math.ceil(imagesOnly.length / 20);

  const openAddModal = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLogoUrl("");
    setLogoText("");
    setLink("");
    setModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setLogoUrl(item.logoUrl || "");
    setLogoText(item.logoText || "");
    setLink(item.link || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !imageUrl.trim()) {
      toast.error("Judul, deskripsi, dan gambar utama wajib diisi.");
      return;
    }

    setSubmitting(true);
    const body = {
      title,
      description,
      imageUrl,
      logoUrl: logoUrl.trim() || null,
      logoText: logoText.trim() || null,
      link: link.trim() || null,
    };

    try {
      const url = editId ? `/api/cms/portofolio/${editId}` : "/api/cms/portofolio";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editId ? "Portofolio berhasil diperbarui!" : "Portofolio baru berhasil ditambahkan!");
        setModalOpen(false);
        fetchPortfolios();
      } else {
        toast.error(data.error || "Gagal menyimpan portofolio.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setItemToDelete(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    try {
      const res = await fetch(`/api/cms/portofolio/${itemToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Portofolio berhasil dihapus!");
        setPortfolios((prev) => prev.filter((p) => p.id !== itemToDelete));
      } else {
        toast.error(data.error || "Gagal menghapus portofolio.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredPortfolios = useMemo(() => {
    if (!searchQuery.trim()) return portfolios;
    const q = searchQuery.toLowerCase();
    return portfolios.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.logoText && p.logoText.toLowerCase().includes(q))
    );
  }, [portfolios, searchQuery]);

  const totalPortfolioPages = Math.ceil(filteredPortfolios.length / ITEMS_PER_PAGE);

  const paginatedPortfolios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPortfolios.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPortfolios, currentPage]);

  if (loading && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{ borderColor: `${themeAccent} transparent ${themeAccent} transparent` }}
          />
          <p className="text-sm font-bold text-gray-900">Memuat Data Portofolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Portofolio Kami</h1>
          <p className="text-xs font-normal text-gray-400 mt-1">
            Kelola daftar portofolio produk lanyard yang ditampilkan di halaman utama publik.
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{ backgroundColor: themeAccent }}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer self-start"
        >
          <Icon icon="lucide:plus" className="h-4 w-4" />
          <span>Tambah Portofolio</span>
        </button>
      </div>

      {error && (
        <div className="flex p-3.5 text-xs text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
          <Icon icon="lucide:alert-circle" className="flex-shrink-0 inline w-4 h-4 mr-2 mt-0.5" />
          <div><span className="font-bold">Gagal:</span> {error}</div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3">
        <div className="relative w-full">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama brand, instansi atau deskripsi..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-brand-red focus:border-brand-red"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredPortfolios.length === 0 ? (
          <div className="py-16 px-8 text-center select-none">
            <Icon icon="lucide:briefcase" className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada portofolio</h3>
            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              Anda belum membuat portofolio apa pun.<br />Klik tombol di atas untuk membuat portofolio pertama Anda.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-bold uppercase select-none">
                  <th className="px-5 py-3 w-28">Preview</th>
                  <th className="px-5 py-3">Nama Brand/Instansi</th>
                  <th className="px-5 py-3 max-w-xs">Deskripsi</th>
                  <th className="px-5 py-3">Logo Teks</th>
                  <th className="px-5 py-3">Tautan</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                {paginatedPortfolios.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt="Full Preview"
                            className="h-12 w-9 object-cover rounded border border-gray-200"
                          />
                        )}
                        {p.logoUrl && (
                          <img
                            src={p.logoUrl}
                            alt="Logo"
                            className="h-7 w-7 object-contain rounded-full border border-gray-200 bg-gray-50 p-0.5"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-950">{p.title}</td>
                    <td className="px-5 py-4 max-w-xs truncate" title={p.description}>
                      {p.description}
                    </td>
                    <td className="px-5 py-4">{p.logoText || "-"}</td>
                    <td className="px-5 py-4">
                      {p.link ? (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <span>Link</span>
                          <Icon icon="lucide:external-link" className="h-3 w-3" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Ubah"
                        >
                          <Icon icon="lucide:pencil" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p.id)}
                          className="p-1.5 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Icon icon="lucide:trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPortfolioPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between select-none">
              <div className="text-xs text-gray-400 font-medium">
                Menampilkan <span className="font-bold text-gray-700">{Math.min(filteredPortfolios.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> sampai <span className="font-bold text-gray-700">{Math.min(filteredPortfolios.length, currentPage * ITEMS_PER_PAGE)}</span> dari <span className="font-bold text-gray-700">{filteredPortfolios.length}</span> portofolio
              </div>
              <div className="flex items-center space-x-1.5">
                {currentPage > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:text-[#fe696a] hover:bg-gray-50 transition-all cursor-pointer bg-white"
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

                {Array.from({ length: totalPortfolioPages }, (_, i) => i + 1).map((pageNumber) => {
                  const isCurrent = pageNumber === currentPage;
                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? "text-white shadow-xs"
                          : "bg-white border-gray-200 text-gray-600 hover:text-[#fe696a] hover:bg-gray-50"
                      }`}
                      style={isCurrent ? { backgroundColor: themeAccent, borderColor: themeAccent } : undefined}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {currentPage < totalPortfolioPages ? (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:text-[#fe696a] hover:bg-gray-50 transition-all cursor-pointer bg-white"
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

      {/* CRUD Modal/Panel Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between select-none">
              <h3 className="font-bold text-gray-900 text-lg">
                {editId ? "Ubah Portofolio" : "Tambah Portofolio Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Brand Name / Title */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">
                  Nama Brand / Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Bank Indonesia, Telkomsel"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ketik deskripsi singkat untuk portofolio ini..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 resize-none"
                />
              </div>

              {/* Main Image (imageUrl) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Gambar Utama Lanyard <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL Gambar Utama (/uploads/...)"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaModal("image")}
                    className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 cursor-pointer flex items-center justify-center shrink-0 shadow-xs transition-colors"
                  >
                    <Icon icon="lucide:image" className="h-4 w-4 mr-1.5" />
                    <span>Pilih dari Media</span>
                  </button>
                </div>
                {imageUrl && (
                  <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={imageUrl} alt="Preview utama" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer"
                    >
                      <Icon icon="lucide:trash-2" className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Logo Image (logoUrl) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Logo Brand (Opsional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="URL Logo Brand (/uploads/...)"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaModal("logo")}
                    className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 cursor-pointer flex items-center justify-center shrink-0 shadow-xs transition-colors"
                  >
                    <Icon icon="lucide:image" className="h-4 w-4 mr-1.5" />
                    <span>Pilih dari Media</span>
                  </button>
                </div>
                {logoUrl && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50 p-1 flex items-center justify-center">
                    <img src={logoUrl} alt="Preview logo" className="w-full h-full object-contain rounded-full" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="absolute top-0 right-0 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer"
                    >
                      <Icon icon="lucide:trash-2" className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Logo Text / Alternative text */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">
                  Teks Logo / Nama Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="Contoh: BI, Kemenkes, Telkomsel"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              {/* Detail URL / Link */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase">
                  Tautan Detail / Link Halaman (Opsional)
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Contoh: https://wa.me/... atau /blog/telkomsel-lanyard"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-2.5 select-none">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: themeAccent }}
                  className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting && <Icon icon="lucide:loader-2" className="animate-spin mr-1.5 h-4 w-4" />}
                  <span>{editId ? "Simpan Perubahan" : "Tambah Portofolio"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal Popup */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-down">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 select-none">
              <h3 className="font-bold text-gray-900 text-sm">
                Pilih Gambar dari Media Library ({mediaTarget === "image" ? "Gambar Utama" : "Logo Brand"})
              </h3>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-50"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>

            {/* Drag & Drop Upload Area inside Modal */}
            <div
              onDragEnter={() => setMediaDragActive(true)}
              onDragOver={(e) => { e.preventDefault(); setMediaDragActive(true); }}
              onDragLeave={() => setMediaDragActive(false)}
              onDrop={handleMediaDrop}
              className={`mx-6 mt-4 border border-dashed rounded-xl p-4 text-center text-xs font-medium transition-all shrink-0 ${
                mediaDragActive ? "border-brand-red bg-brand-light-50" : "border-gray-200 text-gray-400"
              }`}
              style={mediaDragActive ? { borderColor: themeAccent, backgroundColor: themeLight50 } : undefined}
            >
              <input
                id="modal-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    await handleMediaUpload(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="modal-file-input" className="cursor-pointer font-bold hover:underline" style={{ color: themeAccent }}>
                Klik untuk unggah file baru
              </label>{" "}
              atau seret file gambar ke sini
              {uploading && <span className="ml-2 text-gray-400 font-bold animate-pulse">Mengunggah...</span>}
            </div>

            {/* Media Items Grid */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              <div className="flex-1 flex flex-col p-6 overflow-y-auto min-h-0 justify-between">
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
                      style={{ borderColor: `${themeAccent} transparent ${themeAccent} transparent` }}
                    />
                  </div>
                ) : imagesOnly.length === 0 ? (
                  <div className="text-center py-16 space-y-2 select-none">
                    <Icon icon="lucide:image" className="h-12 w-12 text-gray-200 mx-auto" />
                    <p className="text-sm text-gray-400 font-medium">Belum ada gambar di media library.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {paginatedImages.map((m) => {
                        const isSelected = mediaTarget === "image" ? imageUrl === m.url : logoUrl === m.url;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              if (mediaTarget === "image") {
                                setImageUrl(m.url);
                              } else {
                                setLogoUrl(m.url);
                              }
                              setMediaModalOpen(false);
                              toast.success("Gambar berhasil dipilih!");
                            }}
                            className={`group aspect-square bg-gray-50 rounded-xl overflow-hidden border transition-all relative cursor-pointer ${
                              isSelected ? "ring-2 ring-offset-1" : "border-gray-200 hover:border-gray-400"
                            }`}
                            style={isSelected ? { borderColor: themeAccent } : undefined}
                            title={m.filename}
                          >
                            <img src={m.url} alt={m.filename} className="w-full h-full object-cover group-hover:scale-103 transition-transform" />
                            <div className={`absolute inset-0 transition-colors flex items-center justify-center ${
                              isSelected ? "bg-black/10" : "bg-black/0 group-hover:bg-black/15"
                            }`}>
                              <Icon
                                icon="lucide:check-circle"
                                className={`h-6 w-6 text-white drop-shadow-md transition-opacity ${
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                                style={isSelected ? { color: themeAccent } : undefined}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-gray-150 pt-4 mt-6 shrink-0 select-none">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Menampilkan <span className="font-bold text-gray-900">{(mediaPage - 1) * 20 + 1}</span> - <span className="font-bold text-gray-900">{Math.min(mediaPage * 20, imagesOnly.length)}</span> dari <span className="font-bold text-gray-900">{imagesOnly.length}</span>
                        </span>
                        <div className="inline-flex space-x-1">
                          <button
                            type="button"
                            disabled={mediaPage === 1}
                            onClick={() => setMediaPage((prev) => Math.max(prev - 1, 1))}
                            className="px-2.5 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Sebelumnya
                          </button>
                          <button
                            type="button"
                            disabled={mediaPage === totalPages}
                            onClick={() => setMediaPage((prev) => Math.min(prev + 1, totalPages))}
                            className="px-2.5 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 select-none">
            <div className="bg-red-50 text-red-600 h-12 w-12 rounded-full flex items-center justify-center mx-auto">
              <Icon icon="lucide:trash-2" className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">Hapus Item Portofolio?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tindakan ini permanen. Item portofolio ini tidak akan lagi ditampilkan pada halaman utama website.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
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
