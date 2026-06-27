"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    document.title = "Profil Saya | Kawruh Admin";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/cms/profile");
      const data = await res.json();
      if (res.ok && data.user) {
        setName(data.user.name);
        setEmail(data.user.email);
      } else {
        toast.error(data.error || "Gagal memuat profil.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat memuat profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Nama dan email wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/cms/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profil berhasil diperbarui!");
        // Notify other elements that the profile changed (e.g. sidebar display)
        window.dispatchEvent(new Event("profile-updated"));
      } else {
        toast.error(data.error || "Gagal memperbarui profil.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua input password wajib diisi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/cms/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Gagal mengubah password.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat mengubah password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-900">Memuat Profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="text-xs font-normal text-gray-400 mt-1">
          Perbarui informasi akun admin Anda dan atur ulang kata sandi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Informasi Profil */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:user" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">
                Ubah Data Diri
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Admin"
                  required
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  required
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:save" className="h-3.5 w-3.5" />
                  <span>Simpan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Card: Reset / Ubah Password */}
        <form
          onSubmit={handleUpdatePassword}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon
                icon="lucide:key-round"
                className="h-4 w-4 text-brand-red"
              />
              <h3 className="text-sm font-bold text-gray-900">
                Ubah Kata Sandi
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pr-10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon
                      icon={showCurrentPass ? "lucide:eye-off" : "lucide:eye"}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pr-10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon
                      icon={showNewPass ? "lucide:eye-off" : "lucide:eye"}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    required
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pr-10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon
                      icon={showConfirmPass ? "lucide:eye-off" : "lucide:eye"}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <span>Mengubah...</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:key" className="h-3.5 w-3.5" />
                  <span>Ubah Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
