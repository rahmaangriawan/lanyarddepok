import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CategoryProdukListing from "./CategoryProdukListing";
import { UnifiedProduct } from "@/lib/products-service";
import { getProducts } from "@/lib/products-server";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findFirst({
    where: { slug, type: "PRODUCT" },
  });

  if (!category) {
    return {};
  }

  return {
    title: `Jual Lanyard Custom Kategori ${category.name}`,
    description: category.description || `Temukan berbagai pilihan cetak tali lanyard custom premium untuk kategori ${category.name} harga murah hanya di Lanyard Jakarta.`,
    alternates: {
      canonical: `/produk/kategori/${category.slug}`,
    },
  };
}

export default async function ProductCategoryArchivePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch current category details
  const category = await prisma.category.findFirst({
    where: { slug, type: "PRODUCT" },
  });

  if (!category) {
    notFound();
  }

  // 2. Fetch all unified products using getProducts and filter by categoryId
  const allProducts = await getProducts();
  const products: UnifiedProduct[] = allProducts
    .filter((p) => p.categoryId === category.id && p.published)
    .sort((a, b) => a.name.localeCompare(b.name));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";
  const pageUrl = `${siteUrl}/produk/kategori/${category.slug}`;

  const categoryPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}/#collectionpage`,
        "url": pageUrl,
        "name": `Jual Lanyard Custom Kategori ${category.name} - Lanyard Jakarta`,
        "description": category.description || `Pilihan produk cetak tali lanyard custom premium untuk kategori ${category.name}.`,
        "publisher": {
          "@type": "Organization",
          "name": "Lanyard Jakarta",
          "logo": `${siteUrl}/images/logo.webp`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Beranda",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Katalog Produk",
            "item": `${siteUrl}/produk`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": category.name,
            "item": pageUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryPageSchema) }}
      />

      {/* ─── Hero Section ─── */}
      <section className="relative w-full bg-white border-b border-gray-100 pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('/uploads/aset-lanyard-7-1782202689750.webp')] bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest select-none">
              Kategori Kategori
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#373f50] leading-tight tracking-tight">
              Lanyard {category.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              {category.description || `Jelajahi berbagai pilihan cetak tali lanyard custom premium kategori ${category.name} dengan kualitas terbaik dan harga murah di Lanyard Jakarta.`}
            </p>
            <nav className="flex items-center justify-center space-x-2 text-[11px] font-bold text-gray-400 select-none pt-2">
              <Link href="/" className="hover:text-brand-red transition-colors">Beranda</Link>
              <span>&rsaquo;</span>
              <Link href="/produk" className="hover:text-brand-red transition-colors">Katalog Produk</Link>
              <span>&rsaquo;</span>
              <span className="text-brand-red">{category.name}</span>
            </nav>
          </div>
        </div>
      </section>

      {/* ─── Main Content Listing ─── */}
      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <CategoryProdukListing products={products} categoryName={category.name} />

        </div>
      </main>

    </div>
  );
}
