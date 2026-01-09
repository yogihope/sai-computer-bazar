import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location") || "HOME";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const now = new Date();

    const banners = await prisma.heroBanner.findMany({
      where: {
        location: location as "HOME" | "PREBUILT_PC",
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching hero banners:", error);
    return NextResponse.json({ banners: [] });
  }
}
