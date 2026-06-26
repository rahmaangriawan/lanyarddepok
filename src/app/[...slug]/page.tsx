import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// Traverses parents to check visibility and build URL chain
async function getCityPageChain(leafSlug: string) {
  const leaf = await prisma.cityPage.findUnique({
    where: { slug: leafSlug, published: true },
  });

  if (!leaf) return null;

  const chain = [leaf];
  let current = leaf;
  const maxDepth = 10;
  let depth = 0;

  while (current.parentId && depth < maxDepth) {
    const parent = await prisma.cityPage.findUnique({
      where: { id: current.parentId, published: true },
    });

    if (!parent) return null; // Parent must be published and exist

    chain.unshift(parent);
    current = parent;
    depth++;
  }

  return chain;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug.length === 1) {
    // 1. Try static Custom Page
    const page = await prisma.page.findFirst({
      where: { slug: slug[0], published: true },
    });

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || page.title,
        alternates: {
          canonical: `/${page.slug}`,
        },
      };
    }

    // 2. Try root City Page
    const city = await prisma.cityPage.findFirst({
      where: { slug: slug[0], parentId: null, published: true },
    });

    if (city) {
      return {
        title: city.metaTitle || city.title,
        description: city.metaDescription || city.title,
        alternates: {
          canonical: `/${city.slug}`,
        },
      };
    }
  } else {
    // Hierarchical City Page
    const leafSlug = slug[slug.length - 1];
    const chain = await getCityPageChain(leafSlug);

    if (chain) {
      // Validate that chain matches path segments exactly
      const chainSlugs = chain.map((c) => c.slug);
      const isMatch =
        chainSlugs.length === slug.length &&
        chainSlugs.every((segment, idx) => segment === slug[idx]);

      if (isMatch) {
        const leaf = chain[chain.length - 1];
        const path = chainSlugs.join("/");
        return {
          title: leaf.metaTitle || leaf.title,
          description: leaf.metaDescription || leaf.title,
          alternates: {
            canonical: `/${path}`,
          },
        };
      }
    }
  }

  return {};
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;

  // ─── 1. SINGLE SEGMENT CASE: Page or Root City Page ───
  if (slug.length === 1) {
    const page = await prisma.page.findFirst({
      where: { slug: slug[0], published: true },
    });

    if (page) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";
      const pageUrl = `${siteUrl}/${page.slug}`;

      const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${pageUrl}/#webpage`,
            "url": pageUrl,
            "name": page.title,
            "description": page.metaDescription || page.title,
            "publisher": {
              "@type": "Organization",
              "name": "Lanyard Jakarta",
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/images/logo.webp`,
              },
            },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${pageUrl}/#breadcrumb`,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Beranda",
                "item": siteUrl,
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": page.title,
                "item": pageUrl,
              },
            ],
          },
        ],
      };

      return (
        <div className="flex flex-col min-h-screen bg-white">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Header />
          <section className="bg-[#FDFDFD] border-b border-gray-100 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center select-none animate-fade-in">
            <div className="max-w-4xl mx-auto px-5 space-y-3">
              <span className="inline-block bg-[#FFF0F0] text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">
                Halaman Resmi
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#373f50] leading-tight tracking-tight">
                {page.title}
              </h1>
              {page.metaDescription && (
                <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                  {page.metaDescription}
                </p>
              )}
            </div>
          </section>
          <main className="flex-grow bg-gray-50/50 py-10 sm:py-14">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs">
                <div className="blog-post-content w-full overflow-hidden">
                  <div
                    className="ql-editor !p-0 !min-h-0 text-[#4a5568] leading-relaxed text-sm sm:text-base font-normal break-words"
                    dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(page.content) }}
                  />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  }

  // ─── 2. HIERARCHICAL SEGMENTS CASE: City Page ───
  const leafSlug = slug[slug.length - 1];
  const chain = await getCityPageChain(leafSlug);

  if (!chain) {
    notFound();
  }

  // Validate path matches exactly
  const chainSlugs = chain.map((c) => c.slug);
  const isMatch =
    chainSlugs.length === slug.length &&
    chainSlugs.every((segment, idx) => segment === slug[idx]);

  if (!isMatch) {
    notFound();
  }

  const leafCity = chain[chain.length - 1];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

  // Build JSON-LD Breadcrumbs dynamically from nested parent chain
  let accumulatedPath = "";
  const breadcrumbElements = chain.map((node, index) => {
    accumulatedPath += `/${node.slug}`;
    return {
      "@type": "ListItem",
      "position": index + 2, // 1 is Beranda
      "name": node.title,
      "item": `${siteUrl}${accumulatedPath}`,
    };
  });

  const pageUrl = `${siteUrl}${accumulatedPath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        "url": pageUrl,
        "name": leafCity.title,
        "description": leafCity.metaDescription || leafCity.title,
        "publisher": {
          "@type": "Organization",
          "name": "Lanyard Jakarta",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/images/logo.webp`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Beranda",
            "item": siteUrl,
          },
          ...breadcrumbElements,
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-[#FFFDFD] border-b border-gray-100 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center select-none animate-fade-in relative overflow-hidden">
        {leafCity.featuredImage && (
          <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none">
            <img src={leafCity.featuredImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-5 space-y-3 relative z-10">
          <span className="inline-block bg-red-50 text-brand-red text-[10px] font-extrabold px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">
            Layanan Regional
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#373f50] leading-tight tracking-tight">
            {leafCity.title}
          </h1>
          {leafCity.metaDescription && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
              {leafCity.metaDescription}
            </p>
          )}
        </div>
      </section>

      {/* Content Container */}
      <main className="flex-grow bg-gray-50/50 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs">
            {leafCity.featuredImage && (
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-100 mb-6 bg-gray-50 select-none">
                <img
                  src={leafCity.featuredImage}
                  alt={leafCity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="blog-post-content w-full overflow-hidden">
              <div
                className="ql-editor !p-0 !min-h-0 text-[#4a5568] leading-relaxed text-sm sm:text-base font-normal break-words"
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(leafCity.content) }}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
