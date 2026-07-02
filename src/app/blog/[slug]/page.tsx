import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Icon } from "@iconify/react";
import { notFound } from "next/navigation";
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getCachedPostBySlug(slug);

    if (!post) {
      return {};
    }

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
        image: post.featuredImage,
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
  const articleContent = sanitizeCmsHtml(addHeadingIds(contentWithWrappedTables));
  const tocItems = extractTocItems(articleContent);
  const [articleIntroContent, articleMainContent] =
    splitArticleBeforeFirstH2(articleContent);
  const faqs = parseFaqs(cleanContent);
  const authorName = await getCachedPublicAuthorName();
  const approvedComments = await getCachedApprovedComments(post.id);
  const recentPosts = await getCachedRecentPosts(post.id);

  const publishedAt = new Date(post.createdAt);
  const modifiedAt = new Date(post.updatedAt);

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const authorUrl = `${SITE_URL}/blog/author/admin`;
  const featuredImageFullUrl = absoluteImageUrl(post.featuredImage);

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
      itemListElement: [
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
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: postUrl,
        },
      ],
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
  const imageAlt = post.featuredImage
    ? getAltFromFilename(post.featuredImage)
    : post.title;

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      {previewId && (
        <div className="border-b border-public-border bg-public-soft px-5 py-3 text-center text-xs font-bold text-gray-800">
          Mode pratinjau: halaman draf ini hanya dapat dilihat oleh Administrator.
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-gray-500"
        >
          <Link href="/" className="transition hover:text-public-amber-strong">
            Beranda
          </Link>
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5 text-gray-300" />
          <Link href="/blog" className="transition hover:text-public-amber-strong">
            Blog
          </Link>
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5 text-gray-300" />
          <span className="max-w-[220px] truncate text-gray-900 sm:max-w-md">
            {post.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="min-w-0 lg:col-span-8">
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
                {post.category && (
                  <Link
                    href={`/blog/kategori/${post.category.slug}`}
                    className="inline-flex min-h-8 items-center rounded-lg border border-public-border bg-public-soft px-3 text-[11px] font-extrabold text-public-amber-strong transition hover:border-public-amber"
                  >
                    {post.category.name}
                  </Link>
                )}
                <span>{formattedDate}</span>
              </div>

              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl font-bold leading-[1.08] tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
                  {post.title}
                </h1>
              </div>

              <div className="flex flex-col gap-5 border-y border-public-border py-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/blog/author/admin"
                  className="group flex items-center gap-3"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-public-soft text-lg font-extrabold text-public-amber-strong ring-1 ring-public-border">
                    {authorName.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-gray-950 group-hover:text-public-amber-strong">
                      {authorName}
                    </span>
                    <span className="block text-xs font-semibold text-gray-500">
                      Penulis handal dari masa depan
                    </span>
                  </span>
                </Link>
                <ShareButtons
                  title={post.title}
                  slug={post.slug}
                  shareUrl={postUrl}
                />
              </div>

              {post.featuredImage && (
                <FeaturedPostImage src={post.featuredImage} alt={imageAlt} />
              )}
            </header>

            <div className="blog-post-content mt-8 w-full overflow-hidden">
              <div
                className="ql-editor !min-h-0 !p-0 break-words text-base leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: articleIntroContent }}
              />
              <InlineToc tocItems={tocItems} />
              {articleMainContent && (
                <div
                  className="ql-editor !min-h-0 !p-0 break-words text-base leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: articleMainContent }}
                />
              )}
            </div>

            <AuthorBox authorName={authorName} />

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

function splitArticleBeforeFirstH2(html: string): [string, string] {
  const firstH2Match = html.match(/<h2[\s>]/i);

  if (!firstH2Match || firstH2Match.index === undefined) {
    return [html, ""];
  }

  return [html.slice(0, firstH2Match.index), html.slice(firstH2Match.index)];
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
  const isLocal = src.startsWith("/");

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-public-soft text-public-amber-strong">
        <Icon icon="lucide:image" className="h-5 w-5" />
      </div>
    );
  }

  if (isLocal) {
    return (
      <Image
        src={src}
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
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />
  );
}

function InlineToc({ tocItems }: { tocItems: TocItem[] }) {
  if (tocItems.length === 0) {
    return null;
  }

  return (
    <details className="my-7 rounded-xl border border-public-border bg-public-soft/50 p-4">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-public-amber text-gray-950">
            <Icon icon="lucide:list" className="h-4 w-4" />
          </span>
          <span className="text-sm font-extrabold text-gray-950">Daftar Isi</span>
        </span>
        <Icon icon="lucide:chevron-down" className="h-4 w-4 text-gray-500" />
      </summary>
      <nav className="mt-3 grid gap-1 border-t border-public-border pt-3" aria-label="Daftar isi artikel">
        {tocItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block rounded-lg px-3 py-1.5 text-sm font-semibold leading-5 text-gray-600 transition hover:bg-white hover:text-public-amber-strong ${
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
            className="group grid grid-cols-[76px_minmax(0,1fr)] gap-3"
          >
            <span className="relative aspect-square overflow-hidden rounded-xl border border-public-border bg-public-soft">
              <SidebarPostImage src={item.featuredImage || ""} alt={item.title} />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-3 text-sm font-medium leading-snug text-gray-950 transition group-hover:text-public-amber-strong">
                {item.title}
              </span>
              <span className="mt-1 block text-xs font-semibold text-gray-500">
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
        <Icon icon="lucide:heart-handshake" className="h-6 w-6" />
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

function AuthorBox({ authorName }: { authorName: string }) {
  return (
    <section className="mt-10 rounded-2xl border border-public-border bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Link
          href="/blog/author/admin"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-public-soft text-3xl font-extrabold text-public-amber-strong ring-1 ring-public-border"
        >
          {authorName.charAt(0)}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-extrabold text-gray-950">
              {authorName}
            </h2>
            <span className="rounded-lg bg-public-soft px-2.5 py-1 text-[11px] font-extrabold text-public-amber-strong">
              Penulis
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-600">
            Tim Lanyard Bogor menulis panduan seputar lanyard custom, kebutuhan event, dan branding perusahaan.
          </p>
          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <a
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-public-border transition hover:border-public-amber hover:text-public-amber-strong"
              aria-label="Website Lanyard Bogor"
            >
              <Icon icon="lucide:globe" className="h-4 w-4" />
            </a>
            <a
              href="mailto:info@lanyardbogor.com"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-public-border transition hover:border-public-amber hover:text-public-amber-strong"
              aria-label="Email Lanyard Bogor"
            >
              <Icon icon="lucide:mail" className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/6282210200700"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-public-border transition hover:border-public-amber hover:text-public-amber-strong"
              aria-label="WhatsApp Lanyard Bogor"
            >
              <Icon icon="lucide:message-circle" className="h-4 w-4" />
            </a>
          </div>
        </div>
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
