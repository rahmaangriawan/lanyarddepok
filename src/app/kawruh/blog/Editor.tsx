"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/Toast";
import { formatHtml, getAltFromFilename } from "@/lib/html-formatter";
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
}) as any;

interface Category {
  id: number;
  name: string;
  type: string;
}

interface Media {
  id: number;
  filename: string;
  url: string;
  mimetype: string;
}

/* ─── Custom Dropdown Component ─── */
function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  icon,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <span className="flex items-center space-x-2 truncate">
          {icon && (
            <Icon icon={icon} className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          )}
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {selectedLabel}
          </span>
        </span>
        <Icon
          icon="lucide:chevron-down"
          className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                value === opt.value
                  ? "bg-brand-light-50 text-brand-red font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Accordion Section ─── */
function SidebarSection({
  title,
  icon,
  defaultOpen = true,
  draggable = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging = false,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`border border-gray-200 rounded-xl overflow-hidden bg-white transition-all ${
        isDragging
          ? "opacity-40 border-dashed border-brand-red scale-[0.98]"
          : ""
      }`}
    >
      <div className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 text-sm font-bold text-gray-800 transition-colors">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-grow flex items-center space-x-2 text-left cursor-pointer"
        >
          <Icon
            icon={icon}
            className="h-4 w-4 text-gray-500 shrink-0 pointer-events-none"
          />
          <span className="pointer-events-none">{title}</span>
        </button>
        <div className="flex items-center space-x-2 shrink-0">
          {draggable && (
            <span
              title="Seret untuk memindahkan"
              className="cursor-grab active:cursor-grabbing"
            >
              <Icon
                icon="lucide:grip-vertical"
                className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors pointer-events-none"
              />
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="cursor-pointer flex items-center justify-center p-0.5 hover:bg-gray-200/50 rounded transition-colors"
          >
            <Icon
              icon="lucide:chevron-down"
              className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-4 space-y-3 border-t border-gray-100 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BlogEditor({ editId }: { editId?: number }) {
  const { toast } = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featDragActive, setFeatDragActive] = useState(false);
  const [isMetaTitleDirty, setIsMetaTitleDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");
  const [focusKeyword, setFocusKeyword] = useState("");

  // Date & Time pickers
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");

  // Drag & drop state for right sidebar
  const [sidebarOrder, setSidebarOrder] = useState<string[]>([
    "publish",
    "featured",
    "seo",
  ]);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  const handleDragStart = (key: string) => {
    setDraggedKey(key);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;
    const currentIndex = sidebarOrder.indexOf(draggedKey);
    const targetIndex = sidebarOrder.indexOf(targetKey);
    if (currentIndex === -1 || targetIndex === -1) return;
    const newOrder = [...sidebarOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, draggedKey);
    setSidebarOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedKey(null);
  };

  // Custom rich editor states
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [hoveredGrid, setHoveredGrid] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const quillRef = useRef<any>(null);
  const lastSelectionRef = useRef<{ index: number; length: number } | null>(
    null,
  );

  // Media modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"featured" | "editor">(
    "featured",
  );
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaDragActive, setMediaDragActive] = useState(false);
  const [mediaPage, setMediaPage] = useState(1);

  const imagesOnly = useMemo(
    () => mediaList.filter((m) => m.mimetype.startsWith("image/")),
    [mediaList],
  );
  const totalPages = Math.ceil(imagesOnly.length / 21);
  const paginatedImages = useMemo(() => {
    const start = (mediaPage - 1) * 21;
    return imagesOnly.slice(start, start + 21);
  }, [imagesOnly, mediaPage]);

  // Custom image alt states
  const [altPromptOpen, setAltPromptOpen] = useState(false);
  const [altPromptUrl, setAltPromptUrl] = useState("");
  const [customAltText, setCustomAltText] = useState("");

  // Custom link popup states
  const [linkTooltip, setLinkTooltip] = useState<{
    url: string;
    rect: DOMRect | null;
    anchor: HTMLAnchorElement | null;
  } | null>(null);

  // Custom link states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const linkModalOpenRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);
  const [linkIsNofollow, setLinkIsNofollow] = useState(false);
  const [linkIsSponsored, setLinkIsSponsored] = useState(false);
  const [linkActiveQuill, setLinkActiveQuill] = useState<any>(null);
  const [linkActiveRange, setLinkActiveRange] = useState<any>(null);
  const [linkActiveAnchor, setLinkActiveAnchor] =
    useState<HTMLAnchorElement | null>(null);

  const fetchPostAndCats = useCallback(async () => {
    try {
      const catsRes = await fetch("/api/cms/categories");
      const catsData = await catsRes.json();
      if (catsRes.ok) {
        const allCats = catsData.categories || [];
        setCategories(allCats.filter((c: any) => c.type === "BLOG"));
      }

      if (editId) {
        const postRes = await fetch(`/api/cms/posts/${editId}`);
        const postData = await postRes.json();
        if (postRes.ok && postData.post) {
          const post = postData.post;
          setTitle(post.title);
          setSlug(post.slug);
          setContent(post.content || "");
          setPublished(post.published);
          setFeaturedImage(post.featuredImage || "");
          setCategoryId(post.category?.id?.toString() || "");

          setMetaTitle(post.metaTitle || post.title || "");
          setMetaDescription(post.metaDescription || "");
          setIsMetaTitleDirty(!!post.metaTitle);

          const d = post.createdAt ? new Date(post.createdAt) : new Date();
          const dateStr = d.toLocaleDateString("sv-SE", {
            timeZone: "Asia/Jakarta",
          });
          const timeStr = d.toLocaleTimeString("it-IT", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
          });
          setPublishDate(dateStr);
          setPublishTime(timeStr);
        } else {
          setError("Gagal memuat detail postingan.");
        }
      } else {
        // Create mode: set initial date/time in Jakarta timezone
        const now = new Date();
        const dateStr = now.toLocaleDateString("sv-SE", {
          timeZone: "Asia/Jakarta",
        });
        const timeStr = now.toLocaleTimeString("it-IT", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
        });
        setPublishDate(dateStr);
        setPublishTime(timeStr);
      }
    } catch (err) {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [editId]);

  useEffect(() => {
    fetchPostAndCats();
  }, [fetchPostAndCats]);

  useEffect(() => {
    if (editId) {
      document.title = `Edit Postingan: ${title || "Loading..."} | Kawruh Admin`;
    } else {
      document.title = "Buat Postingan Baru | Kawruh Admin";
    }
  }, [editId, title]);

  const fetchMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/cms/media");
      const data = await res.json();
      if (res.ok) setMediaList(data.mediaList || []);
    } catch (err) {
      console.error("Failed to load media");
    } finally {
      setMediaLoading(false);
    }
  };

  const openMediaModal = (target: "featured" | "editor") => {
    setMediaTarget(target);
    setMediaModalOpen(true);
    setMediaPage(1);
    setAltPromptUrl("");
    setCustomAltText("");
    fetchMedia();
  };

  const handleMediaSelect = (url: string, customAlt?: string) => {
    if (mediaTarget === "featured") {
      setFeaturedImage(url);
      toast.success("Gambar unggulan berhasil dipasang!");
    } else {
      const quill = quillRef.current?.getEditor();
      const altText = customAlt || getAltFromFilename(url) || "media";
      if (quill) {
        const range = quill.getSelection(true);
        const insertAt = range ? range.index : quill.getLength();
        quill.insertEmbed(insertAt, "image", url);
        setTimeout(() => {
          try {
            const editorElement = quill.root;
            const images = editorElement.querySelectorAll(`img[src="${url}"]`);
            if (images.length > 0) {
              const lastImg = images[images.length - 1];
              lastImg.setAttribute("alt", altText);
            }
          } catch (err) {
            console.error("Failed to set image alt text in DOM", err);
          }
        }, 50);
        quill.setSelection(insertAt + 1);
      } else {
        setContent(
          (prev) =>
            prev +
            `<p><img src="${url}" alt="${altText}" style="max-width:100%" /></p>`,
        );
      }
    }
    setMediaModalOpen(false);
    setAltPromptOpen(false);
    setAltPromptUrl("");
    setCustomAltText("");
  };

  const handleImageClickInModal = (url: string) => {
    setAltPromptUrl(url);
    setCustomAltText(getAltFromFilename(url));
  };

  const handleMediaUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) setMediaList((prev) => [data.media, ...prev]);
    } catch (err) {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleMediaDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setMediaDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      for (const file of Array.from(e.dataTransfer.files))
        await handleMediaUpload(file);
    }
  };

  const handleFeaturedDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setFeatDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format berkas harus berupa gambar.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeaturedImage(data.media.url);
        toast.success("Gambar unggulan berhasil diunggah!");
      } else {
        toast.error(data.error || "Gagal mengunggah gambar unggulan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const goBack = () => {
    router.push("/kawruh/blog");
  };

  const handleSubmit = async (asDraft?: boolean) => {
    if (!title || !content) {
      toast.error("Judul dan konten tidak boleh kosong.");
      return;
    }
    setSaving(true);

    const shouldPublish = asDraft === true ? false : published;
    const url = editId ? `/api/cms/posts/${editId}` : "/api/cms/posts";
    const method = editId ? "PUT" : "POST";

    const localDt = new Date(`${publishDate}T${publishTime}`);
    const createdAt = localDt.toISOString();

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          published: shouldPublish,
          featuredImage,
          categoryId: categoryId || null,
          createdAt,
          metaTitle,
          metaDescription,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          editId
            ? "Postingan berhasil diperbarui!"
            : "Postingan baru berhasil dibuat!",
        );
        if (!editId && data.post?.id) {
          router.push(`/kawruh/blog/edit/${data.post.id}`);
        }
      } else {
        toast.error(data.error || "Gagal menyimpan postingan.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!title || !content) {
      toast.error("Judul dan konten tidak boleh kosong.");
      return;
    }
    setSaving(true);
    const shouldPublish = published;
    const url = editId ? `/api/cms/posts/${editId}` : "/api/cms/posts";
    const method = editId ? "PUT" : "POST";

    const localDt = new Date(`${publishDate}T${publishTime}`);
    const createdAt = localDt.toISOString();

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          published: shouldPublish,
          featuredImage,
          categoryId: categoryId || null,
          createdAt,
          metaTitle,
          metaDescription,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        let activeId = editId || data.post?.id;
        if (activeId && data.post?.slug) {
          if (!shouldPublish) {
            window.open(
              `/blog/${data.post.slug}/?preview-${activeId}`,
              "_blank",
            );
          } else {
            window.open(`/blog/${data.post.slug}`, "_blank");
          }
        }
      } else {
        toast.error(data.error || "Gagal menyimpan postingan.");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const insertTable = (rows: number, cols: number) => {
    let html =
      '<table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; margin: 10px 0;"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html +=
          '<td style="border: 1px solid #e5e7eb; padding: 8px; min-width: 50px;">&nbsp;</td>';
      }
      html += "</tr>";
    }
    html += "</tbody></table>";

    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      const insertAt = range ? range.index : quill.getLength();
      quill.clipboard.dangerouslyPasteHTML(insertAt, html);
    } else {
      setContent((prev) => prev + html);
    }
  };

  useEffect(() => {
    if (!isHtmlMode) {
      const timer = setTimeout(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const toolbar = quill.getModule("toolbar");
          if (toolbar) {
            toolbar.addHandler("image", () => {
              openMediaModal("editor");
            });
          }

          // Handle click inside the editor to find links
          const handleEditorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (anchor && quill.root.contains(anchor)) {
              // Clicked a link inside editor!
              const rect = anchor.getBoundingClientRect();
              setLinkTooltip({
                url: anchor.getAttribute("href") || "",
                rect,
                anchor,
              });
            } else {
              setLinkTooltip(null);
            }
          };

          quill.root.addEventListener("click", handleEditorClick);

          // Also hide tooltip on selection change if selection is not in a link
          const handleSelectionChange = (range: any) => {
            if (range) {
              lastSelectionRef.current = range;
              const [leaf] = quill.getLeaf(range.index);
              if (
                leaf &&
                leaf.parent &&
                leaf.parent.domNode &&
                leaf.parent.domNode.tagName === "A"
              ) {
                // keep tooltip or update it
                const anchor = leaf.parent.domNode as HTMLAnchorElement;
                const rect = anchor.getBoundingClientRect();
                setLinkTooltip({
                  url: anchor.getAttribute("href") || "",
                  rect,
                  anchor,
                });
                return;
              }
            }
            setLinkTooltip(null);
          };
          quill.on("selection-change", handleSelectionChange);

          return () => {
            quill.root.removeEventListener("click", handleEditorClick);
            quill.off("selection-change", handleSelectionChange);
          };
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
    let initialText = "";

    if (range && range.length > 0) {
      initialText = quill.getText(range.index, range.length);
    }
    setLinkText(initialText);

    try {
      const leafResult = quill.getLeaf(range.index);
      const leaf = Array.isArray(leafResult) ? leafResult[0] : leafResult;
      if (
        leaf &&
        leaf.parent &&
        leaf.parent.domNode &&
        leaf.parent.domNode.tagName === "A"
      ) {
        targetAnchor = leaf.parent.domNode as HTMLAnchorElement;
        target = targetAnchor.getAttribute("target") || "";
        rel = targetAnchor.getAttribute("rel") || "";
        if (!initialText) {
          initialText = targetAnchor.innerText || "";
          setLinkText(initialText);
        }
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
    const text = linkText.trim();

    if (!url) {
      if (anchor) {
        const blot = (quill as any).constructor.find(anchor);
        if (blot) {
          const index = quill.getIndex(blot);
          const length = blot.length();
          quill.formatText(index, length, "link", false);
        }
      }
      closeLinkModal();
      return;
    }

    if (anchor) {
      const blot = (quill as any).constructor.find(anchor);
      if (blot) {
        const index = quill.getIndex(blot);
        const length = blot.length();
        const originalText = quill.getText(index, length);
        if (text && text !== originalText) {
          quill.deleteText(index, length);
          quill.insertText(index, text);
          quill.formatText(index, text.length, "link", url);

          setTimeout(() => {
            try {
              const editorElement = quill.root;
              const anchors = editorElement.querySelectorAll(
                `a[href="${url}"]`,
              );
              if (anchors.length > 0) {
                const newAnchor = anchors[anchors.length - 1];
                if (linkOpenInNewTab) {
                  newAnchor.setAttribute("target", "_blank");
                } else {
                  newAnchor.removeAttribute("target");
                }
                const rels = [];
                if (linkOpenInNewTab) rels.push("noopener", "noreferrer");
                if (linkIsNofollow) rels.push("nofollow");
                if (linkIsSponsored) rels.push("sponsored");

                if (rels.length > 0) {
                  newAnchor.setAttribute("rel", rels.join(" "));
                } else {
                  newAnchor.removeAttribute("rel");
                }
              }
              setContent(quill.root.innerHTML);
            } catch (err) {
              console.error(err);
            }
          }, 50);

          setTimeout(() => {
            setContent(quill.root.innerHTML);
          }, 100);
          closeLinkModal();
          return;
        }
      }

      anchor.setAttribute("href", url);
      if (linkOpenInNewTab) {
        anchor.setAttribute("target", "_blank");
      } else {
        anchor.removeAttribute("target");
      }

      const rels = [];
      if (linkOpenInNewTab) rels.push("noopener", "noreferrer");
      if (linkIsNofollow) rels.push("nofollow");
      if (linkIsSponsored) rels.push("sponsored");

      if (rels.length > 0) {
        anchor.setAttribute("rel", rels.join(" "));
      } else {
        anchor.removeAttribute("rel");
      }
      quill.updateContents({ ops: [] });
    } else {
      if (range.length === 0) {
        const insertText = text || url;
        quill.insertText(range.index, insertText);
        quill.formatText(range.index, insertText.length, "link", url);

        setTimeout(() => {
          try {
            const editorElement = quill.root;
            const anchors = editorElement.querySelectorAll(`a[href="${url}"]`);
            if (anchors.length > 0) {
              const newAnchor = anchors[anchors.length - 1];
              if (linkOpenInNewTab) {
                newAnchor.setAttribute("target", "_blank");
              } else {
                newAnchor.removeAttribute("target");
              }
              const rels = [];
              if (linkOpenInNewTab) rels.push("noopener", "noreferrer");
              if (linkIsNofollow) rels.push("nofollow");
              if (linkIsSponsored) rels.push("sponsored");

              if (rels.length > 0) {
                newAnchor.setAttribute("rel", rels.join(" "));
              } else {
                newAnchor.removeAttribute("rel");
              }
            }
            setContent(quill.root.innerHTML);
          } catch (err) {
            console.error("Failed to insert attributes", err);
          }
        }, 50);
      } else {
        const originalText = quill.getText(range.index, range.length);
        let finalLength = range.length;
        if (text && text !== originalText) {
          quill.deleteText(range.index, range.length);
          quill.insertText(range.index, text);
          finalLength = text.length;
        }

        const tempUrl = `https://temp-link-${Date.now()}`;
        quill.formatText(range.index, finalLength, "link", tempUrl);

        setTimeout(() => {
          try {
            const editorElement = quill.root;
            const newAnchor = editorElement.querySelector(
              `a[href="${tempUrl}"]`,
            );
            if (newAnchor) {
              newAnchor.setAttribute("href", url);
              if (linkOpenInNewTab) {
                newAnchor.setAttribute("target", "_blank");
              } else {
                newAnchor.removeAttribute("target");
              }

              const rels = [];
              if (linkOpenInNewTab) rels.push("noopener", "noreferrer");
              if (linkIsNofollow) rels.push("nofollow");
              if (linkIsSponsored) rels.push("sponsored");

              if (rels.length > 0) {
                newAnchor.setAttribute("rel", rels.join(" "));
              } else {
                newAnchor.removeAttribute("rel");
              }
            }
            setContent(quill.root.innerHTML);
          } catch (err) {
            console.error("Failed to insert custom attributes to link", err);
          }
        }, 50);
      }
    }
    setTimeout(() => {
      setContent(quill.root.innerHTML);
    }, 100);
    closeLinkModal();
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: "#custom-toolbar-blog",
        handlers: {
          link: function (value: any) {
            if (linkModalOpenRef.current) return;
            const quill = quillRef.current?.getEditor();
            if (!quill) return;
            if (value) {
              let range = quill.getSelection(true);
              if (!range || range.length === 0) {
                if (
                  lastSelectionRef.current &&
                  lastSelectionRef.current.length > 0
                ) {
                  range = lastSelectionRef.current;
                }
              }
              const rangeToUse = range || {
                index: quill.getLength(),
                length: 0,
              };
              const existingUrl = range
                ? quill.getFormat(range).link || ""
                : "";
              openLinkModal(quill, rangeToUse, existingUrl);
            } else {
              quill.format("link", false);
            }
          },
        },
      },
    }),
    [],
  );

  const wordCount = useMemo(() => {
    const cleanText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\xa0/g, " ")
      .replace(/&[a-z0-9#]+/gi, "")
      .trim();
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).filter((word) => word.length > 0).length;
  }, [content]);

  const autoSlug = useMemo(() => {
    if (slug) return slug;
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }, [title, slug]);

  const seoAnalysis = useMemo(() => {
    // 1. Title filled
    const titleFilled = title.trim().length > 0;

    // 2. Meta filled
    const metaFilled =
      metaTitle.trim().length > 0 && metaDescription.trim().length > 0;

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
    const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
    const first100Words = words.slice(0, 100).join(" ");
    const passKeywordInFirst100 = focusKeyword
      ? first100Words.toLowerCase().includes(focusKeyword.toLowerCase())
      : false;

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
        const pWords = cleanP.split(/\s+/).filter((w) => w.length > 0).length;
        if (pWords > 150) {
          hasLongParagraph = true;
        }
      }
    }
    const passShortParagraphs = paragraphCount > 0 && !hasLongParagraph;

    // 6. Hierarchy of Headings (at least one H2 or H3, and H1/H2/H3 correct hierarchy - simplify: contains H2 or H3)
    const hasHeading = /<h[23]/i.test(content);

    // 7. Internal link
    const hasInternalLink =
      /<a\s+(?:[^>]*?\s+)?href=["'](?:\/|https?:\/\/(?:www\.)?(?:lanyardjakarta\.co\.id|jakartalanyard\.com))/i.test(
        content,
      );

    // 8. Featured image selected
    const hasFeaturedImage = !!featuredImage;

    // 9. Image in content
    const hasImageInContent = /<img/i.test(content);

    // 10. Table in content
    const hasTableInContent = /<table/i.test(content);

    // 11. Short slug matching keyword
    const passSlugKeyword = focusKeyword
      ? autoSlug.toLowerCase().includes(focusKeyword.toLowerCase()) &&
        autoSlug.length <= 50
      : false;

    const rules = [
      {
        id: "titleFilled",
        label: "Judul terisi",
        passed: titleFilled,
        tip: "Judul artikel belum diisi.",
      },
      {
        id: "metaFilled",
        label: "Meta title dan meta desk terisi",
        passed: metaFilled,
        tip: "Lengkapi Meta Title dan Meta Description di bawah.",
      },
      {
        id: "passWordCount",
        label: "Jumlah kata minimal 400",
        passed: passWordCount,
        tip: `Panjang artikel saat ini ${wordCount} kata. Tambahkan konten hingga minimal 400 kata.`,
      },
      {
        id: "passKeywordInFirst100",
        label: "100 kata pertama mengandung kata kunci",
        passed: passKeywordInFirst100,
        tip: focusKeyword
          ? `Kata kunci fokus "${focusKeyword}" tidak ditemukan di 100 kata pertama.`
          : "Masukkan kata kunci fokus terlebih dahulu untuk menguji bagian ini.",
      },
      {
        id: "passShortParagraphs",
        label: "Paragraf pendek (maksimal 150 kata per paragraf)",
        passed: passShortParagraphs,
        tip:
          paragraphCount === 0
            ? "Artikel belum berisi paragraf."
            : "Terdapat paragraf yang terlalu panjang (lebih dari 150 kata). Pecah menjadi paragraf yang lebih pendek.",
      },
      {
        id: "hasHeading",
        label: "Hierarki heading (terdapat heading H2 atau H3)",
        passed: hasHeading,
        tip: "Gunakan setidaknya satu heading H2 atau H3 untuk struktur artikel yang lebih baik.",
      },
      {
        id: "hasInternalLink",
        label: "Internal link",
        passed: hasInternalLink,
        tip: "Tambahkan tautan (link) internal ke halaman lain dalam situs lanyardjakarta.co.id.",
      },
      {
        id: "hasFeaturedImage",
        label: "Gambar unggulan dipilih",
        passed: hasFeaturedImage,
        tip: "Pilih gambar unggulan (featured image) untuk artikel ini.",
      },
      {
        id: "hasImageInContent",
        label: "Gambar di dalam artikel",
        passed: hasImageInContent,
        tip: "Sisipkan setidaknya satu gambar di dalam konten artikel menggunakan tombol media.",
      },
      {
        id: "hasTableInContent",
        label: "Tabel di dalam artikel",
        passed: hasTableInContent,
        tip: "Sisipkan setidaknya satu tabel di dalam artikel untuk mempermudah pemahaman data.",
      },
      {
        id: "passSlugKeyword",
        label: "Slug pendek dan mengandung kata kunci",
        passed: passSlugKeyword,
        tip: focusKeyword
          ? `Slug "${autoSlug}" harus di bawah 50 karakter dan mengandung "${focusKeyword}".`
          : "Masukkan kata kunci fokus dan pastikan slug mengandung kata kunci tersebut.",
      },
    ];

    const passedCount = rules.filter((r) => r.passed).length;
    const score = Math.round((passedCount / rules.length) * 100);

    return { rules, score };
  }, [
    title,
    metaTitle,
    metaDescription,
    wordCount,
    content,
    featuredImage,
    focusKeyword,
    autoSlug,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-red border-t-transparent" />
          <p className="text-sm font-bold text-gray-900">
            Memuat Editor Postingan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <Icon icon="lucide:arrow-left" className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-medium text-gray-900 tracking-tight">
              {editId ? "Edit Postingan" : "Buat Postingan Baru"}
            </h1>
          </div>
          <p className="text-xs font-normal text-gray-400 mt-1 ml-8">
            Tulis dan terbitkan artikel blog terbaik Anda.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={saving}
            className="flex items-center space-x-1.5 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            <Icon icon="lucide:eye" className="h-3.5 w-3.5" />
            <span>Pratinjau</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            <Icon
              icon={published ? "lucide:send" : "lucide:file-text"}
              className="h-3.5 w-3.5"
            />
            <span>
              {saving
                ? "Menyimpan..."
                : published
                  ? "Terbitkan"
                  : "Simpan Draf"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div
          className="flex p-3 text-xs text-red-800 rounded-lg bg-red-50 border border-red-200"
          role="alert"
        >
          <Icon
            icon="lucide:alert-circle"
            className="flex-shrink-0 inline w-4 h-4 mr-2 mt-0.5"
          />
          <div>
            <span className="font-bold">Gagal:</span> {error}
          </div>
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* ─── LEFT: Main Editor ─── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                Judul Postingan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!isMetaTitleDirty) {
                      setMetaTitle(e.target.value.substring(0, 60));
                    }
                  }}
                  placeholder="Masukkan judul artikel yang menarik..."
                  maxLength={70}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">
                  {title.length} / 70
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Slug (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon
                      icon="lucide:link"
                      className="h-3.5 w-3.5 text-gray-400"
                    />
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="contoh-artikel-blog"
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pl-9"
                  />
                </div>
                {(title || slug) && (
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    URL artikel: jakartalanyard.com/blog/
                    <span className="text-gray-500">
                      {autoSlug || "contoh-artikel-blog"}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Kategori
                </label>
                <CustomSelect
                  value={categoryId}
                  onChange={setCategoryId}
                  icon="lucide:tag"
                  placeholder="Pilih kategori"
                  options={[
                    { value: "", label: "— Tanpa Kategori —" },
                    ...categories.map((c) => ({
                      value: c.id.toString(),
                      label: c.name,
                    })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {/* Quill Custom Toolbar */}
            {!isHtmlMode && (
              <div
                id="custom-toolbar-blog"
                className="!border-none !bg-gray-50/50 p-2 flex flex-wrap items-center"
              >
                <span className="ql-formats">
                  <select className="ql-header" defaultValue="">
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                    <option value="">Normal</option>
                  </select>
                </span>
                <span className="ql-formats">
                  <button
                    type="button"
                    className="ql-bold"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    className="ql-italic"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    className="ql-underline"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    className="ql-strike"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </span>
                <span className="ql-formats">
                  <button
                    type="button"
                    className="ql-list"
                    value="ordered"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    className="ql-list"
                    value="bullet"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </span>
                <span className="ql-formats">
                  <button
                    type="button"
                    className="ql-blockquote"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    className="ql-code-block"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </span>
                <span className="ql-formats">
                  <button
                    type="button"
                    className="ql-link"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </span>
                <span className="ql-formats">
                  <button
                    type="button"
                    className="ql-clean"
                    onMouseDown={(e) => e.preventDefault()}
                  />
                </span>

                {/* Custom Action buttons inside the toolbar */}
                <span className="flex items-center space-x-1 ml-2 pl-2 border-l border-gray-200 shrink-0">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => setShowTableGrid(!showTableGrid)}
                      className="h-7 w-7 flex items-center justify-center text-gray-500 hover:text-brand-red hover:bg-gray-100 rounded transition-colors font-bold cursor-pointer"
                      title="Sisipkan Tabel"
                    >
                      <Icon icon="lucide:table" className="h-4 w-4" />
                    </button>

                    {showTableGrid && (
                      <div
                        className="absolute left-0 z-30 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                        onMouseLeave={() => setHoveredGrid(null)}
                        style={{ top: "100%" }}
                      >
                        <div className="text-[9px] font-bold text-gray-400 mb-1 text-center">
                          {hoveredGrid
                            ? `${hoveredGrid.r + 1} × ${hoveredGrid.c + 1} Tabel`
                            : "Pilih Ukuran"}
                        </div>
                        <div className="flex flex-col gap-1">
                          {Array.from({ length: 5 }).map((_, rIndex) => (
                            <div key={rIndex} className="flex gap-1">
                              {Array.from({ length: 5 }).map((_, cIndex) => {
                                const isHighlighted =
                                  hoveredGrid &&
                                  rIndex <= hoveredGrid.r &&
                                  cIndex <= hoveredGrid.c;
                                return (
                                  <div
                                    key={cIndex}
                                    className={`w-3.5 h-3.5 rounded border transition-all cursor-pointer ${
                                      isHighlighted
                                        ? "bg-brand-red border-brand-red"
                                        : "bg-gray-100 border-gray-200 hover:border-gray-300"
                                    }`}
                                    onMouseEnter={() =>
                                      setHoveredGrid({ r: rIndex, c: cIndex })
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      insertTable(rIndex + 1, cIndex + 1);
                                      setShowTableGrid(false);
                                      setHoveredGrid(null);
                                    }}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openMediaModal("editor")}
                    className="h-7 w-7 flex items-center justify-center text-gray-500 hover:text-brand-red hover:bg-gray-100 rounded transition-colors font-bold cursor-pointer"
                    title="Gambar (Media)"
                  >
                    <Icon icon="lucide:image" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setContent(formatHtml(content));
                      setIsHtmlMode(true);
                    }}
                    className="h-7 w-7 flex items-center justify-center text-gray-500 hover:text-brand-red hover:bg-gray-100 rounded transition-colors font-bold cursor-pointer"
                    title="Lihat HTML"
                  >
                    <Icon icon="lucide:code" className="h-4 w-4" />
                  </button>
                </span>
              </div>
            )}

            {isHtmlMode && (
              <div className="border-b border-gray-150 bg-gray-50/50 p-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHtmlMode(false)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  <Icon icon="lucide:eye" className="h-3.5 w-3.5" />
                  <span>Visual Editor</span>
                </button>
              </div>
            )}

            {/* Editor Component */}
            <div className="border-t border-gray-100">
              {isHtmlMode ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[500px] max-h-[600px] overflow-y-auto p-5 font-mono text-xs text-gray-800 bg-gray-50 border-none focus:outline-none block resize-y"
                  placeholder="Masukkan kode HTML Anda di sini..."
                />
              ) : (
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  placeholder="Mulai menulis artikel Anda di sini..."
                  style={{ minHeight: "500px" }}
                />
              )}
            </div>
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-semibold">
              <span>{wordCount} kata</span>
              <span className="flex items-center space-x-1">
                <Icon icon="lucide:check-circle" className="h-3 w-3" />
                <span>Disimpan otomatis</span>
              </span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Sidebar Panels (Tabs Component) ─── */}
        <div className="w-80 shrink-0 space-y-3 hidden lg:block">
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
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-colors ${
                  seoAnalysis.score >= 80
                    ? activeTab === "seo"
                      ? "bg-white text-green-700"
                      : "bg-green-100 text-green-700"
                    : seoAnalysis.score >= 50
                      ? activeTab === "seo"
                        ? "bg-white text-yellow-700"
                        : "bg-yellow-100 text-yellow-700"
                      : activeTab === "seo"
                        ? "bg-white text-red-700"
                        : "bg-red-100 text-red-700"
                }`}
              >
                {seoAnalysis.score}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "general" ? (
            <div className="space-y-3">
              {/* 1. Publikasikan Section */}
              <SidebarSection
                title="Publikasikan"
                icon="lucide:send"
                defaultOpen={true}
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                    Status
                  </label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPublished(false)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold cursor-pointer transition-all ${
                        !published
                          ? "bg-brand-light-50 text-brand-red"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon icon="lucide:file-text" className="h-3.5 w-3.5" />
                      <span>Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublished(true)}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold cursor-pointer transition-all border-l border-gray-200 ${
                        published
                          ? "bg-brand-light-50 text-brand-red"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon icon="lucide:globe" className="h-3.5 w-3.5" />
                      <span>Terbitkan</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                    Jadwalkan (Opsional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Icon
                        icon="lucide:calendar"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-20"
                      />
                      <input
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker();
                          } catch (err) {}
                        }}
                        className="custom-datepicker bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pl-9 cursor-pointer"
                      />
                    </div>
                    <div className="relative">
                      <Icon
                        icon="lucide:clock"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-20"
                      />
                      <input
                        type="time"
                        value={publishTime}
                        onChange={(e) => setPublishTime(e.target.value)}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker();
                          } catch (err) {}
                        }}
                        className="custom-datepicker bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pl-9 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </SidebarSection>

              {/* 2. Gambar Unggulan Section */}
              <SidebarSection
                title="Gambar Unggulan"
                icon="lucide:image"
                defaultOpen={true}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">
                    File Gambar
                  </label>
                  {featuredImage && (
                    <button
                      type="button"
                      onClick={() => setFeaturedImage("")}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <div
                  onDragEnter={() => setFeatDragActive(true)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setFeatDragActive(true);
                  }}
                  onDragLeave={() => setFeatDragActive(false)}
                  onDrop={handleFeaturedDrop}
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).tagName !== "BUTTON" &&
                      !(e.target as HTMLElement).closest("button")
                    ) {
                      openMediaModal("featured");
                    }
                  }}
                  className={`border border-dashed rounded-xl overflow-hidden cursor-pointer transition-all relative flex flex-col items-center justify-center min-h-[140px] ${
                    featDragActive
                      ? "border-brand-red bg-brand-light-50"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-300"
                  }`}
                >
                  {featuredImage ? (
                    <div className="w-full h-full relative group pointer-events-none">
                      <img
                        src={featuredImage}
                        alt={getAltFromFilename(featuredImage)}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 text-white space-y-1">
                        <Icon icon="lucide:image" className="h-5 w-5" />
                        <span className="text-[10px] font-bold">
                          Ganti Gambar
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center space-y-2 pointer-events-none">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto text-gray-400">
                        <Icon icon="lucide:image-plus" className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-700">
                          Pilih / Drop Gambar
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                          PNG, JPG, WEBP (Maks. 2MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </SidebarSection>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 1. Kata Kunci Fokus Section */}
              <div className="border border-gray-200 rounded-xl bg-white p-4 space-y-3 shadow-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Kata Kunci Fokus
                  </label>
                  <div className="relative">
                    <Icon
                      icon="lucide:key-round"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      placeholder="Masukkan kata kunci..."
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pl-9 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Meta Section */}
              <SidebarSection
                title="Meta & Preview Google"
                icon="lucide:search"
                defaultOpen={true}
              >
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                    Meta Title
                  </label>
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
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pr-12"
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
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                    />
                    <span className="absolute right-2 bottom-2 text-[10px] font-bold text-gray-300">
                      {metaDescription.length} / 160
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                    Preview di Google
                  </label>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-1">
                    <p className="text-[10px] text-green-700 font-medium truncate">
                      jakartalanyard.com &rsaquo; blog &rsaquo;{" "}
                      {autoSlug || "contoh-artikel-blog"}
                    </p>
                    <p className="text-sm font-bold text-blue-700 leading-tight truncate">
                      {metaTitle ||
                        title ||
                        "Judul artikel Anda akan muncul di sini"}
                    </p>
                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {metaDescription ||
                        "Masukkan meta description untuk melihat preview di hasil pencarian Google."}
                    </p>
                  </div>
                </div>
              </SidebarSection>

              {/* 3. SEO Analisis Checklist Section */}
              <SidebarSection
                title="Analisis SEO"
                icon="lucide:check-circle"
                defaultOpen={true}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-150 p-3.5 rounded-xl shadow-xs">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider">
                        Skor SEO
                      </span>
                      <span className="text-lg font-extrabold text-gray-900 mt-0.5 block">
                        {seoAnalysis.score} / 100
                      </span>
                    </div>
                    <div
                      className={`flex items-center justify-center h-11 w-11 rounded-full border-4 font-extrabold text-xs transition-colors ${
                        seoAnalysis.score >= 80
                          ? "border-green-500 text-green-700 bg-green-50"
                          : seoAnalysis.score >= 50
                            ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                            : "border-red-500 text-red-700 bg-red-50"
                      }`}
                    >
                      {seoAnalysis.score}%
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Detail Checklist
                    </label>
                    <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                      {seoAnalysis.rules.map((rule) => (
                        <div key={rule.id} className="py-2.5 space-y-1">
                          <div className="flex items-start space-x-2.5">
                            {rule.passed ? (
                              <Icon
                                icon="lucide:check-circle-2"
                                className="h-4 w-4 text-green-500 shrink-0 mt-0.5"
                              />
                            ) : (
                              <Icon
                                icon="lucide:alert-circle"
                                className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
                              />
                            )}
                            <span
                              className={`text-[11px] font-bold leading-tight ${rule.passed ? "text-gray-900" : "text-gray-500"}`}
                            >
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-150 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">
                Pilih Gambar dari Media Library
              </h3>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-50"
              >
                <Icon icon="lucide:x" className="h-4 w-4" />
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={() => setMediaDragActive(true)}
              onDragOver={(e) => {
                e.preventDefault();
                setMediaDragActive(true);
              }}
              onDragLeave={() => setMediaDragActive(false)}
              onDrop={handleMediaDrop}
              className={`mx-5 mt-3 border border-dashed rounded-lg p-3 text-center text-xs font-medium transition-all shrink-0 ${
                mediaDragActive
                  ? "border-brand-red bg-brand-light-50"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              <input
                id="modal-file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files) {
                    for (const file of Array.from(e.target.files))
                      await handleMediaUpload(file);
                  }
                }}
              />
              <label
                htmlFor="modal-file-input"
                className="cursor-pointer text-brand-red font-bold hover:underline"
              >
                Klik untuk unggah
              </label>{" "}
              atau seret file gambar di sini
              {uploading && (
                <span className="ml-2 text-gray-400 font-bold">
                  Mengunggah...
                </span>
              )}
            </div>

            {/* Split Body */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Left Column: Grid and Pagination */}
              <div className="flex-1 flex flex-col p-5 overflow-y-auto min-h-0 justify-between">
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-7 w-7 border-4 border-brand-red border-t-transparent" />
                  </div>
                ) : imagesOnly.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Icon
                      icon="lucide:image"
                      className="h-10 w-10 text-gray-200 mx-auto"
                    />
                    <p className="text-sm text-gray-400 font-medium">
                      Belum ada gambar di media library.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {paginatedImages.map((m) => {
                        const isSelected = altPromptUrl === m.url;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleImageClickInModal(m.url)}
                            className={`group aspect-square bg-gray-50 rounded-lg overflow-hidden border transition-all relative cursor-pointer ${
                              isSelected
                                ? "border-brand-red ring-2 ring-brand-red/20"
                                : "border-transparent hover:border-brand-red"
                            }`}
                            title={m.filename}
                          >
                            <img
                              src={m.url}
                              alt={m.filename}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div
                              className={`absolute inset-0 transition-colors flex items-center justify-center ${
                                isSelected
                                  ? "bg-brand-red/10"
                                  : "bg-black/0 group-hover:bg-black/20"
                              }`}
                            >
                              <Icon
                                icon="lucide:check-circle"
                                className={`h-6 w-6 text-white drop-shadow-md transition-opacity ${
                                  isSelected
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-gray-150 pt-4 mt-4 shrink-0">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Menampilkan{" "}
                          <span className="font-bold text-gray-900">
                            {(mediaPage - 1) * 21 + 1}
                          </span>{" "}
                          -{" "}
                          <span className="font-bold text-gray-900">
                            {Math.min(mediaPage * 21, imagesOnly.length)}
                          </span>{" "}
                          dari{" "}
                          <span className="font-bold text-gray-900">
                            {imagesOnly.length}
                          </span>
                        </span>
                        <div className="inline-flex space-x-1">
                          <button
                            type="button"
                            disabled={mediaPage === 1}
                            onClick={() =>
                              setMediaPage((prev) => Math.max(prev - 1, 1))
                            }
                            className="px-2.5 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Sebelumnya
                          </button>
                          <button
                            type="button"
                            disabled={mediaPage === totalPages}
                            onClick={() =>
                              setMediaPage((prev) =>
                                Math.min(prev + 1, totalPages),
                              )
                            }
                            className="px-2.5 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Berikutnya
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Column: Details Sidebar */}
              {altPromptUrl ? (
                <div className="w-[300px] bg-gray-50/50 p-5 overflow-y-auto flex flex-col justify-between shrink-0 border-l border-gray-100 animate-fade-in">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Detail Gambar
                      </h4>
                      <p
                        className="text-xs font-bold text-gray-700 truncate mt-0.5"
                        title={altPromptUrl.substring(
                          altPromptUrl.lastIndexOf("/") + 1,
                        )}
                      >
                        {altPromptUrl.substring(
                          altPromptUrl.lastIndexOf("/") + 1,
                        )}
                      </p>
                    </div>

                    <div className="aspect-video w-full bg-white border border-gray-200/60 rounded-lg overflow-hidden flex items-center justify-center relative p-1.5 shadow-xs">
                      <img
                        src={altPromptUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">
                        Deskripsi Alt Gambar (SEO)
                      </label>
                      <input
                        type="text"
                        value={customAltText}
                        onChange={(e) => setCustomAltText(e.target.value)}
                        placeholder={
                          getAltFromFilename(altPromptUrl) ||
                          "auto-detected alt"
                        }
                        className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 shadow-xs"
                      />
                      <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                        Alt text membantu SEO & pembaca layar. Kosongkan untuk
                        menggunakan otomatis:{" "}
                        <span className="italic font-bold text-gray-600">
                          "{getAltFromFilename(altPromptUrl)}"
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-150 flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleMediaSelect(
                          altPromptUrl,
                          customAltText || getAltFromFilename(altPromptUrl),
                        )
                      }
                      className="w-full py-2.5 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <Icon icon="lucide:check" className="h-4 w-4" />
                      <span>
                        {mediaTarget === "featured"
                          ? "Pilih Gambar Unggulan"
                          : "Sisipkan Gambar"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAltPromptUrl("");
                        setCustomAltText("");
                      }}
                      className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center"
                    >
                      Batal Pilihan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-[300px] bg-gray-50/50 p-5 flex flex-col items-center justify-center text-center shrink-0 border-l border-gray-100">
                  <Icon
                    icon="lucide:image"
                    className="h-8 w-8 text-gray-300 mb-2"
                  />
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Pilih gambar dari grid
                    <br />
                    untuk melihat detail.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-slide-down">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Sisipkan / Edit Link
              </h3>
              <button
                type="button"
                onClick={closeLinkModal}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <Icon icon="lucide:x" className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Teks Tautan
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Teks yang akan ditampilkan"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  URL Tujuan
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkOpenInNewTab}
                    onChange={(e) => setLinkOpenInNewTab(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red h-4 w-4 border-gray-300"
                  />
                  <span>Buka di tab baru (target="_blank")</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkIsNofollow}
                    onChange={(e) => setLinkIsNofollow(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red h-4 w-4 border-gray-300"
                  />
                  <span>Atur sebagai No-Follow (rel="nofollow")</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkIsSponsored}
                    onChange={(e) => setLinkIsSponsored(e.target.checked)}
                    className="rounded text-brand-red focus:ring-brand-red h-4 w-4 border-gray-300"
                  />
                  <span>Atur sebagai Sponsored (rel="sponsored")</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={closeLinkModal}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-brand-red hover:bg-brand-dark text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Sisipkan Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Link Tooltip/Popup */}
      {linkTooltip && linkTooltip.rect && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl px-3 py-2 flex items-center space-x-2 text-xs animate-fade-in"
          style={{
            top: `${linkTooltip.rect.bottom + window.scrollY + 8}px`,
            left: `${Math.min(
              Math.max(8, linkTooltip.rect.left + window.scrollX - 50),
              window.innerWidth - 320,
            )}px`,
          }}
        >
          <a
            href={linkTooltip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red font-semibold hover:underline truncate max-w-[180px] flex items-center space-x-1"
            title={linkTooltip.url}
          >
            <Icon icon="lucide:external-link" className="h-3 w-3 shrink-0" />
            <span>{linkTooltip.url}</span>
          </a>
          <div className="h-4 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => {
              if (linkTooltip.anchor) {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  // Get index of the anchor in editor
                  const blot = (quill as any).constructor.find(
                    linkTooltip.anchor,
                  );
                  if (blot) {
                    const index = quill.getIndex(blot);
                    const length = blot.length();
                    const range = { index, length };
                    quill.setSelection(index, length);
                    openLinkModal(quill, range, linkTooltip.url);
                  }
                }
              }
              setLinkTooltip(null);
            }}
            className="text-gray-600 hover:text-brand-red font-bold flex items-center space-x-0.5 cursor-pointer"
            title="Edit Tautan"
          >
            <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (linkTooltip.anchor) {
                const quill = quillRef.current?.getEditor();
                if (quill) {
                  const blot = (quill as any).constructor.find(
                    linkTooltip.anchor,
                  );
                  if (blot) {
                    const index = quill.getIndex(blot);
                    const length = blot.length();
                    quill.formatText(index, length, "link", false);
                  }
                }
              }
              setLinkTooltip(null);
            }}
            className="text-gray-600 hover:text-red-600 font-bold flex items-center space-x-0.5 cursor-pointer"
            title="Hapus Tautan"
          >
            <Icon icon="lucide:unlink" className="h-3.5 w-3.5" />
            <span>Unlink</span>
          </button>
          <button
            type="button"
            onClick={() => setLinkTooltip(null)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Icon icon="lucide:x" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
