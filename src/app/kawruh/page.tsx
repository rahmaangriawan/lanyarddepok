"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";

interface Order {
  id: number;
  lanyardWidth: string;
  printingType: string;
  attachment: string;
  quantity: number;
  totalPrice: number;
  status: string;
  notes: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();

      if (ordersRes.ok) {
        setOrders(ordersData.orders || []);
      } else {
        toast.error(ordersData.error || "Gagal memuat daftar pesanan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manajemen Pesanan | Kawruh Admin";
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`Status pesanan #PG-${orderId} berhasil diperbarui!`);
      } else {
        toast.error(data.error || "Gagal mengubah status.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat memperbarui status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Stats calculation
  const totalSpend = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingCount = orders.filter((o) => o.status.toUpperCase() === "PENDING").length;
  const activeCount = orders.filter(
    (o) => o.status.toUpperCase() !== "PENDING" && o.status.toUpperCase() !== "COMPLETED"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-900">Memuat Pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Manajemen Pesanan</h1>
        <p className="text-xs font-normal text-gray-400 mt-1">
          Pantau dan kelola transaksi pesanan lanyard dari pelanggan.
        </p>
      </div>

      {/* Alerts removed (migrated to Toast notifications) */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Pesanan</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{orders.length}</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded-full text-gray-500 flex items-center justify-center">
            <Icon icon="lucide:shopping-bag" className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Menunggu Verifikasi</span>
            <h3 className="text-2xl font-extrabold text-yellow-600">{pendingCount}</h3>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full text-yellow-600 flex items-center justify-center">
            <Icon icon="lucide:clock" className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Sedang Diproses</span>
            <h3 className="text-2xl font-extrabold text-indigo-600">{activeCount}</h3>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 flex items-center justify-center">
            <Icon icon="lucide:package" className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total Pendapatan</span>
            <h3 className="text-2xl font-extrabold text-brand-red">{formatRupiah(totalSpend)}</h3>
          </div>
          <div className="bg-brand-light-50 p-3 rounded-full text-brand-red flex items-center justify-center">
            <Icon icon="lucide:dollar-sign" className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-bold text-gray-900">Daftar Transaksi Masuk</h3>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="bg-brand-light-100 h-12 w-12 rounded-full flex items-center justify-center text-brand-red mx-auto">
              <Icon icon="lucide:package" className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Belum ada pesanan masuk</h4>
            <p className="text-xs font-medium text-gray-500">
              Transaksi pesanan lanyard akan muncul di sini setelah pelanggan memesan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Spesifikasi Lanyard</th>
                  <th className="px-6 py-3 text-center">Jumlah</th>
                  <th className="px-6 py-3 text-right">Total Biaya</th>
                  <th className="px-6 py-3 text-center">Status Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-500 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">#PG-{o.id}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center space-x-1 whitespace-nowrap">
                        <Icon icon="lucide:calendar" className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{new Date(o.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" })}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {o.user ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-900">{o.user.name}</div>
                          <div className="text-[10px] text-gray-400 font-semibold">{o.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Umum</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="font-bold text-gray-950">{o.printingType}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">
                        Lebar: {o.lanyardWidth} | Aksesoris: {o.attachment}
                      </div>
                      {o.notes && (
                        <div className="flex items-center space-x-1 text-[10px] text-red-800 bg-red-50 p-1.5 rounded-lg border border-red-100 max-w-xs">
                          <Icon icon="lucide:info" className="h-3 w-3 shrink-0" />
                          <span className="truncate">{o.notes}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-955">{o.quantity} Pcs</td>
                    <td className="px-6 py-4 text-right font-extrabold text-gray-955">{formatRupiah(o.totalPrice)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-block relative">
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-[11px] font-bold rounded-lg focus:ring-brand-red focus:border-brand-red block p-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                        >
                          <option value="PENDING">Menunggu Verifikasi</option>
                          <option value="APPROVED">Layout Disetujui</option>
                          <option value="PRODUCING">Sedang Diproduksi</option>
                          <option value="SHIPPED">Dalam Pengiriman</option>
                          <option value="COMPLETED">Selesai</option>
                        </select>
                        {updatingId === o.id && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-red border-t-transparent" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
