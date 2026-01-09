import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Get single customer with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            product: {
              select: { name: true, slug: true },
            },
            prebuiltPC: {
              select: { name: true, slug: true },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Calculate total spent
    const orderTotals = await prisma.order.aggregate({
      where: {
        userId: id,
        paymentStatus: { in: ["PAID", "COD_PENDING"] },
      },
      _sum: { total: true },
    });

    return NextResponse.json({
      customer: {
        ...customer,
        totalSpent: Number(orderTotals._sum.total) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT - Update customer status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, name, email, mobile } = body;

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
