import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET - List all blog categories
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Create new blog category
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, sortOrder, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(name);
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || "#6366f1",
        sortOrder: sortOrder ?? 0,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating blog category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT - Update blog category
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, color, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Handle slug update if name changed
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      const newSlug = generateSlug(name);
      const slugTaken = await prisma.blogCategory.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      slug = slugTaken ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: name ?? existingCategory.name,
        slug,
        description: description !== undefined ? description : existingCategory.description,
        color: color ?? existingCategory.color,
        sortOrder: sortOrder ?? existingCategory.sortOrder,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog category
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { blogs: true } } },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has blogs
    if (existingCategory._count.blogs > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated blogs" },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
