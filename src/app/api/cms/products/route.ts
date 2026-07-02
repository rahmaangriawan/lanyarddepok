import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { fetchSpreadsheetProductsFromSetting, SpreadsheetProduct } from "@/lib/google-sheets";
import {
  getCurrentSiteKeys,
  getSpreadsheetProductOrder,
  isSpreadsheetProductPublished,
  isSpreadsheetProductVisibleOnSite,
} from "@/lib/product-visibility";
import { revalidateTag } from "next/cache";
import { PRODUCTS_CACHE_TAG } from "@/lib/products-server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function productSlug(product: SpreadsheetProduct) {
  return (product.slug || product.sku || product.name)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settingsList = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const serviceAccountJson = settings.google_service_account_json;
    const spreadsheetId = settings.google_spreadsheet_id;

    if (!serviceAccountJson || !spreadsheetId) {
      return NextResponse.json({ success: false, notConfigured: true });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch {
      return NextResponse.json({ success: false, error: "Format JSON Google Service Account tidak valid." });
    }

    const { client_email, private_key } = credentials;
    if (!client_email || !private_key) {
      return NextResponse.json({ success: false, error: "JSON Google Service Account tidak valid (tidak ada email/key)." });
    }

    // 1. Fetch products from Google Sheets
    let spreadsheetProducts: SpreadsheetProduct[] = [];
    try {
      spreadsheetProducts = await fetchSpreadsheetProductsFromSetting(
        client_email,
        private_key,
        spreadsheetId,
        settings.google_spreadsheet_range,
      );
    } catch (err) {
      console.error("Google Sheets Fetch Error:", err);
      return NextResponse.json({ success: false, error: `Gagal membaca Google Spreadsheet: ${getErrorMessage(err)}` });
    }

    // 2. Fetch local products
    const currentSiteKeys = getCurrentSiteKeys(settings);
    let localProducts = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    // 3. Detect and auto-insert new SKUs from sheet
    const localSkuMap = new Map(localProducts.map((lp) => [lp.sku, lp]));
    const newSkus = spreadsheetProducts.filter((sp) => !localSkuMap.has(sp.sku));

    if (newSkus.length > 0) {
      await prisma.product.createMany({
        data: newSkus.map((ns) => ({
          sku: ns.sku,
          name: ns.name || "Produk Lanyard",
          slug: productSlug(ns),
          specs: ns.specs || "",
          accessories: ns.accessories || "",
          basePrice: ns.basePrice || "0",
          minOrder: ns.minOrder || "0",
          shortDescription: ns.shortDesc || "",
          description: ns.longDesc || ns.shortDesc || "",
          sheetStatus: ns.status || "",
          sites: ns.sites || "",
          sortOrder: getSpreadsheetProductOrder(ns),
          published: isSpreadsheetProductPublished(ns.status) && isSpreadsheetProductVisibleOnSite(ns.sites, currentSiteKeys),
        })),
        skipDuplicates: true,
      });

      // Refetch local products after creation
      localProducts = await prisma.product.findMany({
        include: {
          category: true,
        },
      });

      localSkuMap.clear();
      localProducts.forEach((lp) => localSkuMap.set(lp.sku, lp));
    }

    const publishUpdates = spreadsheetProducts
      .map((sp) => {
        const localData = localSkuMap.get(sp.sku);
        const sheetPublished = isSpreadsheetProductPublished(sp.status) && isSpreadsheetProductVisibleOnSite(sp.sites, currentSiteKeys);

        if (!localData) return null;

        return prisma.product.update({
          where: { sku: sp.sku },
          data: {
            name: sp.name || localData.name || "Produk Lanyard",
            slug: productSlug(sp) || localData.slug,
            specs: sp.specs || "",
            accessories: sp.accessories || "",
            basePrice: sp.basePrice || "0",
            minOrder: sp.minOrder || "0",
            shortDescription: sp.shortDesc || "",
            description: localData.description || sp.longDesc || sp.shortDesc || "",
            sheetStatus: sp.status || "",
            sites: sp.sites || "",
            sortOrder: getSpreadsheetProductOrder(sp),
            published: sheetPublished,
          },
        });
      })
      .filter((update): update is NonNullable<typeof update> => Boolean(update));

    if (publishUpdates.length > 0) {
      await Promise.all(publishUpdates);

      localProducts = await prisma.product.findMany({
        include: {
          category: true,
        },
      });

      localSkuMap.clear();
      localProducts.forEach((lp) => localSkuMap.set(lp.sku, lp));
    }

    // 4. Merge Spreadsheet data with local DB enrichment data
    const mergedProducts = spreadsheetProducts.map((sp) => {
      const localData = localSkuMap.get(sp.sku);
      return {
        // Base spreadsheet data
        sku: sp.sku,
        name: sp.name,
        specs: sp.specs,
        accessories: sp.accessories,
        basePrice: sp.basePrice,
        minOrder: sp.minOrder,
        slug: sp.slug,
        shortDesc: sp.shortDesc,
        longDesc: sp.longDesc,
        sheetStatus: sp.status,
        sites: sp.sites,
        order: getSpreadsheetProductOrder(sp),
        spreadsheetFields: sp, // Keep original columns in case we need extra fields
        // Local CMS enriched data
        id: localData?.id || null,
        featuredImage: localData?.featuredImage || null,
        categoryId: localData?.categoryId || null,
        category: localData?.category || null,
        description: localData?.description || sp.longDesc || "",
        published: localData?.published || false,
        metaTitle: localData?.metaTitle || sp.name || "",
        metaDescription: localData?.metaDescription || sp.shortDesc || sp.name || "",
        updatedAt: localData?.updatedAt || null,
      };
    });

    mergedProducts.sort((a, b) => {
      const orderA = a.order ?? Number.POSITIVE_INFINITY;
      const orderB = b.order ?? Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;

      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    revalidateTag(PRODUCTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, products: mergedProducts });
  } catch (error) {
    console.error("Consolidated Products Fetch Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
