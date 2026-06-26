"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { formatHtml, getAltFromFilename } from "@/lib/html-formatter";
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

interface Media {
  id: number;
  filename: string;
  url: string;
  mimetype: string;
}

interface CityPage {
  id: number;
  title: string;
  slug: string;
  parentId: number | null;
}

/* ─── Accordion Section ─── */
function SidebarSection({ title, icon, defaultOpen = true, children }: {
  title: string; icon: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 text-sm font-bold text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors">
        <span className="flex items-center space-x-2"><Icon icon={icon} className="h-4 w-4 text-gray-500" /><span>{title}</span></span>
        <Icon icon="lucide:chevron-down" className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-4 space-y-3 border-t border-gray-100">{children}</div>
      </div>
    </div>
  );
}

export default function CitiesEditor({ editId }: { editId?: number }) {
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isMetaTitleDirty, setIsMetaTitleDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");
  const [focusKeyword, setFocusKeyword] = useState("");

  // List of all cities to choose parent
  const [allCities, setAllCities] = useState<CityPage[]>([]);

  // Custom rich editor states
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [hoveredGrid, setHoveredGrid] = useState<{ r: number; c: number } | null>(null);
  const quillRef = useRef<any>(null);

  // Media Library Integration
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaDragActive, setMediaDragActive] = useState(false);
  const [mediaPage, setMediaPage] = useState(1);

  const imagesOnly = useMemo(() => mediaList.filter((m) => m.mimetype.startsWith("image/")), [mediaList]);
  const totalPages = Math.ceil(imagesOnly.length / 21);
  const paginatedImages = useMemo(() => {
    const start = (mediaPage - 1) * 21;
    return imagesOnly.slice(start, start + 21);
  }, [imagesOnly, mediaPage]);

  // Custom image alt states
  const [altPromptOpen, setAltPromptOpen] = useState(false);
  const [altPromptUrl, setAltPromptUrl] = useState("");
  const [customAltText, setCustomAltText] = useState("");

  // Custom link states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const linkModalOpenRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);
  const [linkIsNofollow, setLinkIsNofollow] = useState(false);
  const [linkIsSponsored, setLinkIsSponsored] = useState(false);
  const [linkActiveQuill, setLinkActiveQuill] = useState<any>(null);
  const [linkActiveRange, setLinkActiveRange] = useState<any>(null);
  const [linkActiveAnchor, setLinkActiveAnchor] = useState<HTMLAnchorElement | null>(null);

  const fetchCityAndParents = useCallback(async () => {
    try {
      // 1. Fetch other cities for parent options
      const listRes = await fetch("/api/cms/cities");
      const listData = await listRes.json();
      if (listRes.ok) {
        setAllCities(listData.cities || []);
      }

      // 2. Fetch specific city details if editing
      if (editId) {
        const res = await fetch(`/api/cms/cities/${editId}`);
        const data = await res.json();
        if (res.ok && data.city) {
          const city = data.city;
          setTitle(city.title);
          setSlug(city.slug);
          setContent(city.content || "");
          setPublished(city.published);
          setParentId(city.parentId);
          setFeaturedImage(city.featuredImage);
          
          setMetaTitle(city.metaTitle || city.title || "");
          setMetaDescription(city.metaDescription || "");
          setIsMetaTitleDirty(!!city.metaTitle);
        } else {
          setError(data.error || "Gagal memuat detail kota.");
        }
      }
    } catch (err) {
      setError("Kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }, [editId]);

  useEffect(() => {
    fetchCityAndParents();
  }, [fetchCityAndParents]);

  useEffect(() => {
    if (editId) {
      document.title = `Edit Kota: ${title || "Loading..."} | Kawruh Admin`;
    } else {
      document.title = "Buat Halaman Kota Baru | Kawruh Admin";
    }
  }, [editId, title]);

  const fetchMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/cms/media");
      const data = await res.json();
      if (res.ok) setMediaList(data.mediaList || []);
    } catch (err) { console.error("Failed to load media"); }
    finally { setMediaLoading(false); }
  };

  const openMediaModal = () => {
    setMediaModalOpen(true);
    setMediaPage(1);
    fetchMedia();
  };

  const handleMediaSelect = (url: string, customAlt?: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();
      
      const altText = customAlt || getAltFromFilename(url) || "media";
      
      quill.insertEmbed(position, "image", url);
      quill.setSelection(position + 1);

      setTimeout(() => {
        const images = quill.root.querySelectorAll("img");
        images.forEach((img: HTMLImageElement) => {
          if (img.src.endsWith(url) || img.src === url) {
            img.setAttribute("alt", altText);
            img.setAttribute("loading", "lazy");
          }
        });
      }, 100);
    }
    setMediaModalOpen(false);
  };

  const handleMediaUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/cms/media", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setMediaList((prev) => [data.media, ...prev]);
        toast.success(`Gambar "${file.name}" berhasil diunggah!`);
      } else {
        toast.error(data.error || "Gagal mengunggah.");
      }
    } catch (err) { toast.error("Kesalahan jaringan."); }
    finally { setUploading(false); }
  };

  const handleMediaDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setMediaDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (const file of Array.from(e.dataTransfer.files)) {
        if (file.type.startsWith("image/")) await handleMediaUpload(file);
      }
    }
  };

  // Helper to dynamically check descendant IDs to avoid circular reference
  const getDescendantIds = useCallback((pageId: number, list: CityPage[]): number[] => {
    const ids: number[] = [];
    const children = list.filter((c) => c.parentId === pageId);
    for (const child of children) {
      ids.push(child.id);
      ids.push(...getDescendantIds(child.id, list));
    }
    return ids;
  }, []);

  // Filter list of eligible parents
  const eligibleParents = useMemo(() => {
    return allCities.filter((c) => {
      if (editId) {
        const editIdNum = typeof editId === "string" ? parseInt(editId, 10) : editId;
        const invalidIds = [editIdNum, ...getDescendantIds(editIdNum, allCities)];
        return !invalidIds.includes(c.id);
      }
      return true;
    });
  }, [allCities, editId, getDescendantIds]);

  const autoSlug = useMemo(() => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, [title]);

  const wordCount = useMemo(() => {
    const cleanText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\xa0/g, " ")
      .replace(/&[a-z0-9#]+/gi, "")
      .trim();
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  }, [content]);

  const seoAnalysis = useMemo(() => {
    // 1. Title filled
    const titleFilled = title.trim().length > 0;
    
    // 2. Meta filled
    const metaFilled = metaTitle.trim().length > 0 && metaDescription.trim().length > 0;
    
    // 3. Word count >= 400
    const passWordCount = wordCount >= 400;
    
    // 4. Keyword in first 100 words
    const cleanText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\xa0/g, " ")
      .replace(/&[a-z0-9#]+/gi, "")
      .trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const first100Words = words.slice(0, 100).join(" ");
    const passKeywordInFirst100 = focusKeyword ? first100Words.toLowerCase().includes(focusKeyword.toLowerCase()) : false;
    
    // 5. Short Paragraphs
    const paragraphs = content.split("</p>");
    let hasLongParagraph = false;
    let paragraphCount = 0;
    for (const p of paragraphs) {
      const cleanP = p
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\u00a0/g, " ")
        .replace(/\xa0/g, " ")
        .trim();
      if (cleanP) {
        paragraphCount++;
        const pWords = cleanP.split(/\s+/).filter(w => w.length > 0).length;
        if (pWords > 150) {
          hasLongParagraph = true;
        }
      }
    }
    const passShortParagraphs = paragraphCount > 0 && !hasLongParagraph;
    
    // 6. Hierarchy of Headings
    const hasHeading = /<h[23]/i.test(content);
    
    // 7. Internal link
    const hasInternalLink = /<a\s+(?:[^>]*?\s+)?href=["'](?:\/|https?:\/\/(?:www\.)?(?:lanyardjakarta\.co\.id|jakartalanyard\.com))/i.test(content);
    
    // 8. Featured image selected
    const hasFeaturedImage = !!featuredImage;
    
    // 9. Image in content
    const hasImageInContent = /<img/i.test(content);
    
    // 10. Table in content
    const hasTableInContent = /<table/i.test(content);
    
    // 11. Short slug matching keyword
    const passSlugKeyword = focusKeyword 
      ? autoSlug.toLowerCase().includes(focusKeyword.toLowerCase()) && autoSlug.length <= 50 
      : false;
      
    const rules = [
      {
        id: "titleFilled",
        label: "Judul terisi",
        passed: titleFilled,
        tip: "Nama/judul halaman kota belum diisi."
      },
      {
        id: "metaFilled",
        label: "Meta title dan meta desk terisi",
        passed: metaFilled,
        tip: "Lengkapi Meta Title dan Meta Description di bawah."
      },
      {
        id: "passWordCount",
        label: "Jumlah kata minimal 400",
        passed: passWordCount,
        tip: `Panjang artikel saat ini ${wordCount} kata. Tambahkan konten hingga minimal 400 kata.`
      },
      {
        id: "passKeywordInFirst100",
        label: "100 kata pertama mengandung kata kunci",
        passed: passKeywordInFirst100,
        tip: focusKeyword 
          ? `Kata kunci fokus "${focusKeyword}" tidak ditemukan di 100 kata pertama.` 
          : "Masukkan kata kunci fokus terlebih dahulu untuk menguji bagian ini."
      },
      {
        id: "passShortParagraphs",
        label: "Paragraf pendek (maksimal 150 kata per paragraf)",
        passed: passShortParagraphs,
        tip: paragraphCount === 0 
          ? "Artikel belum berisi paragraf." 
          : "Terdapat paragraf yang terlalu panjang (lebih dari 150 kata). Pecah menjadi paragraf yang lebih pendek."
      },
      {
        id: "hasHeading",
        label: "Hierarki heading (terdapat heading H2 or H3)",
        passed: hasHeading,
        tip: "Gunakan setidaknya satu heading H2 atau H3 untuk struktur artikel yang lebih baik."
      },
      {
        id: "hasInternalLink",
        label: "Internal link",
        passed: hasInternalLink,
        tip: "Tambahkan tautan (link) internal ke halaman lain dalam situs lanyardjakarta.co.id."
      },
      {
        id: "hasFeaturedImage",
        label: "Gambar unggulan dipilih",
        passed: hasFeaturedImage,
        tip: "Pilih gambar unggulan (featured image) untuk halaman kota ini."
      },
      {
        id: "hasImageInContent",
        label: "Gambar di dalam konten",
        passed: hasImageInContent,
        tip: "Sisipkan setidaknya satu gambar di dalam konten halaman menggunakan tombol media."
      },
      {
        id: "hasTableInContent",
        label: "Tabel di dalam konten",
        passed: hasTableInContent,
        tip: "Sisipkan setidaknya satu tabel di dalam konten untuk mempermudah pemahaman data."
      },
      {
        id: "passSlugKeyword",
        label: "Slug pendek dan mengandung kata kunci",
        passed: passSlugKeyword,
        tip: focusKeyword 
          ? `Slug "${autoSlug}" harus di bawah 50 karakter dan mengandung "${focusKeyword}".` 
          : "Masukkan kata kunci fokus dan pastikan slug mengandung kata kunci tersebut."
      }
    ];
    
    const passedCount = rules.filter(r => r.passed).length;
    const score = Math.round((passedCount / rules.length) * 100);
    
    return { rules, score };
  }, [title, metaTitle, metaDescription, wordCount, content, featuredImage, focusKeyword, autoSlug]);

  useEffect(() => {
    if (!editId && title) {
      setSlug(autoSlug);
    }
    if (!isMetaTitleDirty && title) {
      setMetaTitle(title);
    }
  }, [title, editId, autoSlug, isMetaTitleDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Judul dan konten tidak boleh kosong.");
      return;
    }

    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/cms/cities/${editId}` : "/api/cms/cities";

    const cleanContent = content.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\xa0/g, " ");

    const body = {
      title,
      slug: slug || autoSlug,
      content: cleanContent,
      published,
      featuredImage: featuredImage || null,
      parentId: parentId || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? "Halaman kota berhasil diperbarui!" : "Halaman kota baru berhasil dibuat!");
        router.push("/kawruh/cities");
      } else {
        toast.error(data.error || "Gagal menyimpan.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // Setup custom Quill handlers
  useEffect(() => {
    if (!isHtmlMode) {
      const timer = setTimeout(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const toolbar = quill.getModule("toolbar");
          if (toolbar) {
            toolbar.addHandler("image", () => {
              openMediaModal();
            });
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHtmlMode]);

  const openLinkModal = (quill: any, range: any, existingUrl: string) => {
    linkModalOpenRef.current = true;
    setLinkActiveQuill(quill);
    setLinkActiveRange(range);
    
    let targetAnchor: HTMLAnchorElement | null = null;
    let target = "";
    let rel = "";
    
    try {
      const leafResult = quill.getLeaf(range.index);
      const leaf = Array.isArray(leafResult) ? leafResult[0] : leafResult;
      if (leaf && leaf.parent && leaf.parent.domNode && leaf.parent.domNode.tagName === "A") {
        targetAnchor = leaf.parent.domNode as HTMLAnchorElement;
        target = targetAnchor.getAttribute("target") || "";
        rel = targetAnchor.getAttribute("rel") || "";
      }
    } catch (err) {
      console.error("Failed to parse existing link element", err);
    }
    
    setLinkActiveAnchor(targetAnchor);
    setLinkUrl(existingUrl);
    setLinkOpenInNewTab(target === "_blank");
    setLinkIsNofollow(rel.includes("nofollow"));
    setLinkIsSponsored(rel.includes("sponsored"));
    setLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    linkModalOpenRef.current = false;
    setLinkModalOpen(false);
  };

  const handleLinkSubmit = () => {
    if (!linkActiveQuill || !linkActiveRange) return;
    
    const quill = linkActiveQuill;
    const range = linkActiveRange;
    const url = linkUrl.trim();
    const anchor = linkActiveAnchor;
    
    if (!url) {
      if (anchor) {
        quill.format("link", false);
      }
      closeLinkModal();
      return;
    }
    
    if (anchor) {
      anchor.setAttribute("href", url);
      if (linkOpenInNewTab) {
        anchor.setAttribute("target", "_blank");
      } else {
        anchor.removeAttribute("target");
      }
      
      const rels = [];
      if (linkIsNofollow) rels.push("nofollow");
      if (linkIsSponsored) rels.push("sponsored");
      if (rels.length > 0) {
        anchor.setAttribute("rel", rels.join(" "));
      } else {
        anchor.removeAttribute("rel");
      }
    } else {
      quill.format("link", url);
      setTimeout(() => {
        const leafResult = quill.getLeaf(range.index);
        const leaf = Array.isArray(leafResult) ? leafResult[0] : leafResult;
        if (leaf && leaf.parent && leaf.parent.domNode && leaf.parent.domNode.tagName === "A") {
          const a = leaf.parent.domNode as HTMLAnchorElement;
          if (linkOpenInNewTab) a.setAttribute("target", "_blank");
          const rels = [];
          if (linkIsNofollow) rels.push("nofollow");
          if (linkIsSponsored) rels.push("sponsored");
          if (rels.length > 0) a.setAttribute("rel", rels.join(" "));
        }
      }, 50);
    }
    closeLinkModal();
  };

  // Re-enable custom link handler
  useEffect(() => {
    if (!isHtmlMode) {
      const timer = setTimeout(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const toolbar = quill.getModule("toolbar");
          if (toolbar) {
            toolbar.addHandler("link", () => {
              const range = quill.getSelection();
              if (range) {
                let existingUrl = "";
                const [leaf] = quill.getLeaf(range.index);
                if (leaf && leaf.parent && leaf.parent.domNode && leaf.parent.domNode.tagName === "A") {
                  existingUrl = leaf.parent.domNode.getAttribute("href") || "";
                }
                openLinkModal(quill, range, existingUrl);
              } else {
                toast.warning("Silakan pilih teks terlebih dahulu untuk menyisipkan tautan.");
              }
            });
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHtmlMode]);

  const quillModules = useMemo(() => {
    return {
      toolbar: [
        [{ header: [2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    };
  }, []);

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "align",
    "link",
    "image",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-900">Memuat Formulir...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            {editId ? "Edit Halaman Kota" : "Halaman Kota Baru"}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {editId ? "Ubah detail konten dan struktur bertingkat" : "Tentukan url induk untuk SEO regional bertingkat"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => router.push("/kawruh/cities")}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg text-xs font-bold cursor-pointer transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-brand-red hover:bg-[#e03d3d] text-white rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50 flex items-center space-x-1.5"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Icon icon="lucide:save" className="h-3.5 w-3.5" />
                <span>Simpan Halaman</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Content Editor */}
        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Nama Kota / Judul Halaman
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan nama kota, misal: Jakarta Barat..."
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red focus:outline-none block w-full p-3 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Slug URL (Auto-generate)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-kota"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red focus:outline-none block w-full p-3 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Konten Halaman Kota
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsHtmlMode(!isHtmlMode)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                    isHtmlMode
                      ? "bg-brand-red text-white border-brand-red"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Icon icon={isHtmlMode ? "lucide:eye" : "lucide:code"} className="w-3.5 h-3.5" />
                  <span>{isHtmlMode ? "Visual Editor" : "Edit HTML"}</span>
                </button>
              </div>
            </div>

            {isHtmlMode ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Masukkan source code HTML kustom..."
                className="flex-1 w-full bg-gray-900 text-gray-100 p-4 font-mono text-sm rounded-lg border border-gray-800 focus:outline-none min-h-[350px] resize-none"
              />
            ) : (
              <div className="quill-editor-wrapper flex-1 flex flex-col">
                <ReactQuill
                  ref={quillRef}
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  formats={quillFormats}
                  className="quill-premium flex-grow min-h-[350px]"
                  placeholder="Tulis konten landing page kota di sini..."
                />
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold border-t border-gray-100 pt-3">
              <span>Klik icon media untuk upload gambar.</span>
              <span className="flex items-center space-x-1 text-brand-red">
                <Icon icon="lucide:check-circle" className="w-3.5 h-3.5" />
                <span>Format HTML bersih</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="w-80 shrink-0 space-y-3">
          
          {/* Tab Navigation */}
          <div className="flex border border-gray-200 bg-white rounded-xl p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex-grow flex items-center justify-center space-x-2 py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all outline-none ${
                activeTab === "general"
                  ? "bg-brand-red text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon icon="lucide:settings" className="h-4 w-4" />
              <span>General</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex-grow flex items-center justify-center space-x-2 py-2 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all outline-none ${
                activeTab === "seo"
                  ? "bg-brand-red text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon icon="lucide:search" className="h-4 w-4" />
              <span>SEO</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-colors ${
                seoAnalysis.score >= 80 
                  ? activeTab === "seo" ? "bg-white text-green-700" : "bg-green-100 text-green-700" 
                  : seoAnalysis.score >= 50 
                    ? activeTab === "seo" ? "bg-white text-yellow-700" : "bg-yellow-100 text-yellow-700" 
                    : activeTab === "seo" ? "bg-white text-red-700" : "bg-red-100 text-red-700"
              }`}>
                {seoAnalysis.score}
              </span>
            </button>
          </div>

          {activeTab === "general" ? (
            <div className="space-y-3">
              <SidebarSection title="Publikasikan" icon="lucide:send">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Status</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPublished(false)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold cursor-pointer transition-all ${
                        !published ? "bg-brand-light-50 text-brand-red" : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon icon="lucide:file-text" className="h-3.5 w-3.5" />
                      <span>Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublished(true)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold cursor-pointer transition-all border-l border-gray-200 ${
                        published ? "bg-brand-light-50 text-brand-red" : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon icon="lucide:globe" className="h-3.5 w-3.5" />
                      <span>Terbitkan</span>
                    </button>
                  </div>
                </div>
              </SidebarSection>

              <SidebarSection title="Hubungan Induk (Kota)" icon="lucide:git-pull-request">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                    Kota Induk (Parent)
                  </label>
                  <select
                    value={parentId || ""}
                    onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg p-2.5 focus:ring-brand-red focus:border-brand-red focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="">-- Tanpa Induk (Halaman Utama) --</option>
                    {eligibleParents.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.slug})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 leading-relaxed mt-1.5 font-medium">
                    Pilih halaman kota yang setingkat di atasnya untuk membangun path URL seperti `/induk/anak`.
                  </p>
                </div>
              </SidebarSection>

              <SidebarSection title="Featured Image" icon="lucide:image">
                <div>
                  {featuredImage ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={featuredImage} alt="Featured" className="w-full aspect-[4/3] object-cover" />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage(null)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 cursor-pointer shadow-md transition-colors"
                      >
                        <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openMediaModal}
                      className="w-full aspect-[4/3] border-2 border-dashed border-gray-200 hover:border-brand-red rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-brand-red hover:bg-gray-50 transition-all cursor-pointer font-semibold text-xs gap-1.5"
                    >
                      <Icon icon="lucide:image-plus" className="h-6 w-6 text-gray-300" />
                      <span>Pilih Gambar Unggulan</span>
                    </button>
                  )}
                </div>
              </SidebarSection>
            </div>
          ) : (
            <div className="space-y-3">
              <SidebarSection title="SEO Meta" icon="lucide:search">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Kata Kunci Fokus</label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="Masukkan kata kunci fokus..."
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red focus:outline-none block w-full p-2.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Meta Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => {
                          setMetaTitle(e.target.value);
                          setIsMetaTitleDirty(true);
                        }}
                        placeholder="Masukkan meta title..."
                        maxLength={60}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red focus:outline-none block w-full p-2.5 pr-12 font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">
                        {metaTitle.length} / 60
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                      Meta Description
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Masukkan meta description..."
                        maxLength={160}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red focus:outline-none block w-full p-2.5"
                      />
                      <span className="absolute right-2 bottom-2 text-[10px] font-bold text-gray-300">
                        {metaDescription.length} / 160
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Preview di Google</label>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-1">
                      <p className="text-[10px] text-green-700 font-medium truncate">lanyardjakarta.co.id &rsaquo; {autoSlug || "contoh-halaman-kota"}</p>
                      <p className="text-sm font-bold text-blue-700 leading-tight truncate">{metaTitle || title || "Judul halaman Anda akan muncul di sini"}</p>
                      <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{metaDescription || "Masukkan meta description untuk melihat preview di hasil pencarian Google."}</p>
                    </div>
                  </div>
                </div>
              </SidebarSection>

              <SidebarSection title="Analisis SEO" icon="lucide:check-circle">
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-150 p-3.5 rounded-xl shadow-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">Skor SEO</span>
                      <span className="text-lg font-extrabold text-gray-900 mt-0.5 block">{seoAnalysis.score} / 100</span>
                    </div>
                    <div className={`flex items-center justify-center h-11 w-11 rounded-full border-4 font-extrabold text-xs transition-colors ${
                      seoAnalysis.score >= 80 
                        ? "border-green-500 text-green-700 bg-green-50" 
                        : seoAnalysis.score >= 50 
                          ? "border-yellow-500 text-yellow-700 bg-yellow-50" 
                          : "border-red-500 text-red-700 bg-red-50"
                    }`}>
                      {seoAnalysis.score}%
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Detail Checklist</label>
                    <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                      {seoAnalysis.rules.map((rule) => (
                        <div key={rule.id} className="py-2.5 space-y-1">
                          <div className="flex items-start space-x-2.5">
                            {rule.passed ? (
                              <Icon icon="lucide:check-circle-2" className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            ) : (
                              <Icon icon="lucide:alert-circle" className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-[11px] font-bold leading-tight ${rule.passed ? "text-gray-900" : "text-gray-500"}`}>
                              {rule.label}
                            </span>
                          </div>
                          {!rule.passed && (
                            <p className="text-[9px] text-gray-400 font-semibold pl-6.5 leading-relaxed">
                              {rule.tip}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SidebarSection>
            </div>
          )}
        </div>
      </div>

      {/* Media Modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Pilih Gambar dari Media Library</h3>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Media Library Main Panel */}
              <div
                className="flex-1 p-6 overflow-y-auto space-y-4"
                onDragEnter={() => setMediaDragActive(true)}
                onDragOver={(e) => { e.preventDefault(); setMediaDragActive(true); }}
                onDragLeave={() => setMediaDragActive(false)}
                onDrop={handleMediaDrop}
              >
                <div
                  className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer relative ${
                    mediaDragActive ? "border-brand-red bg-brand-light-50" : "border-gray-200 text-gray-400"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        for (const file of Array.from(e.target.files)) await handleMediaUpload(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1">
                    <Icon icon="lucide:upload-cloud" className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="text-xs font-bold text-gray-600">
                      Tarik & Letakkan gambar di sini atau klik untuk mengunggah
                    </p>
                    <p className="text-[10px] text-gray-300">Mendukung JPEG, PNG, WEBP, SVG</p>
                  </div>
                </div>

                {mediaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-red border-t-transparent" />
                  </div>
                ) : imagesOnly.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-400 font-medium">Belum ada gambar di media library.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {paginatedImages.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            // If user is choosing featured image
                            if (!mediaModalOpen) return;
                            if (quillRef.current?.getEditor().getSelection() === null) {
                              setFeaturedImage(m.url);
                              setMediaModalOpen(false);
                            } else {
                              // Insert to Quill
                              setAltPromptUrl(m.url);
                              setCustomAltText(getAltFromFilename(m.url) || "");
                              setAltPromptOpen(true);
                            }
                          }}
                          className="group relative aspect-square rounded-lg border border-gray-100 overflow-hidden bg-gray-50 hover:border-brand-red hover:shadow-md cursor-pointer transition-all"
                        >
                          <img src={m.url} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] text-white font-bold bg-brand-red px-2 py-0.5 rounded">
                              Pilih
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold text-gray-400">
                        <span>
                          Menampilkan {(mediaPage - 1) * 21 + 1} - {Math.min(mediaPage * 21, imagesOnly.length)} dari {imagesOnly.length}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            disabled={mediaPage === 1}
                            onClick={() => setMediaPage((prev) => Math.max(prev - 1, 1))}
                            className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded disabled:opacity-30 cursor-pointer"
                          >
                            <Icon icon="lucide:chevron-left" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={mediaPage === totalPages}
                            onClick={() => setMediaPage((prev) => Math.min(prev + 1, totalPages))}
                            className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded disabled:opacity-30 cursor-pointer"
                          >
                            <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alt Text Prompt Modal */}
      {altPromptOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Tambahkan Deskripsi Gambar (SEO Alt)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Alt Text</label>
                <input
                  type="text"
                  value={customAltText}
                  onChange={(e) => setCustomAltText(e.target.value)}
                  placeholder="Deskripsikan gambar ini untuk SEO..."
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg block w-full p-2.5 focus:ring-brand-red focus:border-brand-red focus:outline-none font-medium"
                />
              </div>
              <p className="text-[10px] text-gray-400 leading-normal font-medium">
                Penting untuk SEO agar Google Images memahami konteks gambar Anda.
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAltPromptOpen(false);
                  handleMediaSelect(altPromptUrl);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Lewati
              </button>
              <button
                type="button"
                onClick={() => {
                  setAltPromptOpen(false);
                  handleMediaSelect(altPromptUrl, customAltText);
                }}
                className="px-4 py-2 bg-brand-red hover:bg-[#e03d3d] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Terapkan & Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quill Custom Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Sisipkan / Edit Tautan</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">URL Link</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com..."
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg block w-full p-2.5 focus:ring-brand-red focus:border-brand-red focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-2 pt-1 font-semibold text-xs text-gray-600">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkOpenInNewTab}
                    onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red"
                  />
                  <span>Buka di tab baru (target="_blank")</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkIsNofollow}
                    onChange={(e) => setLinkIsNofollow(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red"
                  />
                  <span>Terapkan rel="nofollow" (untuk SEO outbound)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkIsSponsored}
                    onChange={(e) => setLinkIsSponsored(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red"
                  />
                  <span>Terapkan rel="sponsored" (iklan/afiliasi)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={closeLinkModal}
                className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-brand-red hover:bg-[#e03d3d] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Simpan Link
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
