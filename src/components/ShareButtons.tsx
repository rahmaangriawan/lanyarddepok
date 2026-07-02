"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { Icon } from "@iconify/react";

interface ShareButtonsProps {
  title: string;
  slug: string;
  shareUrl?: string;
}

export default function ShareButtons({ title, slug, shareUrl: propShareUrl }: ShareButtonsProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState(propShareUrl || "");

  useEffect(() => {
    if (!shareUrl && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/blog/${slug}`);
    }
  }, [slug, shareUrl]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Tautan artikel berhasil disalin!");
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 select-none">
      <span className="mr-1 font-bold text-gray-700">Bagikan:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-public-border bg-white text-gray-500 transition hover:border-public-amber hover:bg-public-soft hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
        title="Bagikan ke Facebook"
        aria-label="Bagikan ke Facebook"
      >
        <Icon icon="bxl:facebook" className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-public-border bg-white text-gray-500 transition hover:border-public-amber hover:bg-public-soft hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
        title="Bagikan ke Twitter / X"
        aria-label="Bagikan ke Twitter / X"
      >
        <Icon icon="ri:twitter-x-fill" className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-public-border bg-white text-gray-500 transition hover:border-public-amber hover:bg-public-soft hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
        title="Bagikan ke LinkedIn"
        aria-label="Bagikan ke LinkedIn"
      >
        <Icon icon="bxl:linkedin" className="h-4 w-4" />
      </a>
      <button
        onClick={handleCopyLink}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-public-border bg-white text-gray-500 transition hover:border-public-amber hover:bg-public-soft hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
        title="Salin Tautan"
        aria-label="Salin tautan artikel"
      >
        <Icon icon="lucide:link" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
