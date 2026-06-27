"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";

interface Media {
  id: number;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Delete confirmation modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated & filtered media list
  const fetchMediaList = async (pageNum: number, searchVal: string, filterVal: string, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "24",
        search: searchVal,
        type: filterVal,
      });

      const res = await fetch(`/api/cms/media?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        const list = data.mediaList || [];
        if (isLoadMore) {
          setMediaList((prev) => [...prev, ...list]);
        } else {
          setMediaList(list);
        }
        setHasMore(data.pagination?.hasMore || false);
      } else {
        toast.error(data.error || "Gagal memuat file media.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat memuat media.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload lists when search query or filter changes
  useEffect(() => {
    setPage(1);
    fetchMediaList(1, debouncedSearch, fileTypeFilter, false);
  }, [debouncedSearch, fileTypeFilter]);

  useEffect(() => {
    document.title = "Pustaka Media | Kawruh Admin";
  }, []);

  // Handle Load More click
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMediaList(nextPage, debouncedSearch, fileTypeFilter, true);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
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
        toast.success(`File "${file.name}" berhasil diunggah!`);
      } else {
        toast.error(data.error || `Gagal mengunggah file ${file.name}`);
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await uploadFile(file);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await uploadFile(file);
      }
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    try {
      const res = await fetch(`/api/cms/media/${itemToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== itemToDelete));
        if (selectedMedia?.id === itemToDelete) {
          setSelectedMedia(null);
        }
        toast.success("File media berhasil dihapus.");
      } else {
        toast.error(data.error || "Gagal menghapus media.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menghapus media.");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link gambar berhasil disalin!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPreviewUrl = (media: Media) => {
    const separator = media.url.includes("?") ? "&" : "?";
    return `${media.url}${separator}v=${encodeURIComponent(media.createdAt || media.id)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-955">Memuat Pustaka Media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Pustaka Media</h1>
        <p className="text-xs font-normal text-gray-400 mt-1">
          Unggah dan kelola file visual (gambar, logo, aset) untuk konten Anda.
        </p>
      </div>

      {/* Alerts removed (migrated to Toast notifications) */}

      {/* Drag & Drop Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? "border-brand-red bg-brand-light-50/20"
            : "border-gray-300 hover:border-brand-red bg-white"
        }`}
      >
        <input
          id="media-file-input"
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="space-y-3">
          <div className="bg-brand-light-50 h-12 w-12 rounded-full flex items-center justify-center text-brand-red mx-auto">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-red border-t-transparent" />
            ) : (
              <Icon icon="lucide:upload-cloud" className="h-6 w-6" />
            )}
          </div>
          <div>
            <label
              htmlFor="media-file-input"
              className="text-sm font-bold text-brand-red hover:underline cursor-pointer"
            >
              Klik untuk unggah
            </label>{" "}
            <span className="text-sm text-gray-500 font-medium">atau seret dan lepas file di sini</span>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase">
            Maks. Ukuran File: 5MB (Gambar JPEG, PNG, WEBP, GIF, atau PDF)
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-base font-bold text-gray-900 shrink-0">File Terunggah</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search input with icon */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Icon icon="lucide:search" className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200/60 rounded-lg text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-red bg-white"
              />
            </div>
            
            {/* Type selector */}
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200/60 rounded-lg text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-brand-red cursor-pointer"
            >
              <option value="all">Semua Tipe File</option>
              <option value="image">Gambar saja</option>
              <option value="document">Dokumen/PDF saja</option>
            </select>
          </div>
        </div>

        {mediaList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Icon icon="lucide:image" className="h-10 w-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">Belum ada file media</h4>
            <p className="text-xs font-medium text-gray-500">
              Unggah file media pertama Anda menggunakan dropzone di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((m) => {
              const isImage = m.mimetype.startsWith("image/");
              const isSelected = selectedMedia?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMedia(m)}
                  className={`group relative bg-white rounded-xl border overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-brand-red shadow-sm ring-1 ring-brand-red/10"
                      : "border-gray-200/60 hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  {/* Image Preview / File Icon */}
                  <div className="aspect-square bg-gray-50/50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                    {isImage ? (
                      <img
                        src={getPreviewUrl(m)}
                        alt={m.filename}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <Icon icon="lucide:file-text" className="h-10 w-10 text-gray-400" />
                    )}

                    {/* Quick hover actions in the corner */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1.5 transition-opacity duration-200 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(m.url, m.id);
                        }}
                        className="bg-white hover:bg-gray-50 text-gray-700 p-1.5 rounded-lg border border-gray-200/80 cursor-pointer shadow-xs transition-all"
                        title="Salin Link"
                      >
                        <Icon icon={copiedId === m.id ? "lucide:check" : "lucide:copy"} className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg cursor-pointer shadow-xs transition-all"
                        title="Hapus"
                      >
                        <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* File Metadata */}
                  <div className="p-3 bg-white">
                    <p className="text-[10px] font-bold text-gray-800 truncate" title={m.filename}>
                      {m.filename}
                    </p>
                    <p className="text-[9px] font-semibold text-gray-400 mt-1">
                      {formatBytes(m.size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-750 rounded-lg shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-brand-red border-t-transparent mr-2" />
                  <span>Memuat...</span>
                </>
              ) : (
                <>
                  <span>Muat Lebih Banyak</span>
                  <Icon icon="lucide:chevron-down" className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* File Detail Drawer (Slide-out from Right Viewport) */}
      {selectedMedia && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 bg-black/40 z-[90] transition-opacity duration-300 animate-fade-in"
          />

          {/* Drawer container */}
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white border-l border-gray-100 shadow-2xl z-[100] p-6 flex flex-col justify-between animate-slide-in-right">
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Detail File Media</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">Informasi Aset Visual</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-650 transition-colors p-1.5 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Icon icon="lucide:x" className="h-5 w-5" />
                </button>
              </div>

              {/* High-quality Preview */}
              <div className="aspect-video w-full bg-gray-50/50 border border-gray-200/50 rounded-xl overflow-hidden flex items-center justify-center relative p-3">
                {selectedMedia.mimetype.startsWith("image/") ? (
                  <img src={getPreviewUrl(selectedMedia)} alt={selectedMedia.filename} className="w-full h-full object-contain rounded-lg shadow-xs" />
                ) : (
                  <Icon icon="lucide:file-text" className="h-16 w-16 text-gray-400" />
                )}
              </div>

              {/* Meta details list */}
              <div className="space-y-4 text-xs font-semibold text-gray-600">
                <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200/40">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Nama File</span>
                  <span className="text-gray-800 break-all text-sm font-medium">{selectedMedia.filename}</span>
                </div>
                
                <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200/40">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Tautan Link URL</span>
                  <div className="flex gap-2 mt-1.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedMedia.url}
                      className="bg-white border border-gray-200 text-gray-850 text-xs rounded-lg block w-full p-2 focus:ring-0 focus:border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedMedia.url, selectedMedia.id)}
                      className="bg-brand-red hover:bg-brand-dark text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0"
                      title="Salin Tautan"
                    >
                      <Icon icon={copiedId === selectedMedia.id ? "lucide:check" : "lucide:copy"} className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200/40">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Ukuran</span>
                    <span className="text-gray-800 text-sm font-medium">{formatBytes(selectedMedia.size)}</span>
                  </div>
                  <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200/40">
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Tipe File</span>
                    <span className="text-gray-800 text-sm font-medium uppercase">{selectedMedia.mimetype.split('/')[1]}</span>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200/40">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Tanggal Unggah</span>
                  <span className="text-gray-800 text-sm font-medium">
                    {new Date(selectedMedia.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="pt-4 border-t border-gray-100 flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedMedia.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100/60 border border-red-150 rounded-xl text-xs font-bold text-red-650 transition-all cursor-pointer"
              >
                <Icon icon="lucide:trash-2" className="h-4 w-4" />
                <span>Hapus Aset</span>
              </button>
            </div>
          </div>
        </>
      )}

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
              Apakah Anda yakin ingin menghapus file media ini secara permanen? Tindakan ini tidak dapat dibatalkan.
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
