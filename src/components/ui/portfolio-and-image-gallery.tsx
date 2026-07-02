"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useMergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      });
    },
    [refs],
  );
}

function useResponsiveValue(baseValue: number, mobileValue: number) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setValue(window.innerWidth < 768 ? mobileValue : baseValue);
    };

    handleResize();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [baseValue, mobileValue]);

  return value;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
}

export interface RadialScrollGalleryProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: (hoveredIndex: number | null) => ReactNode[];
  header?: ReactNode;
  headerClassName?: string;
  scrollDuration?: number;
  visiblePercentage?: number;
  baseRadius?: number;
  mobileRadius?: number;
  wheelYOffset?: number;
  mobileWheelYOffset?: number;
  startTrigger?: string;
  mobileStartTrigger?: string;
  onItemSelect?: (index: number) => void;
  direction?: "ltr" | "rtl";
  disabled?: boolean;
}

export const RadialScrollGallery = forwardRef<HTMLDivElement, RadialScrollGalleryProps>(
  (
    {
      children,
      header,
      headerClassName = "",
      scrollDuration = 2500,
      visiblePercentage = 45,
      baseRadius = 550,
      mobileRadius = 220,
      wheelYOffset = 0,
      mobileWheelYOffset = 0,
      className = "",
      startTrigger = "top top+=60",
      mobileStartTrigger = "top top+=76",
      onItemSelect,
      direction = "ltr",
      disabled = false,
      ...rest
    },
    ref,
  ) => {
    const pinRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLUListElement>(null);
    const childRef = useRef<HTMLLIElement>(null);

    const mergedRef = useMergeRefs(ref, pinRef);
    const isSelectable = Boolean(onItemSelect) && !disabled;

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [childSize, setChildSize] = useState<{ w: number; h: number } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const currentRadius = useResponsiveValue(baseRadius, mobileRadius);
    const isMobile = useIsMobile();
    const circleDiameter = currentRadius * 2;
    const effectiveStartTrigger = isMobile ? mobileStartTrigger : startTrigger;
    const effectiveWheelYOffset = isMobile ? mobileWheelYOffset : wheelYOffset;

    const { visibleDecimal, hiddenDecimal } = useMemo(() => {
      const clamped = Math.max(10, Math.min(100, visiblePercentage));
      const v = clamped / 100;
      return { visibleDecimal: v, hiddenDecimal: 1 - v };
    }, [visiblePercentage]);

    const childrenNodes = useMemo(() => React.Children.toArray(children(hoveredIndex)), [children, hoveredIndex]);
    const childrenCount = childrenNodes.length;

    useEffect(() => {
      setIsMounted(true);

      if (!childRef.current) return;

      const observer = new ResizeObserver((entries) => {
        let hasChanged = false;
        for (const entry of entries) {
          setChildSize({
            w: entry.contentRect.width,
            h: entry.contentRect.height,
          });
          hasChanged = true;
        }
        if (hasChanged) {
          ScrollTrigger.refresh();
        }
      });

      observer.observe(childRef.current);
      return () => observer.disconnect();
    }, [childrenCount]);

    useGSAP(
      () => {
        if (!pinRef.current || !containerRef.current || childrenCount === 0) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        gsap.fromTo(
          containerRef.current.children,
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 1.2,
            ease: "back.out(1.2)",
            stagger: 0.05,
            scrollTrigger: {
              trigger: pinRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );

        gsap.to(containerRef.current, {
          rotation: 360,
          ease: "none",
          scrollTrigger: {
            trigger: pinRef.current,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            start: effectiveStartTrigger,
            end: `+=${scrollDuration}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      },
      {
        scope: pinRef,
        dependencies: [scrollDuration, currentRadius, effectiveStartTrigger, childrenCount],
        revertOnUpdate: true,
      },
    );

    useEffect(() => {
      if (!isMounted) return;

      const refreshId = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);

      return () => window.clearTimeout(refreshId);
    }, [isMounted, currentRadius, childSize, effectiveStartTrigger, effectiveWheelYOffset]);

    if (childrenCount === 0) return null;

    const scaleFactor = 1.25;
    const calculatedBuffer = childSize ? childSize.h * scaleFactor - childSize.h + 60 : 150;
    const visibleAreaHeight = childSize
      ? circleDiameter * visibleDecimal + childSize.h / 2 + calculatedBuffer
      : circleDiameter * visibleDecimal + 200;

    return (
      <div
        ref={mergedRef}
        className={`relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden ${className}`}
        {...rest}
      >
        {header && <div className={`relative z-20 w-full shrink-0 ${headerClassName}`}>{header}</div>}

        <div
          className="relative mt-12 w-full overflow-hidden sm:mt-0"
          style={{
            height: `${visibleAreaHeight}px`,
            maskImage: "linear-gradient(to top, transparent 0%, black 40%, black 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 40%, black 100%)",
          }}
        >
          <ul
            ref={containerRef}
            className={`
              absolute left-1/2 m-0 list-none p-0 -translate-x-1/2 will-change-transform
              transition-opacity duration-500 ease-out
              ${disabled ? "pointer-events-none grayscale opacity-50" : ""}
              ${isMounted ? "opacity-100" : "opacity-0"}
            `}
            dir={direction}
            style={{
              width: circleDiameter,
              height: circleDiameter,
              bottom: -(circleDiameter * hiddenDecimal) + effectiveWheelYOffset,
            }}
          >
            {childrenNodes.map((child, index) => {
              const angle = (index / childrenCount) * 2 * Math.PI;
              let x = currentRadius * Math.cos(angle);
              const y = currentRadius * Math.sin(angle);

              if (direction === "rtl") {
                x = -x;
              }

              const rotationAngle = (angle * 180) / Math.PI;
              const isHovered = hoveredIndex === index;
              const isAnyHovered = hoveredIndex !== null;

              return (
                <li
                  key={index}
                  ref={index === 0 ? childRef : null}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    zIndex: isHovered ? 100 : 10,
                    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rotationAngle + 90}deg)`,
                  }}
                >
                  <div
                    role={isSelectable ? "button" : undefined}
                    tabIndex={isSelectable ? 0 : undefined}
                    onClick={() => {
                      if (isSelectable) onItemSelect?.(index);
                    }}
                    onKeyDown={(event) => {
                      if (!isSelectable) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onItemSelect?.(index);
                      }
                    }}
                    onMouseEnter={() => !disabled && setHoveredIndex(index)}
                    onMouseLeave={() => !disabled && setHoveredIndex(null)}
                    onFocus={() => !disabled && setHoveredIndex(index)}
                    onBlur={() => !disabled && setHoveredIndex(null)}
                    className={`
                      block rounded-xl text-left outline-none transition-all duration-500 ease-out will-change-transform
                      ${isSelectable ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-public-amber)] focus-visible:ring-offset-2" : "cursor-default"}
                      ${isHovered ? "scale-125 -translate-y-8" : "scale-100"}
                      ${isAnyHovered && !isHovered ? "opacity-40 grayscale blur-[2px]" : "opacity-100 blur-0"}
                    `}
                  >
                    {child}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  },
);

RadialScrollGallery.displayName = "RadialScrollGallery";
