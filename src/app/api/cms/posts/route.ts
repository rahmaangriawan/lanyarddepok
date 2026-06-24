import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("Fetch Posts Error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, content, published, featuredImage, categoryId, createdAt, metaTitle, metaDescription } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Generate slug from title if not provided
    const postSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug exists
    const existing = await prisma.post.findUnique({
      where: { slug: postSlug },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const cleanContent = typeof content === "string"
      ? content.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\xa0/g, " ")
      : content;

    const post = await prisma.post.create({
      data: {
        title,
        slug: postSlug,
        content: cleanContent,
        published: !!published,
        featuredImage: featuredImage || null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
