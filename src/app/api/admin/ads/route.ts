import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adType = searchParams.get("type");
    const position = searchParams.get("position");
    const activeOnly = searchParams.get("active") === "true";

    const where: Record<string, unknown> = {};
    if (adType) where.adType = adType;
    if (position) where.position = position;
    if (activeOnly) where.isActive = true;

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        coupon: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        prebuiltPC: { select: { id: true, name: true, slug: true } },
        blog: { select: { id: true, title: true, slug: true } },
        socialVideo: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!name || !title || !adType) {
      return NextResponse.json(
        { error: "Name, title, and adType are required" },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.create({
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
        backgroundColor: backgroundColor || "#f3f4f6",
        textColor: textColor || "#000000",
        accentColor: accentColor || "#3b82f6",
        position: position || "SIDEBAR",
        showOnPages: showOnPages ? JSON.stringify(showOnPages) : null,
        buttonText: buttonText || "Shop Now",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { error: "Failed to create advertisement" },
      { status: 500 }
    );
  }
}
