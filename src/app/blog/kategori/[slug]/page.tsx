import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Icon } from "@iconify/react";
import {
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";
import {
  getCachedBlogCategorySummaries,
  getCachedBlogPostsByCategoryId,
  getCachedCategoryBySlugAndType,
  getCachedPublicAuthorName,
} from "@/lib/public-cache";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCachedCategoryBySlugAndType(slug, "BLOG");

  if (!category) {
    return {};
  }

  const description =
    category.description ||
    `Kumpulan artikel edukatif, panduan, dan tips seputar ${category.name.toLowerCase()} dari Lanyard Bogor.`;

  return {
    title: `Artikel Kategori ${category.name}`,
    description,
    alternates: {
      canonical: `/blog/kategori/${category.slug}`,
    },
    ...createOpenGraphMetadata({
      title: `Artikel Kategori ${category.name}`,
      description,
      path: `/blog/kategori/${category.slug}`,
      image: "/uploads/blog-hero-lanyardbogor.webp",
    }),
  };
}

function getExcerpt(htmlContent: string, maxLength = 120): string {
  if (!htmlContent) return "";
  const clean = htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ")
    .trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.substring(0, maxLength).trim()}...`;
}

function BlogPostImage({
  image,
  title,
}: {
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
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={image}
      alt={title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      loading="lazy"
    />
  );
}

export default async function CategoryPostPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCachedCategoryBySlugAndType(slug, "BLOG");

  if (!category) {
    notFound();
  }

  const [posts, categories, authorName] = await Promise.all([
    getCachedBlogPostsByCategoryId(category.id),
    getCachedBlogCategorySummaries(),
    getCachedPublicAuthorName(),
  ]);

  const categoryDescription =
    category.description ||
    `Kumpulan artikel edukatif, panduan, dan tips seputar ${category.name.toLowerCase()} dari Lanyard Bogor.`;

  const categoryPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/kategori/${category.slug}/#collectionpage`,
        url: `${SITE_URL}/blog/kategori/${category.slug}`,
        name: `Artikel Kategori ${category.name} - Lanyard Bogor`,
        description: categoryDescription,
        publisher: organizationSchema(),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/kategori/${category.slug}/#breadcrumb`,
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
            name: category.name,
            item: `${SITE_URL}/blog/kategori/${category.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryPageSchema) }}
      />

      <section className="relative isolate overflow-hidden border-b border-public-border/70 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-public-amber/20" />
        <div className="pointer-events-none absolute right-10 top-12 hidden grid-cols-6 gap-2 sm:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="h-1 w-1 rounded-full bg-public-amber/50" />
          ))}
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex justify-center text-xs font-bold text-gray-500"
          >
            <ol className="flex flex-wrap items-center justify-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-public-amber-strong">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="transition hover:text-public-amber-strong">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-800">{category.name}</li>
            </ol>
          </nav>

          <p className="text-xs font-extrabold uppercase tracking-normal text-public-amber-strong">
            KATEGORI ARTIKEL
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold leading-[1.06] tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
            Artikel {category.name}
          </h1>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-public-amber" />
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-gray-600">
            {categoryDescription}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-public-border bg-public-soft px-4 py-2 text-xs font-bold text-gray-700">
            <Icon icon="lucide:newspaper" className="h-4 w-4 text-public-amber-strong" />
            <span>{posts.length} artikel tersedia</span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-xl border border-public-border bg-white p-3 shadow-sm">
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Kategori blog">
            <Link
              href="/blog"
              className="inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-lg px-4 text-xs font-extrabold text-gray-700 transition-colors hover:bg-public-soft hover:text-public-amber-strong"
            >
              Semua
            </Link>
            {categories.map((cat) => {
              const isActive = cat.slug === category.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog/kategori/${cat.slug}`}
                  className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-lg px-4 text-xs font-extrabold transition-colors ${
                    isActive
                      ? "bg-public-amber text-gray-950"
                      : "bg-white text-gray-700 hover:bg-public-soft hover:text-public-amber-strong"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-public-border bg-public-soft px-6 py-16 text-center">
            <Icon icon="lucide:book-open" className="mx-auto h-12 w-12 text-public-amber-strong" />
            <h2 className="mt-4 text-lg font-bold text-gray-950">Belum Ada Artikel</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-gray-600">
              Kami sedang menyiapkan materi berkualitas untuk kategori ini. Kunjungi kembali halaman ini nanti!
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-public-amber px-5 text-xs font-extrabold text-gray-950 transition hover:bg-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
            >
              Lihat Semua Artikel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString("id-ID", {
                dateStyle: "long",
                timeZone: "Asia/Jakarta",
              });
              const excerpt = post.metaDescription || getExcerpt(post.title, 110);

              return (
                <article
                  key={post.id}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-public-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-public-soft"
                  >
                    <BlogPostImage image={post.featuredImage} title={post.title} />
                    {post.category ? (
                      <span className="absolute left-4 top-4 rounded-lg bg-public-amber px-3 py-1 text-[10px] font-extrabold uppercase tracking-normal text-gray-950 shadow-sm">
                        {post.category.name}
                      </span>
                    ) : null}
                  </Link>

                  <div className="flex flex-grow flex-col justify-between p-6">
                    <div className="flex flex-col">
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon icon="lucide:calendar" className="h-3.5 w-3.5" />
                          {formattedDate}
                        </span>
                        <Link
                          href="/blog/author/admin"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-public-amber-strong"
                        >
                          <Icon icon="lucide:user" className="h-3.5 w-3.5" />
                          {authorName}
                        </Link>
                      </div>

                      <Link href={`/blog/${post.slug}`} className="mb-3 block">
                        <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-950 transition-colors group-hover:text-public-amber-strong">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="line-clamp-3 text-sm font-medium leading-6 text-gray-600">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-5">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-public-amber-strong transition-colors hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
                      >
                        <span>Baca Selengkapnya</span>
                        <Icon
                          icon="lucide:arrow-right"
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
