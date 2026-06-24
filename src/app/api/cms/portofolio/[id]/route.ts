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
    const portfolioId = parseInt(resolvedParams.id, 10);
    if (isNaN(portfolioId)) {
      return NextResponse.json({ error: "Invalid portfolio ID" }, { status: 400 });
    }

    const { title, description, imageUrl, logoUrl, logoText, link } = await request.json();

    if (!title || !description || !imageUrl) {
      return NextResponse.json({ error: "Title, description, and image URL are required" }, { status: 400 });
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        title,
        description,
        imageUrl,
        logoUrl: logoUrl || null,
        logoText: logoText || null,
        link: link || null,
      },
    });

    return NextResponse.json({ success: true, portfolio: updatedPortfolio });
  } catch (error: any) {
    console.error("Update Portfolio Error:", error);
    return NextResponse.json({ error: "Failed to update portfolio item" }, { status: 500 });
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
    const portfolioId = parseInt(resolvedParams.id, 10);
    if (isNaN(portfolioId)) {
      return NextResponse.json({ error: "Invalid portfolio ID" }, { status: 400 });
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });

    return NextResponse.json({ success: true, message: "Portfolio item deleted successfully" });
  } catch (error: any) {
    console.error("Delete Portfolio Error:", error);
    return NextResponse.json({ error: "Failed to delete portfolio item" }, { status: 500 });
  }
}
