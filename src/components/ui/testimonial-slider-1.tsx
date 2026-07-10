"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TestimonialReview = {
  id: string | number;
  name: string;
  affiliation: string;
  quote: string;
  imageSrc: string;
  thumbnailSrc: string;
};

type TestimonialSliderProps = {
  reviews: TestimonialReview[];
  className?: string;
};

export function TestimonialSlider({
  reviews,
  className,
}: TestimonialSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"left" | "right">("right");

  if (reviews.length === 0) return null;

  const activeReview = reviews[currentIndex];
  const thumbnailReviews = reviews.filter((_, index) => index !== currentIndex);

  const showNext = () => {
    setDirection("right");
    setCurrentIndex((current) => (current + 1) % reviews.length);
  };

  const showPrevious = () => {
    setDirection("left");
    setCurrentIndex((current) => (current - 1 + reviews.length) % reviews.length);
  };

  const showReview = (index: number) => {
    if (index === currentIndex) return;

    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  };

  const imageVariants = {
    enter: (slideDirection: "left" | "right") => ({
      y: shouldReduceMotion ? 0 : slideDirection === "right" ? 32 : -32,
      opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: (slideDirection: "left" | "right") => ({
      y: shouldReduceMotion ? 0 : slideDirection === "right" ? -32 : 32,
      opacity: 0,
    }),
  };

  const textVariants = {
    enter: (slideDirection: "left" | "right") => ({
      x: shouldReduceMotion ? 0 : slideDirection === "right" ? 24 : -24,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (slideDirection: "left" | "right") => ({
      x: shouldReduceMotion ? 0 : slideDirection === "right" ? -24 : 24,
      opacity: 0,
    }),
  };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: "easeOut" as const };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card text-foreground",
        className
      )}
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.72fr_1fr_1.15fr] lg:gap-8 lg:p-7">
        <div className="order-3 flex flex-col justify-between gap-5 lg:order-1">
          <div>
            <p className="text-xs font-extrabold uppercase leading-5 tracking-normal text-primary">
              Testimoni
            </p>
            <p className="mt-3 text-2xl font-extrabold leading-none text-foreground">
              {String(currentIndex + 1).padStart(2, "0")}
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-muted-foreground">
                {String(reviews.length).padStart(2, "0")}
              </span>
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
            {thumbnailReviews.slice(0, 4).map((review) => {
              const originalIndex = reviews.findIndex((item) => item.id === review.id);

              return (
                <button
                  type="button"
                  key={review.id}
                  onClick={() => showReview(originalIndex)}
                  className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-background opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background sm:h-20 sm:w-16"
                  aria-label={`Lihat testimoni ${review.name}`}
                >
                  <Image
                    src={review.thumbnailSrc}
                    alt={review.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    quality={60}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative order-1 min-h-[18rem] overflow-hidden rounded-2xl bg-background lg:order-2 lg:min-h-[22rem]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeReview.id}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute inset-0"
            >
              <Image
                src={activeReview.imageSrc}
                alt={activeReview.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 30vw, 100vw"
                quality={60}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="order-2 flex min-h-[15rem] flex-col justify-between gap-8 lg:order-3">
          <div className="min-h-[12rem] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeReview.id}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <p className="text-sm font-bold text-primary">
                  {activeReview.affiliation}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-normal text-foreground">
                  {activeReview.name}
                </h3>
                <blockquote className="mt-5 max-w-xl text-xl font-normal leading-[1.35] tracking-normal text-foreground sm:text-2xl">
                  &quot;{activeReview.quote}&quot;
                </blockquote>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-primary text-primary hover:bg-secondary"
              onClick={showPrevious}
              aria-label="Testimoni sebelumnya"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={showNext}
              aria-label="Testimoni berikutnya"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
