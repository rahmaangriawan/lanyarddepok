import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { CATEGORIES_CACHE_TAG } from "@/lib/public-cache";
import { PRODUCTS_CACHE_TAG } from "@/lib/products-server";
import { assertSameOrigin } from "@/lib/security";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, type } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug if not provided
    const categorySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug exists
    const existing = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description: description || "",
        type: type || "BLOG",
      },
    });

    revalidateTag(CATEGORIES_CACHE_TAG, "max");
    revalidateTag(PRODUCTS_CACHE_TAG, "max");

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
