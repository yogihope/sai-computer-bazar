import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET all PC types
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const pcTypes = await prisma.pCType.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { slug: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ pcTypes });
  } catch (error) {
    console.error("Error fetching PC types:", error);
    return NextResponse.json(
      { error: "Failed to fetch PC types" },
      { status: 500 }
    );
  }
}

// POST create new PC type
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if slug already exists
    const existing = await prisma.pCType.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A PC type with this name already exists" },
        { status: 400 }
      );
    }

    const pcType = await prisma.pCType.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ pcType }, { status: 201 });
  } catch (error) {
    console.error("Error creating PC type:", error);
    return NextResponse.json(
      { error: "Failed to create PC type" },
      { status: 500 }
    );
  }
}
