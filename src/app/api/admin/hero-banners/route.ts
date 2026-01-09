import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location"); // HOME or PREBUILT_PC

    const where: Record<string, unknown> = {};
    if (location) {
      where.location = location;
    }

    const banners = await prisma.heroBanner.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching hero banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!location || !title) {
      return NextResponse.json(
        { error: "Location and title are required" },
        { status: 400 }
      );
    }

    const banner = await prisma.heroBanner.create({
      data: {
        location,
        title,
        subtitle,
        description,
        imageUrl,
        mobileImageUrl,
        buttonText,
        buttonLink,
        textColor: textColor || "#ffffff",
        overlayColor: overlayColor || "rgba(0,0,0,0.5)",
        textAlign: textAlign || "left",
        badgeText,
        badgeColor: badgeColor || "#ef4444",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Error creating hero banner:", error);
    return NextResponse.json(
      { error: "Failed to create hero banner" },
      { status: 500 }
    );
  }
}
