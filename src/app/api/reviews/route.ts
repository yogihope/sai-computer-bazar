import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET reviews for a product or prebuilt PC
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const prebuiltPCId = searchParams.get("prebuiltPCId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!productId && !prebuiltPCId) {
      return NextResponse.json(
        { error: "Either productId or prebuiltPCId is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      isApproved: true,
    };

    if (productId) {
      where.productId = productId;
    } else if (prebuiltPCId) {
      where.prebuiltPCId = prebuiltPCId;
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          rating: true,
          reviewerName: true,
          helpfulCount: true,
          isVerified: true,
          createdAt: true,
          images: {
            orderBy: { sortOrder: "asc" },
            select: { url: true },
          },
          tags: {
            include: {
              reviewTag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate analytics
    const allReviews = await prisma.review.findMany({
      where,
      select: {
        rating: true,
        tags: {
          include: { reviewTag: true },
        },
      },
    });

    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

    // Star distribution
    const starDistribution = [5, 4, 3, 2, 1].map((star) => {
      const count = allReviews.filter((r) => r.rating === star).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { star, count, percentage };
    });

    // Tag distribution
    const tagCounts: Record<string, { tag: { id: string; name: string; color: string }; count: number }> = {};
    allReviews.forEach((review) => {
      review.tags.forEach((t) => {
        if (!tagCounts[t.reviewTag.id]) {
          tagCounts[t.reviewTag.id] = {
            tag: { id: t.reviewTag.id, name: t.reviewTag.name, color: t.reviewTag.color },
            count: 0,
          };
        }
        tagCounts[t.reviewTag.id].count++;
      });
    });

    const tagDistribution = Object.values(tagCounts)
      .map((item) => ({
        ...item.tag,
        count: item.count,
        percentage: totalReviews > 0 ? (item.count / totalReviews) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Get current user for checking their votes
    const currentUser = await getCurrentUser();

    // Get user's helpful votes for these reviews
    let userVotes: string[] = [];
    if (currentUser) {
      const votes = await prisma.reviewHelpful.findMany({
        where: {
          userId: currentUser.id,
          reviewId: { in: reviews.map(r => r.id) },
        },
        select: { reviewId: true },
      });
      userVotes = votes.map(v => v.reviewId);
    }

    // Map reviews to response format
    const mappedReviews = reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.reviewerName,
      title: r.title,
      description: r.description,
      rating: r.rating,
      date: r.createdAt.toISOString(),
      helpful: r.helpfulCount,
      hasVoted: userVotes.includes(r.id),
      isVerified: r.isVerified,
      images: r.images.map((img) => img.url),
      tags: r.tags.map((t) => ({
        id: t.reviewTag.id,
        name: t.reviewTag.name,
        color: t.reviewTag.color,
      })),
    }));

    // Sort to put current user's review first
    if (currentUser) {
      mappedReviews.sort((a, b) => {
        if (a.userId === currentUser.id && b.userId !== currentUser.id) return -1;
        if (a.userId !== currentUser.id && b.userId === currentUser.id) return 1;
        return 0; // Keep original order for other reviews
      });
    }

    return NextResponse.json({
      reviews: mappedReviews,
      currentUserId: currentUser?.id || null,
      analytics: {
        totalReviews,
        averageRating,
        starDistribution,
        tagDistribution,
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST create a new review
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to write a review" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      productId,
      prebuiltPCId,
      title,
      description,
      rating,
      tagIds,
      images,
    } = body;

    // Validation
    if (!productId && !prebuiltPCId) {
      return NextResponse.json(
        { error: "Either productId or prebuiltPCId is required" },
        { status: 400 }
      );
    }

    if (!title || !description || !rating) {
      return NextResponse.json(
        { error: "Title, description, and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Create review with user info
    const review = await prisma.review.create({
      data: {
        productId: productId || null,
        prebuiltPCId: prebuiltPCId || null,
        userId: user.id,
        title,
        description,
        rating,
        reviewerName: user.name,
        reviewerEmail: user.email,
        isApproved: true, // Auto-approve for now (can add moderation later)
        isVerified: true, // Verified since user is authenticated
        images: images?.length > 0 ? {
          create: images.slice(0, 5).map((url: string, index: number) => ({
            url,
            sortOrder: index,
          })),
        } : undefined,
        tags: tagIds?.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            reviewTagId: tagId,
          })),
        } : undefined,
      },
      include: {
        images: true,
        tags: {
          include: { reviewTag: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully! It will be visible after moderation.",
      review: {
        id: review.id,
        title: review.title,
        rating: review.rating,
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to submit review", details: errorMessage },
      { status: 500 }
    );
  }
}
