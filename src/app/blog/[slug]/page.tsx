import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Icon } from "@iconify/react";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import CommentForm from "@/components/CommentForm";
import ShareButtons from "@/components/ShareButtons";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAltFromFilename } from "@/lib/html-formatter";
import {
  injectAutoLinks,
  injectRelatedReading,
  parseFaqs,
} from "@/lib/seo-utils";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import {
  absoluteImageUrl,
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";
import {
  getCachedApprovedComments,
  getCachedPostBySlug,
  getCachedPublicAuthorName,
  getCachedRecentPosts,
  getCachedRelatedPosts,
} from "@/lib/public-cache";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type TocItem = {
  depth: 2 | 3;
  id: string;
  text: string;
};

export const revalidate = 600;
const BLOG_FALLBACK_IMAGE = "/uploads/blog-hero-lanyarddepok.webp";
const IMAGE_SOURCE_ALIASES = [
  {
    match: "sablon-vs-printing-lanyard-depok",
    src: "/storage/1792/perbedaan-lanyard-sablon-vs-printing.webp",
  },
  {
    match: "perbedaan-lanyard-sablon-vs-printing",
    src: "/storage/1792/perbedaan-lanyard-sablon-vs-printing.webp",
  },
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getCachedPostBySlug(slug);

    if (!post) {
      return {};
    }

    const metadataImage =
      getRenderableImageSrc(post.featuredImage) || BLOG_FALLBACK_IMAGE;

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.title.substring(0, 150),
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      ...createOpenGraphMetadata({
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.title.substring(0, 150),
        path: `/blog/${post.slug}`,
        image: metadataImage,
        type: "article",
      }),
    };
  } catch (err: any) {
    console.warn(
      "Database not accessible during generateMetadata:",
      err.message,
    );
    return {};
  }
}

