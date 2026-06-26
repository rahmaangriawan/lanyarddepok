import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { assertSameOrigin } from "@/lib/security";
import { normalizeCmsHtml } from "@/lib/sanitize-html";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const pageId = parseInt(resolvedParams.id, 10);
    if (isNaN(pageId)) {
      return NextResponse.json({ error: "Invalid page ID" }, { status: 400 });
    }

    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error("Fetch Page Error:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const pageId = parseInt(resolvedParams.id, 10);
    if (isNaN(pageId)) {
      return NextResponse.json({ error: "Invalid page ID" }, { status: 400 });
    }

    const { title, slug, content, published, metaTitle, metaDescription } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const pageSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    const existing = await prisma.page.findFirst({
      where: { slug: pageSlug, NOT: { id: pageId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const cleanContent = typeof content === "string" ? normalizeCmsHtml(content) : content;

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        slug: pageSlug,
        content: cleanContent,
        published: !!published,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    revalidatePath(`/${updatedPage.slug}`);

    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error: any) {
    console.error("Update Page Error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const pageId = parseInt(resolvedParams.id, 10);
    if (isNaN(pageId)) {
      return NextResponse.json({ error: "Invalid page ID" }, { status: 400 });
    }

    const deletedPage = await prisma.page.delete({ where: { id: pageId } });
    revalidatePath(`/${deletedPage.slug}`);

    return NextResponse.json({ success: true, message: "Page deleted successfully" });
  } catch (error: any) {
    console.error("Delete Page Error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
