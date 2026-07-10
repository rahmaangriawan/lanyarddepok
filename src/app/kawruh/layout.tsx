"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getSavedThemeId, getThemeById, getThemeCSSVars } from "@/lib/dashboard-theme";
import { ToastProvider } from "@/components/Toast";

export default function KawruhLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(true);
  const [productOpen, setProductOpen] = useState(true);
  const [themeId, setThemeId] = useState("red");
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (res.ok && data.user && data.user.role === "ADMIN") {
          setUser(data.user);
        } else {
          router.push("/login/blackout");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/login/blackout");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    checkAuth();
    
    window.addEventListener("profile-updated", checkAuth);
    return () => {
      window.removeEventListener("profile-updated", checkAuth);
    };
  }, [router]);

  // Theme system
  useEffect(() => {
    setThemeId(getSavedThemeId());
    const handler = () => setThemeId(getSavedThemeId());
    window.addEventListener("storage", handler);
    window.addEventListener("theme-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("theme-changed", handler);
    };
  }, []);

  const themeVars = getThemeCSSVars(getThemeById(themeId));

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login/blackout");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-500 tracking-wider">Memuat Dashboard CMS...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { name: "Ringkasan", href: "/kawruh", icon: "lucide:layout-dashboard" },
    { name: "Analitik", href: "/kawruh/analytics", icon: "lucide:bar-chart-3" },
    { name: "Portofolio", href: "/kawruh/portofolio", icon: "lucide:briefcase" },
    { name: "Formulir", href: "/kawruh/formulir", icon: "lucide:mail" },
  ];

  const productGroup = {
    label: "Produk",
    icon: "lucide:shopping-bag",
    children: [
      { name: "All Produk", href: "/kawruh/products", icon: "lucide:shopping-bag" },
      { name: "Kategori Produk", href: "/kawruh/categories-produk", icon: "lucide:tag" },
    ],
  };

  const blogGroup = {
    label: "Blog",
    icon: "lucide:notebook-pen",
    children: [
      { name: "Blog", href: "/kawruh/blog", icon: "lucide:file-text" },
      { name: "Kategori Blog", href: "/kawruh/categories", icon: "lucide:tag" },
      { name: "Halaman", href: "/kawruh/pages", icon: "lucide:layout-template" },
      { name: "Generator Kota", href: "/kawruh/cities", icon: "lucide:map-pin" },
      { name: "Komentar", href: "/kawruh/komentar", icon: "lucide:message-square" },
    ],
  };

  const bottomItems = [
    { name: "Media Library", href: "/kawruh/media", icon: "lucide:image" },
    { name: "CMS Settings", href: "/kawruh/settings", icon: "lucide:settings" },
    { name: "Profil Saya", href: "/kawruh/profile", icon: "lucide:user" },
  ];

  const isProductGroupActive = productGroup.children.some((c) => pathname === c.href);
  const isBlogGroupActive = blogGroup.children.some((c) => pathname === c.href);

  const renderItem = (item: { name: string; href: string; icon: string }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center justify-between px-2.5 py-[7px] rounded-md text-[12px] font-medium transition-all ${
          isActive
            ? "bg-brand-light-50/80 text-brand-red font-bold"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${
            isActive ? "bg-white text-brand-red border border-brand-light-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-gray-100 text-gray-400"
          }`}>
            <Icon icon={item.icon} className="h-3.5 w-3.5" />
          </div>
          <span>{item.name}</span>
        </div>
        <Icon icon="lucide:chevron-right" className={`h-3 w-3 shrink-0 ${isActive ? "text-brand-red/50" : "text-gray-300"}`} />
      </Link>
    );
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-gray-50 font-sans overflow-x-hidden" style={themeVars as React.CSSProperties}>
        {/* Mobile Top Bar */}
        <div className="md:hidden fixed top-0 left-0 w-full bg-white text-gray-900 h-16 flex items-center justify-between px-4 z-40 shadow-sm border-b border-gray-100">
          <Link href="/kawruh" className="flex items-center space-x-2">
            <img src="/uploads/lanyarddepok-logo.webp" alt="Logo" className="h-8 w-auto" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-brand-red p-2 rounded-lg"
          >
            <Icon icon={sidebarOpen ? "lucide:x" : "lucide:menu"} className="h-6 w-6" />
          </button>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col justify-between z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-gray-100 shadow-lg md:shadow-none overflow-x-hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header / Branding */}
            <div className="px-5 py-4 border-b border-gray-100 shrink-0 flex items-center justify-between">
              <Link href="/kawruh" className="flex items-center">
                <img src="/uploads/lanyarddepok-logo.webp" alt="Logo" className="h-9 w-auto" />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
              {/* Top-level: Ringkasan */}
              {menuItems.map(renderItem)}

              {/* Produk Group — Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setProductOpen(!productOpen)}
                  className={`w-full flex items-center justify-between px-2.5 py-[7px] rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                    isProductGroupActive && !productOpen ? "bg-brand-light-50/80 text-brand-red font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${
                      isProductGroupActive ? "bg-white text-brand-red border border-brand-light-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon icon={productGroup.icon} className="h-3.5 w-3.5" />
                    </div>
                    <span>{productGroup.label}</span>
                  </div>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
                      productOpen ? "rotate-180" : ""
                    } ${isProductGroupActive ? "text-brand-red/50" : "text-gray-300"}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  productOpen ? "max-h-40 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                }`}>
                  <div className="pl-4 space-y-0.5">
                    {productGroup.children.map(renderItem)}
                  </div>
                </div>
              </div>

              {/* Blog Group — Accordion */}
              <div className="pt-1">
                <button
                  onClick={() => setBlogOpen(!blogOpen)}
                  className={`w-full flex items-center justify-between px-2.5 py-[7px] rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                    isBlogGroupActive && !blogOpen ? "bg-brand-light-50/80 text-brand-red font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${
                      isBlogGroupActive ? "bg-white text-brand-red border border-brand-light-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon icon={blogGroup.icon} className="h-3.5 w-3.5" />
                    </div>
                    <span>{blogGroup.label}</span>
                  </div>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
                      blogOpen ? "rotate-180" : ""
                    } ${isBlogGroupActive ? "text-brand-red/50" : "text-gray-300"}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  blogOpen ? "max-h-40 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                }`}>
                  <div className="pl-4 space-y-0.5">
                    {blogGroup.children.map(renderItem)}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-100 !my-3" />

              {/* Bottom items */}
              {bottomItems.map(renderItem)}
            </nav>
          </div>

          {/* Profile / Footer Section */}
          <div className="p-4 border-t border-gray-100 shrink-0">
            {/* User Profile */}
            <Link href="/kawruh/profile" className="flex items-center space-x-3 px-2 py-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
              <div className="bg-brand-light-50 group-hover:bg-brand-light-100 p-2.5 rounded-full text-brand-red flex items-center justify-center shrink-0 transition-colors">
                <Icon icon="lucide:user" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-gray-900 truncate leading-none group-hover:text-brand-red transition-colors">{user.name}</div>
                <div className="text-[11px] font-semibold text-gray-400 truncate mt-1.5 leading-none">
                  {user.email}
                </div>
              </div>
              <Icon icon="lucide:chevron-right" className="h-4 w-4 text-gray-300 group-hover:text-brand-red/50 shrink-0 transition-all" />
            </Link>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl text-xs font-bold transition-all border border-gray-150"
              >
                <Icon icon="lucide:globe" className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span>Situs</span>
                <Icon icon="lucide:external-link" className="h-3 w-3 text-gray-400" />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-white hover:bg-brand-light-50 text-brand-red border border-brand-light-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Icon icon="lucide:log-out" className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 relative md:ml-64">
          <main className="flex-grow pt-20 pb-8 px-5 md:pt-8 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
