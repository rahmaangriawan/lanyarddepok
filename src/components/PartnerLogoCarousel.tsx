"use client";

import Image from "next/image";
import Link from "next/link";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface LogoCarouselItem {
  name: string;
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  href?: string;
}

interface PartnerLogoCarouselProps {
  logos: LogoCarouselItem[];
  mobileColumnCount?: number;
  desktopColumnCount?: number;
}

interface LogoColumnProps {
  logos: LogoCarouselItem[];
  index: number;
  currentTime: number;
  reduceMotion: boolean;
}

const deterministicShuffle = <T extends { id: number; name: string }>(
  items: T[],
): T[] =>
  [...items].sort((a, b) => {
    const aScore = (a.id * 37 + a.name.length * 11) % 97;
    const bScore = (b.id * 37 + b.name.length * 11) % 97;
    return aScore - bScore || a.id - b.id;
  });

const distributeLogos = (
  allLogos: LogoCarouselItem[],
  columnCount: number,
): LogoCarouselItem[][] => {
  const safeColumnCount = Math.max(1, Math.min(columnCount, allLogos.length));
  const shuffled = deterministicShuffle(allLogos);
  const columns: LogoCarouselItem[][] = Array.from(
    { length: safeColumnCount },
    () => [],
  );

  shuffled.forEach((logo, index) => {
    columns[index % safeColumnCount].push(logo);
  });

  const maxLength = Math.max(...columns.map((column) => column.length));
  columns.forEach((column, columnIndex) => {
    let fillIndex = columnIndex;
    while (column.length < maxLength) {
      column.push(shuffled[fillIndex % shuffled.length]);
      fillIndex += safeColumnCount;
    }
  });

  return columns;
};

function useResponsiveColumnCount(mobileCount: number, desktopCount: number) {
  const [columnCount, setColumnCount] = useState(mobileCount);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateColumnCount = () => {
      setColumnCount(mediaQuery.matches ? desktopCount : mobileCount);
    };

    updateColumnCount();
    mediaQuery.addEventListener("change", updateColumnCount);
    return () => mediaQuery.removeEventListener("change", updateColumnCount);
  }, [desktopCount, mobileCount]);

  return columnCount;
}

const LogoColumn = memo(function LogoColumn({
  logos,
  index,
  currentTime,
  reduceMotion,
}: LogoColumnProps) {
  const cycleInterval = 2000;
  const columnDelay = index * 200;
  const adjustedTime =
    (currentTime + columnDelay) % (cycleInterval * logos.length);
  const currentIndex = reduceMotion
    ? index % logos.length
    : Math.floor(adjustedTime / cycleInterval);
  const currentLogo = logos[currentIndex];

  const logoImage = (
    <Image
      src={currentLogo.src}
      alt={currentLogo.alt}
      width={currentLogo.width}
      height={currentLogo.height}
      className="max-h-[70%] w-auto max-w-[78%] object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
      sizes="(max-width: 768px) 96px, 160px"
    />
  );

  return (
    <motion.div
      className="relative h-16 w-32 overflow-hidden rounded-xl border border-border bg-card/70 shadow-xs md:h-24 md:w-48"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.45,
        ease: "easeOut",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentLogo.id}-${currentIndex}`}
          className="absolute inset-0 flex items-center justify-center px-4"
          initial={reduceMotion ? false : { y: "10%", opacity: 0, filter: "blur(8px)" }}
          animate={{
            y: "0%",
            opacity: 1,
            filter: "blur(0px)",
            transition: reduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  mass: 1,
                  bounce: 0.2,
                  duration: 0.5,
                },
          }}
          exit={
            reduceMotion
              ? { opacity: 1 }
              : {
                  y: "-20%",
                  opacity: 0,
                  filter: "blur(6px)",
                  transition: {
                    type: "tween",
                    ease: "easeIn",
                    duration: 0.3,
                  },
                }
          }
        >
          {currentLogo.href ? (
            <Link
              href={currentLogo.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={currentLogo.name}
              className="flex h-full w-full items-center justify-center"
            >
              {logoImage}
            </Link>
          ) : (
            logoImage
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});

export default function PartnerLogoCarousel({
  logos,
  mobileColumnCount = 2,
  desktopColumnCount = 5,
}: PartnerLogoCarouselProps) {
  const reduceMotion = useReducedMotion();
  const columnCount = useResponsiveColumnCount(
    mobileColumnCount,
    desktopColumnCount,
  );
  const [currentTime, setCurrentTime] = useState(0);

  const logoSets = useMemo(() => {
    if (logos.length === 0) return [];
    return distributeLogos(logos, columnCount);
  }, [columnCount, logos]);

  const updateTime = useCallback(() => {
    setCurrentTime((previousTime) => previousTime + 100);
  }, []);

  useEffect(() => {
    if (reduceMotion || logos.length === 0) return;

    const intervalId = window.setInterval(updateTime, 100);
    return () => window.clearInterval(intervalId);
  }, [logos.length, reduceMotion, updateTime]);

  if (logos.length === 0) return null;

  return (
    <section className="border-b border-border bg-background py-20 sm:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase leading-5 tracking-normal text-primary">
            Partner & Klien
          </p>
          <h2 className="mt-4 text-[2rem] font-extrabold leading-[1.08] tracking-normal text-foreground sm:text-[2.4rem] lg:text-[2.75rem]">
            Dipercaya Brand &amp; Instansi
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Dipilih untuk kebutuhan lanyard custom perusahaan, sekolah,
            komunitas, dan event.
          </p>
        </div>

        <div className="grid w-full max-w-5xl grid-cols-2 justify-items-center gap-3 sm:gap-4 md:grid-cols-5">
          {logoSets.map((columnLogos, index) => (
            <LogoColumn
              key={`logo-column-${index}`}
              logos={columnLogos}
              index={index}
              currentTime={currentTime}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
