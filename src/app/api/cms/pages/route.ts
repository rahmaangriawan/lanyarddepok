import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    console.error("Fetch Pages Error:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, content, published, metaTitle, metaDescription } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const pageSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug exists
    const existing = await prisma.page.findUnique({
      where: { slug: pageSlug },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const cleanContent = typeof content === "string"
      ? content.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\xa0/g, " ")
      : content;

    const page = await prisma.page.create({
      data: {
        title,
        slug: pageSlug,
        content: cleanContent,
        published: !!published,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error("Create Page Error:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
