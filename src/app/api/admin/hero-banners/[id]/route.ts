import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const banner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { error: "Hero banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error fetching hero banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero banner" },
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
      location,
      title,
      subtitle,
      description,
      imageUrl,
      mobileImageUrl,
      buttonText,
      buttonLink,
      textColor,
      overlayColor,
      textAlign,
      badgeText,
      badgeColor,
      startDate,
      endDate,
      isActive,
      sortOrder,
    } = body;

    const banner = await prisma.heroBanner.update({
      where: { id },
      data: {
        location,
        title,
        subtitle,
        description,
        imageUrl,
        mobileImageUrl,
        buttonText,
        buttonLink,
        textColor,
        overlayColor,
        textAlign,
        badgeText,
        badgeColor,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error updating hero banner:", error);
    return NextResponse.json(
      { error: "Failed to update hero banner" },
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

    await prisma.heroBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero banner:", error);
    return NextResponse.json(
      { error: "Failed to delete hero banner" },
      { status: 500 }
    );
  }
}
