import { notFound } from "next/navigation";
import { Metadata } from "next";
import { sanitizeCmsHtml } from "@/lib/sanitize-html";
import { getCachedPageBySlug } from "@/lib/public-cache";
import { createOpenGraphMetadata, organizationSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCachedPageBySlug(slug);

  if (!page) {
    return {};
  }

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

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;

  const page = await getCachedPageBySlug(slug);

  if (!page) {
    notFound();
  }

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
        "publisher": organizationSchema()
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
            "name": page.title,
            "item": pageUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />


      {/* Hero Banner Section */}
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

      {/* Main Container */}
      <main className="flex-grow bg-gray-50/50 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">


          {/* Content Card */}
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
