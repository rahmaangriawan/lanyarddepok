"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { getSavedThemeId, getThemeById } from "@/lib/dashboard-theme";

interface DashboardStats {
  products: number;
  pages: number;
  posts: number;
  media: number;
  comments: number;
}

interface RecentPost {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme support
  const [themeAccent, setThemeAccent] = useState("#ec2028");
  const [themeLight50, setThemeLight50] = useState("#fef2f2");

  useEffect(() => {
    document.title = "Ringkasan CMS | Kawruh Admin";
    const themeId = getSavedThemeId();
    const theme = getThemeById(themeId);
    setThemeAccent(theme.accent);
    setThemeLight50(theme.light50);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/stats");
      const data = await res.json();

      if (res.ok && data.success) {
        setStats(data.stats);
        setRecentActivities(data.recentActivity || []);
      } else {
        toast.error(data.error || "Gagal memuat ringkasan CMS.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi database.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{
              borderColor: `${themeAccent} transparent ${themeAccent} transparent`,
            }}
          />
          <p className="text-sm font-bold text-gray-900">
            Memuat Ringkasan CMS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Selamat Datang di Kawruh CMS
          </h1>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Ini adalah pusat kendali untuk mengelola seluruh konten situs
            Lanyard Jakarta. Pantau statistik dan kelola halaman, produk, dan
            blog dalam satu tempat.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-[0.03] pointer-events-none">
          <Icon icon="lucide:layout-dashboard" className="w-64 h-64" />
        </div>
      </div>

      {/* Stats Grid - Modern Minimalist Focus */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          label="Total Produk"
          value={stats?.products || 0}
          icon="lucide:shopping-bag"
          colorClass="text-brand-red bg-brand-light-50 border-brand-light-100"
          linkHref="/kawruh/products"
        />
        <StatCard
          label="Artikel Blog"
          value={stats?.posts || 0}
          icon="lucide:file-text"
          colorClass="text-blue-500 bg-blue-50 border-blue-100/50"
          linkHref="/kawruh/blog"
        />
        <StatCard
          label="Halaman (Pages)"
          value={stats?.pages || 0}
          icon="lucide:layout-template"
          colorClass="text-emerald-500 bg-emerald-50 border-emerald-100/50"
          linkHref="/kawruh/pages"
        />
        <StatCard
          label="Media Library"
          value={stats?.media || 0}
          icon="lucide:image"
          colorClass="text-amber-500 bg-amber-50 border-amber-100/50"
          linkHref="/kawruh/media"
        />
        <StatCard
          label="Komentar"
          value={stats?.comments || 0}
          icon="lucide:message-square"
          colorClass="text-purple-500 bg-purple-50 border-purple-100/50"
          linkHref="/kawruh/komentar"
        />
      </div>

      {/* Main Content Split: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Blog Activities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Icon icon="lucide:clock" className="h-5 w-5 text-gray-400" />
              <span>Aktivitas Blog Terbaru</span>
            </h2>
            <Link
              href="/kawruh/blog"
              className="text-xs font-semibold text-gray-500 hover:text-brand-red transition-colors flex items-center space-x-1 group"
            >
              <span>Lihat Semua</span>
              <Icon
                icon="lucide:arrow-right"
                className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            {recentActivities.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <div className="bg-gray-50 h-14 w-14 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                  <Icon icon="lucide:file-x" className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-700">
                  Belum Ada Artikel
                </h4>
                <p className="text-xs text-gray-400">
                  Mulailah menulis artikel pertama Anda.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 uppercase-remove">
                {recentActivities.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/kawruh/blog/edit/${post.id}`}
                        className="text-sm font-bold text-gray-900 hover:text-brand-red transition-colors truncate block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1.5 text-[11px] font-medium text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Icon icon="lucide:calendar" className="h-3 w-3" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(
                              "id-ID",
                              { dateStyle: "medium" },
                            )}
                          </span>
                        </span>
                        <span>•</span>
                        {post.published ? (
                          <span className="text-emerald-500 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center space-x-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Tampil</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/kawruh/blog/edit/${post.id}`}
                      className="shrink-0 h-9 w-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-red hover:border-brand-light-100 transition-colors bg-white hover:shadow-xs"
                    >
                      <Icon icon="lucide:edit-2" className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <Icon icon="lucide:zap" className="h-5 w-5 text-gray-400" />
            <span>Pintasan Cepat</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            <QuickLinkCard
              title="Tulis Artikel Baru"
              desc="Buat postingan blog atau berita terbaru"
              icon="lucide:pen-tool"
              href="/kawruh/blog/new"
              hoverColor="group-hover:text-blue-500"
            />
            <QuickLinkCard
              title="Sinkronisasi Produk"
              desc="Kelola katalog pengayaan lanyard lokal"
              icon="lucide:shopping-cart"
              href="/kawruh/products"
              hoverColor="group-hover:text-emerald-500"
            />
            <QuickLinkCard
              title="Mulai Bikin Halaman"
              desc="Desain landing page statis tambahan"
              icon="lucide:layout"
              href="/kawruh/pages/new"
              hoverColor="group-hover:text-amber-500"
            />
            <QuickLinkCard
              title="Konfigurasi Tema CMS"
              desc="Atur integrasi identitas dan service account"
              icon="lucide:settings"
              href="/kawruh/settings"
              hoverColor="group-hover:text-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Helper Components --- */
function StatCard({
  label,
  value,
  icon,
  colorClass,
  linkHref,
}: {
  label: string;
  value: number;
  icon: string;
  colorClass: string;
  linkHref: string;
}) {
  return (
    <Link
      href={linkHref}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl border shrink-0 transition-colors ${colorClass}`}
        >
          <Icon icon={icon} className="h-5 w-5" />
        </div>
        <Icon
          icon="lucide:arrow-up-right"
          className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100"
        />
      </div>
      <div>
        <h3 className="text-[28px] font-extrabold text-gray-800 tracking-tight leading-none mb-1">
          {value}
        </h3>
        <span className="text-[11px] font-bold text-gray-400 capitalize tracking-wider">
          {label}
        </span>
      </div>
    </Link>
  );
}

function QuickLinkCard({
  title,
  desc,
  icon,
  href,
  hoverColor,
}: {
  title: string;
  desc: string;
  icon: string;
  href: string;
  hoverColor: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center space-x-4 transition-all duration-300 hover:border-gray-200 hover:shadow-md group"
    >
      <div className="bg-gray-50 h-10 w-10 rounded-lg flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-white transition-colors">
        <Icon
          icon={icon}
          className={`h-5 w-5 transition-colors ${hoverColor}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-800 group-hover:text-black transition-colors truncate">
          {title}
        </h4>
        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
          {desc}
        </p>
      </div>
      <Icon
        icon="lucide:chevron-right"
        className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors shrink-0"
      />
    </Link>
  );
}
