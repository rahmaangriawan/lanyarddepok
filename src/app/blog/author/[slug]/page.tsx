import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPaginationItems } from "@/lib/pagination";
import { getPublicAuthorName, PUBLIC_AUTHOR_ROLE } from "@/lib/public-author";
import {
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";

export const revalidate = 600;

const POSTS_PER_PAGE = 6;
const AUTHOR_DESCRIPTION =
  "Bergabung bersama tim editorial Lanyard Bogor untuk menghadirkan artikel bermanfaat seputar lanyard custom, teknik cetak, ide promosi, dan tips branding bagi perusahaan, event organizer, hingga instansi pemerintahan.";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

type AuthorPost = {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  featuredImage: string | null;
  metaDescription: string | null;
  createdAt: Date | string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

function isValidAuthorSlug(slug: string) {
  return slug.toLowerCase() === "admin";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isValidAuthorSlug(slug)) {
    return {};
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { name: true },
  });
  const authorName = getPublicAuthorName(adminUser?.name);
  const title = `Artikel oleh ${authorName}`;

  return {
    title,
    description: AUTHOR_DESCRIPTION,
    alternates: {
      canonical: `/blog/author/${slug}`,
    },
    ...createOpenGraphMetadata({
      title,
      description: AUTHOR_DESCRIPTION,
      path: `/blog/author/${slug}`,
      image: "/uploads/blog-hero-lanyarddepok.webp",
    }),
  };
}

function getExcerpt(htmlContent: string | null | undefined, maxLength = 135) {
  if (!htmlContent) return "";
  const clean = htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= maxLength) return clean;
  return `${clean.substring(0, maxLength).trim()}...`;
}

function getReadingTime(content: string | null | undefined) {
  const clean = (content || "").replace(/<[^>]*>/g, " ").trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  return Math.max(3, Math.ceil(words / 200));
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function buildAuthorHref(params: {
  category?: string;
  page?: number;
  sort?: string;
}) {
  const search = new URLSearchParams();

  if (params.category) search.set("category", params.category);
  if (params.sort && params.sort !== "terbaru") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/blog/author/admin?${query}` : "/blog/author/admin";
}

function resolveSort(sort: string) {
  if (sort === "terlama") return { createdAt: "asc" as const };
  if (sort === "az") return { title: "asc" as const };
  return { createdAt: "desc" as const };
}

export default async function AuthorPostPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  if (!isValidAuthorSlug(slug)) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const activeCategory = (query.category || "").trim();
  const sort = (query.sort || "terbaru").trim();
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  const adminUserPromise = prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { name: true },
  });
  const categoriesPromise = prisma.category.findMany({
    where: { type: "BLOG" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          posts: {
            where: { published: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  const where = {
    published: true,
    ...(activeCategory
      ? {
          category: {
            slug: activeCategory,
            type: "BLOG",
          },
        }
      : {}),
  };

  const [adminUser, categories, posts, filteredTotal] =
    await Promise.all([
      adminUserPromise,
      categoriesPromise,
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          featuredImage: true,
          metaDescription: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: resolveSort(sort),
        skip,
        take: POSTS_PER_PAGE,
      }),
      prisma.post.count({ where }),
    ]);

  const authorName = getPublicAuthorName(adminUser?.name);
  const totalPages = Math.ceil(filteredTotal / POSTS_PER_PAGE);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const authorProfileSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/blog/author/${slug}/#profilepage`,
        url: `${SITE_URL}/blog/author/${slug}`,
        name: `Profil Penulis: ${authorName} - Lanyard Bogor`,
        description: AUTHOR_DESCRIPTION,
        mainEntity: {
          "@type": "Person",
          name: authorName,
          description: AUTHOR_DESCRIPTION,
          jobTitle: PUBLIC_AUTHOR_ROLE,
          worksFor: organizationSchema(),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/author/${slug}/#breadcrumb`,
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
            name: authorName,
            item: `${SITE_URL}/blog/author/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorProfileSchema) }}
      />

      <section className="relative isolate overflow-hidden border-b border-public-border bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full border border-public-amber/25 bg-public-soft/40" />
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full border border-public-amber/25" />
        <div className="pointer-events-none absolute right-12 top-20 hidden grid-cols-6 gap-2 sm:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              className="h-1 w-1 rounded-full bg-public-amber/50"
            />
          ))}
        </div>

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-public-border bg-white p-2 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-public-soft text-5xl font-extrabold text-public-amber-strong">
                {authorName.charAt(0)}
              </span>
            </div>
          </div>

          <span className="mt-7 rounded-xl bg-public-soft px-4 py-2 text-xs font-extrabold uppercase tracking-normal text-public-amber-strong">
            Penulis Utama
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-normal text-gray-950 sm:text-5xl">
            {authorName}
          </h1>
          <p className="mt-2 text-sm font-bold text-gray-500">
            {PUBLIC_AUTHOR_ROLE}
          </p>
          <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-gray-600 sm:text-base">
            {AUTHOR_DESCRIPTION}
          </p>

        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">
              Artikel oleh <span className="text-public-amber-strong">{authorName}</span>
            </h2>
            <p className="mt-2 text-sm font-semibold text-gray-500">
              Menampilkan {filteredTotal} artikel
            </p>
          </div>

          <form
            action="/blog/author/admin"
            className="flex items-center gap-3 text-sm font-bold text-gray-700"
          >
            {activeCategory && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <label htmlFor="author-post-sort">Urutkan:</label>
            <select
              id="author-post-sort"
              name="sort"
              defaultValue={sort}
              className="min-h-11 cursor-pointer rounded-xl border border-public-border bg-white px-4 text-sm font-bold text-gray-900 outline-none transition focus-visible:border-public-amber focus-visible:ring-2 focus-visible:ring-public-amber/30"
              aria-label="Urutkan artikel"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="az">Nama A-Z</option>
            </select>
            <button
              type="submit"
              className="min-h-11 cursor-pointer rounded-xl bg-public-amber px-4 text-sm font-extrabold text-gray-950 transition hover:bg-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
            >
              Terapkan
            </button>
          </form>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1" aria-label="Kategori artikel penulis">
          <CategoryPill
            href={buildAuthorHref({ sort })}
            active={!activeCategory}
          >
            Semua
          </CategoryPill>
          {categories.map((category) => (
            <CategoryPill
              key={category.id}
              href={buildAuthorHref({ category: category.slug, sort })}
              active={activeCategory === category.slug}
            >
              {category.name}
            </CategoryPill>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-public-border bg-public-soft/50 px-6 py-16 text-center">
            <Icon
              icon="lucide:newspaper"
              className="mx-auto h-10 w-10 text-public-amber-strong"
            />
            <h3 className="mt-4 text-lg font-extrabold text-gray-950">
              Belum ada artikel
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-gray-600">
              Kategori ini belum memiliki artikel yang dipublikasikan.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <AuthorPostCard
                key={post.id}
                post={post}
                eager={posts.indexOf(post) < 3}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination artikel penulis"
          >
            <PageButton
              href={buildAuthorHref({
                category: activeCategory,
                sort,
                page: Math.max(1, currentPage - 1),
              })}
              disabled={currentPage === 1}
              label="Sebelumnya"
              icon="lucide:chevron-left"
            />
            {paginationItems.map((item) =>
              typeof item === "number" ? (
                <Link
                  key={item}
                  href={buildAuthorHref({ category: activeCategory, sort, page: item })}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-extrabold transition ${
                    item === currentPage
                      ? "border-public-amber bg-public-amber text-gray-950"
                      : "border-public-border bg-white text-gray-700 hover:border-public-amber"
                  }`}
                >
                  {item}
                </Link>
              ) : (
                <span
                  key={item}
                  className="flex h-10 min-w-10 items-center justify-center text-sm font-bold text-gray-400"
                >
                  ...
                </span>
              ),
            )}
            <PageButton
              href={buildAuthorHref({
                category: activeCategory,
                sort,
                page: Math.min(totalPages, currentPage + 1),
              })}
              disabled={currentPage === totalPages}
              label="Berikutnya"
              icon="lucide:chevron-right"
            />
          </nav>
        )}

      </main>
    </div>
  );
}

