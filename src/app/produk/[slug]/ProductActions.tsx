"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { UnifiedProduct } from "@/lib/products-service";
import { animateWishlistFly } from "@/lib/wishlist-animation";
import { getWishlist, saveWishlist, checkRateLimit } from "@/lib/wishlist-storage";
import { useToast } from "@/components/Toast";

interface ProductActionsProps {
  product: UnifiedProduct;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [isLoved, setIsLoved] = useState(false);
  const { toast } = useToast();

  const loadLovedState = () => {
    const skus = getWishlist();
    setIsLoved(skus.includes(product.sku));
  };

  useEffect(() => {
    loadLovedState();
    window.addEventListener("wishlist-updated", loadLovedState);
    return () => window.removeEventListener("wishlist-updated", loadLovedState);
  }, [product.sku]);

  const handleToggleLoved = (event: React.MouseEvent) => {
    // Check rate limit
    const limit = checkRateLimit();
    if (!limit.allowed) {
      toast.warning(`Terlalu cepat! Batas klik favorit tercapai. Coba lagi dalam ${limit.waitTimeSec} detik.`);
      return;
    }

    const skus = getWishlist();
    let updatedSkus: string[];
    
    if (skus.includes(product.sku)) {
      updatedSkus = skus.filter((s: string) => s !== product.sku);
    } else {
      updatedSkus = [...skus, product.sku];
      // Run flying heart animation
      animateWishlistFly(event.currentTarget as HTMLElement);
    }
    
    saveWishlist(updatedSkus);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const waMessage = `Halo Lanyard Bogor, saya tertarik dengan produk *${product.name}* (SKU: ${product.sku}). Bisa tolong berikan informasi lebih lanjut mengenai harga dan pemesanannya?`;
  const waUrl = `https://wa.me/6282210200700?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-public-border/70 select-none">
      {/* WhatsApp CTA Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center bg-public-amber hover:bg-public-amber-strong text-[#111827] hover:text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-md shadow-public-amber/20 transition-all duration-300 hover:-translate-y-0.5 text-center"
      >
        <Icon icon="logos:whatsapp-icon" className="w-5 h-5 mr-2 shrink-0" />
        Hubungi WhatsApp CS Sekarang
      </a>

      {/* Love/Wishlist Toggle Button */}
      <button
        onClick={handleToggleLoved}
        className={`px-5 py-4 rounded-2xl border text-sm font-bold flex items-center justify-center active:scale-105 transition-all duration-200 cursor-pointer focus:outline-none ${
          isLoved
            ? "bg-public-amber/10 border-public-amber/30 text-public-amber-strong"
            : "bg-white border-public-border text-gray-600 hover:border-public-amber hover:text-public-amber-strong"
        }`}
      >
        <Icon 
          icon={isLoved ? "mdi:heart" : "lucide:heart"} 
          className={`w-5 h-5 mr-2 ${isLoved ? "text-public-amber-strong" : ""}`} 
        />
        {isLoved ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
      </button>
    </div>
  );
}
