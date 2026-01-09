import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { addressSchema } from "@/lib/validations/address";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/account/addresses/:id - Get a specific address
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.error("Get address error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// PATCH /api/account/addresses/:id - Update an address
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();

    // Validate input (partial validation for PATCH)
    const validationResult = addressSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // If marking as default, remove default from other addresses
    if (data.isDefault === true) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.error("Update address error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// DELETE /api/account/addresses/:id - Delete an address
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, set another address as default
    if (existingAddress.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.error("Delete address error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
