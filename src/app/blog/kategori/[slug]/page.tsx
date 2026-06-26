import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicAuthorName } from "@/lib/public-author";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findFirst({
    where: { slug, type: "BLOG" },
  });

  if (!category) {
    return {};
  }

  return {
    title: `Artikel Kategori ${category.name}`,
    description: category.description || `Kumpulan artikel edukatif, panduan dan tips seputar ${category.name.toLowerCase()} dari Lanyard Jakarta.`,
    alternates: {
      canonical: `/blog/kategori/${category.slug}`,
    },
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
  return clean.substring(0, maxLength).trim() + "...";
}

export default async function CategoryPostPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch current category details
  const category = await prisma.category.findFirst({
    where: { slug, type: "BLOG" },
  });

  if (!category) {
    notFound();
  }

  // 2. Fetch posts under this category & admin details
  const [posts, adminUser] = await Promise.all([
    prisma.post.findMany({
      where: {
        categoryId: category.id,
        published: true,
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { name: true },
    })
  ]);
  const authorName = getPublicAuthorName(adminUser?.name);

  const categoryPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://lanyardjakarta.co.id/blog/kategori/${category.slug}/#collectionpage`,
        "url": `https://lanyardjakarta.co.id/blog/kategori/${category.slug}`,
        "name": `Artikel Kategori ${category.name} - Lanyard Jakarta`,
        "description": category.description || `Kumpulan artikel edukatif, panduan dan tips seputar ${category.name.toLowerCase()} dari Lanyard Jakarta.`,
        "publisher": {
          "@type": "Organization",
          "name": "Lanyard Jakarta",
          "logo": "https://lanyardjakarta.co.id/images/logo.webp"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://lanyardjakarta.co.id/blog/kategori/${category.slug}/#breadcrumb`,
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
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category.name,
            "item": `https://lanyardjakarta.co.id/blog/kategori/${category.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryPageSchema) }}
      />
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-[#FDFDFD] border-b border-gray-100 pt-8 pb-12 sm:pt-12 sm:pb-16 text-center select-none">
        <div className="max-w-4xl mx-auto px-5 space-y-4">
          <span className="inline-block bg-[#FFF0F0] text-brand-red text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">
            Kategori: {category.name}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
            Artikel <span className="text-[#e13b3d]">{category.name}</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
            {category.description || `Kumpulan artikel edukatif, panduan dan tips seputar ${category.name.toLowerCase()} dari Lanyard Jakarta.`}
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
              Kami sedang menyiapkan materi berkualitas untuk kategori ini. Kunjungi kembali halaman ini nanti!
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
                      {/* Date & Author Meta */}
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold mb-2">
                        <Link href="/blog/author/admin" className="hover:text-[#e13b3d] transition-colors">
                          {authorName}
                        </Link>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>

                      {/* Post Title */}
                      <Link href={`/blog/${post.slug}`} className="block mb-3.5">
                        <h2 className="text-[#373f50] text-lg font-semibold leading-snug group-hover:text-[#e13b3d] transition-colors line-clamp-2">
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
                        className="text-[11px] font-extrabold text-[#e13b3d] hover:text-[#c82a2c] inline-flex items-center space-x-1.5 transition-colors group/btn select-none"
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
      </main>

      <Footer />
    </div>
  );
}