function CategoryPill({
  active,
  children,
  href,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 shrink-0 items-center rounded-xl border px-4 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber ${
        active
          ? "border-public-amber bg-public-soft text-public-amber-strong"
          : "border-public-border bg-white text-gray-700 hover:border-public-amber"
      }`}
    >
      {children}
    </Link>
  );
}

function AuthorPostCard({
  eager,
  post,
}: {
  eager: boolean;
  post: AuthorPost;
}) {
  const excerpt = post.metaDescription || getExcerpt(post.content);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-public-border bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-public-soft"
      >
        <PostImage
          src={post.featuredImage}
          alt={post.title}
          eager={eager}
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <Link
            href={`/blog/kategori/${post.category.slug}`}
            className="text-[11px] font-extrabold uppercase tracking-normal text-public-amber-strong"
          >
            {post.category.name}
          </Link>
        )}

        <Link href={`/blog/${post.slug}`} className="mt-3 block">
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-gray-950 transition group-hover:text-public-amber-strong">
            {post.title}
          </h3>
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Icon icon="lucide:calendar-days" className="h-4 w-4" />
            {formatDate(post.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon icon="lucide:clock" className="h-4 w-4" />
            {getReadingTime(post.content)} menit baca
          </span>
        </div>

        <p className="mt-4 line-clamp-3 flex-1 text-sm font-medium leading-6 text-gray-600">
          {excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-public-amber-strong transition hover:text-gray-950"
        >
          Baca Selengkapnya
          <Icon
            icon="lucide:arrow-right"
            className="h-4 w-4 transition group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}

function PostImage({
  alt,
  eager,
  src,
}: {
  alt: string;
  eager: boolean;
  src: string | null;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-public-amber-strong">
        <Icon icon="lucide:image" className="h-10 w-10" />
      </div>
    );
  }

  if (src.startsWith("http")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition duration-500 group-hover:scale-105"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}

function PageButton({
  disabled,
  href,
  icon,
  label,
}: {
  disabled: boolean;
  href: string;
  icon: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-public-border bg-public-soft text-gray-300"
        aria-disabled="true"
      >
        <Icon icon={icon} className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-public-border bg-white text-gray-700 transition hover:border-public-amber hover:text-public-amber-strong"
      aria-label={label}
    >
      <Icon icon={icon} className="h-4 w-4" />
    </Link>
  );
}
