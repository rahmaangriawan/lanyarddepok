import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionProps {
  text: string;
  href?: string;
  onClick?: () => void;
  variant?: ButtonProps["variant"];
  className?: string;
}

interface HeroSectionProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  actions: ActionProps[];
  images: string[];
  imageAlts?: string[];
  className?: string;
}

const materialTags = ["Sublimasi", "Polyester", "Custom logo"];

const ActionButton = ({ action }: { action: ActionProps }) => {
  const isExternal = action.href?.startsWith("http");

  if (action.href) {
    const className = action.className;

    if (isExternal) {
      return (
        <Button asChild variant={action.variant} size="lg" className={className}>
          <a href={action.href} target="_blank" rel="noopener noreferrer">
            {action.text}
          </a>
        </Button>
      );
    }

    return (
      <Button asChild variant={action.variant} size="lg" className={className}>
        <Link href={action.href}>{action.text}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={action.onClick}
      variant={action.variant}
      size="lg"
      className={action.className}
    >
      {action.text}
    </Button>
  );
};

const HeroSection = ({
  eyebrow,
  title,
  subtitle,
  actions,
  images,
  imageAlts,
  className,
}: HeroSectionProps) => {
  return (
    <section
      id="hero"
      className={cn(
        "relative w-full overflow-hidden border-b border-border bg-background px-4 py-20 text-foreground sm:px-6 sm:py-0 lg:px-8",
        className
      )}
    >
      <div className="mx-auto grid min-h-[calc(100dvh-88px)] max-w-7xl grid-cols-1 items-center gap-12 sm:-translate-y-[10px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {eyebrow ? (
            <p className="mb-5 text-xs font-extrabold uppercase leading-5 tracking-normal text-primary">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-normal text-foreground sm:text-[3.2rem] lg:text-[3.2rem]">
            {title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            {actions.map((action) => (
              <ActionButton key={action.text} action={action} />
            ))}
          </div>
        </div>

        <div className="relative mx-auto h-[430px] w-full max-w-[620px] sm:h-[520px] lg:max-w-none">
          {materialTags.map((tag, index) => (
            <div
              key={tag}
              aria-hidden="true"
              className={cn(
                "absolute z-20 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur",
                index === 0 && "left-[8%] top-[12%]",
                index === 1 && "right-[6%] top-[18%]",
                index === 2 && "bottom-[15%] left-[28%]"
              )}
            >
              {tag}
            </div>
          ))}

          <div
            className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-2xl bg-card p-2 shadow-xl ring-1 ring-border sm:h-72 sm:w-72"
            style={{ transformOrigin: "bottom center" }}
          >
            <Image
              src={images[0]}
              alt={imageAlts?.[0] || "Contoh lanyard custom Lanyard Depok"}
              fill
              priority
              sizes="(max-width: 640px) 224px, 288px"
              className="rounded-xl object-cover"
            />
          </div>

          <div
            className="absolute right-0 top-[32%] h-44 w-44 rounded-2xl bg-card p-2 shadow-xl ring-1 ring-border sm:h-60 sm:w-60"
            style={{ transformOrigin: "left center" }}
          >
            <Image
              src={images[1]}
              alt={imageAlts?.[1] || "Detail cetak lanyard custom"}
              fill
              sizes="(max-width: 640px) 176px, 240px"
              className="rounded-xl object-cover"
            />
          </div>

          <div
            className="absolute bottom-0 left-0 h-40 w-40 rounded-2xl bg-card p-2 shadow-xl ring-1 ring-border sm:h-56 sm:w-56"
            style={{ transformOrigin: "top right" }}
          >
            <Image
              src={images[2]}
              alt={imageAlts?.[2] || "Pilihan warna dan bahan lanyard"}
              fill
              sizes="(max-width: 640px) 160px, 224px"
              className="rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
