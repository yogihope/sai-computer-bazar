import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Helper to calculate SEO score for a blog
function calculateSeoScore(blog: any): number {
  let score = 0;

  // SEO Title (30-60 chars) = 20 points
  const seoTitle = blog.seoTitle || blog.title || "";
  if (seoTitle.length >= 30 && seoTitle.length <= 60) {
    score += 20;
  } else if (seoTitle.length > 0) {
    score += 10;
  }

  // Meta Description (120-160 chars) = 20 points
  const seoDescription = blog.seoDescription || blog.excerpt || "";
  if (seoDescription.length >= 120 && seoDescription.length <= 160) {
    score += 20;
  } else if (seoDescription.length >= 50) {
    score += 10;
  }

  // Focus Keywords (3+) = 15 points
  const keywords = (blog.seoKeywords || "").split(",").filter((k: string) => k.trim()).length;
  if (keywords >= 3) {
    score += 15;
  } else if (keywords >= 1) {
    score += 7;
  }

  // Featured Image with Alt = 15 points
  if (blog.featuredImage && blog.featuredImageAlt) {
    score += 15;
  } else if (blog.featuredImage) {
    score += 7;
  }

  // Excerpt (50+ chars) = 10 points
  if ((blog.excerpt || "").length >= 50) {
    score += 10;
  }

  // Category Selected = 10 points
  if (blog.categoryId) {
    score += 10;
  }

  // Tags Added (2+) = 10 points
  const tagsCount = blog.tags?.length || 0;
  if (tagsCount >= 2) {
    score += 10;
  } else if (tagsCount >= 1) {
    score += 5;
  }

  return score;
}

// GET - List all blogs with filters, search, pagination, and stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const featured = searchParams.get("featured") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
        { authorName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured === "true") {
      where.isFeatured = true;
    } else if (featured === "false") {
      where.isFeatured = false;
    }

    // Get total count
    const total = await prisma.blog.count({ where });

    // Get blogs
    const blogsRaw = await prisma.blog.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: true,
      },
    });

    // Add SEO score to each blog
    const blogs = blogsRaw.map((blog) => ({
      ...blog,
      seoScore: calculateSeoScore(blog),
    }));

    // Get stats
    const totalBlogs = await prisma.blog.count();
    const publishedBlogs = await prisma.blog.count({ where: { status: "PUBLISHED" } });
    const draftBlogs = await prisma.blog.count({ where: { status: "DRAFT" } });
    const scheduledBlogs = await prisma.blog.count({ where: { status: "SCHEDULED" } });
    const featuredBlogs = await prisma.blog.count({ where: { isFeatured: true } });

    // Total views
    const viewStats = await prisma.blog.aggregate({
      _sum: { viewCount: true },
    });

    // Get categories for filter dropdown
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: {
          select: { blogs: true },
        },
      },
    });

    return NextResponse.json({
      blogs,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs,
        scheduled: scheduledBlogs,
        featured: featuredBlogs,
        totalViews: viewStats._sum.viewCount || 0,
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

// POST - Create new blog
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featuredImage,
      featuredImageAlt,
      ogImage,
      authorName = "Admin",
      authorImage,
      authorBio,
      categoryId,
      tags = [],
      status = "DRAFT",
      isFeatured = false,
      allowComments = true,
      publishedAt,
      scheduledAt,
      // SEO Fields
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      robotsIndex = true,
      robotsFollow = true,
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      schemaType = "Article",
      internalNotes,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate or use custom slug
    let slug = customSlug || generateSlug(title);

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({ where: { slug } });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    // Determine publish date
    let finalPublishedAt = null;
    if (status === "PUBLISHED") {
      finalPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
    }

    // Create blog
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage || null,
        featuredImageAlt: featuredImageAlt || null,
        ogImage: ogImage || null,
        authorName,
        authorImage: authorImage || null,
        authorBio: authorBio || null,
        categoryId: categoryId || null,
        status,
        isFeatured,
        allowComments,
        publishedAt: finalPublishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        readingTime,
        // SEO
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        canonicalUrl: canonicalUrl || null,
        robotsIndex,
        robotsFollow,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        schemaType,
        internalNotes: internalNotes || null,
        // Tags
        tags: tags.length > 0 ? {
          create: tags.map((tag: string) => ({
            name: tag,
            slug: generateSlug(tag),
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({
      success: true,
      blog,
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
