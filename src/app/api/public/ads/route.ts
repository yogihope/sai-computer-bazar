import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page"); // e.g., "home", "category", "product"
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const now = new Date();

    const ads = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      include: {
        coupon: { select: { id: true, code: true, discountValue: true, discountType: true } },
        product: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        prebuiltPC: { select: { id: true, name: true, slug: true } },
        blog: { select: { id: true, title: true, slug: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    // Filter by page if specified
    let filteredAds = ads;
    if (page) {
      filteredAds = ads.filter((ad) => {
        if (!ad.showOnPages) return true;
        try {
          const pages = JSON.parse(ad.showOnPages as string);
          return pages.includes(page);
        } catch {
          return true;
        }
      });
    }

    // Generate link for each ad based on type
    const adsWithLinks = filteredAds.map((ad) => {
      let link = ad.customLink || "#";

      switch (ad.adType) {
        case "COUPON":
          link = "/cart"; // Go to cart to apply coupon
          break;
        case "PRODUCT":
          if (ad.product) link = `/product/${ad.product.slug}`;
          break;
        case "CATEGORY":
          if (ad.category) link = `/category/${ad.category.slug}`;
          break;
        case "PREBUILT_PC":
          if (ad.prebuiltPC) link = `/prebuilt-pc/${ad.prebuiltPC.slug}`;
          break;
        case "BLOG":
          if (ad.blog) link = `/blog/${ad.blog.slug}`;
          break;
        case "CUSTOM":
          link = ad.customLink || "#";
          break;
      }

      return {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        backgroundColor: ad.backgroundColor,
        textColor: ad.textColor,
        accentColor: ad.accentColor,
        buttonText: ad.buttonText,
        link,
        adType: ad.adType,
        couponCode: ad.coupon?.code,
      };
    });

    // Track impressions
    if (adsWithLinks.length > 0) {
      const adIds = adsWithLinks.map((ad) => ad.id);
      await prisma.advertisement.updateMany({
        where: { id: { in: adIds } },
        data: { impressions: { increment: 1 } },
      });
    }

    return NextResponse.json({ ads: adsWithLinks });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ ads: [] });
  }
}
