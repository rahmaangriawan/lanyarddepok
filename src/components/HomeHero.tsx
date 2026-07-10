"use client";

import HeroSection from "@/components/ui/hero-section-9";

const WHATSAPP_URL =
  "https://wa.me/6282210200700?text=Halo%20Lanyard%20Depok%2C%20saya%20ingin%20minta%20penawaran%20harga%20lanyard%20custom.";

const HERO_IMAGES = [
  "/uploads/hero-lanyard-slider-01.webp",
  "/uploads/hero-lanyard-slider-02.webp",
  "/uploads/hero-lanyard-slider-03.webp",
];

const HERO_IMAGE_ALTS = [
  "Contoh lanyard custom untuk perusahaan dan event",
  "Detail bahan tali lanyard custom",
  "Pilihan desain lanyard custom Lanyard Depok",
];

export default function HomeHero() {
  return (
    <HeroSection
      eyebrow="Lanyard Custom Depok"
      title={
        <>
          Media Branding
          <br />
          Yang Selalu Terlihat
        </>
      }
      subtitle="Cetak lanyard custom untuk kantor, sekolah, komunitas, dan event dengan bahan nyaman, visual rapi, dan pemesanan cepat."
      actions={[
        {
          text: "Minta Quotation",
          href: WHATSAPP_URL,
          variant: "default",
          className: "rounded-full px-7 font-bold",
        },
        {
          text: "Lihat Produk",
          href: "/produk",
          variant: "outline",
          className: "rounded-full px-7 font-bold",
        },
      ]}
      images={HERO_IMAGES}
      imageAlts={HERO_IMAGE_ALTS}
    />
  );
}
