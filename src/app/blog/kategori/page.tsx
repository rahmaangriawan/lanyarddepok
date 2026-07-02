import Link from "next/link";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
import { getCachedBlogCategorySummaries } from "@/lib/public-cache";
import {
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";

export const revalidate = 600;

const PAGE_TITLE = "Kategori Artikel Lanyard Bogor";
const PAGE_DESCRIPTION =
  "Telusuri kategori artikel seputar lanyard custom, branding, event, promosi, dan panduan cetak dari Lanyard Bogor.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/blog/kategori",
  },
  ...createOpenGraphMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: "/blog/kategori",
    image: "/uploads/blog-hero-lanyardbogor.webp",
  }),
};

export default async function CategoriesPage() {
  const categories = await getCachedBlogCategorySummaries();
  const totalPosts = categories.reduce((total, category) => total + category._count.posts, 0);

  const categoryListingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/kategori/#collectionpage`,
        url: `${SITE_URL}/blog/kategori`,
        name: "Daftar Kategori Artikel - Lanyard Bogor",
        description: PAGE_DESCRIPTION,
        publisher: organizationSchema(),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/kategori/#breadcrumb`,
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
            name: "Kategori",
            item: `${SITE_URL}/blog/kategori`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListingSchema) }}
      />

      <section className="relative isolate overflow-hidden border-b border-public-border/70 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-public-amber/20" />
        <div className="pointer-events-none absolute right-10 top-12 hidden grid-cols-6 gap-2 sm:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="h-1 w-1 rounded-full bg-public-amber/50" />
          ))}
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-normal text-public-amber-strong">
            KATEGORI ARTIKEL
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-bold leading-[1.06] tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
            Telusuri Artikel Berdasarkan Topik
          </h1>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-public-amber" />
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-gray-600">
            Temukan panduan, tips, trik, dan informasi produk lanyard custom berkualitas
            berdasarkan kategori yang paling sesuai dengan kebutuhan Anda.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-public-border bg-public-soft px-4 py-2 text-xs font-bold text-gray-700">
            <Icon icon="lucide:folder-open" className="h-4 w-4 text-public-amber-strong" />
            <span>
              {categories.length} kategori, {totalPosts} artikel
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-gray-950">Semua Kategori</h2>
            <p className="mt-1 text-sm font-medium text-gray-600">
              Pilih kategori untuk membaca artikel terkait.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-public-border px-4 text-xs font-extrabold text-gray-700 transition hover:bg-public-soft hover:text-public-amber-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber sm:inline-flex"
          >
            <Icon icon="lucide:arrow-left" className="h-4 w-4" />
            Semua Artikel
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog/kategori/${cat.slug}`}
              className="group relative block overflow-hidden rounded-xl border border-public-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-public-amber/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-amber"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-public-soft transition-transform duration-300 group-hover:scale-110" />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-public-amber text-gray-950">
                  <Icon icon="lucide:folder" className="h-5 w-5" />
                </span>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-public-amber-strong">
                  {cat.name}
                </h3>
                  <span className="shrink-0 rounded-full bg-public-soft px-3 py-1 text-[11px] font-extrabold text-gray-700">
                    {cat._count.posts} artikel
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-gray-600">
                  {cat.description || `Kumpulan artikel seputar ${cat.name.toLowerCase()} dari Lanyard Bogor.`}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-public-amber-strong">
                  <span>Lihat Artikel</span>
                  <Icon
                    icon="lucide:arrow-right"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full rounded-2xl border border-public-border bg-public-soft px-6 py-16 text-center">
              <Icon icon="lucide:folder-x" className="mx-auto h-12 w-12 text-public-amber-strong" />
              <p className="mt-4 text-sm font-bold text-gray-700">Belum ada kategori yang tersedia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
