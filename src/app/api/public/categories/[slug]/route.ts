import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single category by slug with children and product count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug, isVisible: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        imageAlt: true,
        displayOrder: true,
        isFeatured: true,
        parentId: true,
        // SEO fields
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        canonicalUrl: true,
        robotsIndex: true,
        robotsFollow: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        jsonLd: true,
        // Parent category
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        // Children categories
        children: {
          where: { isVisible: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            _count: {
              select: { products: true },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        // Product count
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get sibling categories (same parent)
    const siblings = await prisma.category.findMany({
      where: {
        isVisible: true,
        parentId: category.parentId,
        NOT: { id: category.id },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
      take: 6,
    });

    // Get total product count including children
    let totalProducts = category._count.products;
    if (category.children.length > 0) {
      const childProductCounts = category.children.reduce(
        (sum, child) => sum + child._count.products,
        0
      );
      totalProducts += childProductCounts;
    }

    return NextResponse.json({
      category: {
        ...category,
        totalProducts,
      },
      siblings,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
