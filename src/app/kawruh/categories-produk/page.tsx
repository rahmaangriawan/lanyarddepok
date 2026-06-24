"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: string;
  createdAt: string;
}

export default function ProductCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("PRODUCT");
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/cms/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      } else {
        toast.error(data.error || "Gagal memuat kategori.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat memuat kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Kategori Produk | Kawruh Admin";
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setType("PRODUCT");
  };

  const handleEditClick = (c: Category) => {
    setEditId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || "");
    setType(c.type);
  };

  const productCategories = useMemo(() => {
    return categories.filter((c) => c.type === "PRODUCT");
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);

    const url = editId ? `/api/cms/categories/${editId}` : "/api/cms/categories";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, type }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(editId ? "Kategori produk berhasil diperbarui!" : "Kategori produk berhasil ditambahkan!");
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.error || "Gagal menyimpan kategori.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    try {
      const res = await fetch(`/api/cms/categories/${itemToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Kategori produk berhasil dihapus!");
        fetchCategories();
      } else {
        toast.error(data.error || "Gagal menghapus kategori.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menghapus.");
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
          <p className="text-sm font-bold text-gray-955">Memuat Kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Kategori Produk</h1>
        <p className="text-xs font-normal text-gray-400 mt-1">
          Kelola kategori untuk pengorganisasian produk lanyard Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 shadow-xs h-fit">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            {editId ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Nama Kategori
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Lanyard Woven"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Slug (Opsional)
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lanyard-woven"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Deskripsi
              </label>
              <textarea
                id="description"
                rows={3}
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat kategori produk..."
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 text-white bg-brand-red hover:bg-brand-dark focus:ring-4 focus:ring-red-300 font-bold rounded-lg text-xs px-4 py-2.5 text-center disabled:opacity-50 uppercase cursor-pointer"
              >
                {saving ? "Menyimpan..." : editId ? "Perbarui" : "Tambah Baru"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs px-4 py-2.5 text-center cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-bold text-gray-900">Daftar Kategori Produk</h3>
          </div>
          {productCategories.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Icon icon="lucide:tag" className="h-10 w-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900">Belum ada kategori produk</h4>
              <p className="text-xs font-medium text-gray-500">
                Buat kategori baru menggunakan formulir di sebelah kiri.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Deskripsi</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs text-gray-500 font-medium">
                  {productCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500">{c.slug}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{c.description || "-"}</td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="text-blue-600 hover:text-blue-800 font-bold p-1"
                          title="Edit"
                        >
                          <Icon icon="lucide:edit-2" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-800 font-bold p-1"
                          title="Hapus"
                        >
                          <Icon icon="lucide:trash-2" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
              Apakah Anda yakin ingin menghapus kategori produk ini secara permanen? Tindakan ini tidak dapat dibatalkan.
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
