"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  ctaHref?: string;
  className?: string;
}

const ActionButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) => {
  const className =
    "inline-flex rounded-full bg-public-amber px-8 py-3 text-sm font-semibold text-[#111827] shadow-lg shadow-public-amber/20 transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus:ring-2 focus:ring-public-amber focus:ring-opacity-75";
  const isExternal = href?.startsWith("http");

  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
    >
      {children}
    </button>
  );
};

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  ctaHref,
  className,
}) => {
  const renderMarqueeImages = (group: number) =>
    images.map((src, index) => (
      <div
        key={`${group}-${src}-${index}`}
        className="relative aspect-[3/4] h-48 flex-shrink-0 md:h-64"
        style={{
          rotate: `${index % 2 === 0 ? -2 : 5}deg`,
        }}
      >
        <img
          src={src}
          alt={`Showcase image ${index + 1}`}
          className="h-full w-full rounded-2xl object-cover shadow-md"
        />
      </div>
    ));

  return (
    <section
      id="hero"
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-start overflow-hidden bg-[#f9fafb] px-4 pt-20 text-center text-[#252525]",
        className
      )}
    >
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1d5db 1px, transparent 1px),
            linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
        }}
      />

      <div className="z-10 flex max-w-5xl flex-col items-center gap-6">
        <div className="flex w-full justify-center">
          <div className="inline-flex rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-center text-sm font-medium text-gray-500 shadow-sm backdrop-blur-sm">
            {tagline}
          </div>
        </div>

        <h1 className="text-[42px] font-bold leading-[1.08] tracking-normal text-[#252525] md:text-7xl md:leading-[1.08]">
          {typeof title === "string"
            ? title.split(" ").map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="inline-block"
                >
                  {word}&nbsp;
                </span>
              ))
            : title}
        </h1>

        <p className="max-w-xl text-lg font-normal leading-8 text-gray-500">
          {description}
        </p>

        <div>
          <ActionButton href={ctaHref}>{ctaText}</ActionButton>
        </div>
      </div>

      <div className="relative z-10 mt-10 h-48 w-screen overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] md:h-64">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#f9fafb] via-[#f9fafb]/85 to-transparent" />
        <div className="hero-marquee-track flex w-max">
          <div className="flex shrink-0 gap-4 pr-4">
            {renderMarqueeImages(1)}
          </div>
          <div className="flex shrink-0 gap-4 pr-4" aria-hidden="true">
            {renderMarqueeImages(2)}
          </div>
        </div>
      </div>
    </section>
  );
};