export default async function BlogPostPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  let previewId: number | null = null;
  for (const key of Object.keys(resolvedSearchParams)) {
    const match = key.match(/^preview-(\d+)$/);
    if (match) {
      previewId = parseInt(match[1], 10);
      break;
    }
  }

  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  let post = null;
  if (previewId) {
    if (!isAdmin) {
      notFound();
    }
    post = await prisma.post.findUnique({
      where: { id: previewId },
      include: { category: true },
    });
  } else {
    post = await getCachedPostBySlug(slug);
  }

  if (!post) {
    notFound();
  }

  const settings = await getCachedSettingsMap([
    "seo_auto_links",
    "seo_auto_links_limit",
  ]);
  let autoLinks = [];
  if (settings.seo_auto_links) {
    try {
      autoLinks = JSON.parse(settings.seo_auto_links);
    } catch (e) {
      console.error("Failed to parse seo_auto_links settings", e);
    }
  }

  const autoLinksLimit = settings.seo_auto_links_limit
    ? parseInt(settings.seo_auto_links_limit, 10)
    : 2;

  const relatedPosts = await getCachedRelatedPosts(post.id, post.categoryId);
  const cleanContent = post.content
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ");
  const contentWithRelated = injectRelatedReading(cleanContent, relatedPosts);
  const processedContent = injectAutoLinks(
    contentWithRelated,
    autoLinks,
    autoLinksLimit,
  );
  const contentWithWrappedTables = processedContent.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/gi,
    (match, attrs, body) => {
      return `<div class="w-full overflow-x-auto my-6"><table class="w-full border-collapse" ${attrs}>${body}</table></div>`;
    },
  );
  const articleContent = rewriteMissingImageSources(
    sanitizeCmsHtml(addHeadingIds(contentWithWrappedTables)),
  );
  const tocItems = extractTocItems(articleContent);
  const articleContentWithMobileToc = insertMobileTocBeforeFirstHeading(
    articleContent,
    tocItems,
  );
  const faqs = parseFaqs(cleanContent);
  const authorName = await getCachedPublicAuthorName();
  const approvedComments = await getCachedApprovedComments(post.id);
  const recentPosts = await getCachedRecentPosts(post.id);

  const publishedAt = new Date(post.createdAt);
  const modifiedAt = new Date(post.updatedAt);

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const authorUrl = `${SITE_URL}/blog/author/admin`;
  const featuredImageSrc =
    getRenderableImageSrc(post.featuredImage) || BLOG_FALLBACK_IMAGE;
  const featuredImageFullUrl = absoluteImageUrl(featuredImageSrc);
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Beranda",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
    ...(post.category
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: post.category.name,
            item: `${SITE_URL}/blog/kategori/${post.category.slug}`,
          },
        ]
      : []),
  ];

  const graphList: any[] = [
    {
      "@type": "BlogPosting",
      "@id": `${postUrl}/#blogposting`,
      url: postUrl,
      headline: post.title,
      image: [featuredImageFullUrl],
      datePublished: publishedAt.toISOString(),
      dateModified: modifiedAt.toISOString(),
      description: post.metaDescription || post.title.substring(0, 150),
      author: {
        "@type": "Person",
        name: authorName,
        url: authorUrl,
      },
      publisher: {
        ...organizationSchema(),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${postUrl}/#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
  ];

  if (faqs.length > 0) {
    graphList.push({
      "@type": "FAQPage",
      "@id": `${postUrl}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": graphList,
  };

  const formattedDate = publishedAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const readingMinutes = Math.max(
    1,
    Math.ceil(stripHtml(cleanContent).split(/\s+/).filter(Boolean).length / 220),
  );
  const imageAlt = post.featuredImage
    ? getAltFromFilename(post.featuredImage)
    : post.title;

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      {previewId && (
        <div className="border-b border-public-border bg-public-soft px-5 py-3 text-center text-xs font-bold text-gray-800">
          Mode pratinjau: halaman draf ini hanya dapat dilihat oleh Administrator.
        </div>
      )}

      <section className="relative isolate overflow-hidden border-b border-public-border/70 bg-white">
        <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-public-soft" />
        <div className="pointer-events-none absolute -left-24 bottom-8 hidden h-72 w-72 rounded-full border border-public-amber/15 lg:block" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-gray-500"
          >
            <Link href="/" className="transition hover:text-public-amber-strong">
              Beranda
            </Link>
            <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5 text-gray-300" />
            <Link href="/blog" className="transition hover:text-public-amber-strong">
              Blog
            </Link>
            {post.category && (
              <>
                <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5 text-gray-300" />
                <Link
                  href={`/blog/kategori/${post.category.slug}`}
                  className="text-gray-900 transition hover:text-public-amber-strong"
                >
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>

          <header className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.72fr)] lg:gap-12">
            <div className="min-w-0">
              <h1 className="max-w-4xl text-3xl font-extrabold leading-[1.1] tracking-normal text-gray-950 sm:text-[2.45rem] lg:text-[2.75rem]">
                {post.title}
              </h1>

              {post.metaDescription && (
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-gray-600 sm:text-base">
                  {post.metaDescription}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
                <Link
                  href="/blog/author/admin"
                  className="inline-flex items-center gap-2 text-[11px] font-extrabold text-gray-800 transition hover:text-public-amber-strong"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-public-soft text-[10px] text-public-amber-strong">
                    {authorName.charAt(0)}
                  </span>
                  {authorName}
                </Link>
                <span className="inline-flex items-center gap-1.5">
                  <Icon icon="lucide:calendar-days" className="h-4 w-4 text-public-amber-strong" />
                  {formattedDate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon icon="lucide:clock-3" className="h-4 w-4 text-public-amber-strong" />
                  {readingMinutes} menit baca
                </span>
              </div>
            </div>

            <FeaturedPostImage src={featuredImageSrc} alt={imageAlt} />
          </header>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="min-w-0 lg:col-span-8">
            <div className="blog-post-content w-full overflow-hidden rounded-2xl border border-public-border bg-white px-5 py-7 shadow-[0_16px_42px_rgba(15,23,42,0.035)] sm:px-7 lg:px-9">
              <div
                className="ql-editor !min-h-0 !p-0 break-words text-base leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: articleContentWithMobileToc }}
              />
            </div>

            <AuthorBox
              authorName={authorName}
            />

            <SharePanel
              postTitle={post.title}
              postSlug={post.slug}
              postUrl={postUrl}
            />

            <section className="mt-10 border-t border-public-border pt-8">
              <h2 className="text-2xl font-extrabold text-gray-950">
                Komentar ({approvedComments.length})
              </h2>

              {approvedComments.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-public-border bg-public-soft/50 p-6 text-sm font-semibold leading-6 text-gray-600">
                  Belum ada komentar. Jadilah yang pertama memberikan tanggapan.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {approvedComments.map((comment: any) => (
                    <article
                      key={comment.id}
                      className="rounded-2xl border border-public-border bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-public-soft text-sm font-extrabold text-public-amber-strong">
                          {comment.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="text-sm font-extrabold text-gray-950">
                              {comment.name}
                            </h3>
                            <span className="text-xs font-semibold text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  dateStyle: "medium",
                                  timeZone: "Asia/Jakarta",
                                },
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <CommentForm postId={post.id} />
            </section>

            <PostNavigation recentPosts={recentPosts} currentSlug={post.slug} />
          </article>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-6">
              <SidebarToc tocItems={tocItems} />
              <PopularPosts posts={recentPosts} />
              <SidebarCta />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function extractTocItems(html: string): TocItem[] {
  const headingRegex = /<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const depth = Number(match[1]) as 2 | 3;
    const attrs = match[2];
    const id = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
    const text = stripHtml(match[3]);

    if (id && text) {
      items.push({ depth, id, text });
    }
  }

  return items.slice(0, 8);
}

function addHeadingIds(html: string) {
  const usedIds = new Set<string>();

  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (match, level, attrs, content) => {
    if (/\sid=["'][^"']+["']/i.test(attrs)) {
      return match;
    }

    const text = stripHtml(content).replace(/^(?:\d+\.|[A-Za-z]\.)\s*/, "");
    let baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseId) {
      baseId = `heading-${usedIds.size + 1}`;
    }

    let id = baseId;
    let counter = 1;
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    usedIds.add(id);

    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function insertMobileTocBeforeFirstHeading(html: string, tocItems: TocItem[]) {
  if (tocItems.length === 0) {
    return html;
  }

  const firstHeadingMatch = html.match(/<h[23][\s>]/i);
  const mobileTocHtml = renderMobileTocHtml(tocItems);

  if (!firstHeadingMatch || firstHeadingMatch.index === undefined) {
    return `${mobileTocHtml}${html}`;
  }

  return `${html.slice(0, firstHeadingMatch.index)}${mobileTocHtml}${html.slice(
    firstHeadingMatch.index,
  )}`;
}

function rewriteMissingImageSources(html: string) {
  return html.replace(/<img\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi, (match, before, quote, src, after) => {
    const resolvedSrc = getRenderableImageSrc(src);

    if (!resolvedSrc || resolvedSrc === src) {
      return match;
    }

    return `<img${before}src=${quote}${resolvedSrc}${quote}${after}>`;
  });
}

function renderMobileTocHtml(tocItems: TocItem[]) {
  const links = tocItems
    .map((item) => {
      const indentClass = item.depth === 3 ? " ml-4" : "";
      return `<a href="#${escapeAttr(item.id)}" class="block rounded-lg px-3 py-1.5 text-sm font-semibold leading-5 text-gray-600 transition hover:bg-white hover:text-public-amber-strong${indentClass}">${escapeAttr(item.text)}</a>`;
    })
    .join("");

  return `<details class="my-7 rounded-xl border border-public-border bg-public-soft/50 p-4 lg:hidden">
  <summary class="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4">
    <span class="flex items-center gap-3">
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-public-amber text-gray-950">&#9776;</span>
      <span class="text-sm font-extrabold text-gray-950">Daftar Isi</span>
    </span>
    <span class="text-gray-500">&#8964;</span>
  </summary>
  <nav class="mt-3 grid gap-1 border-t border-public-border pt-3" aria-label="Daftar isi artikel">${links}</nav>
</details>`;
}

function getRenderableImageSrc(src: string | null | undefined) {
  if (!src) {
    return null;
  }

  const alias = getImageAlias(src);
  if (alias) {
    return alias;
  }

  if (src.startsWith("http") || !src.startsWith("/")) {
    return src;
  }

  const cleanSrc = src.split("?")[0].replace(/^\/+/, "");
  return existsSync(path.join(process.cwd(), "public", cleanSrc)) ? src : null;
}

function getImageAlias(src: string) {
  const normalizedSrc = decodeURIComponent(src).toLowerCase();
  const alias = IMAGE_SOURCE_ALIASES.find((item) =>
    normalizedSrc.includes(item.match),
  );

  if (!alias) {
    return null;
  }

  const cleanAlias = alias.src.replace(/^\/+/, "");
  return existsSync(path.join(process.cwd(), "public", cleanAlias))
    ? alias.src
    : null;
}

function FeaturedPostImage({ alt, src }: { alt: string; src: string }) {
  const isLocal = src.startsWith("/");

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-public-border bg-public-soft">
      {isLocal ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 820px"
          className="object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function SidebarPostImage({ alt, src }: { alt: string; src: string }) {
  const safeSrc = getRenderableImageSrc(src) || BLOG_FALLBACK_IMAGE;
  const isLocal = Boolean(safeSrc?.startsWith("/"));

  if (!safeSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-public-soft text-public-amber-strong">
        <Icon icon="lucide:image" className="h-5 w-5" />
      </div>
    );
  }

  if (isLocal) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        sizes="96px"
        className="object-cover transition duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safeSrc}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
  );
}

function SidebarToc({ tocItems }: { tocItems: TocItem[] }) {
  if (tocItems.length === 0) {
    return null;
  }

  return (
    <details className="rounded-2xl border border-public-border bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-public-soft text-public-amber-strong">
            <Icon icon="lucide:list" className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-gray-950">Daftar Isi</span>
        </span>
        <Icon icon="lucide:chevron-down" className="h-4 w-4 text-gray-500" />
      </summary>
      <nav className="mt-5 grid gap-1.5 border-t border-public-border pt-4" aria-label="Daftar isi artikel">
        {tocItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block rounded-lg px-3 py-2 text-sm font-semibold leading-5 text-gray-600 transition hover:bg-public-soft hover:text-public-amber-strong ${
              item.depth === 3 ? "ml-4" : ""
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </details>
  );
}

function PopularPosts({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-public-border bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-public-soft text-public-amber-strong">
          <Icon icon="lucide:flame" className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-extrabold text-gray-950">Artikel Populer</h2>
      </div>

      <div className="mt-5 space-y-4">
        {posts.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={`/blog/${item.slug}`}
            className="group grid min-h-[76px] grid-cols-[76px_minmax(0,1fr)] gap-3"
          >
            <span className="relative aspect-square overflow-hidden rounded-xl border border-public-border bg-public-soft">
              <SidebarPostImage src={item.featuredImage || ""} alt={item.title} />
            </span>
            <span className="flex min-h-[76px] min-w-0 flex-col justify-between">
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-gray-950 transition group-hover:text-public-amber-strong">
                {item.title}
              </span>
              <span className="block pt-2 text-xs font-semibold text-gray-500">
                {new Date(item.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Jakarta",
                })}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SidebarCta() {
  return (
    <section className="rounded-2xl border border-public-border bg-public-soft p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-public-amber-strong ring-1 ring-public-border">
        <Icon icon="lucide:message-circle" className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-xl font-extrabold text-gray-950">
        Butuh Lanyard Custom?
      </h2>
      <p className="mt-3 text-sm font-medium leading-6 text-gray-600">
        Tim kami siap membantu kebutuhan lanyard custom dengan desain rapi dan harga resmi.
      </p>
      <a
        href="https://wa.me/6282210200700"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-public-amber px-5 text-sm font-extrabold text-gray-950 transition hover:bg-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
      >
        Konsultasi Sekarang
      </a>
    </section>
  );
}

function AuthorBox({
  authorName,
}: {
  authorName: string;
}) {
  return (
    <section className="mt-10 rounded-2xl border border-public-border bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/blog/author/admin"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-public-soft text-2xl font-extrabold text-public-amber-strong ring-1 ring-public-border"
        >
          {authorName.charAt(0)}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-extrabold text-gray-950">
                {authorName}
              </h2>
              <span className="rounded-lg bg-public-soft px-2.5 py-1 text-[11px] font-extrabold text-public-amber-strong">
                Penulis
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-gray-600">
              Tim Lanyard Bogor menulis panduan seputar lanyard custom, kebutuhan event, dan branding perusahaan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SharePanel({
  postSlug,
  postTitle,
  postUrl,
}: {
  postSlug: string;
  postTitle: string;
  postUrl: string;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-public-border bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.035)] sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div>
        <h2 className="text-base font-extrabold text-gray-950">Bagikan artikel</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-gray-600">
          Kirim panduan ini ke tim atau rekan yang sedang memilih lanyard.
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <ShareButtons title={postTitle} slug={postSlug} shareUrl={postUrl} />
      </div>
    </section>
  );
}

function PostNavigation({
  currentSlug,
  recentPosts,
}: {
  currentSlug: string;
  recentPosts: any[];
}) {
  const candidates = recentPosts.filter((item) => item.slug !== currentSlug);
  const previous = candidates[0];
  const next = candidates[1];

  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="mt-10 grid gap-4 border-t border-public-border pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/blog/${previous.slug}`}
          className="group rounded-2xl border border-public-border bg-white p-5 transition hover:border-public-amber"
        >
          <span className="flex items-center gap-2 text-xs font-extrabold text-public-amber-strong">
            <Icon icon="lucide:arrow-left" className="h-4 w-4" />
            Artikel Sebelumnya
          </span>
          <span className="mt-2 line-clamp-2 block text-sm font-extrabold leading-6 text-gray-950 group-hover:text-public-amber-strong">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="group rounded-2xl border border-public-border bg-white p-5 text-left transition hover:border-public-amber sm:text-right"
        >
          <span className="flex items-center gap-2 text-xs font-extrabold text-public-amber-strong sm:justify-end">
            Artikel Selanjutnya
            <Icon icon="lucide:arrow-right" className="h-4 w-4" />
          </span>
          <span className="mt-2 line-clamp-2 block text-sm font-extrabold leading-6 text-gray-950 group-hover:text-public-amber-strong">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
