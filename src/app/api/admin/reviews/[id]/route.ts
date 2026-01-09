import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Get single review
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

    const review = await prisma.review.findUnique({
      where: { id },
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
        images: true,
        tags: {
          include: {
            reviewTag: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      review: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PUT - Update review (approve/reject/edit)
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

    const {
      title,
      description,
      rating,
      isApproved,
      isVerified,
      reviewerName,
      reviewerEmail,
    } = body;

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        product: { select: { id: true } },
        prebuiltPC: { select: { id: true } },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (rating !== undefined) updateData.rating = rating;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (reviewerName !== undefined) updateData.reviewerName = reviewerName;
    if (reviewerEmail !== undefined) updateData.reviewerEmail = reviewerEmail || null;

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    // Update product/prebuiltPC rating if approval status changed
    if (isApproved !== undefined) {
      if (existingReview.productId) {
        await updateProductRating(existingReview.productId);
      } else if (existingReview.prebuiltPCId) {
        // PrebuiltPC doesn't have rating fields, so no update needed
      }
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete review
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

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        product: { select: { id: true } },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const productId = existingReview.productId;

    // Delete review (cascade will delete related images and tags)
    await prisma.review.delete({
      where: { id },
    });

    // Update product rating after deletion
    if (productId) {
      await updateProductRating(productId);
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

// Helper function to update product rating
async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      isApproved: true,
    },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: null,
        ratingCount: 0,
      },
    });
  } else {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: Math.round(avgRating * 10) / 10,
        ratingCount: reviews.length,
      },
    });
  }
}
