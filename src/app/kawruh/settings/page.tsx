"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import {
  dashboardThemes,
  getSavedThemeId,
  saveThemeId,
  getThemeById,
} from "@/lib/dashboard-theme";

interface SettingsState {
  site_title: string;
  site_description: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_address: string;
  seo_meta_title: string;
  seo_meta_description: string;
  bing_site_verification: string;
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
  footer_text: string;
  google_service_account_json: string;
  google_analytics_property_id: string;
  google_search_console_site_url: string;
  google_analytics_measurement_id: string;
  google_spreadsheet_id: string;
  google_spreadsheet_range: string;
  seo_auto_links: string;
  seo_auto_links_limit: string;
}

const defaultSettings: SettingsState = {
  site_title: "",
  site_description: "",
  contact_phone: "",
  contact_whatsapp: "",
  contact_email: "",
  contact_address: "",
  seo_meta_title: "",
  seo_meta_description: "",
  bing_site_verification: "",
  social_instagram: "",
  social_facebook: "",
  social_tiktok: "",
  footer_text: "",
  google_service_account_json: "",
  google_analytics_property_id: "",
  google_search_console_site_url: "",
  google_analytics_measurement_id: "",
  google_spreadsheet_id: "",
  google_spreadsheet_range: "",
  seo_auto_links: "",
  seo_auto_links_limit: "2",
};

