import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ad = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        coupon: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        prebuiltPC: { select: { id: true, name: true, slug: true } },
        blog: { select: { id: true, title: true, slug: true } },
        socialVideo: { select: { id: true, title: true } },
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisement" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      title,
      description,
      adType,
      couponId,
      productId,
      categoryId,
      prebuiltPCId,
      blogId,
      socialVideoId,
      customLink,
      imageUrl,
      backgroundColor,
      textColor,
      accentColor,
      position,
      showOnPages,
      buttonText,
      startDate,
      endDate,
      priority,
      isActive,
    } = body;

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        name,
        title,
        description,
        adType,
        couponId: couponId || null,
        productId: productId || null,
        categoryId: categoryId || null,
        prebuiltPCId: prebuiltPCId || null,
        blogId: blogId || null,
        socialVideoId: socialVideoId || null,
        customLink: customLink || null,
        imageUrl,
        backgroundColor,
        textColor,
        accentColor,
        position,
        showOnPages: showOnPages ? JSON.stringify(showOnPages) : null,
        buttonText,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority,
        isActive,
      },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { error: "Failed to update advertisement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.advertisement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { error: "Failed to delete advertisement" },
      { status: 500 }
    );
  }
}

// Track click
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "click") {
      await prisma.advertisement.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      });
    } else if (action === "impression") {
      await prisma.advertisement.update({
        where: { id },
        data: { impressions: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking ad:", error);
    return NextResponse.json(
      { error: "Failed to track advertisement" },
      { status: 500 }
    );
  }
}
