import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// DELETE - Delete a review (only owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete the review (cascade will delete images, tags, helpful votes)
    await prisma.review.delete({
      where: { id: reviewId },
    });

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

// PUT - Update a review (only owner can update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user owns this review
    if (review.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, rating, tagIds, images } = body;

    // Validation
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

    // Update review in a transaction
    await prisma.$transaction(async (tx) => {
      // Update review basic fields
      await tx.review.update({
        where: { id: reviewId },
        data: {
          title,
          description,
          rating,
        },
      });

      // If tagIds provided, update tags
      if (tagIds !== undefined) {
        // Delete existing tag assignments
        await tx.reviewTagAssignment.deleteMany({
          where: { reviewId },
        });

        // Create new tag assignments
        if (tagIds.length > 0) {
          await tx.reviewTagAssignment.createMany({
            data: tagIds.map((tagId: string) => ({
              reviewId,
              reviewTagId: tagId,
            })),
          });
        }
      }

      // If images provided, update images
      if (images !== undefined) {
        // Delete existing images
        await tx.reviewImage.deleteMany({
          where: { reviewId },
        });

        // Create new images
        if (images.length > 0) {
          await tx.reviewImage.createMany({
            data: images.slice(0, 5).map((url: string, index: number) => ({
              reviewId,
              url,
              sortOrder: index,
            })),
          });
        }
      }
    });

    // Fetch updated review
    const updatedReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        tags: { include: { reviewTag: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
