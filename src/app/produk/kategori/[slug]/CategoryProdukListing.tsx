"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { UnifiedProduct } from "@/lib/products-service";
import { animateWishlistFly } from "@/lib/wishlist-animation";
import { getWishlist, saveWishlist, checkRateLimit } from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";
import { getPaginationItems } from "@/lib/pagination";

interface CategoryProdukListingProps {
  products: UnifiedProduct[];
  categoryName: string;
}

export default function CategoryProdukListing({ products, categoryName }: CategoryProdukListingProps) {
  const [lovedSkus, setLovedSkus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 8;

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

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.specs && p.specs.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [products, searchQuery]);

  // Paginated products
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginationItems = useMemo(() => getPaginationItems(currentPage, totalPages), [currentPage, totalPages]);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md select-none">
          <input
            type="text"
            placeholder={`Cari produk di kategori ${categoryName}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:ring-brand-red focus:border-brand-red outline-none transition-all"
          />
          <Icon 
            icon="lucide:search" 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4.5 w-4.5" 
          />
        </div>
        <div className="text-xs font-semibold text-gray-400 select-none">
          Menampilkan <span className="text-gray-700">{filteredProducts.length}</span> Produk
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 shadow-3xs max-w-md mx-auto">
          <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Icon icon="lucide:shopping-bag" className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#373f50]">Produk tidak ditemukan</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Tidak ada produk lanyard custom di kategori ini yang cocok dengan pencarian Anda.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="text-xs font-bold text-brand-red hover:underline"
          >
            Reset pencarian
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
                        {item.category?.name || categoryName}
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
