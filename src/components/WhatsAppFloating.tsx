"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

export default function WhatsAppFloating({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();

  // Hide the floating button on admin dashboard, API routes, and login pages
  if (
    pathname?.startsWith("/kawruh") ||
    pathname?.startsWith("/api") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  // URL encode the custom lanyard message
  const prefilledText = "Halo Lanyard Jakarta, saya ingin bertanya mengenai cetak lanyard custom premium.";
  const encodedText = encodeURIComponent(prefilledText);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

  return (
    <div className="fixed bottom-6 right-6 z-[80] select-none">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
        aria-label="Hubungi WhatsApp Kami"
      >
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-[#373f50] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md">
          Chat via WhatsApp
        </span>

        {/* WhatsApp Icon */}
        <Icon icon="logos:whatsapp-icon" className="w-7 h-7 filter brightness-0 invert" />
      </a>
    </div>
  );
}
