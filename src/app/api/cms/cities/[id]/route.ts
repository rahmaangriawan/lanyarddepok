import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Helper to check if a potential parent is a descendant of the page itself to prevent circular reference
async function isDescendant(possibleParentId: number, targetId: number): Promise<boolean> {
  if (possibleParentId === targetId) return true;

  const page = await prisma.cityPage.findUnique({
    where: { id: possibleParentId },
    select: { parentId: true },
  });

  if (!page || !page.parentId) return false;

  return isDescendant(page.parentId, targetId);
}

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
    const cityId = parseInt(resolvedParams.id, 10);
    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city page ID" }, { status: 400 });
    }

    const city = await prisma.cityPage.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return NextResponse.json({ error: "City page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, city });
  } catch (error: any) {
    console.error("Get City Page Error:", error);
    return NextResponse.json({ error: "Failed to fetch city page" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const cityId = parseInt(resolvedParams.id, 10);
    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city page ID" }, { status: 400 });
    }

    const { title, slug, content, published, featuredImage, parentId, metaTitle, metaDescription } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const citySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    const existing = await prisma.cityPage.findFirst({
      where: { slug: citySlug, NOT: { id: cityId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const parsedParentId = parentId ? parseInt(parentId, 10) : null;

    // Verify parent choice to avoid circular reference
    if (parsedParentId && !isNaN(parsedParentId)) {
      if (parsedParentId === cityId) {
        return NextResponse.json({ error: "A page cannot be its own parent" }, { status: 400 });
      }
      const isCircular = await isDescendant(parsedParentId, cityId);
      if (isCircular) {
        return NextResponse.json({ error: "Parent page selection creates a circular dependency" }, { status: 400 });
      }
    }

    const cleanContent = typeof content === "string"
      ? content.replace(/&nbsp;/gi, " ").replace(/\u00a0/g, " ").replace(/\xa0/g, " ")
      : content;

    const updatedCity = await prisma.cityPage.update({
      where: { id: cityId },
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

    return NextResponse.json({ success: true, city: updatedCity });
  } catch (error: any) {
    console.error("Update City Page Error:", error);
    return NextResponse.json({ error: "Failed to update city page" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const cityId = parseInt(resolvedParams.id, 10);
    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city page ID" }, { status: 400 });
    }

    // Set parentId of children to null before deleting (or Prisma handles onDelete: SetNull)
    await prisma.cityPage.delete({ where: { id: cityId } });

    return NextResponse.json({ success: true, message: "City page deleted successfully" });
  } catch (error: any) {
    console.error("Delete City Page Error:", error);
    return NextResponse.json({ error: "Failed to delete city page" }, { status: 500 });
  }
}
