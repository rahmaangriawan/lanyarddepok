"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "@/lib/products-service";
import { animateWishlistFly } from "@/lib/wishlist-animation";
import { getWishlist, saveWishlist, checkRateLimit } from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";

export default function LanyardProducts() {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [lovedSkus, setLovedSkus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch homepage products (limit 4)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=4");
        const data = await res.json();
        if (res.ok && data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(DEFAULT_PRODUCTS.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load products for homepage:", err);
        setProducts(DEFAULT_PRODUCTS.slice(0, 4));
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
    loadLoved();
    window.addEventListener("wishlist-updated", loadLoved);
    return () => window.removeEventListener("wishlist-updated", loadLoved);
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

  return (
    <section id="products" className="relative bg-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 select-none">
          <span className="inline-flex items-center text-[#e13b3d] text-xs font-bold tracking-widest uppercase gap-2 mb-2">
            <span className="w-4 h-[1px] bg-[#e13b3d]" />
            PRODUK KAMI
            <span className="w-4 h-[1px] bg-[#e13b3d]" />
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight mt-2">
            Lanyard Berkualitas, <br />
            <span className="text-[#e13b3d]">Siap Dukung Identitasmu</span>
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Big Lanyard Card */}
          <div className="lg:col-span-5 relative bg-[#fff5f5] rounded-[2rem] overflow-hidden p-8 sm:p-10 flex flex-col justify-between min-h-[480px] lg:min-h-[500px]">
            
            {/* Content Top */}
            <div className="relative z-10 select-none">
              <h3 className="text-4xl font-extrabold text-[#e13b3d] mb-3">
                Lanyard
              </h3>
              <p className="text-[#4b566b] text-sm sm:text-base font-normal leading-relaxed max-w-[280px]">
                Temukan berbagai pilihan lanyard dengan kualitas terbaik untuk kebutuhan corporate, panitia, maupun personal.
              </p>
              
              <Link
                href="/produk"
                className="inline-flex items-center gap-2 text-[#e13b3d] font-bold text-sm mt-6 hover:opacity-80 transition-opacity group"
              >
                <span>Lihat Semua</span>
                <div className="w-8 h-8 rounded-full border border-[#e13b3d]/30 flex items-center justify-center text-[#e13b3d] bg-white shadow-xs group-hover:bg-[#e13b3d] group-hover:text-white transition-all duration-300">
                  <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
                </div>
              </Link>
            </div>

            {/* Bottom Red Curved Wave Background */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 rounded-b-[2rem]">
              <svg
                viewBox="0 0 400 300"
                preserveAspectRatio="none"
                className="relative block w-full h-[220px] sm:h-[240px]"
              >
                <path
                  d="M0,160 C120,220 280,80 400,120 L400,300 L0,300 Z"
                  fill="#e13b3d"
                />
              </svg>
            </div>

            {/* Highlight Lanyard Image */}
            <div className="absolute bottom-[120px] right-[-20px] w-[105%] max-w-[380px] sm:max-w-[430px] z-10 pointer-events-none">
              <img
                src="/uploads/aset-lanyard-4-1782114161098.webp"
                className="w-full h-auto"
                alt="Highlight Lanyard Custom"
                width={430}
                height={242}
              />
            </div>
          </div>

          {/* Right Column: 2x2 Product Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, idx) => (
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
              ))
            ) : (
              products.map((item) => {
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
                          width={400}
                          height={300}
                        />
                      ) : (
                        <>
                          <span className="text-3xl font-black text-gray-300 group-hover:text-[#e13b3d] transition-all duration-300 tracking-wider">
                            {item.sku.substring(0, 2)}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-gray-400 mt-1 tracking-widest group-hover:text-[#e13b3d]/70 transition-all duration-300">
                            Lanyard
                          </span>
                        </>
                      )}
                    </div>

                    {/* Product Text Details */}
                    <div className="mt-2 select-none">
                      <h4 className="font-bold text-[#373f50] text-base leading-snug group-hover:text-[#e13b3d] transition-colors duration-300 mb-1 line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="text-[#e13b3d] font-extrabold text-sm">
                        Mulai {item.basePrice}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
