import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List published blogs for public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const categorySlug = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("search") || "";

    // Build where clause - only published blogs
    const where: any = {
      status: "PUBLISHED",
      publishedAt: {
        lte: new Date(),
      },
    };

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.blog.count({ where });

    // Get blogs
    const blogs = await prisma.blog.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        featuredImageAlt: true,
        authorName: true,
        authorImage: true,
        readingTime: true,
        viewCount: true,
        publishedAt: true,
        isFeatured: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Get categories with blog count for sidebar
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: {
          select: {
            blogs: {
              where: {
                status: "PUBLISHED",
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    });

    // Get popular tags
    const popularTags = await prisma.blogTag.groupBy({
      by: ["name", "slug"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    return NextResponse.json({
      blogs,
      categories: categories.map((cat) => ({
        ...cat,
        blogCount: cat._count.blogs,
      })),
      popularTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
