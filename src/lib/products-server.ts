import { prisma } from "@/lib/db";
import { fetchSpreadsheetProducts } from "@/lib/google-sheets";
import { DEFAULT_PRODUCTS, UnifiedProduct } from "./products-service";

export async function getProducts(): Promise<UnifiedProduct[]> {
  try {
    const settingsList = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const serviceAccountJson = settings.google_service_account_json;
    const spreadsheetId = settings.google_spreadsheet_id;

    if (!serviceAccountJson || !spreadsheetId) {
      // Fallback if not configured
      return DEFAULT_PRODUCTS;
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }

    const { client_email, private_key } = credentials;
    if (!client_email || !private_key) {
      return DEFAULT_PRODUCTS;
    }

    let spreadsheetProducts = [];
    try {
      const range = settings.google_spreadsheet_range || "Sheet1!A1:Z10000";
      spreadsheetProducts = await fetchSpreadsheetProducts(client_email, private_key, spreadsheetId, range);
    } catch (err) {
      console.error("Failed to fetch spreadsheet products, using fallback:", err);
      return DEFAULT_PRODUCTS;
    }

    if (!spreadsheetProducts || spreadsheetProducts.length === 0) {
      return DEFAULT_PRODUCTS;
    }

    // Fetch local product configuration to check published status
    const localProducts = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    const localSkuMap = new Map<string, any>(localProducts.map((lp: any) => [lp.sku, lp]));

    // Auto-insert any new sheet products as drafts if they don't exist locally
    const newSkus = spreadsheetProducts.filter((sp) => !localSkuMap.has(sp.sku));
    if (newSkus.length > 0) {
      await prisma.product.createMany({
        data: newSkus.map((ns) => ({
          sku: ns.sku,
          published: true,
        })),
        skipDuplicates: true,
      });

      // Refetch after insert
      const refetchedLocal = await prisma.product.findMany({
        include: {
          category: true,
        },
      });
      localSkuMap.clear();
      refetchedLocal.forEach((lp: any) => localSkuMap.set(lp.sku, lp));
    }

    // Filter only published products
    const publishedProducts: UnifiedProduct[] = [];

    spreadsheetProducts.forEach((sp) => {
      const localData = localSkuMap.get(sp.sku);
      if (localData && localData.published) {
        publishedProducts.push({
          id: localData.id,
          sku: sp.sku,
          name: sp.name || "Produk Lanyard",
          slug: sp.slug || sp.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          specs: sp.specs || "",
          accessories: sp.accessories || "",
          basePrice: sp.basePrice || "0",
          minOrder: sp.minOrder || "0",
          featuredImage: localData.featuredImage || "/uploads/aset-lanyard-4-1782114161098.webp",
          description: localData.description || sp.longDesc || sp.shortDesc || "",
          published: true,
          metaTitle: localData.metaTitle || sp.name || "Lanyard Custom",
          metaDescription: localData.metaDescription || sp.shortDesc || sp.name || "",
          createdAt: localData.createdAt ? localData.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: localData.updatedAt ? localData.updatedAt.toISOString() : null,
          categoryId: localData.categoryId,
          category: localData.category,
        });
      }
    });

    // If there are no published products configured in the database, return our default set of lanyard products
    if (publishedProducts.length === 0) {
      return DEFAULT_PRODUCTS;
    }

    // Sort by newest created first
    publishedProducts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return publishedProducts;
  } catch (error) {
    console.error("Error in products-server getProducts:", error);
    return DEFAULT_PRODUCTS;
  }
}
