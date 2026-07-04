"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, Eye, User } from "lucide-react";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

type PreviewData = {
  title: string;
  content: string;
  category?: string;
  date: string;
  type: "post" | "page";
};

export default function HomePreviewClient() {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const match = window.location.search.match(/^\?preview-(\d+)$/);
    if (!match) return;

    const loadPreview = async (id: number) => {
      setPreviewLoading(true);
      setPreviewError("");

      try {
        let res = await fetch(`/api/cms/posts/${id}`);
        let data = await res.json();

        if (res.ok && data.post) {
          setPreviewData({
            title: data.post.title,
            content: data.post.content,
            category: data.post.category?.name || "Uncategorized",
            date: new Date(data.post.createdAt).toLocaleDateString("id-ID", {
              dateStyle: "long",
              timeZone: "Asia/Jakarta",
            }),
            type: "post",
          });
          return;
        }

        res = await fetch(`/api/cms/pages/${id}`);
        data = await res.json();

        if (res.ok && data.page) {
          setPreviewData({
            title: data.page.title,
            content: data.page.content,
            category: "Halaman Statis",
            date: new Date(data.page.createdAt).toLocaleDateString("id-ID", {
              dateStyle: "long",
              timeZone: "Asia/Jakarta",
            }),
            type: "page",
          });
          return;
        }

        setPreviewError("Konten pratinjau tidak ditemukan atau Anda tidak memiliki akses admin.");
      } catch {
        setPreviewError("Gagal memuat pratinjau konten.");
      } finally {
        setPreviewLoading(false);
      }
    };

    loadPreview(parseInt(match[1], 10));
  }, []);

  if (!previewLoading && !previewError && !previewData) {
    return null;
  }

  if (previewLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-grow items-center justify-center py-20">
          <div className="space-y-4 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
            <p className="text-sm font-semibold text-gray-500">Memuat pratinjau draf...</p>
          </div>
        </div>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-grow items-center justify-center px-5 py-20">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg">
            <div className="inline-flex rounded-full bg-red-50 p-3 text-red-500">
              <AlertTriangle className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">Gagal Memuat Pratinjau</h2>
            <p className="text-xs font-semibold leading-relaxed text-gray-500">{previewError}</p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block w-full rounded-xl bg-brand-red px-4 py-2.5 text-xs font-bold uppercase text-white transition-colors hover:bg-brand-dark"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!previewData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col overflow-y-auto bg-white">
      <div className="mt-[72px] flex animate-pulse items-center justify-center space-x-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-xs font-bold text-amber-800 md:mt-[80px]">
        <Eye className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <span>Mode Pratinjau: Halaman draf ini hanya dapat dilihat oleh Administrator.</span>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-grow px-5 py-12">
        <div className="mt-6 space-y-4 border-b border-gray-100 pb-8">
          {previewData.type === "post" && (
            <span className="rounded-full bg-brand-light-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
              {previewData.category}
            </span>
          )}
          <h1 className="text-3xl font-black leading-tight text-gray-900 md:text-4xl lg:text-5xl">
            {previewData.title}
          </h1>
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-400">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Dibuat: {previewData.date}</span>
            <span className="text-gray-200">|</span>
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Oleh: Admin</span>
          </div>
        </div>

        <div className="prose max-w-none py-8">
          <div
            className="ql-editor !min-h-0 !p-0 text-base leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(previewData.content) }}
          />
        </div>
      </main>
    </div>
  );
}
