import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentForm from "@/components/CommentForm";
import Link from "next/link";
import { getAltFromFilename } from "@/lib/html-formatter";
import { injectAutoLinks, injectRelatedReading, parseFaqs, injectTableOfContents } from "@/lib/seo-utils";
import ShareButtons from "@/components/ShareButtons";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
  });

  if (!post) {
    return {};
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.title.substring(0, 150),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}


export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Check if preview-ID is passed in URL query keys
  let previewId: number | null = null;
  for (const key of Object.keys(resolvedSearchParams)) {
    const match = key.match(/^preview-(\d+)$/);
    if (match) {
      previewId = parseInt(match[1], 10);
      break;
    }
  }

  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  let post = null;
  if (previewId) {
    if (!isAdmin) {
      notFound();
    }
    post = await prisma.post.findUnique({
      where: { id: previewId },
      include: { category: true },
    });
  } else {
    post = await prisma.post.findFirst({
      where: { slug, published: true },
      include: { category: true },
    });
  }

  if (!post) {
    notFound();
  }

  // 1. Fetch Auto-Link Mappings & Limit from settings
  const autoLinksSetting = await prisma.setting.findUnique({
    where: { key: "seo_auto_links" },
  });
  let autoLinks = [];
  if (autoLinksSetting?.value) {
    try {
      autoLinks = JSON.parse(autoLinksSetting.value);
    } catch (e) {
      console.error("Failed to parse seo_auto_links settings", e);
    }
  }

  const autoLinksLimitSetting = await prisma.setting.findUnique({
    where: { key: "seo_auto_links_limit" },
  });
  const autoLinksLimit = autoLinksLimitSetting?.value ? parseInt(autoLinksLimitSetting.value, 10) : 2;

  // 2. Fetch Related Posts (up to 3 posts in the same category)
  let relatedPosts: any[] = [];
  if (post.categoryId) {
    relatedPosts = await prisma.post.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id },
        published: true,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  }

  // Fallback to latest posts if same-category posts are less than 3
  if (relatedPosts.length < 3) {
    const excludeIds = [post.id, ...relatedPosts.map((rp: any) => rp.id)];
    const extraPosts = await prisma.post.findMany({
      where: {
        id: { notIn: excludeIds },
        published: true,
      },
      take: 3 - relatedPosts.length,
      orderBy: { createdAt: "desc" },
    });
    relatedPosts = [...relatedPosts, ...extraPosts];
  }

  // 3. Inject auto-links (Type 1) and related reading links (Type 2) & parse FAQs
  const cleanContent = post.content.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\xa0/g, " ");
  const contentWithRelated = injectRelatedReading(cleanContent, relatedPosts);
  const processedContent = injectAutoLinks(contentWithRelated, autoLinks, autoLinksLimit);
  const contentWithWrappedTables = processedContent.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs, body) => {
    return `<div class="w-full overflow-x-auto my-6"><table class="w-full border-collapse" ${attrs}>${body}</table></div>`;
  });
  const contentWithToc = injectTableOfContents(contentWithWrappedTables);
  const faqs = parseFaqs(cleanContent);

  // 4. Fetch admin details for Author Box
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { name: true, email: true },
  });
  const authorName = adminUser?.name || "Admin Lanyard Jakarta";

  // 5. Fetch approved comments
  const approvedComments = await prisma.comment.findMany({
    where: {
      postId: post.id,
      approved: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 6. Fetch 3 recent posts for the sidebar
  const recentPosts = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: post.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // 7. Fetch all categories for sidebar
  const categories = await prisma.category.findMany({
    where: { type: "BLOG" },
    take: 8,
    orderBy: { name: "asc" },
  });

  // Calculate dynamic reading time
  const wordCount = post.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 220));

  // 8. Generate JSON-LD Schemas using @graph structure
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const authorUrl = `${siteUrl}/blog/author/admin`;
  const featuredImageFullUrl = post.featuredImage
    ? (post.featuredImage.startsWith("http") ? post.featuredImage : `${siteUrl}${post.featuredImage}`)
    : `${siteUrl}/images/logo.webp`;

  const graphList: any[] = [
    {
      "@type": "BlogPosting",
      "@id": `${postUrl}/#blogposting`,
      "url": postUrl,
      "headline": post.title,
      "image": [featuredImageFullUrl],
      "datePublished": post.createdAt.toISOString(),
      "dateModified": post.updatedAt.toISOString(),
      "description": post.metaDescription || post.title.substring(0, 150),
      "author": {
        "@type": "Person",
        "name": authorName,
        "url": authorUrl,
      },
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
      "@id": `${postUrl}/#breadcrumb`,
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
          "name": "Blog",
          "item": `${siteUrl}/blog`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": postUrl,
        },
      ],
    }
  ];

  if (faqs.length > 0) {
    graphList.push({
      "@type": "FAQPage",
      "@id": `${postUrl}/#faq`,
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      })),
    });
  }

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": graphList,
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />

      <Header />

      {previewId && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-5 text-center text-xs text-amber-800 font-bold flex items-center justify-center space-x-2">
          <span>Mode Pratinjau: Halaman draf ini hanya dapat dilihat oleh Administrator.</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-gray-400 mb-6 select-none">
          <Link href="/" className="hover:text-brand-red transition-colors">Beranda</Link>
          <span>&rsaquo;</span>
          <Link href="/blog" className="hover:text-brand-red transition-colors">Artikel</Link>
          <span>&rsaquo;</span>
          <span className="text-brand-red truncate max-w-[200px]">Detail Artikel</span>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category & Title */}
            <div className="space-y-4">
              {post.category && (
                <Link
                  href={`/blog/kategori/${post.category.slug}`}
                  className="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-[#FFF0F0] text-brand-red uppercase tracking-wider select-none hover:bg-brand-red hover:text-white transition-colors"
                >
                  {post.category.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3.5xl font-bold text-[#1a202c] leading-tight pt-1">
                {post.title}
              </h1>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-gray-400 pt-1">
                <span className="flex items-center space-x-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formattedDate}</span>
                </span>
                <span className="text-gray-200">•</span>
                <span className="flex items-center space-x-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{authorName}</span>
                </span>
                <span className="text-gray-200">•</span>
                <span className="flex items-center space-x-1.5">
                  <svg className="h-3.5 w-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{readingTime} menit baca</span>
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="rounded-2xl overflow-hidden shadow-xs max-h-[460px] bg-gray-50 border border-gray-100">
                <img
                  src={post.featuredImage}
                  alt={getAltFromFilename(post.featuredImage)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content body */}
            <div className="py-2 blog-post-content w-full overflow-hidden">
              <div
                className="ql-editor !p-0 !min-h-0 text-[#4a5568] leading-relaxed text-sm sm:text-base font-normal break-words"
                dangerouslySetInnerHTML={{ __html: contentWithToc }}
              />
            </div>

            {/* Share Post */}
            <ShareButtons title={post.title} slug={post.slug} shareUrl={postUrl} />

            {/* Author Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 my-8 shadow-xs">
              <Link href="/blog/author/admin" className="h-16 w-16 rounded-full bg-brand-light-200 flex items-center justify-center text-brand-red font-bold text-2xl shrink-0 border border-brand-light-100 uppercase hover:bg-brand-light-100 transition-colors select-none">
                {authorName.charAt(0)}
              </Link>
              <div className="flex-grow text-center sm:text-left space-y-2">
                <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider block">Penulis Utama</span>
                <h4 className="text-base font-bold text-[#1a202c]">
                  <Link href="/blog/author/admin" className="hover:text-brand-red transition-colors">{authorName}</Link>
                </h4>
                <p className="text-xs font-normal text-gray-500 leading-relaxed">
                  Tim ahli media promosi Lanyard Jakarta. Berkomitmen menyajikan ulasan ulasan produk, tips cetak gantungan tali lanyard custom tebal, serta panduan branding event untuk kesuksesan promosi instansi Anda.
                </p>
                <div className="flex items-center justify-center sm:justify-start space-x-3 pt-2 text-gray-400">
                  <a href="/" className="hover:text-brand-red transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </a>
                  <a href={`mailto:${adminUser?.email || "info@lanyardjakarta.co.id"}`} className="hover:text-brand-red transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </a>
                  <a href="https://wa.me/6282210200700" target="_blank" className="hover:text-brand-red transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Approved Comments List */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2 select-none">
                <span>Komentar ({approvedComments.length})</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
              </h3>

              {approvedComments.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-500 font-semibold text-xs leading-relaxed">
                  Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedComments.map((comment: any) => (
                    <div key={comment.id} className="border border-gray-100 rounded-2xl p-5 bg-white space-y-2 animate-fade-in shadow-xs">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-brand-light-100 text-brand-red font-bold text-xs flex items-center justify-center border border-red-50 uppercase select-none">
                            {comment.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-gray-900 leading-none">{comment.name}</h5>
                            <span className="text-[10px] font-semibold text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                                dateStyle: "medium",
                                timeZone: "Asia/Jakarta",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-650 leading-relaxed pl-11">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comments Submission Form */}
              <CommentForm postId={post.id} />
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Sticky on Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 self-start space-y-6 w-full">
            
            {/* Search Box */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg focus:ring-brand-red focus:border-brand-red pl-3 pr-9 py-2.5 outline-none"
                />
                <svg className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
              </div>
            </div>

            {/* Categories Card */}
            {categories.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-50 uppercase tracking-wider select-none text-[10px]">
                  Kategori
                </h4>
                <div className="space-y-1 text-xs font-semibold">
                  <Link
                    href="/blog"
                    className="flex justify-between items-center py-2 px-3 rounded-lg text-gray-600 hover:text-brand-red hover:bg-gray-50 transition-colors"
                  >
                    <span>Semua Kategori</span>
                  </Link>
                  {categories.map((cat) => {
                    const isActive = post.categoryId === cat.id;
                    return (
                      <Link
                        key={cat.id}
                        href={`/blog/kategori/${cat.slug}`}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-[#FFF0F0] text-brand-red font-bold"
                            : "text-gray-600 hover:text-brand-red hover:bg-gray-55"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isActive && (
                          <svg className="h-3 w-3 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Posts Sidebar Card */}
            {recentPosts.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-xs">
                <h4 className="text-sm font-bold text-gray-800 pb-2 border-b border-gray-50 uppercase tracking-wider select-none text-[10px]">
                  Artikel Terbaru
                </h4>
                <div className="space-y-4">
                  {recentPosts.map((rPost) => (
                    <Link
                      key={rPost.id}
                      href={`/blog/${rPost.slug}`}
                      className="group flex space-x-3 items-start"
                    >
                      {rPost.featuredImage ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                          <img
                            src={rPost.featuredImage}
                            alt={rPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                          </svg>
                        </div>
                      )}
                      <div className="space-y-0.5 min-w-0 flex-grow">
                        <h5 className="text-xs font-semibold text-gray-850 leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                          {rPost.title}
                        </h5>
                        <span className="text-[9px] text-gray-400 font-bold block pt-0.5">
                          {new Date(rPost.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            timeZone: "Asia/Jakarta",
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-50">
                  <Link
                    href="/blog"
                    className="text-xs font-bold text-brand-red hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Lihat semua artikel</span>
                    <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Helper CTA Card */}
            <div className="bg-[#FFF5F5] rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[160px] select-none border border-red-50/50">
              <div className="space-y-1.5 z-10">
                <h4 className="text-sm font-bold text-gray-800">Butuh Bantuan?</h4>
                <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-[180px]">
                  Tim kami siap membantu Anda menemukan solusi terbaik.
                </p>
              </div>
              <div className="pt-4 z-10">
                <a
                  href="https://wa.me/6282210200700"
                  target="_blank"
                  className="inline-flex items-center justify-center bg-[#e13b3d] hover:bg-[#c82a2c] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <svg className="mr-1.5 h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Hubungi Kami</span>
                </a>
              </div>
              
              {/* Soft visual icon indicator */}
              <div className="absolute right-0 bottom-0 opacity-8 pointer-events-none translate-x-4 translate-y-4">
                <svg className="h-28 w-28 text-brand-red" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.88.52 3.638 1.417 5.154L2 22l4.898-1.39C8.384 21.49 10.134 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                </svg>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
