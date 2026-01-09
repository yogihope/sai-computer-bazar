import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const parentId = searchParams.get("parentId");

    const categories = await prisma.category.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { slug: { contains: search } },
          ],
        }),
        ...(parentId === "root" ? { parentId: null } : parentId ? { parentId } : {}),
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true, children: true },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    // Calculate SEO score for each category
    const categoriesWithSeoScore = categories.map(category => {
      let seoScore = 0;
      const maxScore = 100;

      // Title check (20 points)
      if (category.seoTitle && category.seoTitle.length >= 30 && category.seoTitle.length <= 60) {
        seoScore += 20;
      } else if (category.seoTitle && category.seoTitle.length > 0) {
        seoScore += 10;
      }

      // Description check (20 points)
      if (category.seoDescription && category.seoDescription.length >= 120 && category.seoDescription.length <= 160) {
        seoScore += 20;
      } else if (category.seoDescription && category.seoDescription.length > 0) {
        seoScore += 10;
      }

      // Keywords check (15 points)
      if (category.seoKeywords && category.seoKeywords.length > 0) {
        seoScore += 15;
      }

      // OG Title (15 points)
      if (category.ogTitle && category.ogTitle.length > 0) {
        seoScore += 15;
      }

      // OG Description (15 points)
      if (category.ogDescription && category.ogDescription.length > 0) {
        seoScore += 15;
      }

      // Image (15 points)
      if (category.imageUrl) {
        seoScore += 15;
      }

      return {
        ...category,
        seoScore: Math.min(seoScore, maxScore),
      };
    });

    // Get stats
    const totalCategories = await prisma.category.count();
    const parentCategories = await prisma.category.count({ where: { parentId: null } });
    const subCategories = await prisma.category.count({ where: { parentId: { not: null } } });
    const totalProducts = await prisma.product.count();

    return NextResponse.json({
      categories: categoriesWithSeoScore,
      stats: {
        total: totalCategories,
        parents: parentCategories,
        subcategories: subCategories,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

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

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        imageAlt,
        parentId: parentId || null,
        displayOrder: displayOrder || 0,
        isVisible: isVisible ?? true,
        isFeatured: isFeatured ?? false,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
        robotsIndex: robotsIndex ?? true,
        robotsFollow: robotsFollow ?? true,
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

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
