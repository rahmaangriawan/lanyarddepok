import { prisma } from "@/lib/db";
import { getProducts } from "@/lib/products-server";
import { UnifiedProduct } from "@/lib/products-service";

export async function GET(request: Request) {
  const host = request.headers.get("host") || "jakartalanyard.com";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const siteUrl = `${protocol}://${host}`;

  // Fetch all published/active products using the unified service
  let products: UnifiedProduct[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("Error fetching products for sitemap:", err);
  }
 
  // Fetch all categories of type PRODUCT
  let categories: { slug: string; updatedAt: Date }[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { type: "PRODUCT" },
      select: { slug: true, updatedAt: true },
    });
  } catch (err) {
    console.error("Error fetching product categories for sitemap:", err);
  }

  const urlNodes: string[] = [];

  // Add products
  products.forEach((prod) => {
    const lastmod = prod.updatedAt ? new Date(prod.updatedAt).toISOString() : new Date().toISOString();
    urlNodes.push(`  <url>
    <loc>${siteUrl}/produk/${prod.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // Add product categories
  categories.forEach((cat) => {
    urlNodes.push(`  <url>
    <loc>${siteUrl}/produk/kategori/${cat.slug}</loc>
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
