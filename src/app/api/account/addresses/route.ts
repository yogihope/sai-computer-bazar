import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { addressSchema } from "@/lib/validations/address";

// GET /api/account/addresses - List all addresses for current user
export async function GET() {
  try {
    const user = await requireAuth();

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.error("Get addresses error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST /api/account/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    // Validate input
    const validationResult = addressSchema.safeParse(body);

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

    // If this is the first address or marked as default, handle default logic
    if (data.isDefault) {
      // Remove default from other addresses
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    } else {
      // Check if user has any addresses, if not, make this one default
      const addressCount = await prisma.address.count({
        where: { userId: user.id },
      });

      if (addressCount === 0) {
        data.isDefault = true;
      }
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: data.label,
        fullName: data.fullName,
        mobile: data.mobile,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Please login to continue" },
        { status: 401 }
      );
    }

    console.error("Create address error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
