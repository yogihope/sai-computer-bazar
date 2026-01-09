import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET all badges
export async function GET() {
  try {
    await requireAdmin();

    const badges = await prisma.badge.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

// POST create badge
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, slug, color } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existingBadge = await prisma.badge.findUnique({
      where: { slug },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: "A badge with this slug already exists" },
        { status: 400 }
      );
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        slug,
        color: color || "#6366f1",
      },
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error("Error creating badge:", error);
    return NextResponse.json(
      { error: "Failed to create badge" },
      { status: 500 }
    );
  }
}
