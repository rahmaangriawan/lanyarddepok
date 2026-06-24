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
    } catch (err) {
      toast.error("Gagal menyalin tautan");
    }
  };

  return (
    <div className="flex items-center space-x-3 py-6 border-t border-b border-gray-100 text-xs font-semibold text-gray-400 select-none">
      <span>Bagikan artikel ini:</span>
      
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-7 w-7 rounded-full bg-gray-50 hover:bg-gray-100 hover:text-[#1877f2] text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        title="Bagikan ke Facebook"
      >
        <Icon icon="bxl:facebook" className="h-4 w-4" />
      </a>
      
      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-7 w-7 rounded-full bg-gray-50 hover:bg-gray-100 hover:text-black text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        title="Bagikan ke Twitter / X"
      >
        <Icon icon="ri:twitter-x-fill" className="h-3.5 w-3.5" />
      </a>
      
      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-7 w-7 rounded-full bg-gray-50 hover:bg-gray-100 hover:text-[#0a66c2] text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        title="Bagikan ke LinkedIn"
      >
        <Icon icon="bxl:linkedin" className="h-4 w-4" />
      </a>
      
      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="h-7 w-7 rounded-full bg-gray-50 hover:bg-gray-100 hover:text-brand-red text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
        title="Salin Tautan"
      >
        <Icon icon="lucide:link" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
