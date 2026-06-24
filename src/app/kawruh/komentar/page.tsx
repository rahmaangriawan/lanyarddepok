"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import Link from "next/link";

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
  post: {
    id: number;
    title: string;
    slug: string;
  };
}

export default function CommentsModerationPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

  // Deletion modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/cms/comments");
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      } else {
        toast.error(data.error || "Gagal memuat komentar.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat memuat komentar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Moderasi Komentar | Kawruh Admin";
    fetchComments();
  }, []);

  const handleToggleApproval = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/cms/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(
          currentStatus
            ? "Komentar berhasil disembunyikan dari publik."
            : "Komentar berhasil disetujui dan kini tampil publik."
        );
        fetchComments();
      } else {
        toast.error(data.error || "Gagal memperbarui status komentar.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat memperbarui status komentar.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setCommentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/cms/comments/${commentToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Komentar berhasil dihapus permanen.");
        setDeleteConfirmOpen(false);
        setCommentToDelete(null);
        fetchComments();
      } else {
        toast.error(data.error || "Gagal menghapus komentar.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat menghapus komentar.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.content.toLowerCase().includes(query) ||
      c.post.title.toLowerCase().includes(query);

    if (statusFilter === "approved") {
      return matchesSearch && c.approved;
    }
    if (statusFilter === "pending") {
      return matchesSearch && !c.approved;
    }
    return matchesSearch;
  });

  // Stats
  const totalComments = comments.length;
  const approvedCount = comments.filter((c) => c.approved).length;
  const pendingCount = comments.filter((c) => !c.approved).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Moderasi Komentar Blog
          </h1>
          <p className="text-xs font-normal text-gray-400 mt-1">
            Kelola ulasan dan komentar kiriman pengunjung di seluruh artikel blog Anda.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Komentar</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{totalComments}</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded-full text-gray-500 flex items-center justify-center">
            <Icon icon="lucide:message-square" className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Telah Disetujui</span>
            <h3 className="text-2xl font-extrabold text-emerald-600">{approvedCount}</h3>
          </div>
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 flex items-center justify-center">
            <Icon icon="lucide:check-circle" className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Menunggu Moderasi</span>
            <h3 className="text-2xl font-extrabold text-amber-600">{pendingCount}</h3>
          </div>
          <div className="bg-amber-50 p-3 rounded-full text-amber-600 flex items-center justify-center">
            <Icon icon="lucide:clock" className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        {/* Controls Header */}
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari komentar, nama, atau artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold rounded-lg focus:ring-brand-red focus:border-brand-red block w-full pl-9 pr-3 py-2.5 outline-none"
            />
            <Icon icon="lucide:search" className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-brand-red text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-55"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-brand-red text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-55"
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "approved"
                  ? "bg-brand-red text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-55"
              }`}
            >
              Disetujui ({approvedCount})
            </button>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
            <p className="text-xs font-bold text-gray-400">Memuat komentar...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <Icon icon="lucide:message-square-off" className="h-10 w-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">Komentar tidak ditemukan</h4>
            <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
              Tidak ada komentar yang cocok dengan filter atau pencarian Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th className="px-6 py-3 w-48">Pengirim</th>
                  <th className="px-6 py-3">Isi Komentar</th>
                  <th className="px-6 py-3 w-52">Artikel Tujuan</th>
                  <th className="px-6 py-3 w-32">Status</th>
                  <th className="px-6 py-3 text-right w-44">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-500 font-medium">
                {filteredComments.map((c) => (
                  <tr key={c.id} className="bg-white hover:bg-gray-55 transition-colors">
                    {/* Author Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-bold text-gray-900 line-clamp-1">{c.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate">{c.email}</div>
                        <div className="text-[9px] text-gray-400 font-semibold mt-1">
                          {new Date(c.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Jakarta",
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4">
                      <p className="text-gray-700 font-medium whitespace-pre-line line-clamp-3 leading-relaxed max-w-lg">
                        {c.content}
                      </p>
                    </td>

                    {/* Post Context */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/blog/${c.post.slug}`}
                        target="_blank"
                        className="text-brand-red font-bold hover:underline line-clamp-2 leading-snug flex items-center space-x-1"
                      >
                        <span>{c.post.title}</span>
                        <Icon icon="lucide:external-link" className="h-3 w-3 shrink-0 opacity-50" />
                      </Link>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.approved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${c.approved ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {c.approved ? "Disetujui" : "Menunggu"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex space-x-2">
                        <button
                          onClick={() => handleToggleApproval(c.id, c.approved)}
                          className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            c.approved
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-600"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                          }`}
                          title={c.approved ? "Sembunyikan Komentar" : "Setujui Komentar"}
                        >
                          <Icon icon={c.approved ? "lucide:eye-off" : "lucide:check"} className="h-3.5 w-3.5" />
                          <span className="ml-1 text-[10px]">{c.approved ? "Sembunyikan" : "Setujui"}</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(c.id)}
                          className="inline-flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title="Hapus Komentar"
                        >
                          <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                          <span className="ml-1 text-[10px]">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-2.5 bg-red-50 rounded-full">
                <Icon icon="lucide:alert-triangle" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Komentar?</h3>
            </div>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Komentar yang dihapus akan hilang secara permanen dari database.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
