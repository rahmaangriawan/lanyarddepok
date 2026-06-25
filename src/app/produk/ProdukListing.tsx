"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "@/lib/products-service";
import { animateWishlistFly } from "@/lib/wishlist-animation";
import { getWishlist, saveWishlist, checkRateLimit } from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";
import { getPaginationItems } from "@/lib/pagination";

export default function ProdukListing() {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [lovedSkus, setLovedSkus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Fetch all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok && data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to load products listing:", err);
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load wishlist state
  const loadLoved = () => {
    setLovedSkus(getWishlist());
  };

  useEffect(() => {
    const timer = window.setTimeout(loadLoved, 0);
    window.addEventListener("wishlist-updated", loadLoved);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wishlist-updated", loadLoved);
    };
  }, []);

  // Toggle wishlist item
  const handleToggleLoved = (sku: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // Check rate limit
    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.warning(`Terlalu cepat! Batas klik favorit tercapai. Coba lagi dalam ${limit.waitTimeSec} detik.`);
      return;
    }
    
    const skus = getWishlist();
    let updatedSkus: string[];
    
    if (skus.includes(sku)) {
      updatedSkus = skus.filter((s: string) => s !== sku);
    } else {
      updatedSkus = [...skus, sku];
      // Run flying heart animation
      animateWishlistFly(event.currentTarget as HTMLElement);
    }
    
    saveWishlist(updatedSkus);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  // Get unique categories present in the products list
  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.name) {
        list.add(p.category.name);
      }
    });
    return Array.from(list);
  }, [products]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specs.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "all" ||
        (p.category && p.category.name === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginationItems = useMemo(() => getPaginationItems(currentPage, totalPages), [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 p-5 rounded-3xl shadow-2xs select-none">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Cari nama lanyard, spesifikasi, atau SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-brand-red focus:ring-1 focus:border-brand-red p-3 pr-10 focus:outline-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <Icon icon="lucide:search" className="w-5 h-5" />
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-brand-red border-brand-red text-white shadow-xs shadow-red-100"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red"
            }`}
          >
            Semua Produk
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-brand-red border-brand-red text-white shadow-xs shadow-red-100"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col justify-between min-h-[280px] animate-pulse"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-full self-end" />
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl my-2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                <div className="h-4 bg-gray-100 rounded-md w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 shadow-3xs max-w-md mx-auto">
          <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Icon icon="lucide:shopping-bag" className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#373f50]">Produk tidak ditemukan</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Tidak ada produk lanyard yang cocok dengan pencarian atau kategori yang Anda pilih.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setCurrentPage(1);
            }}
            className="text-xs font-bold text-brand-red hover:underline"
          >
            Reset filter pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((item) => {
              const isLoved = lovedSkus.includes(item.sku);
              return (
                <Link
                  key={item.sku}
                  href={`/produk/${item.slug}`}
                  className="bg-white border border-gray-100 rounded-[2rem] p-6 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group min-h-[280px]"
                >
                  {/* Wishlist Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleLoved(item.sku, e)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center text-[#e13b3d] hover:bg-[#ffe3e3]/30 active:scale-125 transition-all duration-200 cursor-pointer z-20"
                    aria-label={isLoved ? "Hapus dari favorit" : "Tambah ke favorit"}
                  >
                    <Icon 
                      icon={isLoved ? "mdi:heart" : "lucide:heart"} 
                      className={`h-4 w-4 transition-colors ${isLoved ? "text-[#e13b3d]" : "text-gray-400 group-hover:text-[#e13b3d]"}`} 
                    />
                  </button>

                  {/* Product Image Area */}
                  <div className="w-full aspect-[4/3] rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden select-none group-hover:bg-[#e13b3d]/5 group-hover:border-[#e13b3d]/20 transition-all duration-300 mb-4 z-10">
                    {item.featuredImage ? (
                      <img
                        src={item.featuredImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <>
                        <span className="text-2xl font-black text-gray-300 group-hover:text-[#e13b3d] transition-all duration-300 tracking-wider">
                          {item.sku.substring(0, 2)}
                        </span>
                        <span className="text-[8px] uppercase font-bold text-gray-400 mt-0.5 tracking-widest group-hover:text-[#e13b3d]/70 transition-all duration-300">
                          Lanyard
                        </span>
                      </>
                    )}
                  </div>

                  {/* Product Text Details */}
                  <div className="mt-2 select-none">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {item.category?.name || "Lanyard"}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{item.sku}</span>
                    </div>
                    <h4 className="font-bold text-[#373f50] text-base leading-snug group-hover:text-[#e13b3d] transition-colors duration-300 mb-1 line-clamp-2 min-h-[2.5rem]">
                      {item.name}
                    </h4>
                    <span className="text-[#e13b3d] font-extrabold text-sm">
                      Mulai {item.basePrice}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 pt-6 select-none">
              {/* Prev Button */}
              {currentPage > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red transition-all cursor-pointer bg-white"
                  aria-label="Previous Page"
                >
                  <Icon icon="lucide:chevron-left" className="h-5 w-5" />
                </button>
              ) : (
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                  aria-disabled="true"
                >
                  <Icon icon="lucide:chevron-left" className="h-5 w-5" />
                </span>
              )}

              {/* Page Numbers */}
              {paginationItems.map((pageNumber) => {
                if (typeof pageNumber === "string") {
                  return (
                    <span
                      key={pageNumber}
                      className="inline-flex items-center justify-center w-10 h-10 text-gray-300 text-xs font-bold"
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  );
                }

                const isCurrent = pageNumber === currentPage;
                return (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-brand-red border-brand-red text-white shadow-xs"
                        : "bg-white border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red"
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red transition-all cursor-pointer bg-white"
                  aria-label="Next Page"
                >
                  <Icon icon="lucide:chevron-right" className="h-5 w-5" />
                </button>
              ) : (
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 text-gray-300 cursor-not-allowed bg-white"
                  aria-disabled="true"
                >
                  <Icon icon="lucide:chevron-right" className="h-5 w-5" />
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
