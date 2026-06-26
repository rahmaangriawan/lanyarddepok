import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";
import { Icon } from "@iconify/react";
import { getProducts } from "@/lib/products-server";
import ProductActions from "./ProductActions";
import ProductDescription from "./ProductDescription";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1800; // Regenerate pages in background every 30 minutes

export async function generateStaticParams() {
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
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";
  const pageUrl = `${siteUrl}/produk/${product.slug}`;
  const categoryName = product.category?.name || "Lanyard Custom";
  const categoryHref = product.category?.slug ? `/produk/kategori/${product.category.slug}` : "/produk";
  const categoryUrl = `${siteUrl}${categoryHref}`;

  // Structured Data (JSON-LD Product Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}/#product`,
        "name": product.name,
        "image": product.featuredImage ? `${siteUrl}${product.featuredImage}` : `${siteUrl}/uploads/aset-lanyard-4-1782114161098.webp`,
        "description": product.description,
        "sku": product.sku,
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
            "item": siteUrl
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
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* Main Container */}
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-[11px] font-semibold text-gray-400 mb-6 select-none">
            <Link href="/" className="hover:text-brand-red transition-colors">Beranda</Link>
            <span>&rsaquo;</span>
            <Link href={categoryHref} className="text-brand-red hover:text-[#c92f31] transition-colors truncate max-w-[220px]">
              {categoryName}
            </Link>
          </nav>

          {/* Product Detail Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Image & Info Metadata */}
              <div className="md:col-span-5 flex flex-col space-y-6">
                <div className="relative w-full aspect-[16/9] bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
                  <img
                    src={product.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp"}
                    alt={product.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info Metadata Box */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3 select-none text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-400 font-medium">SKU Produk</span>
                    <span className="font-mono font-bold text-gray-700">{product.sku}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-400 font-medium">Kategori</span>
                    <span className="font-bold text-brand-red">{product.category?.name || "Lanyard Custom"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="text-gray-400 font-medium">Minimal Pemesanan</span>
                    <span className="font-bold text-gray-700">{product.minOrder}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-400 font-medium">Harga Dasar</span>
                    <span className="font-extrabold text-brand-red">Mulai {product.basePrice}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Description, Technical Details */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Category and SKU Badges */}
                  <div className="flex items-center space-x-2 select-none">
                    <span className="bg-[#FFF0F0] text-brand-red text-[9px] font-extrabold px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">
                      {categoryName}
                    </span>
                    <span className="bg-gray-100 text-gray-500 text-[9px] font-mono font-bold px-3 py-1 rounded-full border border-gray-200">
                      SKU: {product.sku}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#373f50] leading-tight">
                    {product.name}
                  </h1>

                  {/* Price info display */}
                  <div className="flex items-baseline space-x-2 py-1.5 border-y border-gray-100 select-none">
                    <span className="text-xs text-gray-400 font-semibold">Harga Mulai:</span>
                    <span className="text-2xl font-black text-brand-red">{product.basePrice}</span>
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
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center select-none">
                          <Icon icon="lucide:settings" className="w-3.5 h-3.5 mr-1 text-brand-red" />
                          Spesifikasi Dasar
                        </span>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                          {product.specs}
                        </p>
                      </div>
                    )}
                    {product.accessories && (
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center select-none">
                          <Icon icon="lucide:puzzle" className="w-3.5 h-3.5 mr-1 text-brand-red" />
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

      <Footer />
    </div>
  );
}
