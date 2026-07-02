import { Metadata } from "next";
import { getProducts } from "@/lib/products-server";
import { createOpenGraphMetadata, organizationSchema, SITE_URL } from "@/lib/seo";
import ProdukListing from "./ProdukListing";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const PRODUCTS_TITLE = "Katalog Produk Tali Lanyard Custom";
const PRODUCTS_DESCRIPTION =
  "Jelajahi berbagai pilihan cetak tali gantungan lanyard custom premium kualitas terbaik di Lanyard Bogor. Lanyard sublimasi, rajut woven, bundling holder, harga murah.";

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : {};
  const hasListingQuery = Object.values(params).some((value) => {
    if (Array.isArray(value)) return value.some(Boolean);
    return Boolean(value);
  });

  return {
    title: PRODUCTS_TITLE,
    description: PRODUCTS_DESCRIPTION,
    alternates: {
      canonical: "/produk",
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
      title: PRODUCTS_TITLE,
      description: PRODUCTS_DESCRIPTION,
      path: "/produk",
      image: "/uploads/aset-lanyard-4-1782114161098.webp",
    }),
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/produk/#webpage`,
      url: `${SITE_URL}/produk`,
      name: "Katalog Produk Tali Lanyard Custom - Lanyard Bogor",
      description: PRODUCTS_DESCRIPTION,
      publisher: organizationSchema(),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/produk/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Katalog Produk", item: `${SITE_URL}/produk` },
      ],
    },
  ],
};

export default async function ProdukListingPage() {
  const products = await getProducts();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-grow py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProdukListing initialProducts={products} />
        </div>
      </main>
    </div>
  );
}
