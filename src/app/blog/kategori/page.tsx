import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const revalidate = 0; // dynamic rendering

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { type: "BLOG" },
    include: {
      _count: {
        select: { posts: { where: { published: true } } }
      }
    },
    orderBy: { name: "asc" }
  });

  const categoryListingSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://lanyardjakarta.co.id/blog/kategori/#collectionpage",
        "url": "https://lanyardjakarta.co.id/blog/kategori",
        "name": "Daftar Kategori Artikel - Lanyard Jakarta",
        "description": "Daftar kategori artikel edukasi promosi, event, dan percetakan lanyard custom.",
        "publisher": {
          "@type": "Organization",
          "name": "Lanyard Jakarta",
          "logo": "https://lanyardjakarta.co.id/images/logo.webp"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://lanyardjakarta.co.id/blog/kategori/#breadcrumb",
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
            "name": "Kategori",
            "item": "https://lanyardjakarta.co.id/blog/kategori"
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListingSchema) }}
      />
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-[#FDFDFD] border-b border-gray-100 pt-8 pb-12 sm:pt-12 sm:pb-16 text-center select-none">
        <div className="max-w-4xl mx-auto px-5 space-y-4">
          <span className="inline-block bg-[#FFF0F0] text-brand-red text-xs font-bold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">
            Kategori Artikel
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
            Telusuri Berdasarkan <span className="text-[#e13b3d]">Kategori</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto">
            Temukan panduan, tips, trik, dan informasi produk lanyard custom berkualitas berdasarkan topik pilihan Anda.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog/kategori/${cat.slug}`}
              className="group block p-6 bg-white border border-gray-100 hover:border-brand-red/30 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-light-50 text-brand-red uppercase tracking-wider group-hover:bg-brand-red group-hover:text-white transition-colors">
                  {cat._count.posts} Artikel
                </span>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-brand-red transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed line-clamp-3">
                  {cat.description || `Kumpulan artikel seputar ${cat.name.toLowerCase()} dari Lanyard Jakarta.`}
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-brand-red space-x-1">
                <span>Lihat Artikel</span>
                <svg className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-250" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-400">Belum ada kategori yang tersedia.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
