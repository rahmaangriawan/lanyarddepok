"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "@/lib/products-service";
import { getWishlist, saveWishlist, checkRateLimit } from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";

export default function Header() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const { toast } = useToast();
  
  // Dynamic Products and Search states
  const [allProducts, setAllProducts] = useState<UnifiedProduct[]>([]);
  const [latestProducts, setLatestProducts] = useState<UnifiedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnifiedProduct[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Wishlist states
  const [wishlist, setWishlist] = useState<UnifiedProduct[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [stickyWishlistOpen, setStickyWishlistOpen] = useState(false);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const stickyWishlistRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sticky Navbar Handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user session in header:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.products) {
          setAllProducts(data.products);
          setLatestProducts(data.products.slice(0, 4));
        } else {
          setAllProducts(DEFAULT_PRODUCTS);
          setLatestProducts(DEFAULT_PRODUCTS.slice(0, 4));
        }
      } else {
        setAllProducts(DEFAULT_PRODUCTS);
        setLatestProducts(DEFAULT_PRODUCTS.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setAllProducts(DEFAULT_PRODUCTS);
      setLatestProducts(DEFAULT_PRODUCTS.slice(0, 4));
    }
  };

  // Load Wishlist from LocalStorage
  const loadWishlist = useCallback(() => {
    const skus = getWishlist();
    
    // Map SKUs to product objects
    const items = skus.map((sku: string) => {
      // Find in state or fallbacks
      const found = allProducts.find(p => p.sku === sku) || 
                    DEFAULT_PRODUCTS.find(p => p.sku === sku);
      return found;
    }).filter(Boolean) as UnifiedProduct[];
    
    setWishlist(items);
  }, [allProducts]);

  useEffect(() => {
    fetchSession();
    fetchProducts();
  }, []);

  useEffect(() => {
    loadWishlist();
    window.addEventListener("wishlist-updated", loadWishlist);
    return () => window.removeEventListener("wishlist-updated", loadWishlist);
  }, [allProducts, loadWishlist]);

  // Click Outside handlers for Wishlist, Search, and Category
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchFocused(false);
      }
      if (wishlistRef.current && !wishlistRef.current.contains(target)) {
        setWishlistOpen(false);
      }
      if (stickyWishlistRef.current && !stickyWishlistRef.current.contains(target)) {
        setStickyWishlistOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query)
    );
    
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, allProducts]);

  const taglines = [
    "Cetak online terbesar & terlengkap",
    "Digital print kualitas terbaik",
    "Secure online payment & express delivery",
  ];

  // Rotate taglines every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCategoryOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setCategoryOpen(false);
    }, 150);
  };

  // Toggle wishlist item
  const handleRemoveWishlist = (sku: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // Check rate limit
    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.warning(`Terlalu cepat! Batas klik favorit tercapai. Coba lagi dalam ${limit.waitTimeSec} detik.`);
      return;
    }

    const skus = getWishlist();
    const updatedSkus = skus.filter((s: string) => s !== sku);
    saveWishlist(updatedSkus);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  return (
    <header className="w-full bg-white relative z-40">
      
      {/* LEVEL 1: Topbar (Dark Background - Slate) */}
      <div className="bg-[#000000] text-white text-[12px] py-2 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center font-medium">
          {/* Left: Whatsapp Info */}
          <div className="flex items-center space-x-3">
            <a
              href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Jakarta%2C%20saya%20tertarik%20dengan%20layanan%20cetak%20lanyard%20custom..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-white/80 hover:text-white transition-colors"
            >
              <Icon icon="logos:whatsapp-icon" className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline font-semibold">CS WhatsApp (+62 822-1020-0700)</span>
              <span className="inline md:hidden font-semibold">CS</span>
            </a>
          </div>

          {/* Center: Carousel Text Taglines */}
          <div className="hidden md:block transition-all duration-500 ease-in-out select-none text-gray-300">
            {taglines[taglineIndex]}
          </div>

          {/* Right: Info */}
          <div className="flex items-center space-x-4">
            <Link href="/cara-pemesanan" className="hidden md:flex items-center space-x-1 hover:text-brand-red transition-colors">
              <Icon icon="lucide:shopping-bag" className="h-3.5 w-3.5" />
              <span>Cara Pemesanan</span>
            </Link>
            <span className="text-gray-600 hidden md:inline">|</span>
            <div className="flex items-center space-x-1 text-gray-300 whitespace-nowrap">
              <Icon icon="twemoji:flag-indonesia" className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Ind / Rp</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEVEL 2: Main Header */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4 relative">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <img src="/images/logo.webp" alt="Lanyard Jakarta Logo" className="h-10 w-auto object-contain" />
          </Link>

          {/* Center Search Bar with Live Search */}
          <div className="hidden md:flex flex-1 max-w-lg relative" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari produk lanyard custom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:ring-1 focus:border-brand-red p-2.5 pr-10 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <Icon icon="lucide:search" className="h-4 w-4" />
              </div>
            </div>

            {/* Live Search Dropdown */}
            {searchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-[320px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 font-medium">
                    Tidak ada produk yang cocok dengan pencarian Anda.
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                      Hasil Pencarian Produk
                    </div>
                    {searchResults.map((product) => (
                      <Link
                        key={product.sku}
                        href={`/produk/${product.slug}`}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchFocused(false);
                        }}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                          <img
                            src={product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-brand-red transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-extrabold text-brand-red">
                            {product.basePrice}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center space-x-4 relative">
            
            <div className="relative" ref={wishlistRef}>
              <button 
                id="header-wishlist-button"
                onClick={() => setWishlistOpen(!wishlistOpen)}
                className="text-gray-600 hover:text-brand-red shrink-0 p-1.5 focus:outline-none relative cursor-pointer"
                aria-label="Wishlist"
              >
                <Icon 
                  icon={wishlist.length > 0 ? "mdi:heart" : "lucide:heart"} 
                  className={`h-6 w-6 transition-colors ${wishlist.length > 0 ? "text-brand-red animate-pulse" : ""}`} 
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Wishlist Dropdown Overlay */}
              {wishlistOpen && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 max-h-[420px] overflow-y-auto animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <span className="text-sm font-extrabold text-gray-800 flex items-center">
                      <Icon icon="mdi:heart" className="text-brand-red mr-2 w-4 h-4" />
                      Produk Favorit ({wishlist.length})
                    </span>
                    <button 
                      onClick={() => setWishlistOpen(false)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    </button>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <Icon icon="lucide:heart" className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                        Belum ada produk lanyard yang ditambahkan ke favorit.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {wishlist.map((item) => (
                        <div key={item.sku} className="flex items-center justify-between gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                          <Link
                            href={`/produk/${item.slug}`}
                            onClick={() => setWishlistOpen(false)}
                            className="flex items-center space-x-3 flex-1 min-w-0 group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                              <img
                                src={item.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"}
                                alt={item.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-brand-red transition-colors">
                                {item.name}
                              </h4>
                              <span className="text-[10px] font-extrabold text-brand-red">
                                {item.basePrice}
                              </span>
                            </div>
                          </Link>
                          <button
                            onClick={(e) => handleRemoveWishlist(item.sku, e)}
                            className="text-gray-400 hover:text-brand-red p-1 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                            title="Hapus dari favorit"
                          >
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <Link
                      href="/produk"
                      onClick={() => setWishlistOpen(false)}
                      className="w-full inline-flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-[#373f50] text-xs font-bold py-2 rounded-xl border border-gray-200 transition-colors"
                    >
                      Lihat Semua Produk
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Collapse */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-500 hover:text-brand-red hover:bg-gray-100 focus:outline-none p-2 rounded-lg md:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? <Icon icon="lucide:x" className="h-6 w-6" /> : <Icon icon="lucide:menu" className="h-6 w-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* LEVEL 3: Categories & Primary Navigation */}
      <div className="hidden md:block h-[46px] relative z-30">
        <div className={`bg-white border-b border-gray-100 py-2.5 w-full ${
          isSticky 
            ? "fixed top-0 left-0 shadow-md animate-slide-down z-50" 
            : "relative"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-6 text-sm relative">
            
            {/* Left Nav items wrapper */}
            <div className="flex items-center gap-6">
              {/* Dynamic Products Dropdown (Kategori) */}
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="py-1"
                ref={categoryMenuRef}
              >
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="flex items-center space-x-2 text-brand-dark hover:text-brand-red cursor-pointer focus:outline-none"
                >
                  <Icon icon="lucide:layout-grid" className="h-4.5 w-4.5 text-brand-red" />
                  <span className="text-gray-900 font-medium">New Arrival</span>
                  <Icon icon="lucide:chevron-down" className={`h-4 w-4 text-brand-red transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dynamic Products Mega Menu Dropdown */}
                {categoryOpen && (
                  <div 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute top-full left-4 sm:left-6 lg:left-8 w-[380px] z-40 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 mt-2 animate-fade-in"
                  >
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-50">
                        Rilis Lanyard Terbaru
                      </div>
                      
                      {latestProducts.length === 0 ? (
                        <div className="text-center text-xs text-gray-400 py-4">
                          Memuat produk terbaru...
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {latestProducts.map((product) => (
                            <Link 
                              key={product.sku}
                              href={`/produk/${product.slug}`} 
                              onClick={() => setCategoryOpen(false)}
                              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-red-50/30 border border-transparent hover:border-red-100/50 transition-all duration-200 group"
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                                <img 
                                  src={product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h6 className="font-bold text-xs text-gray-800 group-hover:text-brand-red transition-colors truncate">
                                  {product.name}
                                </h6>
                                <span className="text-[10px] font-extrabold text-brand-red">
                                  {product.basePrice}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      <div className="border-t border-gray-100 pt-3">
                        <Link 
                          href="/produk" 
                          onClick={() => setCategoryOpen(false)} 
                          className="w-full inline-flex items-center justify-center bg-brand-red hover:bg-[#e03d3d] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-colors"
                        >
                          Lihat Semua Lanyard
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-gray-200 self-center"></div>

              {/* Primary Nav Links */}
              <nav className="flex space-x-6 text-gray-700 font-medium">
                <Link href="/" className="hover:text-brand-red transition-colors py-1">Beranda</Link>
                <Link href="/produk" className="hover:text-brand-red transition-colors py-1">Semua Produk</Link>
                <Link href="/tentang" className="hover:text-brand-red transition-colors py-1">Tentang Kami</Link>
                <Link href="/promo" className="hover:text-brand-red transition-colors py-1">Promo</Link>
                <Link href="/syarat-ketentuan" className="hover:text-brand-red transition-colors py-1">Syarat &amp; Ketentuan</Link>
                <Link href="/faq" className="hover:text-brand-red transition-colors py-1">FAQ</Link>
                <Link href="/blog" className="hover:text-brand-red transition-colors py-1">Blog</Link>
                <a 
                  href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Jakarta%2C%20saya%20ingin%20minta%20penawaran%20harga%20lanyard%20custom..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-red transition-colors py-1 flex items-center text-brand-red"
                >
                  <Icon icon="logos:whatsapp-icon" className="w-3.5 h-3.5 mr-1" />
                  Minta Quotation
                </a>
              </nav>
            </div>

            {/* Right: Sticky Wishlist Button */}
            {isSticky && (
              <div className="relative" ref={stickyWishlistRef}>
                <button 
                  id="header-wishlist-button-sticky"
                  onClick={() => setStickyWishlistOpen(!stickyWishlistOpen)}
                  className="text-gray-600 hover:text-brand-red shrink-0 p-1.5 focus:outline-none relative cursor-pointer flex items-center justify-center"
                  aria-label="Wishlist Sticky"
                >
                  <Icon 
                    icon={wishlist.length > 0 ? "mdi:heart" : "lucide:heart"} 
                    className={`h-5 w-5 transition-colors ${wishlist.length > 0 ? "text-brand-red animate-pulse" : ""}`} 
                  />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-brand-red text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Wishlist Dropdown Overlay */}
                {stickyWishlistOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 max-h-[420px] overflow-y-auto animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <span className="text-sm font-extrabold text-gray-800 flex items-center">
                        <Icon icon="mdi:heart" className="text-brand-red mr-2 w-4 h-4" />
                        Produk Favorit ({wishlist.length})
                      </span>
                      <button 
                        onClick={() => setStickyWishlistOpen(false)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <Icon icon="lucide:x" className="w-4 h-4" />
                      </button>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="py-8 text-center space-y-3">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                          <Icon icon="lucide:heart" className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                          Belum ada produk lanyard yang ditambahkan ke favorit.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {wishlist.map((item) => (
                          <div key={item.sku} className="flex items-center justify-between gap-3 group/item">
                            <Link 
                              href={`/produk/${item.slug}`}
                              onClick={() => setStickyWishlistOpen(false)}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                <img 
                                  src={item.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-gray-800 group-hover/item:text-brand-red transition-colors truncate">
                                  {item.name}
                                </h5>
                                <span className="text-[10px] text-brand-red font-black">
                                  {item.basePrice}
                                </span>
                              </div>
                            </Link>
                            <button
                              onClick={(e) => handleRemoveWishlist(item.sku, e)}
                              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-red hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer shrink-0"
                            >
                              <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <Link
                            href="/produk"
                            onClick={() => setStickyWishlistOpen(false)}
                            className="w-full inline-flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-[#373f50] text-xs font-bold py-2 rounded-xl border border-gray-200 transition-colors"
                          >
                            Lihat Semua Produk
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2 text-sm font-medium animate-slide-down">
          
          {/* Mobile Live Search */}
          <div className="relative w-full py-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari produk lanyard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red p-2 pr-10 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <Icon icon="lucide:search" className="h-4 w-4" />
              </div>
            </div>

            {searchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-[240px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500 font-medium">
                    Tidak ada hasil
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {searchResults.map((product) => (
                      <Link
                        key={product.sku}
                        href={`/produk/${product.slug}`}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchFocused(false);
                          setMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                          <img
                            src={product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-800 truncate">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-extrabold text-brand-red">
                            {product.basePrice}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Main Links */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-brand-red text-left"
          >
            Beranda
          </Link>
          <Link
            href="/produk"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-brand-red text-left"
          >
            Semua Produk
          </Link>
          <Link
            href="/faq"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-brand-red text-left"
          >
            FAQ
          </Link>
          <Link
            href="/cara-pemesanan"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-brand-red text-left"
          >
            Cara Pemesanan
          </Link>
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-brand-red text-left"
          >
            Blog
          </Link>
          <a
            href="https://wa.me/6282210200700?text=Halo%20Lanyard%20Jakarta%2C%20saya%20ingin%20minta%20penawaran%20harga%20lanyard%20custom..."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-brand-red hover:bg-red-50 text-left"
          >
            Minta Quotation (WhatsApp)
          </a>
        </div>
      )}
    </header>
  );
}
