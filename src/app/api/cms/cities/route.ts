import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { CITY_PAGES_CACHE_TAG } from "@/lib/public-cache";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cities = await prisma.cityPage.findMany({
      include: {
        parent: {
          select: {
            title: true,
            slug: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, cities });
  } catch (error: any) {
    console.error("Fetch Cities Error:", error);
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, content, published, featuredImage, parentId, metaTitle, metaDescription } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const citySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug exists
    const existing = await prisma.cityPage.findUnique({
      where: { slug: citySlug },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const cleanContent = typeof content === "string"
      ? content.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\xa0/g, " ")
      : content;

    const parsedParentId = parentId ? parseInt(parentId, 10) : null;

    const city = await prisma.cityPage.create({
      data: {
        title,
        slug: citySlug,
        content: cleanContent,
        published: !!published,
        featuredImage: featuredImage || null,
        parentId: parsedParentId && !isNaN(parsedParentId) ? parsedParentId : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    revalidatePath(`/${city.slug}`);
    revalidateTag(CITY_PAGES_CACHE_TAG, "max");

    return NextResponse.json({ success: true, city });
  } catch (error: any) {
    console.error("Create City Error:", error);
    return NextResponse.json({ error: "Failed to create city" }, { status: 500 });
  }
}
