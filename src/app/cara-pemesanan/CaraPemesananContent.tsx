"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

type FaqItem = {
  question: string;
  answer: string;
};

type CaraPemesananContentProps = {
  faqs: FaqItem[];
};

export default function CaraPemesananContent({
  faqs,
}: CaraPemesananContentProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const contentId = `cara-pemesanan-faq-${index}`;

        return (
          <article
            key={faq.question}
            className="overflow-hidden rounded-xl border border-public-border bg-white shadow-xs"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-5 px-5 py-4 text-left text-sm font-extrabold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/20 sm:px-6 ${
                isOpen ? "text-public-amber" : "text-[#111827]"
              }`}
              aria-expanded={isOpen}
              aria-controls={contentId}
            >
              <span>{faq.question}</span>
              <Icon
                icon={isOpen ? "lucide:minus" : "lucide:plus"}
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              />
            </button>
            <div
              id={contentId}
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-56" : "max-h-0"
              }`}
            >
              <p className="border-t border-public-border/70 px-5 pb-5 pt-4 text-sm leading-7 text-[#475569] sm:px-6">
                {faq.answer}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
