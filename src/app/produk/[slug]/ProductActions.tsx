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

  const waMessage = `Halo Lanyard Jakarta, saya tertarik dengan produk *${product.name}* (SKU: ${product.sku}). Bisa tolong berikan informasi lebih lanjut mengenai harga dan pemesanannya?`;
  const waUrl = `https://wa.me/6282210200700?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-gray-100 select-none">
      {/* WhatsApp CTA Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center bg-[#FF4C4C] hover:bg-[#e03d3d] text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-md shadow-red-200 transition-all duration-300 hover:-translate-y-0.5 text-center"
      >
        <Icon icon="logos:whatsapp-icon" className="w-5 h-5 mr-2 shrink-0" />
        Hubungi WhatsApp CS Sekarang
      </a>

      {/* Love/Wishlist Toggle Button */}
      <button
        onClick={handleToggleLoved}
        className={`px-5 py-4 rounded-2xl border text-sm font-bold flex items-center justify-center active:scale-105 transition-all duration-200 cursor-pointer focus:outline-none ${
          isLoved
            ? "bg-[#FFF0F0] border-red-200 text-brand-red"
            : "bg-white border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red"
        }`}
      >
        <Icon 
          icon={isLoved ? "mdi:heart" : "lucide:heart"} 
          className={`w-5 h-5 mr-2 ${isLoved ? "text-brand-red" : ""}`} 
        />
        {isLoved ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
      </button>
    </div>
  );
}
