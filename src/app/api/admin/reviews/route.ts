import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - List all reviews with filters, search, pagination, and stats
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
    const status = searchParams.get("status") || ""; // approved, pending, rejected
    const type = searchParams.get("type") || ""; // product, prebuilt
    const rating = searchParams.get("rating") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { reviewerName: { contains: search } },
        { reviewerEmail: { contains: search } },
      ];
    }

    if (status === "approved") {
      where.isApproved = true;
    } else if (status === "pending") {
      where.isApproved = false;
    }

    if (type === "product") {
      where.productId = { not: null };
      where.prebuiltPCId = null;
    } else if (type === "prebuilt") {
      where.prebuiltPCId = { not: null };
      where.productId = null;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    // Get total count
    const total = await prisma.review.count({ where });

    // Get reviews with relations
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { take: 1, select: { url: true } },
          },
        },
        prebuiltPC: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryImage: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
        },
        tags: {
          include: {
            reviewTag: true,
          },
        },
      },
    });

    // Get stats
    const totalReviews = await prisma.review.count();
    const approvedCount = await prisma.review.count({ where: { isApproved: true } });
    const pendingCount = await prisma.review.count({ where: { isApproved: false } });
    const productReviewsCount = await prisma.review.count({ where: { productId: { not: null } } });
    const prebuiltReviewsCount = await prisma.review.count({ where: { prebuiltPCId: { not: null } } });

    // Get average rating
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      _count: { id: true },
    });

    const ratingStats = ratingDistribution.reduce((acc: any, item) => {
      acc[item.rating] = item._count.id;
      return acc;
    }, {});

    // Transform reviews for response
    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      type: review.productId ? "product" : "prebuilt",
      itemId: review.productId || review.prebuiltPCId,
      itemName: review.product?.name || review.prebuiltPC?.name || "Unknown",
      itemSlug: review.product?.slug || review.prebuiltPC?.slug,
      itemImage: review.product?.images[0]?.url || review.prebuiltPC?.primaryImage,
      title: review.title,
      description: review.description,
      rating: review.rating,
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail,
      userId: review.userId,
      userName: review.user?.name,
      userEmail: review.user?.email,
      helpfulCount: review.helpfulCount,
      isApproved: review.isApproved,
      isVerified: review.isVerified,
      images: review.images,
      tags: review.tags.map((t) => ({
        id: t.reviewTag.id,
        name: t.reviewTag.name,
        color: t.reviewTag.color,
      })),
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalReviews,
        approved: approvedCount,
        pending: pendingCount,
        productReviews: productReviewsCount,
        prebuiltReviews: prebuiltReviewsCount,
        avgRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
        ratingDistribution: ratingStats,
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
