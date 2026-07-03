"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "@/lib/products-service";
import {
  checkRateLimit,
  getWishlist,
  saveWishlist,
} from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";
import { getProductListingHref } from "@/lib/product-links";

const NAV_ITEMS = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Promo", href: "/promo" },
  { label: "Cara Pemesanan", href: "/cara-pemesanan" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontak", href: "/kontak" },
];

const WHATSAPP_URL =
  "https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20minta%20penawaran%20harga%20lanyard%20custom.";

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [allProducts, setAllProducts] =
    useState<UnifiedProduct[]>(DEFAULT_PRODUCTS);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [wishlist, setWishlist] = useState<UnifiedProduct[]>([]);
  const wishlistRef = useRef<HTMLDivElement>(null);

  const closeMenus = () => {
    setMenuOpen(false);
    setWishlistOpen(false);
  };

  const fetchProductsForWishlist = useCallback(async () => {
    if (productsLoaded) return;

    try {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setAllProducts(data.products);
        setProductsLoaded(true);
      }
    } catch (err) {
      console.error("Failed to fetch products for wishlist header:", err);
    }
  }, [productsLoaded]);

  const loadWishlist = useCallback(() => {
    const skus = getWishlist();

    if (skus.length === 0) {
      setWishlist([]);
      return;
    }

    const items = skus
      .map(
        (sku) =>
          allProducts.find((product) => product.sku === sku) ||
          DEFAULT_PRODUCTS.find((product) => product.sku === sku),
      )
      .filter(Boolean) as UnifiedProduct[];

    setWishlist(items);
    void fetchProductsForWishlist();
  }, [allProducts, fetchProductsForWishlist]);

  useEffect(() => {
    loadWishlist();
    window.addEventListener("wishlist-updated", loadWishlist);
    return () => window.removeEventListener("wishlist-updated", loadWishlist);
  }, [loadWishlist]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (wishlistRef.current && !wishlistRef.current.contains(target)) {
        setWishlistOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setWishlistOpen(false);
  }, [pathname]);

  const handleRemoveWishlist = (sku: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.warning(
        `Terlalu cepat! Batas klik favorit tercapai. Coba lagi dalam ${limit.waitTimeSec} detik.`,
      );
      return;
    }

    saveWishlist(getWishlist().filter((savedSku) => savedSku !== sku));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-public-border/70 bg-white/95 shadow-sm shadow-black/[0.03] backdrop-blur">
      <nav aria-label="Navigasi utama">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <Link
            href="/"
            onClick={closeMenus}
            className="flex min-w-0 items-center gap-3"
            aria-label="Lanyard Bogor"
          >
            <Image
              src="/uploads/lanyardbogor-logo-mobile.webp"
              alt="Lanyard Bogor Logo"
              width={148}
              height={36}
              className="shrink-0 object-contain"
              quality={60}
              loading="eager"
              fetchPriority="high"
            />
          </Link>

          <div className="flex items-center gap-2 md:order-2">
            <div ref={wishlistRef} className="relative">
              <button
                type="button"
                onClick={() => setWishlistOpen((open) => !open)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-public-muted transition-colors hover:bg-public-soft hover:text-public-fg focus:outline-none focus:ring-2 focus:ring-public-amber/30"
                aria-label="Buka produk favorit"
                aria-expanded={wishlistOpen}
              >
                <Icon
                  icon={wishlist.length > 0 ? "mdi:heart" : "lucide:heart"}
                  className={`h-5.5 w-5.5 ${wishlist.length > 0 ? "text-public-amber" : ""}`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-public-amber px-1 text-[9px] font-black leading-none text-[#111827] ring-2 ring-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {wishlistOpen && (
                <div className="absolute right-0 top-full mt-3 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-public-border bg-white p-4 shadow-xl shadow-black/10">
                  <div className="mb-3 flex items-center justify-between border-b border-public-border/60 pb-3">
                    <p className="text-sm font-extrabold text-public-fg">
                      Produk Favorit ({wishlist.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setWishlistOpen(false)}
                      className="rounded-md p-1 text-public-muted transition-colors hover:bg-public-soft hover:text-public-fg focus:outline-none focus:ring-2 focus:ring-public-amber/30"
                      aria-label="Tutup produk favorit"
                    >
                      <Icon icon="lucide:x" className="h-4 w-4" />
                    </button>
                  </div>

                  {wishlist.length === 0 ? (
                    <p className="py-6 text-center text-xs font-semibold leading-relaxed text-public-muted">
                      Belum ada produk lanyard yang ditambahkan ke favorit.
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                      {wishlist.map((item) => (
                        <div
                          key={item.sku}
                          className="flex items-center gap-3 border-b border-public-border/50 pb-3 last:border-0 last:pb-0"
                        >
                          <Link
                            href={getProductListingHref(item)}
                            onClick={() => setWishlistOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-public-border bg-public-soft">
                              <Image
                                src={
                                  item.featuredImage ||
                                  "/uploads/aset-lanyard-4-1782114161098.webp"
                                }
                                alt={item.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-public-fg">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-extrabold text-public-amber-strong">
                                {item.basePrice}
                              </p>
                            </div>
                          </Link>
                          <button
                            type="button"
                            onClick={(event) =>
                              handleRemoveWishlist(item.sku, event)
                            }
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-public-muted transition-colors hover:bg-public-soft hover:text-public-amber-strong focus:outline-none focus:ring-2 focus:ring-public-amber/30"
                            aria-label={`Hapus ${item.name} dari favorit`}
                          >
                            <Icon icon="lucide:trash-2" className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/produk"
                    onClick={() => setWishlistOpen(false)}
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-public-border bg-public-soft px-4 text-xs font-bold text-public-fg transition-colors hover:bg-[#eeeeea]"
                  >
                    Lihat Semua Produk
                  </Link>
                </div>
              )}
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center justify-center rounded-full border border-transparent bg-public-amber px-4 text-sm font-bold leading-5 text-[#111827] shadow-xs transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus:ring-4 focus:ring-public-amber/20 md:inline-flex"
            >
              Minta Quotation
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-public-muted transition-colors hover:bg-public-soft hover:text-public-fg focus:outline-none focus:ring-2 focus:ring-public-amber/30 md:hidden"
              aria-controls="public-navbar-menu"
              aria-expanded={menuOpen}
              aria-label="Buka menu utama"
            >
              <Icon
                icon={menuOpen ? "lucide:x" : "lucide:menu"}
                className="h-6 w-6"
              />
            </button>
          </div>

          <div
            id="public-navbar-menu"
            className={`w-full items-center justify-between md:order-1 md:flex md:w-auto ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            <ul className="mt-3 flex flex-col rounded-xl border border-public-border bg-public-soft p-3 font-semibold md:mt-0 md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors md:px-3 md:py-2 ${
                        active
                          ? "bg-public-amber text-[#111827] md:bg-transparent md:text-public-amber-strong"
                          : "text-public-fg hover:bg-white hover:text-public-amber-strong md:hover:bg-transparent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2 md:hidden">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center rounded-full bg-public-amber px-4 text-sm font-bold text-[#111827] transition-colors hover:bg-public-amber-strong hover:text-white"
                >
                  Minta Quotation
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