const tabs = [
  { id: "umum", name: "Umum", icon: "lucide:globe" },
  { id: "kontak", name: "Kontak", icon: "lucide:phone" },
  { id: "seo", name: "SEO", icon: "lucide:search" },
  { id: "sosial", name: "Sosial", icon: "lucide:share-2" },
  { id: "tampilan", name: "Tampilan", icon: "lucide:palette" },
  { id: "integrasi", name: "Integrasi Google", icon: "lucide:cpu" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("umum");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoLinks, setAutoLinks] = useState<{ keyword: string; url: string }[]>([]);

  // Theme
  const [selectedTheme, setSelectedTheme] = useState("red");
  const [jsonDragActive, setJsonDragActive] = useState(false);

  useEffect(() => {
    if (settings.seo_auto_links) {
      try {
        const parsed = JSON.parse(settings.seo_auto_links);
        if (Array.isArray(parsed)) {
          setAutoLinks(parsed);
        }
      } catch (e) {
        console.error("Failed to parse auto links settings", e);
      }
    } else {
      setAutoLinks([]);
    }
  }, [settings.seo_auto_links]);

  const handleJsonFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      toast.error("Format berkas harus berupa .json");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        if (parsed.type !== "service_account" || !parsed.client_email || !parsed.private_key) {
          toast.error("Berkas JSON bukan Google Service Account yang valid.");
          return;
        }
        handleChange("google_service_account_json", text);
        toast.success("Berkas JSON Service Account berhasil dimuat!");
      } catch (err) {
        toast.error("Gagal membaca berkas: Format JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    document.title = "Pengaturan | Kawruh Admin";
    setSelectedTheme(getSavedThemeId());
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/cms/settings");
        const data = await res.json();
        if (res.ok && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          setOriginalSettings({ ...defaultSettings, ...data.settings });
        }
      } catch (err) {
        toast.error("Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddAutoLink = () => {
    const newLinks = [...autoLinks, { keyword: "", url: "" }];
    setAutoLinks(newLinks);
    setSettings((prev) => ({ ...prev, seo_auto_links: JSON.stringify(newLinks) }));
  };

  const handleRemoveAutoLink = (index: number) => {
    const newLinks = autoLinks.filter((_, i) => i !== index);
    setAutoLinks(newLinks);
    setSettings((prev) => ({ ...prev, seo_auto_links: JSON.stringify(newLinks) }));
  };

  const handleEditAutoLink = (index: number, field: "keyword" | "url", value: string) => {
    const newLinks = autoLinks.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setAutoLinks(newLinks);
    setSettings((prev) => ({ ...prev, seo_auto_links: JSON.stringify(newLinks) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/cms/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Pengaturan berhasil disimpan.");
        setOriginalSettings({ ...settings });
      } else {
        toast.error(data.error || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeSelect = (id: string) => {
    setSelectedTheme(id);
    saveThemeId(id);
    window.dispatchEvent(new Event("theme-changed"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-900">Memuat Pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Pengaturan</h1>
        <p className="text-xs font-normal text-gray-400 mt-1">
          Konfigurasi situs, kontak, SEO, media sosial, dan tampilan dashboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon icon={tab.icon} className="h-3.5 w-3.5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Alerts removed (migrated to Toast notifications) */}

      {/* Tab: Umum */}
      {activeTab === "umum" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:globe" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">Informasi Umum</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Nama Situs</label>
                <input type="text" value={settings.site_title} onChange={(e) => handleChange("site_title", e.target.value)} placeholder="Lanyard Jakarta" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Deskripsi Situs</label>
                <textarea rows={3} value={settings.site_description} onChange={(e) => handleChange("site_description", e.target.value)} placeholder="Cetak lanyard custom terbaik di Jakarta..." className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Teks Footer</label>
                <input type="text" value={settings.footer_text} onChange={(e) => handleChange("footer_text", e.target.value)} placeholder="© 2026 Lanyard Jakarta. All rights reserved." className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors">
              {saving ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /><span>Menyimpan...</span></> : <><Icon icon="lucide:save" className="h-3.5 w-3.5" /><span>Simpan</span></>}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Kontak */}
      {activeTab === "kontak" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:phone" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">Informasi Kontak</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">No. Telepon</label>
                <input type="text" value={settings.contact_phone} onChange={(e) => handleChange("contact_phone", e.target.value)} placeholder="+62 822-1020-0700" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">No. WhatsApp</label>
                <input type="text" value={settings.contact_whatsapp} onChange={(e) => handleChange("contact_whatsapp", e.target.value)} placeholder="6282210200700" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" value={settings.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} placeholder="cs@jakartalanyard.com" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Alamat</label>
                <input type="text" value={settings.contact_address} onChange={(e) => handleChange("contact_address", e.target.value)} placeholder="Jl. Contoh No. 123, Jakarta" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors">
              {saving ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /><span>Menyimpan...</span></> : <><Icon icon="lucide:save" className="h-3.5 w-3.5" /><span>Simpan</span></>}
            </button>
          </div>
        </form>
      )}

      {/* Tab: SEO */}
      {activeTab === "seo" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:search" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">SEO & Meta Tags</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50/50 border border-amber-150 rounded-xl p-4 text-xs text-amber-800 space-y-1 leading-relaxed font-medium">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Icon icon="lucide:info" className="h-4 w-4 text-amber-600" />
                  <span>Tentang Site Title</span>
                </div>
                <p>Site Title akan otomatis ditambahkan sebagai suffix di semua halaman. Contoh: <strong>&quot;Cara Pemesanan - Lanyard Jakarta&quot;</strong>. Meta Title di bawah digunakan khusus untuk halaman utama (homepage).</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Site Title (Nama Situs)</label>
                <input type="text" value={settings.site_title} onChange={(e) => handleChange("site_title", e.target.value)} placeholder="Lanyard Jakarta" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Digunakan sebagai suffix judul di semua halaman (contoh: &quot;Nama Halaman - {settings.site_title || 'Lanyard Jakarta'}&quot;).</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Meta Title (Homepage)</label>
                <input type="text" value={settings.seo_meta_title} onChange={(e) => handleChange("seo_meta_title", e.target.value)} placeholder="Lanyard Jakarta | Cetak Lanyard Custom Online" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Judul khusus untuk halaman utama. Rekomendasi: 50–60 karakter. Saat ini: {settings.seo_meta_title.length} karakter.</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Meta Description</label>
                <textarea rows={3} value={settings.seo_meta_description} onChange={(e) => handleChange("seo_meta_description", e.target.value)} placeholder="Cetak lanyard custom terbaik dengan kualitas premium..." className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Rekomendasi: 150–160 karakter. Saat ini: {settings.seo_meta_description.length} karakter.</p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Bing Site Verification</label>
                <input type="text" value={settings.bing_site_verification || ""} onChange={(e) => handleChange("bing_site_verification", e.target.value)} placeholder="Contoh: xml tag content (misal: 1234567890ABCDEF)" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Sertakan kode verifikasi Bing Webmaster Tools Anda.</p>
              </div>
            </div>
          </div>

          {/* Auto-Link SEO Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon icon="lucide:link" className="h-4 w-4 text-brand-red" />
                <h3 className="text-sm font-bold text-gray-900">Auto-Link SEO (Internal Link)</h3>
              </div>
              <button
                type="button"
                onClick={handleAddAutoLink}
                className="flex items-center space-x-1 px-3 py-1.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors uppercase"
              >
                <Icon icon="lucide:plus" className="h-3 w-3" />
                <span>Tambah Kata Kunci</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                Tentukan daftar kata kunci yang akan secara otomatis diubah menjadi tautan internal ketika ditulis di dalam artikel blog Anda.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Maksimal Kemunculan Tautan per Kata Kunci</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={settings.seo_auto_links_limit || "2"}
                  onChange={(e) => handleChange("seo_auto_links_limit", e.target.value)}
                  placeholder="Batasi kemunculan tautan untuk keyword yang sama..."
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Batasi berapa kali kata kunci yang sama akan secara otomatis diubah menjadi link di dalam satu artikel (default: 2).</p>
              </div>

              <div className="border-t border-gray-100 my-4" />

              {autoLinks.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-400">Belum ada kata kunci terdaftar.</p>
                  <button
                    type="button"
                    onClick={handleAddAutoLink}
                    className="text-xs text-brand-red hover:underline font-bold mt-1 inline-flex items-center space-x-1"
                  >
                    <span>Buat kata kunci pertama</span>
                    <Icon icon="lucide:arrow-right" className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {autoLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Kata Kunci (Keyword)</label>
                          <input
                            type="text"
                            value={link.keyword}
                            onChange={(e) => handleEditAutoLink(index, "keyword", e.target.value)}
                            placeholder="Contoh: lanyard custom"
                            className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Target URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleEditAutoLink(index, "url", e.target.value)}
                            placeholder="Contoh: /#calculator atau /blog/..."
                            className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAutoLink(index)}
                        className="text-gray-450 hover:text-brand-red p-1.5 rounded-lg hover:bg-red-50 mt-4 transition-colors"
                        title="Hapus Kata Kunci"
                      >
                        <Icon icon="lucide:trash-2" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors">
              {saving ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /><span>Menyimpan...</span></> : <><Icon icon="lucide:save" className="h-3.5 w-3.5" /><span>Simpan</span></>}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Sosial */}
      {activeTab === "sosial" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:share-2" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">Media Sosial</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Instagram</label>
                <input type="text" value={settings.social_instagram} onChange={(e) => handleChange("social_instagram", e.target.value)} placeholder="https://instagram.com/lanyardjakarta" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Facebook</label>
                <input type="text" value={settings.social_facebook} onChange={(e) => handleChange("social_facebook", e.target.value)} placeholder="https://facebook.com/lanyardjakarta" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">TikTok</label>
                <input type="text" value={settings.social_tiktok} onChange={(e) => handleChange("social_tiktok", e.target.value)} placeholder="https://tiktok.com/@lanyardjakarta" className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center space-x-2 px-6 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors">
              {saving ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /><span>Menyimpan...</span></> : <><Icon icon="lucide:save" className="h-3.5 w-3.5" /><span>Simpan</span></>}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Tampilan */}
      {activeTab === "tampilan" && (
        <div className="space-y-5">
          {/* Live Preview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:eye" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">Preview Tampilan</h3>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-start space-x-4">
                {/* Mini sidebar mockup */}
                <div className="w-44 shrink-0 bg-white rounded-lg border border-gray-200 p-3 space-y-1.5">
                  {["Dashboard", "Blog Posts", "Media"].map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-[10px] font-semibold"
                      style={
                        i === 0
                          ? {
                              backgroundColor: getThemeById(selectedTheme).light50,
                              color: getThemeById(selectedTheme).accent,
                            }
                          : { color: "#9ca3af" }
                      }
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={
                          i === 0
                            ? {
                                backgroundColor: "#fff",
                                border: `1px solid ${getThemeById(selectedTheme).light200}`,
                              }
                            : { backgroundColor: "#f3f4f6" }
                        }
                      >
                        <Icon
                          icon={i === 0 ? "lucide:layout-dashboard" : i === 1 ? "lucide:file-text" : "lucide:image"}
                          className="h-2.5 w-2.5"
                        />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {/* Mini content mockup */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div
                      className="h-7 w-28 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: getThemeById(selectedTheme).accent }}
                    >
                      + Buat Baru
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-3 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:palette" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">Pilih Warna Aksen</h3>
            </div>
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <p className="text-xs text-gray-400 font-medium">
                  Warna yang dipilih akan langsung diterapkan pada seluruh elemen dashboard — sidebar, tombol, badge, dan indikator aktif.
                </p>
                <div className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-150 flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
                  <span>Tema Aktif:</span>
                  <span style={{ color: getThemeById(selectedTheme).accent }}>
                    {getThemeById(selectedTheme).name}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-3">
                {dashboardThemes.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeSelect(theme.id)}
                      title={theme.name}
                      className="group relative aspect-square rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      style={{
                        borderColor: isSelected ? theme.accent : "#e5e7eb",
                        backgroundColor: isSelected ? theme.light50 : "#fff",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-sm transition-transform group-hover:scale-105 flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.accent }}
                      >
                        {isSelected && <Icon icon="lucide:check" className="h-4.5 w-4.5 drop-shadow-sm font-bold" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Integrasi Google */}
      {activeTab === "integrasi" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <Icon icon="lucide:cpu" className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-gray-900">Integrasi API Google</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50/50 border border-blue-150 rounded-xl p-4 text-xs text-blue-800 space-y-2 leading-relaxed font-medium">
                <div className="flex items-center space-x-2 text-blue-900 font-bold">
                  <Icon icon="lucide:info" className="h-4.5 w-4.5 text-blue-600" />
                  <span>Panduan Menghubungkan Google API:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Buat proyek di <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-blue-950">Google Cloud Console</a>.</li>
                  <li>Aktifkan API berikut: <strong>Google Analytics Data API</strong> dan <strong>Google Search Console API</strong>.</li>
                  <li>Buat <strong>Service Account</strong> di proyek tersebut, buat kunci baru tipe <strong>JSON</strong>, lalu unduh kuncinya.</li>
                  <li>Buka berkas JSON tersebut, salin semua isinya, lalu tempel pada input <strong>Google Service Account JSON Key</strong> di bawah ini.</li>
                  <li>Salin alamat email Service Account (berformat <code>xxx@xxx.iam.gserviceaccount.com</code>):
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                      <li>Bagikan akses properti <strong>Google Analytics 4</strong> Anda kepada email tersebut dengan peran <strong>Viewer</strong> (Pelihat).</li>
                      <li>Bagikan akses properti <strong>Google Search Console</strong> Anda kepada email tersebut dengan peran <strong>Full</strong> atau <strong>Viewer</strong>.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Google Service Account JSON Key</label>
                
                {(() => {
                  let parsedCreds = null;
                  if (settings.google_service_account_json) {
                    try {
                      parsedCreds = JSON.parse(settings.google_service_account_json);
                    } catch (e) {
                      // fallback
                    }
                  }

                  if (parsedCreds && parsedCreds.client_email) {
                    return (
                      <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-xs">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-100/60 rounded-lg text-emerald-600 shrink-0">
                            <Icon icon="lucide:key-round" className="h-4.5 w-4.5" />
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">Kredensial Service Account Aktif</span>
                              {settings.google_service_account_json === originalSettings?.google_service_account_json ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">
                                  <Icon icon="lucide:check-circle" className="h-2.5 w-2.5 mr-1" />
                                  Tersimpan
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                  <Icon icon="lucide:alert-circle" className="h-2.5 w-2.5 mr-1" />
                                  Belum Disimpan
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 font-semibold truncate max-w-xs sm:max-w-sm" title={parsedCreds.client_email}>
                              Email: <span className="text-gray-700 font-bold">{parsedCreds.client_email}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-semibold uppercase">
                              Project ID: <span className="font-bold text-gray-600">{parsedCreds.project_id || "-"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                          <label className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-xs">
                            <input
                              type="file"
                              accept=".json"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleJsonFile(e.target.files[0]);
                              }}
                            />
                            Ganti Berkas
                          </label>
                          <button
                            type="button"
                            onClick={() => handleChange("google_service_account_json", "")}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100/60 border border-red-150 text-red-650 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-xs"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      onDragEnter={() => setJsonDragActive(true)}
                      onDragOver={(e) => { e.preventDefault(); setJsonDragActive(true); }}
                      onDragLeave={() => setJsonDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setJsonDragActive(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleJsonFile(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border border-dashed rounded-xl p-6 text-center transition-all ${
                        jsonDragActive
                          ? "border-brand-red bg-brand-light-50/20"
                          : "border-gray-300 hover:border-brand-red bg-gray-50/50"
                      }`}
                    >
                      <input
                        id="json-file-input"
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleJsonFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center text-gray-400 mx-auto shadow-xs border border-gray-200/50">
                          <Icon icon="lucide:file-json" className="h-5 w-5" />
                        </div>
                        <div className="text-xs">
                          <label htmlFor="json-file-input" className="font-bold text-brand-red hover:underline cursor-pointer">
                            Klik untuk unggah berkas JSON
                          </label>{" "}
                          <span className="text-gray-500 font-medium">atau seret berkas ke sini</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mendukung berkas ekstensi .json Service Account</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">GA4 Measurement ID (G-...)</label>
                  <input
                    type="text"
                    value={settings.google_analytics_measurement_id}
                    onChange={(e) => handleChange("google_analytics_measurement_id", e.target.value)}
                    placeholder="Contoh: G-A1B2C3D4"
                    className="bg-gray-50 border border-gray-200 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Google Analytics 4 Property ID</label>
                  <input
                    type="text"
                    value={settings.google_analytics_property_id}
                    onChange={(e) => handleChange("google_analytics_property_id", e.target.value)}
                    placeholder="Contoh: 318251294"
                    className="bg-gray-50 border border-gray-200 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Google Search Console Site URL</label>
                  <input
                    type="text"
                    value={settings.google_search_console_site_url}
                    onChange={(e) => handleChange("google_search_console_site_url", e.target.value)}
                    placeholder="Contoh: https://lanyardjakarta.com"
                    className="bg-gray-50 border border-gray-200 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Google Spreadsheet ID</label>
                  <input
                    type="text"
                    value={settings.google_spreadsheet_id}
                    onChange={(e) => handleChange("google_spreadsheet_id", e.target.value)}
                    placeholder="Contoh: 1a2b3c4d5e6f7g8h9i0j"
                    className="bg-gray-50 border border-gray-200 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Spreadsheet Sheet Name & Range</label>
                  <input
                    type="text"
                    value={settings.google_spreadsheet_range}
                    onChange={(e) => handleChange("google_spreadsheet_range", e.target.value)}
                    placeholder="Contoh: Sheet1!A1:Z200 (Default: Sheet1!A1:Z200)"
                    className="bg-gray-50 border border-gray-200 text-gray-950 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer uppercase transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:save" className="h-3.5 w-3.5" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
