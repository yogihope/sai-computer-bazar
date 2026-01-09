import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// POST - Toggle helpful vote on a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", requiresLogin: true },
        { status: 401 }
      );
    }

    // Get the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, helpfulCount: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: user.id,
        },
      },
    });

    if (existingVote) {
      // Remove vote (toggle off)
      await prisma.$transaction([
        prisma.reviewHelpful.delete({
          where: {
            reviewId_userId: {
              reviewId,
              userId: user.id,
            },
          },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { decrement: 1 } },
        }),
      ]);

      const updatedReview = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { helpfulCount: true },
      });

      return NextResponse.json({
        success: true,
        action: "removed",
        helpfulCount: updatedReview?.helpfulCount || 0,
        hasVoted: false,
      });
    } else {
      // Add vote
      await prisma.$transaction([
        prisma.reviewHelpful.create({
          data: {
            reviewId,
            userId: user.id,
          },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } },
        }),
      ]);

      const updatedReview = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { helpfulCount: true },
      });

      return NextResponse.json({
        success: true,
        action: "added",
        helpfulCount: updatedReview?.helpfulCount || 0,
        hasVoted: true,
      });
    }
  } catch (error) {
    console.error("Error toggling helpful vote:", error);
    return NextResponse.json(
      { error: "Failed to update helpful vote" },
      { status: 500 }
    );
  }
}

// GET - Check if user has voted on this review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ hasVoted: false, isAuthenticated: false });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });

    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      hasVoted: !!existingVote,
      isAuthenticated: true,
      isOwnReview: review?.userId === user.id,
    });
  } catch (error) {
    console.error("Error checking helpful vote:", error);
    return NextResponse.json(
      { error: "Failed to check helpful vote" },
      { status: 500 }
    );
  }
}
