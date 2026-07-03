"use client";

import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

const WHATSAPP_URL =
  "https://wa.me/6282210200700?text=Halo%20Lanyard%20Bogor%2C%20saya%20ingin%20minta%20penawaran%20harga%20lanyard%20custom.";

const HERO_IMAGES = [
  "/uploads/hero-lanyard-slider-01-marquee.webp",
  "/uploads/hero-lanyard-slider-02-marquee.webp",
  "/uploads/hero-lanyard-slider-03-marquee.webp",
  "/uploads/hero-lanyard-slider-04-marquee.webp",
  "/uploads/hero-lanyard-slider-05-marquee.webp",
  "/uploads/hero-lanyard-slider-06-marquee.webp",
  "/uploads/hero-lanyard-slider-07-marquee.webp",
];

export default function HomeHero() {
  return (
    <AnimatedMarqueeHero
      className="border-b border-gray-100"
      tagline="Pionir No. #1"
      title={
        <>
          Print Tali Lanyard Custom
          <br />
          untuk Brand Anda
        </>
      }
      description="Cetak lanyard custom untuk perusahaan, sekolah, komunitas, dan event dengan tampilan rapi, material nyaman, dan proses pemesanan yang fleksibel."
      ctaText="Minta Quotation"
      ctaHref={WHATSAPP_URL}
      images={HERO_IMAGES}
    />
  );
}
