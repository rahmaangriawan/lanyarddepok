"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export default function FormulirSubmissionsPage() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries || []);
      } else {
        toast.error(data.error || "Gagal memuat pesan masuk.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat memuat data pesan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Pesan Masuk (Formulir) | Kawruh Admin";
    fetchInquiries();
  }, []);

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInquiryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/inquiries/${inquiryToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Pesan masuk berhasil dihapus.");
        setDeleteConfirmOpen(false);
        setInquiryToDelete(null);
        if (selectedInquiry?.id === inquiryToDelete) {
          setSelectedInquiry(null);
        }
        fetchInquiries();
      } else {
        toast.error(data.error || "Gagal menghapus pesan.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan saat menghapus pesan.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const query = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(query) ||
      inq.email.toLowerCase().includes(query) ||
      inq.phone.toLowerCase().includes(query) ||
      inq.message.toLowerCase().includes(query)
    );
  });

  // Helper to format WhatsApp link
  const getWhatsAppLink = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Pesan Masuk (Formulir)
          </h1>
          <p className="text-xs font-normal text-gray-400 mt-1">
            Lihat dan kelola seluruh pesan serta inquiries dari calon pelanggan yang dikirim via website.
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Pesan</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{inquiries.length}</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded-full text-gray-500 flex items-center justify-center">
            <Icon icon="lucide:mail" className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Pesan Hari Ini</span>
            <h3 className="text-2xl font-extrabold text-brand-red">
              {inquiries.filter((inq) => {
                const today = new Date().toDateString();
                const itemDate = new Date(inq.createdAt).toDateString();
                return today === itemDate;
              }).length}
            </h3>
          </div>
          <div className="bg-brand-light-50 p-3 rounded-full text-brand-red flex items-center justify-center">
            <Icon icon="lucide:sparkles" className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Header */}
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Cari nama, email, phone, pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold rounded-lg focus:ring-brand-red focus:border-brand-red block w-full pl-9 pr-3 py-2.5 outline-none"
            />
            <Icon icon="lucide:search" className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
            <p className="text-xs font-bold text-gray-400">Memuat pesan masuk...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <Icon icon="lucide:mail-question" className="h-10 w-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">Tidak ada pesan</h4>
            <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
              Tidak ada pesan masuk dari formulir website yang cocok dengan pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th className="px-6 py-3 w-48">Pengirim</th>
                  <th className="px-6 py-3 w-40">Kontak</th>
                  <th className="px-6 py-3">Pesan / Inquiry</th>
                  <th className="px-6 py-3 text-right w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-500 font-medium">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className="bg-white hover:bg-gray-55 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900 line-clamp-1">{inq.name}</div>
                        <div className="text-[9px] text-gray-400 font-semibold">
                          {new Date(inq.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Jakarta",
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1" onClick={(e) => e.stopPropagation()}>
                      <div className="text-[10px] text-gray-600 font-mono truncate">{inq.email}</div>
                      <a
                        href={getWhatsAppLink(inq.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold space-x-1"
                      >
                        <Icon icon="logos:whatsapp-icon" className="h-3.5 w-3.5" />
                        <span>{inq.phone}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 font-medium line-clamp-2 leading-relaxed max-w-xl">
                        {inq.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex space-x-2">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="inline-flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Icon icon="lucide:eye" className="h-3.5 w-3.5" />
                          <span className="ml-1 text-[10px]">Lihat</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(inq.id, e)}
                          className="inline-flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title="Hapus Pesan"
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

      {/* Message Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full border border-gray-200 shadow-xl space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-brand-red">
                <Icon icon="lucide:mail" className="h-5 w-5" />
                <h3 className="text-base font-bold text-gray-900">Detail Pesan Masuk</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Nama Pengirim</span>
                <span className="col-span-2 font-bold text-gray-900">{selectedInquiry.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Email</span>
                <span className="col-span-2 font-mono text-gray-900">{selectedInquiry.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">No. Telepon / WA</span>
                <span className="col-span-2 font-bold text-gray-900">
                  <a
                    href={getWhatsAppLink(selectedInquiry.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-emerald-600 hover:underline gap-1"
                  >
                    <Icon icon="logos:whatsapp-icon" className="h-3.5 w-3.5" />
                    {selectedInquiry.phone}
                  </a>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-50">
                <span className="font-bold text-gray-500">Tanggal Kirim</span>
                <span className="col-span-2 font-semibold text-gray-900">
                  {new Date(selectedInquiry.createdAt).toLocaleString("id-ID", {
                    dateStyle: "long",
                    timeStyle: "medium",
                    timeZone: "Asia/Jakarta",
                  })}
                </span>
              </div>
              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-gray-500 block">Isi Pesan</span>
                <div className="bg-gray-50 p-4 rounded-xl text-gray-800 text-xs font-semibold leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto border border-gray-150">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-gray-100">
              <a
                href={`mailto:${selectedInquiry.email}`}
                className="flex-1 inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-xs uppercase cursor-pointer text-center gap-1.5"
              >
                <Icon icon="lucide:mail" className="h-4 w-4" />
                Balas Email
              </a>
              <a
                href={getWhatsAppLink(selectedInquiry.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase cursor-pointer text-center gap-1.5"
              >
                <Icon icon="logos:whatsapp-icon" className="h-4 w-4 filter brightness-0 invert" />
                Hubungi WA
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-200 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-2.5 bg-red-50 rounded-full">
                <Icon icon="lucide:alert-triangle" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hapus Pesan Masuk?</h3>
            </div>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Pesan ini akan dihapus secara permanen dari database.
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
