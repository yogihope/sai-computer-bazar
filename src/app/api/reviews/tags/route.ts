import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all review tags
export async function GET() {
  try {
    const tags = await prisma.reviewTag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching review tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch review tags" },
      { status: 500 }
    );
  }
}
