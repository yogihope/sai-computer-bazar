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

// GET - Get single blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT - Update blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featuredImage,
      featuredImageAlt,
      ogImage,
      authorName,
      authorImage,
      authorBio,
      categoryId,
      tags = [],
      status,
      isFeatured,
      allowComments,
      publishedAt,
      scheduledAt,
      // SEO Fields
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      schemaType,
      internalNotes,
    } = body;

    // Handle slug update
    let slug = existingBlog.slug;
    if (customSlug && customSlug !== existingBlog.slug) {
      // Check if new slug is taken
      const slugTaken = await prisma.blog.findFirst({
        where: { slug: customSlug, id: { not: id } },
      });
      if (slugTaken) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
      slug = customSlug;
    } else if (title && title !== existingBlog.title && !customSlug) {
      // Auto-generate new slug if title changed and no custom slug
      const newSlug = generateSlug(title);
      const slugTaken = await prisma.blog.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      slug = slugTaken ? `${newSlug}-${Date.now()}` : newSlug;
    }

    // Calculate reading time if content changed
    const readingTime = content
      ? calculateReadingTime(content)
      : existingBlog.readingTime;

    // Determine publish date
    let finalPublishedAt = existingBlog.publishedAt;
    if (status === "PUBLISHED" && !existingBlog.publishedAt) {
      finalPublishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else if (publishedAt) {
      finalPublishedAt = new Date(publishedAt);
    }

    // Delete existing tags
    await prisma.blogTag.deleteMany({ where: { blogId: id } });

    // Update blog
    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: title ?? existingBlog.title,
        slug,
        excerpt: excerpt !== undefined ? excerpt : existingBlog.excerpt,
        content: content ?? existingBlog.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existingBlog.featuredImage,
        featuredImageAlt: featuredImageAlt !== undefined ? featuredImageAlt : existingBlog.featuredImageAlt,
        ogImage: ogImage !== undefined ? ogImage : existingBlog.ogImage,
        authorName: authorName ?? existingBlog.authorName,
        authorImage: authorImage !== undefined ? authorImage : existingBlog.authorImage,
        authorBio: authorBio !== undefined ? authorBio : existingBlog.authorBio,
        categoryId: categoryId !== undefined ? categoryId : existingBlog.categoryId,
        status: status ?? existingBlog.status,
        isFeatured: isFeatured !== undefined ? isFeatured : existingBlog.isFeatured,
        allowComments: allowComments !== undefined ? allowComments : existingBlog.allowComments,
        publishedAt: finalPublishedAt,
        scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : existingBlog.scheduledAt,
        readingTime,
        // SEO
        seoTitle: seoTitle !== undefined ? seoTitle : existingBlog.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existingBlog.seoDescription,
        seoKeywords: seoKeywords !== undefined ? seoKeywords : existingBlog.seoKeywords,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : existingBlog.canonicalUrl,
        robotsIndex: robotsIndex !== undefined ? robotsIndex : existingBlog.robotsIndex,
        robotsFollow: robotsFollow !== undefined ? robotsFollow : existingBlog.robotsFollow,
        ogTitle: ogTitle !== undefined ? ogTitle : existingBlog.ogTitle,
        ogDescription: ogDescription !== undefined ? ogDescription : existingBlog.ogDescription,
        twitterTitle: twitterTitle !== undefined ? twitterTitle : existingBlog.twitterTitle,
        twitterDescription: twitterDescription !== undefined ? twitterDescription : existingBlog.twitterDescription,
        schemaType: schemaType ?? existingBlog.schemaType,
        internalNotes: internalNotes !== undefined ? internalNotes : existingBlog.internalNotes,
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
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({ where: { id } });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Delete tags first
    await prisma.blogTag.deleteMany({ where: { blogId: id } });

    // Delete blog
    await prisma.blog.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
