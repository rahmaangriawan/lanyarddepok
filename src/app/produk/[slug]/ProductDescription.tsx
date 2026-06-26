"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ProductDescriptionProps = {
  description: string;
};

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(value: string) {
  return value.replace(/\*([^*\n]+?)\*/g, (_match, text: string) => `<strong>${text.trim()}</strong>`);
}

function normalizeDescription(description: string) {
  const trimmed = description.trim();

  if (!trimmed) {
    return "";
  }

  if (HTML_TAG_PATTERN.test(trimmed)) {
    return renderInlineMarkdown(trimmed);
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${renderInlineMarkdown(escapeHtml(paragraph)).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const html = useMemo(() => normalizeDescription(description), [description]);

  const measureOverflow = useCallback(() => {
    const element = contentRef.current;
    if (!element || isExpanded) return;

    setCanExpand(element.scrollHeight > element.clientHeight + 2);
  }, [isExpanded]);

  useEffect(() => {
    measureOverflow();

    const element = contentRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [measureOverflow, html]);

  if (!html) {
    return (
      <p className="text-sm font-normal leading-relaxed text-gray-500 sm:text-base">
        Deskripsi produk belum tersedia.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={contentRef}
          className={`product-description-content ${
            isExpanded ? "" : "max-h-56 overflow-hidden"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!isExpanded && canExpand && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-white/0" />
        )}
      </div>

      {!isExpanded && canExpand && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="inline-flex p-0 text-sm font-bold text-brand-red hover:text-[#c92f31] hover:underline focus-visible:rounded-sm"
        >
          Baca Selengkapnya
        </button>
      )}
    </div>
  );
}
