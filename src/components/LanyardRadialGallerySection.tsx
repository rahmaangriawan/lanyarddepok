"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { RadialScrollGallery } from "@/components/ui/portfolio-and-image-gallery";

const GALLERY_ITEMS = [
  {
    title: "Telkomsel Lanyard",
    category: "Full Color",
    image: "/uploads/lanyard-telkomsel-gallery.webp",
  },
  {
    title: "UGM Event Lanyard",
    category: "Instansi",
    image: "/uploads/lanyard-ugm-gallery.webp",
  },
  {
    title: "RRQ Team Lanyard",
    category: "Komunitas",
    image: "/uploads/rrq-gallery.webp",
  },
  {
    title: "Polyester Premium",
    category: "Material",
    image: "/uploads/featured-lanyard-polyester-gallery.webp",
  },
  {
    title: "Event Wristband",
    category: "Akses",
    image: "/uploads/1781967181944-wristband-gallery.webp",
  },
  {
    title: "Custom Lanyard",
    category: "Branding",
    image: "/uploads/hero-lanyard-slider-02-marquee.webp",
  },
  {
    title: "ID Card Set",
    category: "Bundling",
    image: "/uploads/hero-lanyard-slider-07-marquee.webp",
  },
];

export default function LanyardRadialGallerySection() {
  return (
    <section className="overflow-hidden bg-white text-[var(--color-public-fg)]">
      <RadialScrollGallery
        className="!min-h-[calc(100svh-76px)] pt-14 sm:!min-h-[calc(100svh-60px)] sm:pt-10"
        headerClassName="px-4"
        header={
          <div className="mx-auto w-[min(100%,1216px)] text-center">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--color-public-amber)]">
              Galeri Lanyard
            </p>
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-[1.02] tracking-normal text-[var(--color-public-fg)] sm:text-5xl lg:text-6xl">
              Inspirasi Lanyard Custom Untuk Brand Anda
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-normal leading-7 text-[var(--color-public-muted)] sm:text-base">
              Beberapa referensi visual untuk kebutuhan event, identitas tim, komunitas, sampai corporate branding.
            </p>
          </div>
        }
        baseRadius={400}
        mobileRadius={245}
        mobileWheelYOffset={-40}
        visiblePercentage={38}
        scrollDuration={2100}
        startTrigger="top top+=60"
        mobileStartTrigger="top top+=76"
      >
        {(hoveredIndex) =>
          GALLERY_ITEMS.map((item, index) => {
            const isActive = hoveredIndex === index;

            return (
              <article
                key={item.title}
                className="relative h-[270px] w-[190px] overflow-hidden rounded-[18px] border border-[var(--color-public-border)] bg-white sm:h-[320px] sm:w-[230px]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 190px, 230px"
                  quality={58}
                  className={`object-cover transition-transform duration-700 ease-out ${
                    isActive ? "scale-110" : "scale-100 grayscale-[18%]"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/12 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                  <Badge className="mb-3 border border-[rgba(245,158,11,0.24)] bg-white/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-public-amber-strong)] backdrop-blur-sm hover:bg-white/85">
                    {item.category}
                  </Badge>
                  <h3 className="text-xl font-extrabold leading-tight text-[var(--color-public-fg)]">
                    {item.title}
                  </h3>
                  <div
                    className={`mt-3 h-0.5 bg-[var(--color-public-amber)] transition-all duration-500 ${
                      isActive ? "w-16 opacity-100" : "w-8 opacity-60"
                    }`}
                  />
                </div>
              </article>
            );
          })
        }
      </RadialScrollGallery>
    </section>
  );
}
