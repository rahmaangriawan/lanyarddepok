import { prisma } from "@/lib/db";
import { getRequestSiteUrl } from "@/lib/seo";

export async function GET(request: Request) {
  const siteUrl = getRequestSiteUrl(request);
  const now = new Date().toISOString();

  // Fetch all published static pages from db
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const staticUrls = [
    "",
    "/produk",
    "/blog",
    "/cara-pemesanan",
    "/pembayaran",
    "/pengiriman",
    "/faq",
    "/tentang",
    "/kontak",
    "/promo",
    "/syarat-ketentuan",
    "/kebijakan",
  ];

  let urlNodes = staticUrls.map((url) => {
    return `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${url === "" ? "daily" : "weekly"}</changefreq>
    <priority>${url === "" ? "1.0" : "0.8"}</priority>
  </url>`;
  });

  pages.forEach((page) => {
    urlNodes.push(`  <url>
    <loc>${siteUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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
