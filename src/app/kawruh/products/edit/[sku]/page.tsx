"use client";

import { useEffect, useState, useCallback, useMemo, useRef, use } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { getSavedThemeId, getThemeById } from "@/lib/dashboard-theme";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

interface Category {
  id: number;
  name: string;
}

interface Media {
  id: number;
  filename: string;
  url: string;
  mimetype: string;
}

interface ProductDetail {
  sku: string;
  name: string;
  specs: string;
  accessories: string;
  basePrice: string;
  minOrder: string;
  slug: string;
  shortDesc: string;
  longDesc: string;
  id: number | null;
  featuredImage: string | null;
  categoryId: number | null;
  category: Category | null;
  description: string;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
}

/* ─── Sidebar Section Component ─── */
function SidebarSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 text-xs font-bold text-gray-800 border-b border-gray-100 cursor-pointer"
      >
        <span className="flex items-center space-x-2">
          <Icon icon={icon} className="h-4 w-4 text-gray-400" />
          <span>{title}</span>
        </span>
        <Icon icon="lucide:chevron-down" className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-4 space-y-4 bg-white animate-fade-in">{children}</div>}
    </div>
  );
}

export default function ProductEditPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku: encodedSku } = use(params);
  const sku = decodeURIComponent(encodedSku);

  const { toast } = useToast();
  const router = useRouter();

  // State
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state fields
  const [categoryId, setCategoryId] = useState<string>("");
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [published, setPublished] = useState<boolean>(false);
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");

  // Media picker modal states
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaDragActive, setMediaDragActive] = useState(false);
  const [mediaPage, setMediaPage] = useState(1);

  // Theme support
  const [themeAccent, setThemeAccent] = useState("#ec2028");
  const [themeLight50, setThemeLight50] = useState("#fef2f2");

  useEffect(() => {
    document.title = `Edit Produk ${sku} | Kawruh Admin`;
    const themeId = getSavedThemeId();
    const theme = getThemeById(themeId);
    setThemeAccent(theme.accent);
    setThemeLight50(theme.light50);
  }, [sku]);

  // Fetch product data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catsRes, mediaRes] = await Promise.all([
        fetch(`/api/cms/products/${encodeURIComponent(sku)}`),
        fetch("/api/cms/categories"),
        fetch("/api/cms/media"),
      ]);

      const prodData = await prodRes.json();
      const catsData = await catsRes.json();
      const mediaData = await mediaRes.json();

      if (prodRes.ok && prodData.success) {
        const prod = prodData.product as ProductDetail;
        setProduct(prod);
        setCategoryId(prod.categoryId ? prod.categoryId.toString() : "");
        setFeaturedImage(prod.featuredImage || "");
        setDescription(prod.description || "");
        setPublished(prod.published || false);
        setMetaTitle(prod.metaTitle || "");
        setMetaDescription(prod.metaDescription || "");
      } else {
        toast.error(prodData.error || "Gagal memuat produk.");
        router.push("/kawruh/products");
      }

      if (catsRes.ok) {
        setCategories(catsData.categories || []);
      }
      if (mediaRes.ok) {
        setMediaList(mediaData.mediaList || []);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }, [sku, router, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Media picker paging
  const imagesOnly = useMemo(() => mediaList.filter((m) => m.mimetype.startsWith("image/")), [mediaList]);
  const totalPages = Math.ceil(imagesOnly.length / 20);
  const paginatedImages = useMemo(() => {
    const start = (mediaPage - 1) * 20;
    return imagesOnly.slice(start, start + 20);
  }, [imagesOnly, mediaPage]);

  // Handle Media file upload
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
        setFeaturedImage(data.media.url);
        toast.success("Gambar berhasil diunggah!");
      } else {
        toast.error(data.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop inside Media Modal
  const handleMediaDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setMediaDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      await handleMediaUpload(e.dataTransfer.files[0]);
    }
  };

  // Form Save Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/products/${encodeURIComponent(sku)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryId ? parseInt(categoryId, 10) : null,
          featuredImage: featuredImage || null,
          description,
          published,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Pengayaan produk berhasil disimpan!");
      } else {
        toast.error(data.error || "Gagal menyimpan pengayaan produk.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // Quill configuration modules
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "clean"],
      ],
    }),
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{ borderColor: `${themeAccent} transparent ${themeAccent} transparent` }}
          />
          <p className="text-sm font-bold text-gray-900">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/kawruh/products"
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 shadow-xs transition-colors shrink-0"
          >
            <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[300px] leading-tight">
              Edit Pengayaan Produk
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-semibold">
              SKU: <span className="font-mono font-bold text-gray-600">{product.sku}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors"
            style={{ backgroundColor: themeAccent }}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Icon icon="lucide:save" className="h-3.5 w-3.5" />
                <span>Simpan Pengayaan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spreadsheet Specs & Rich Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Read Only Spreadsheet Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center space-x-2">
                <Icon icon="logos:google-sheets" className="h-4 w-4 shrink-0" />
                <span>Data Asli Google Spreadsheet (Read-Only)</span>
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Tersambung
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Nama Produk
                  </label>
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-gray-900 font-bold">
                    {product.name}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Harga Dasar
                  </label>
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-gray-800 font-bold">
                    {product.basePrice}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-gray-650 font-mono">
                    {product.slug || <span className="italic text-gray-300">Tidak ada slug</span>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Deskripsi Singkat (Spreadsheet)
                  </label>
                  <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg text-gray-600 leading-relaxed font-sans">
                    {product.shortDesc || <span className="italic text-gray-300">Tidak ada deskripsi singkat</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Deskripsi Lengkap & Detail (Rich Text)
              </label>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">
                Tulis deskripsi produk yang lengkap dan menarik untuk ditampilkan di halaman web detail produk.
              </p>
            </div>
            <div className="prose max-w-none">
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                modules={quillModules}
                className="h-64 mb-12"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Category, Image, SEO */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section: Status & Kategori */}
          <SidebarSection title="Status & Kategori" icon="lucide:tag">
            {/* Status Switch */}
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-gray-800">Tampilkan di Web</div>
                <div className="text-[10px] text-gray-400 font-semibold">Tampilkan produk ini di katalog publik.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"
                  style={published ? { backgroundColor: themeAccent } : {}}
                />
              </label>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Kategori Produk (Lokal)
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:ring-brand-red focus:border-brand-red cursor-pointer"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </SidebarSection>

          {/* Section: Gambar Unggulan */}
          <SidebarSection title="Gambar Unggulan" icon="lucide:image">
            <div
              onClick={() => setMediaModalOpen(true)}
              className="border border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer bg-gray-50 hover:bg-gray-100/50 hover:border-gray-300 transition-all flex flex-col items-center justify-center min-h-[140px] relative"
            >
              {featuredImage ? (
                <div className="w-full h-full relative group">
                  <img src={featuredImage} alt="Featured" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 text-white space-y-1">
                    <Icon icon="lucide:image" className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Ganti Gambar</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto text-gray-400">
                    <Icon icon="lucide:image-plus" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-700">Pilih dari Media Library</p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Mendukung format PNG, JPG, WEBP</p>
                  </div>
                </div>
              )}
            </div>
            {featuredImage && (
              <button
                type="button"
                onClick={() => setFeaturedImage("")}
                className="w-full py-1.5 bg-red-50 hover:bg-red-100/60 border border-red-100 text-red-650 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center"
              >
                Hapus Gambar
              </button>
            )}
          </SidebarSection>

          {/* Section: Optimasi SEO */}
          <SidebarSection title="Optimasi SEO" icon="lucide:search">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Judul SEO..."
                className="bg-gray-50 border border-gray-200 text-gray-950 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Deskripsi SEO..."
                rows={3}
                className="bg-gray-50 border border-gray-200 text-gray-950 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 resize-none leading-relaxed"
              />
            </div>
          </SidebarSection>
        </div>
      </div>

      {/* Media Library Modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-150 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Pilih Gambar dari Media Library</h3>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-50"
              >
                <Icon icon="lucide:x" className="h-4 w-4" />
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={() => setMediaDragActive(true)}
              onDragOver={(e) => { e.preventDefault(); setMediaDragActive(true); }}
              onDragLeave={() => setMediaDragActive(false)}
              onDrop={handleMediaDrop}
              className={`mx-5 mt-3 border border-dashed rounded-lg p-3 text-center text-xs font-medium transition-all shrink-0 ${
                mediaDragActive ? "border-brand-red bg-brand-light-50" : "border-gray-200 text-gray-400"
              }`}
            >
              <input
                id="modal-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files) {
                    for (const file of Array.from(e.target.files)) await handleMediaUpload(file);
                  }
                }}
              />
              <label htmlFor="modal-file-input" className="cursor-pointer text-brand-red font-bold hover:underline" style={{ color: themeAccent }}>
                Klik untuk unggah
              </label>{" "}
              atau seret file gambar di sini
              {uploading && <span className="ml-2 text-gray-400 font-bold">Mengunggah...</span>}
            </div>

            {/* Split Body */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-0 justify-between">
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-7 w-7 border-4 border-t-transparent animate-spin" style={{ borderColor: `${themeAccent} transparent ${themeAccent} transparent` }} />
                  </div>
                ) : imagesOnly.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Icon icon="lucide:image" className="h-10 w-10 text-gray-200 mx-auto" />
                    <p className="text-sm text-gray-400 font-medium">Belum ada gambar di media library.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {paginatedImages.map((m) => {
                        const isSelected = featuredImage === m.url;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setFeaturedImage(m.url);
                              setMediaModalOpen(false);
                            }}
                            className={`group aspect-square bg-gray-50 rounded-lg overflow-hidden border transition-all relative cursor-pointer ${
                              isSelected ? "border-brand-red ring-2 ring-brand-red/20" : "border-transparent hover:border-brand-red"
                            }`}
                            style={isSelected ? { borderColor: themeAccent, boxShadow: `0 0 0 2px ${themeAccent}33` } : undefined}
                            title={m.filename}
                          >
                            <img src={m.url} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className={`absolute inset-0 transition-colors flex items-center justify-center ${
                              isSelected ? "bg-brand-red/10" : "bg-black/0 group-hover:bg-black/20"
                            }`}>
                              <Icon
                                icon="lucide:check-circle"
                                className={`h-6 w-6 text-white drop-shadow-md transition-opacity ${
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-gray-150 pt-4 mt-4 shrink-0">
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
    </form>
  );
}
