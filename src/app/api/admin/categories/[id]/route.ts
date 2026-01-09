import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      slug,
      description,
      imageUrl,
      imageAlt,
      parentId,
      displayOrder,
      isVisible,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      jsonLd,
    } = body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if slug is unique (if changed)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Prevent self-referencing parent
    if (parentId === id) {
      return NextResponse.json(
        { error: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl,
        imageAlt,
        parentId: parentId || null,
        displayOrder,
        isVisible,
        isFeatured,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
        robotsIndex,
        robotsFollow,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        jsonLd,
      },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.products} products. Move or delete products first.` },
        { status: 400 }
      );
    }

    // Update children to have no parent (make them root categories)
    if (category._count.children > 0) {
      await prisma.category.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

// PATCH for quick updates (visibility, featured)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const category = await prisma.category.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}
