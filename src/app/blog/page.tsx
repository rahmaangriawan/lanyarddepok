import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Artikel Lanyard Custom",
  description: "Temukan panduan, tips cetak lanyard custom, ulasan promosi event, dan info branding terupdate dari Lanyard Jakarta.",
  alternates: {
    canonical: "/blog",
  },
};

function getExcerpt(htmlContent: string, maxLength = 120): string {
  if (!htmlContent) return "";
  // Strip HTML tags and replace HTML spaces
  const clean = htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\xa0/g, " ")
    .trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + "...";
}

export const revalidate = 0; // dynamic rendering

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const limit = 9;
  const skip = (currentPage - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({
      where: { published: true },
    })
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  const blogListingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://lanyardjakarta.co.id/blog/#collectionpage",
        "url": "https://lanyardjakarta.co.id/blog",
        "name": "Blog & Artikel Edukasi Lanyard Jakarta",
        "description": "Temukan panduan, tips cetak lanyard custom, ulasan promosi event, dan info branding.",
        "publisher": {
          "@type": "Organization",
          "name": "Lanyard Jakarta",
          "logo": "https://lanyardjakarta.co.id/images/logo.webp"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://lanyardjakarta.co.id/blog/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Beranda",
            "item": "https://lanyardjakarta.co.id"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://lanyardjakarta.co.id/blog"
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingSchema) }}
      />
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-[#FDFDFD] border-b border-gray-100 pt-8 pb-12 sm:pt-12 sm:pb-16 text-center select-none">
        <div className="max-w-4xl mx-auto px-5 space-y-4">
          <span className="inline-block bg-[#FFF0F0] text-brand-red text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">
            Blogs & Artikel
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
            Informasi Terbaru & Tips <span className="text-[#fe696a]">Lanyard</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Temukan artikel ulasan produk, tips promosi event, panduan desain gantungan ID card custom, dan ulasan branding terkini dari Lanyard Jakarta.
          </p>
        </div>
      </section>

      {/* Main Blog Listing Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 bg-white rounded-full shadow-xs text-gray-400">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-gray-900">Belum Ada Artikel</h3>
            <p className="text-xs font-semibold text-gray-400 max-w-xs mx-auto leading-relaxed">
              Kami sedang menyiapkan materi berkualitas untuk Anda. Kunjungi kembali halaman ini nanti!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString("id-ID", {
                dateStyle: "long",
                timeZone: "Asia/Jakarta",
              });
              const excerpt = post.metaDescription || getExcerpt(post.content, 110);

              return (
                <article
                  key={post.id}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  {/* Thumbnail Image */}
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-gray-50 shrink-0">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 border-b border-gray-100">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-brand-red text-[9px] font-extrabold px-3 py-1 rounded-full border border-red-50 uppercase tracking-wider shadow-xs">
                        {post.category.name}
                      </span>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="flex flex-col">
                      {/* Date Meta */}
                      <span className="text-[10px] text-gray-400 font-bold block mb-2">
                        {formattedDate}
                      </span>

                      {/* Post Title */}
                      <Link href={`/blog/${post.slug}`} className="block mb-3.5">
                        <h2 className="text-[#373f50] text-lg font-semibold leading-snug group-hover:text-[#fe696a] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-xs font-normal text-gray-500 leading-relaxed line-clamp-3">
                        {excerpt}
                      </p>
                    </div>

                    {/* Footer CTA */}
                    <div className="pt-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-[11px] font-extrabold text-[#fe696a] hover:text-[#e04e4f] inline-flex items-center space-x-1.5 transition-colors group/btn select-none"
                      >
                        <span>Baca Selengkapnya</span>
                        <svg
                          className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pt-16 select-none">
            {/* Prev Button */}
            {currentPage > 1 ? (
              <Link
                href={`/blog?page=${currentPage - 1}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:border-[#fe696a] hover:text-[#fe696a] transition-all cursor-pointer"
                aria-label="Previous Page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Link>
            ) : (
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 text-gray-300 cursor-not-allowed"
                aria-disabled="true"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </span>
            )}

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
              const isCurrent = pageNumber === currentPage;
              return (
                <Link
                  key={pageNumber}
                  href={`/blog?page=${pageNumber}`}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#fe696a] text-white shadow-xs"
                      : "border border-gray-200 text-gray-600 hover:border-[#fe696a] hover:text-[#fe696a]"
                  }`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {pageNumber}
                </Link>
              );
            })}

            {/* Next Button */}
            {currentPage < totalPages ? (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-600 hover:border-[#fe696a] hover:text-[#fe696a] transition-all cursor-pointer"
                aria-label="Next Page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ) : (
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 text-gray-300 cursor-not-allowed"
                aria-disabled="true"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
