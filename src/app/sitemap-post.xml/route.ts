import { prisma } from "@/lib/db";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  // Fetch all categories of type BLOG
  const categories = await prisma.category.findMany({
    where: { type: "BLOG" },
    select: { slug: true, updatedAt: true },
  });

  let urlNodes = posts.map((post) => {
    return `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  categories.forEach((cat) => {
    urlNodes.push(`  <url>
    <loc>${siteUrl}/blog/kategori/${cat.slug}</loc>
    <lastmod>${cat.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
