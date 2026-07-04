import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Puzzle, Settings } from "lucide-react";
import { shouldSkipDbDuringBuild } from "@/lib/build-env";
import { getProducts } from "@/lib/products-server";
import {
  absoluteImageUrl,
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";
import ProductActions from "./ProductActions";
import ProductDescription from "./ProductDescription";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1800; // Regenerate pages in background every 30 minutes

export async function generateStaticParams() {
  if (shouldSkipDbDuringBuild()) {
    return [];
  }

  const products = await getProducts();
  
  return products.map((product) => ({
    slug: product.slug,
  }));
}


export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {};
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description,
    alternates: {
      canonical: `/produk/${product.slug}`,
    },
    ...createOpenGraphMetadata({
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.description,
      path: `/produk/${product.slug}`,
      image: product.featuredImage,
    }),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/produk/${product.slug}`;
  const categoryName = product.category?.name || "Lanyard Custom";
  const categoryHref = product.category?.slug ? `/produk/kategori/${product.category.slug}` : "/produk";
  const categoryUrl = `${SITE_URL}${categoryHref}`;
  const productImageUrl = absoluteImageUrl(
    product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp",
  );

  // Structured Data (JSON-LD Product Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}/#product`,
        "name": product.name,
        "image": productImageUrl,
        "description": product.description,
        "sku": product.sku,
        "brand": organizationSchema(),
        "offers": {
          "@type": "Offer",
          "url": pageUrl,
          "priceCurrency": "IDR",
          "price": product.basePrice.replace(/[^0-9]/g, "") || "0",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2030-12-31",
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "ID",
            "returnPolicyCategory": "https://schema.org/MerchantReturnDaysEnabled",
            "merchantReturnDays": 7,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "ID"
            },
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": 0,
              "currency": "IDR"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 3,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 5,
                "unitCode": "DAY"
              }
            }
          }
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
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": categoryUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      {/* Main Container */}
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-[11px] font-semibold text-gray-400 mb-6 select-none">
            <Link href="/" className="hover:text-public-amber transition-colors">Beranda</Link>
            <span>&rsaquo;</span>
            <Link href={categoryHref} className="text-public-amber hover:text-public-amber-strong transition-colors truncate max-w-[220px]">
              {categoryName}
            </Link>
          </nav>

          {/* Product Detail Card */}
          <div className="bg-white border border-public-border/70 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Image & Info Metadata */}
              <div className="md:col-span-5 flex flex-col space-y-6">
                <div className="relative w-full aspect-[16/9] bg-public-soft border border-public-border/70 rounded-2xl overflow-hidden shadow-2xs">
                  <Image
                    src={product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 42vw, 520px"
                    quality={58}
                    priority
                  />
                </div>

                {/* Info Metadata Box */}
                <div className="bg-public-soft/60 border border-public-border/70 rounded-2xl p-4 space-y-3 select-none text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-public-border/70">
                    <span className="text-gray-400 font-medium">SKU Produk</span>
                    <span className="font-mono font-bold text-gray-700">{product.sku}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-public-border/70">
                    <span className="text-gray-400 font-medium">Kategori</span>
                    <span className="font-bold text-public-amber-strong">{product.category?.name || "Lanyard Custom"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-public-border/70">
                    <span className="text-gray-400 font-medium">Minimal Pemesanan</span>
                    <span className="font-bold text-gray-700">{product.minOrder}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-400 font-medium">Harga Dasar</span>
                    <span className="font-extrabold text-public-amber-strong">Mulai {product.basePrice}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Description, Technical Details */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Category and SKU Badges */}
                  <div className="flex items-center space-x-2 select-none">
                    <span className="bg-public-amber/10 text-public-amber-strong text-[9px] font-extrabold px-3 py-1 rounded-full border border-public-amber/20 uppercase tracking-wider">
                      {categoryName}
                    </span>
                    <span className="bg-public-soft text-gray-500 text-[9px] font-mono font-bold px-3 py-1 rounded-full border border-public-border/70">
                      SKU: {product.sku}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#373f50] leading-tight">
                    {product.name}
                  </h1>

                  {/* Price info display */}
                  <div className="flex items-baseline space-x-2 py-1.5 border-y border-public-border/70 select-none">
                    <span className="text-xs text-gray-400 font-semibold">Harga Mulai:</span>
                    <span className="text-2xl font-black text-public-amber-strong">{product.basePrice}</span>
                    <span className="text-xs text-gray-400">/ pcs (MOQ: {product.minOrder})</span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none">Deskripsi Produk</h3>
                    <ProductDescription description={product.description} />
                  </div>

                  {/* Specs & Accessories details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {product.specs && (
                      <div className="p-4 bg-public-soft/60 rounded-2xl border border-public-border/70 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center select-none">
                          <Settings className="mr-1 h-3.5 w-3.5 text-public-amber-strong" aria-hidden="true" />
                          Spesifikasi Dasar
                        </span>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                          {product.specs}
                        </p>
                      </div>
                    )}
                    {product.accessories && (
                      <div className="p-4 bg-public-soft/60 rounded-2xl border border-public-border/70 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center select-none">
                          <Puzzle className="mr-1 h-3.5 w-3.5 text-public-amber-strong" aria-hidden="true" />
                          Aksesoris &amp; Kelengkapan
                        </span>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                          {product.accessories}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Wishlist and WhatsApp Interactive Actions */}
                  <ProductActions product={product} />
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
