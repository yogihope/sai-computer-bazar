import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/account/addresses/:id/make-default - Set an address as default
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    // Remove default from all other addresses
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json({
      success: true,
      message: "Address set as default",
      address,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.error("Make default address error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
