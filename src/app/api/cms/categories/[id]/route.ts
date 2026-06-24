import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

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
    const categoryId = parseInt(resolvedParams.id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const { name, slug, description, type } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const categorySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug exists on a different category
    const existing = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        NOT: { id: categoryId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug: categorySlug,
        description: description || "",
        type: type || "BLOG",
      },
    });

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error: any) {
    console.error("Update Category Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    const categoryId = parseInt(resolvedParams.id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    // Check if category has associated posts
    const postsCount = await prisma.post.count({
      where: { categoryId },
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated posts" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
