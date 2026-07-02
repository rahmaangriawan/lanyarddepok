import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import type { ReactNode } from "react";
import { getPaginationItems } from "@/lib/pagination";
import {
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";
import {
  getCachedBlogCategorySummaries,
  getCachedBlogListing,
} from "@/lib/public-cache";

export const revalidate = 600;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

const BLOG_LIMIT = 12;
const BLOG_TITLE = "Blog & Artikel Lanyard Custom";
const BLOG_DESCRIPTION =
  "Temukan panduan, tips cetak lanyard custom, ulasan promosi event, dan info branding terupdate dari Lanyard Bogor.";

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const hasListingQuery =
    currentPage > 1 || Boolean(params.category?.trim()) || Boolean(params.q?.trim());

  return {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    alternates: {
      canonical: "/blog",
    },
    robots: hasListingQuery
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    ...createOpenGraphMetadata({
      title: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      path: "/blog",
      image: "/uploads/blog-hero-lanyardbogor.webp",
    }),
  };
}

function getExcerpt(text: string | null | undefined, maxLength = 116): string {
  if (!text) return "";
  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ")
    .trim();

  if (clean.length <= maxLength) return clean;
  return `${clean.substring(0, maxLength).trim()}...`;
}

function buildBlogHref(params: { category?: string; page?: number; q?: string }) {
  const search = new URLSearchParams();

  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/blog?${query}` : "/blog";
}

function BlogPostImage({
  eager,
  image,
  title,
}: {
  eager: boolean;
  image: string | null;
  title: string;
}) {
  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-public-soft text-public-amber">
        <Icon icon="lucide:image" className="h-12 w-12" />
      </div>
    );
  }

  if (image.startsWith("http")) {
    return (
      // External CMS images may not be configured for next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        fetchPriority={eager ? "high" : "auto"}
        loading={eager ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={image}
      alt={title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      fetchPriority={eager ? "high" : "auto"}
      loading={eager ? "eager" : "lazy"}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  );
}

export default async function BlogListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const activeCategory = (params.category || "").trim();
  const query = (params.q || "").trim();

  const [{ posts, totalPosts }, categories] = await Promise.all([
    getCachedBlogListing(currentPage, BLOG_LIMIT, activeCategory, query),
    getCachedBlogCategorySummaries(),
  ]);

  const totalPages = Math.ceil(totalPosts / BLOG_LIMIT);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const blogListingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/#collectionpage`,
        url: `${SITE_URL}/blog`,
        name: "Blog & Artikel Edukasi Lanyard Bogor",
        description: "Temukan panduan, tips cetak lanyard custom, ulasan promosi event, dan info branding.",
        publisher: organizationSchema(),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/#breadcrumb`,
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
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingSchema) }}
      />

      <section className="relative isolate overflow-hidden border-b border-public-border/70 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-public-soft" />
        <div className="pointer-events-none absolute right-10 top-16 hidden grid-cols-6 gap-2 sm:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="h-1 w-1 rounded-full bg-public-amber/50" />
          ))}
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-extrabold uppercase tracking-normal text-public-amber-strong">BLOG</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.06] tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
              Artikel &amp; Berita Terbaru
            </h1>
            <div className="mt-5 h-1 w-16 rounded-full bg-public-amber" />
            <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-gray-600">
              Informasi, tips, dan inspirasi seputar lanyard custom, event, promosi, serta dunia
              branding untuk kebutuhan Anda.
            </p>
          </div>

          <div className="flex min-w-0 justify-center md:justify-end">
            <Image
              src="/uploads/blog-hero-lanyardbogor.webp"
              alt="Ilustrasi artikel dan berita Lanyard Bogor"
              width={1672}
              height={941}
              className="h-auto w-full max-w-[560px] object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-public-border bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" aria-label="Kategori blog">
              <Link
                href={buildBlogHref({ q: query })}
                className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-lg px-4 text-xs font-extrabold transition-colors ${
                  !activeCategory
                    ? "bg-public-amber text-gray-950"
                    : "bg-white text-gray-700 hover:bg-public-soft hover:text-public-amber-strong"
                }`}
              >
                Semua
              </Link>
              {categories.map((category) => {
                const isActive = activeCategory === category.slug;
                return (
                  <Link
                    key={category.id}
                    href={buildBlogHref({ category: category.slug, q: query })}
                    className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-lg px-4 text-xs font-extrabold transition-colors ${
                      isActive
                        ? "bg-public-amber text-gray-950"
                        : "bg-white text-gray-700 hover:bg-public-soft hover:text-public-amber-strong"
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>

            <form action="/blog" className="relative w-full lg:w-72">
              {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cari artikel..."
                className="min-h-10 w-full rounded-lg border border-public-border bg-white px-4 pr-11 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-public-amber focus:ring-2 focus:ring-public-amber/20"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-public-soft hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
                aria-label="Cari artikel"
              >
                <Icon icon="lucide:search" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-public-border bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-public-soft text-public-amber">
              <Icon icon="lucide:newspaper" className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-gray-950">Artikel tidak ditemukan</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
              Coba gunakan kata kunci lain atau kembali ke semua artikel.
            </p>
            <Link
              href="/blog"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-public-amber px-5 text-sm font-extrabold text-gray-950 transition hover:bg-public-amber-strong"
            >
              Lihat Semua Artikel
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post, index) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Jakarta",
              });
              const excerpt = post.metaDescription || getExcerpt(post.title, 110);

              return (
                <article
                  key={post.id}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-public-border bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-[1.45/1] overflow-hidden bg-public-soft">
                    <BlogPostImage eager={index === 0 && currentPage === 1} image={post.featuredImage} title={post.title} />
                    {post.category ? (
                      <span className="absolute left-3 top-3 rounded-md bg-public-amber px-2.5 py-1 text-[10px] font-extrabold text-gray-950 shadow-sm">
                        {post.category.name}
                      </span>
                    ) : null}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-bold text-gray-500">{formattedDate}</p>
                    <Link href={`/blog/${post.slug}`} className="mt-2 block">
                      <h2 className="line-clamp-2 min-h-[2.65rem] text-base font-extrabold leading-snug text-gray-950 transition-colors group-hover:text-public-amber-strong">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-gray-600">{excerpt}</p>

                    <div className="mt-auto pt-5">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-public-amber-strong transition hover:text-gray-950"
                      >
                        Baca Selengkapnya
                        <Icon icon="lucide:arrow-right" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-12">
            <PaginationLink
              disabled={currentPage === 1}
              href={buildBlogHref({ category: activeCategory, page: currentPage - 1, q: query })}
              label="Halaman sebelumnya"
            >
              <Icon icon="lucide:chevron-left" className="h-4 w-4" />
            </PaginationLink>

            {paginationItems.map((pageNumber) => {
              if (typeof pageNumber === "string") {
                return (
                  <span
                    key={pageNumber}
                    className="inline-flex h-9 w-9 items-center justify-center text-xs font-bold text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = pageNumber === currentPage;
              return (
                <Link
                  key={pageNumber}
                  href={buildBlogHref({ category: activeCategory, page: pageNumber, q: query })}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-extrabold transition ${
                    isCurrent
                      ? "border-public-amber bg-public-amber text-gray-950"
                      : "border-public-border bg-white text-gray-700 hover:border-public-amber hover:text-public-amber-strong"
                  }`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {pageNumber}
                </Link>
              );
            })}

            <PaginationLink
              disabled={currentPage === totalPages}
              href={buildBlogHref({ category: activeCategory, page: currentPage + 1, q: query })}
              label="Halaman berikutnya"
            >
              <Icon icon="lucide:chevron-right" className="h-4 w-4" />
            </PaginationLink>
          </div>
        )}
      </main>
    </div>
  );
}

function PaginationLink({
  children,
  disabled,
  href,
  label,
}: {
  children: ReactNode;
  disabled: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-public-border bg-white text-gray-300"
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-public-border bg-white text-gray-700 transition hover:border-public-amber hover:text-public-amber-strong"
      aria-label={label}
    >
      {children}
    </Link>
  );
}
