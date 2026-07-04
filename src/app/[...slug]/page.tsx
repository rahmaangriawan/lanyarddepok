import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";
import {
  absoluteImageUrl,
  createOpenGraphMetadata,
  organizationSchema,
  SITE_URL,
} from "@/lib/seo";
import {
  getCachedCityPageChain,
  getCachedPageBySlug,
  getCachedRootCityPageBySlug,
} from "@/lib/public-cache";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug.length === 1) {
    // 1. Try static Custom Page
    const page = await getCachedPageBySlug(slug[0]);

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || page.title,
        alternates: {
          canonical: `/${page.slug}`,
        },
        ...createOpenGraphMetadata({
          title: page.metaTitle || page.title,
          description: page.metaDescription || page.title,
          path: `/${page.slug}`,
        }),
      };
    }

    // 2. Try root City Page
    const city = await getCachedRootCityPageBySlug(slug[0]);

    if (city) {
      return {
        title: city.metaTitle || city.title,
        description: city.metaDescription || city.title,
        alternates: {
          canonical: `/${city.slug}`,
        },
        ...createOpenGraphMetadata({
          title: city.metaTitle || city.title,
          description: city.metaDescription || city.title,
          path: `/${city.slug}`,
          image: city.featuredImage,
        }),
      };
    }
  } else {
    // Hierarchical City Page
    const leafSlug = slug[slug.length - 1];
    const chain = await getCachedCityPageChain(leafSlug);

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
          ...createOpenGraphMetadata({
            title: leaf.metaTitle || leaf.title,
            description: leaf.metaDescription || leaf.title,
            path: `/${path}`,
            image: leaf.featuredImage,
          }),
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
    const page = await getCachedPageBySlug(slug[0]);

    if (page) {
      const pageUrl = `${SITE_URL}/${page.slug}`;

      const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${pageUrl}/#webpage`,
            "url": pageUrl,
            "name": page.title,
            "description": page.metaDescription || page.title,
            "publisher": organizationSchema(),
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${pageUrl}/#breadcrumb`,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Beranda",
                "item": SITE_URL,
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
        </div>
      );
    }
  }

  // ─── 2. HIERARCHICAL SEGMENTS CASE: City Page ───
  const leafSlug = slug[slug.length - 1];
  const chain = await getCachedCityPageChain(leafSlug);

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

  // Build JSON-LD Breadcrumbs dynamically from nested parent chain
  let accumulatedPath = "";
  const breadcrumbElements = chain.map((node, index) => {
    accumulatedPath += `/${node.slug}`;
    return {
      "@type": "ListItem",
      "position": index + 2, // 1 is Beranda
      "name": node.title,
      "item": `${SITE_URL}${accumulatedPath}`,
    };
  });

  const pageUrl = `${SITE_URL}${accumulatedPath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        "url": pageUrl,
        "name": leafCity.title,
        "description": leafCity.metaDescription || leafCity.title,
        "publisher": organizationSchema(),
        "image": leafCity.featuredImage ? absoluteImageUrl(leafCity.featuredImage) : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Beranda",
            "item": SITE_URL,
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

      {/* Hero Banner Section */}
      <section className="bg-[#FFFDFD] border-b border-gray-100 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center select-none animate-fade-in relative overflow-hidden">
        {leafCity.featuredImage && (
          <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none">
            <Image
              src={leafCity.featuredImage}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              quality={40}
              aria-hidden="true"
            />
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
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 select-none">
                <Image
                  src={leafCity.featuredImage}
                  alt={leafCity.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                  quality={58}
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

    </div>
  );
}
