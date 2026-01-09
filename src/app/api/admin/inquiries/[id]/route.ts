import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Get single inquiry
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

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 }
    );
  }
}

// PUT - Update inquiry
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

    const {
      type,
      name,
      mobile,
      email,
      requirement,
      budget,
      note,
      status,
      source,
      followUpDate,
      lastContactedAt,
      assignedTo,
    } = body;

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (email !== undefined) updateData.email = email || null;
    if (requirement !== undefined) updateData.requirement = requirement || null;
    if (budget !== undefined) updateData.budget = budget || null;
    if (note !== undefined) updateData.note = note || null;
    if (status !== undefined) updateData.status = status;
    if (source !== undefined) updateData.source = source || null;
    if (followUpDate !== undefined) {
      updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    if (lastContactedAt !== undefined) {
      updateData.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : null;
    }
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    // Update inquiry
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      inquiry,
      message: "Inquiry updated successfully",
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existingInquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
