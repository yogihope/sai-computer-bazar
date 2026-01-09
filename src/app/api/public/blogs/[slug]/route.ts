import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get single published blog by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        publishedAt: {
          lte: new Date(),
        },
      },
      include: {
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

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get related blogs (same category or tags)
    const relatedBlogs = await prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        id: { not: blog.id },
        OR: [
          { categoryId: blog.categoryId },
          {
            tags: {
              some: {
                slug: {
                  in: blog.tags.map((t) => t.slug),
                },
              },
            },
          },
        ],
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        featuredImageAlt: true,
        authorName: true,
        readingTime: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      blog: {
        ...blog,
        viewCount: blog.viewCount + 1, // Return updated count
      },
      relatedBlogs,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
