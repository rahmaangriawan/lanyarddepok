import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { fetchSpreadsheetProducts, SpreadsheetProduct } from "@/lib/google-sheets";
import { isSpreadsheetProductPublished } from "@/lib/product-visibility";
import { revalidateTag } from "next/cache";
import { PRODUCTS_CACHE_TAG } from "@/lib/products-server";
import { assertSameOrigin } from "@/lib/security";
import { normalizeCmsHtml } from "@/lib/sanitize-html";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let { sku } = await params;
    // Fallback: extract SKU from URL path if params is empty
    if (!sku) {
      const url = new URL(request.url);
      const segments = url.pathname.split("/").filter(Boolean);
      const skuIndex = segments.findIndex((s) => s === "products") + 1;
      sku = segments[skuIndex] || "";
    }
    if (!sku) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    }

    // 1. Fetch settings
    const settingsList = await prisma.setting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    // 2. Fetch local product entry. New entries are created after reading sheet status below.
    let localProduct = await prisma.product.findUnique({
      where: { sku },
      include: { category: true },
    });

    // 3. Fetch sheet products for base specs
    const serviceAccountJson = settings.google_service_account_json;
    const spreadsheetId = settings.google_spreadsheet_id;

    let baseProduct: SpreadsheetProduct | null = null;

    if (serviceAccountJson && spreadsheetId) {
      try {
        const credentials = JSON.parse(serviceAccountJson);
        const { client_email, private_key } = credentials;
        if (client_email && private_key) {
          const range = settings.google_spreadsheet_range || "Sheet1!A1:Z10000";
          const spreadsheetProducts = await fetchSpreadsheetProducts(client_email, private_key, spreadsheetId, range);
          baseProduct = spreadsheetProducts.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) || null;
        }
      } catch (err) {
        console.error("Sheets fetch error for single product:", err);
      }
    }

    if (!localProduct) {
      localProduct = await prisma.product.create({
        data: { sku, published: isSpreadsheetProductPublished(baseProduct?.status || "") },
        include: { category: true },
      });
    }

    // 4. Return merged product
    const mergedProduct = {
      sku: baseProduct?.sku || sku,
      name: baseProduct?.name || "Produk Lanyard",
      specs: baseProduct?.specs || "",
      accessories: baseProduct?.accessories || "",
      basePrice: baseProduct?.basePrice || "0",
      minOrder: baseProduct?.minOrder || "0",
      slug: baseProduct?.slug || "",
      shortDesc: baseProduct?.shortDesc || "",
      longDesc: baseProduct?.longDesc || "",
      sheetStatus: baseProduct?.status || "",
      sites: baseProduct?.sites || "",
      order: baseProduct?.order || "",
      spreadsheetFields: baseProduct || null,
      id: localProduct?.id || null,
      featuredImage: localProduct?.featuredImage || null,
      categoryId: localProduct?.categoryId || null,
      category: localProduct?.category || null,
      description: localProduct?.description || baseProduct?.longDesc || "",
      published: localProduct?.published || false,
      metaTitle: localProduct?.metaTitle || baseProduct?.name || "",
      metaDescription: localProduct?.metaDescription || baseProduct?.shortDesc || "",
      createdAt: localProduct?.createdAt || null,
      updatedAt: localProduct?.updatedAt || null,
    };

    return NextResponse.json({ success: true, product: mergedProduct });
  } catch (error) {
    console.error("Fetch Single Product Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sku } = await params;
    if (!sku) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 });
    }

    const body = await request.json();
    const {
      featuredImage,
      categoryId,
      description,
      published,
      metaTitle,
      metaDescription,
    } = body;

    // Check if product exists in local database
    const existing = await prisma.product.findUnique({
      where: { sku },
    });

    let updatedProduct;

    if (existing) {
      // Update
      updatedProduct = await prisma.product.update({
        where: { sku },
        data: {
          featuredImage: featuredImage || null,
          categoryId: categoryId ? parseInt(categoryId, 10) : null,
          description: typeof description === "string" ? normalizeCmsHtml(description) : "",
          published: !!published,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        },
      });
    } else {
      // Create (fallback if for some reason not created during index sync)
      updatedProduct = await prisma.product.create({
        data: {
          sku,
          featuredImage: featuredImage || null,
          categoryId: categoryId ? parseInt(categoryId, 10) : null,
          description: typeof description === "string" ? normalizeCmsHtml(description) : "",
          published: !!published,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        },
      });
    }

    revalidateTag(PRODUCTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
