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
  featuredImage: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  // Theme support
  const [themeAccent, setThemeAccent] = useState("#ec2028");

  useEffect(() => {
    document.title = "Dashboard CMS | Kawruh Admin";
    const themeId = getSavedThemeId();
    const theme = getThemeById(themeId);
    setThemeAccent(theme.accent);
    fetchDashboardData();

    // Set current date string format: 15 Mei 2026, 22:30
    const now = new Date();
    const formatted = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const timeFormatted = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setCurrentDate(`${formatted}, ${timeFormatted}`);
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
    <div className="space-y-6 w-full max-w-full">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.015)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">
            Dashboard CMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
            Selamat Datang di Kawruh CMS
          </h1>
          <p className="text-sm font-medium text-gray-400 max-w-xl leading-relaxed">
            Pusat kendali untuk mengelola seluruh konten situs Lanyard Jakarta.
            <br />
            Pantau statistik dan kelola halaman, produk, dan blog dalam satu
            tempat.
          </p>
        </div>

        {/* Right side Metadata / Date */}
        <div className="shrink-0 flex items-center bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-[5px] text-[12px] font-bold text-gray-800 shadow-xs z-10 self-start md:self-center">
          <Icon
            icon="lucide:calendar"
            className="h-4 w-4 mr-2 text-gray-400 shrink-0"
          />
          <span>{currentDate}</span>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-y-4 right-6 h-[calc(100%-2rem)] w-[72%] md:w-[34%] bg-contain bg-center bg-no-repeat opacity-45 pointer-events-none"
          style={{
            backgroundImage:
              "url('/uploads/aset-dashboard-fb714169-9a62-4c9f-8a66-a057702f406c.webp?v=kawruh-dashboard')",
          }}
        />
      </div>

      {/* Stats Grid - Five Column Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <StatCard
          label="Total Produk"
          value={stats?.products || 0}
          icon="lucide:package"
          linkHref="/kawruh/products"
          trend="— dari bulan lalu"
          trendUp={null}
        />
        <StatCard
          label="Artikel Blog"
          value={stats?.posts || 0}
          icon="lucide:file-text"
          linkHref="/kawruh/blog"
          trend="8% dari bulan lalu"
          trendUp={true}
        />
        <StatCard
          label="Halaman (Pages)"
          value={stats?.pages || 0}
          icon="lucide:layout-template"
          linkHref="/kawruh/pages"
          trend="— dari bulan lalu"
          trendUp={null}
        />
        <StatCard
          label="Media Library"
          value={stats?.media || 0}
          icon="lucide:image"
          linkHref="/kawruh/media"
          trend="12% dari bulan lalu"
          trendUp={true}
        />
        <StatCard
          label="Komentar"
          value={stats?.comments || 0}
          icon="lucide:message-square"
          linkHref="/kawruh/komentar"
          trend="— dari bulan lalu"
          trendUp={null}
        />
      </div>

      {/* Main Content Split: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Blog Activities (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center space-x-2.5">
              <Icon
                icon="lucide:clock"
                className="h-5 w-5 text-gray-400 shrink-0"
              />
              <span>Aktivitas Blog Terbaru</span>
            </h2>
            <Link
              href="/kawruh/blog"
              className="text-xs font-bold text-gray-500 hover:text-brand-red transition-colors flex items-center space-x-1 group"
            >
              <span>Lihat Semua</span>
              <Icon
                icon="lucide:arrow-right"
                className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] overflow-hidden">
            {recentActivities.length === 0 ? (
              <div className="p-10 text-center space-y-2 select-none">
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
              <div className="divide-y divide-gray-100/60">
                {recentActivities.map((post) => (
                  <Link
                    key={post.id}
                    href={`/kawruh/blog/edit/${post.id}`}
                    className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className="bg-gray-50 h-10 w-10 rounded-[5px] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-100 transition-colors group-hover:border-brand-red/20">
                        {post.featuredImage ? (
                          <div
                            aria-hidden="true"
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${post.featuredImage}')` }}
                          />
                        ) : (
                          <Icon icon="lucide:image" className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-[13px] font-bold text-gray-800 group-hover:text-brand-red transition-colors truncate">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] font-medium text-gray-400">
                          <Icon
                            icon="lucide:calendar"
                            className="h-3 w-3 shrink-0"
                          />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span>•</span>
                          <span>Oleh Admin</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge and Chevron Actions */}
                    <div className="flex items-center space-x-3 shrink-0">
                      {post.published ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full select-none">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-150 px-2.5 py-0.5 rounded-full select-none">
                          Draft
                        </span>
                      )}

                      <Icon
                        icon="lucide:chevron-right"
                        className="h-4 w-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Links (1/3 width) */}
        <div className="space-y-4">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center space-x-2.5">
            <Icon
              icon="lucide:zap"
              className="h-5 w-5 text-gray-400 shrink-0"
            />
            <span>Pintasan Cepat</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            <QuickLinkCard
              title="Tulis Artikel Baru"
              desc="Buat postingan blog atau berita terbaru"
              icon="lucide:pen-tool"
              href="/kawruh/blog/new"
            />
            <QuickLinkCard
              title="Sinkronisasi Produk"
              desc="Kelola katalog pengayaan lanyard lokal"
              icon="lucide:refresh-cw"
              href="/kawruh/products"
            />
            <QuickLinkCard
              title="Mulai Bikin Halaman"
              desc="Desain landing page statis tambahan"
              icon="lucide:file-plus"
              href="/kawruh/pages/new"
            />
            <QuickLinkCard
              title="Konfigurasi Tema CMS"
              desc="Atur integrasi identitas dan service account"
              icon="lucide:settings"
              href="/kawruh/settings"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Inline Helper Components --- */
interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  linkHref: string;
  trend: string;
  trendUp: boolean | null;
}

function StatCard({
  label,
  value,
  icon,
  linkHref,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <Link
      href={linkHref}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
    >
      <div className="space-y-4">
        {/* Icon Header Box */}
        <div className="flex items-center justify-between">
          <div className="bg-gray-50 h-10 w-10 rounded-xl flex items-center justify-center text-[#373f50] border border-gray-100 shrink-0 transition-colors group-hover:bg-brand-light-50 group-hover:text-brand-red">
            <Icon icon={icon} className="h-5 w-5" />
          </div>
          <Icon
            icon="lucide:arrow-up-right"
            className="h-4 w-4 text-gray-300 group-hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100"
          />
        </div>

        {/* Stats Figures */}
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
            {value.toLocaleString()}
          </h3>
          <span className="text-[11px] font-extrabold text-gray-500 block">
            {label}
          </span>
        </div>
      </div>

      {/* Footer Trend Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[10px] font-bold text-gray-400">
        {trendUp !== null ? (
          <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mr-1.5 font-extrabold">
            <Icon icon="lucide:arrow-up" className="h-2.5 w-2.5 mr-0.5" />
            {trend.split(" ")[0]}
          </span>
        ) : (
          <span className="text-gray-300 mr-1.5 font-bold">—</span>
        )}
        <span>
          {trendUp !== null ? trend.split(" ").slice(1).join(" ") : trend}
        </span>
      </div>
    </Link>
  );
}

interface QuickLinkCardProps {
  title: string;
  desc: string;
  icon: string;
  href: string;
}

function QuickLinkCard({ title, desc, icon, href }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] flex items-center justify-between gap-4 transition-all duration-300 hover:border-gray-200 hover:shadow-md group"
    >
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className="bg-gray-50 h-10 w-10 rounded-xl flex items-center justify-center text-gray-550 border border-gray-100 shrink-0 group-hover:bg-brand-light-50 group-hover:text-brand-red transition-all">
          <Icon icon={icon} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold text-gray-800 group-hover:text-brand-red transition-colors truncate leading-tight">
            {title}
          </h4>
          <p className="text-[10px] text-gray-400 font-medium truncate mt-1">
            {desc}
          </p>
        </div>
      </div>
      <Icon
        icon="lucide:chevron-right"
        className="h-4 w-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </Link>
  );
}
