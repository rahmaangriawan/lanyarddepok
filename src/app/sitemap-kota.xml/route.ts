import { prisma } from "@/lib/db";

interface CityPageData {
  id: number;
  slug: string;
  parentId: number | null;
  updatedAt: Date;
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lanyardjakarta.co.id";

  // Fetch all published CityPage entries from the database
  let cityPages: CityPageData[] = [];
  try {
    cityPages = await prisma.cityPage.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        parentId: true,
        updatedAt: true,
      },
    });
  } catch (err) {
    console.error("Error fetching city pages for sitemap:", err);
  }

  // Create a map for fast lookup of parents
  const cityMap = new Map<number, CityPageData>(cityPages.map((page) => [page.id, page]));

  // Helper to build the hierarchical slug path. Returns null if any parent is unpublished.
  function getCityPath(page: CityPageData): string | null {
    const segments: string[] = [page.slug];
    let current = page;
    let depth = 0;
    const maxDepth = 10;

    while (current.parentId && depth < maxDepth) {
      const parent = cityMap.get(current.parentId);
      if (!parent) {
        // Parent is missing or unpublished (not in our map), so the chain is broken
        return null;
      }
      segments.unshift(parent.slug);
      current = parent;
      depth++;
    }

    return segments.join("/");
  }

  const urlNodes: string[] = [];

  cityPages.forEach((page) => {
    const path = getCityPath(page);
    if (path) {
      urlNodes.push(`  <url>
    <loc>${siteUrl}/${path}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
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
