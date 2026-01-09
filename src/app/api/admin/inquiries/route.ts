import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - List all inquiries with filters, search, pagination, and stats
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { requirement: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    // Get total count
    const total = await prisma.inquiry.count({ where });

    // Get inquiries
    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get stats by type
    const statsByType = await prisma.inquiry.groupBy({
      by: ["type"],
      _count: { id: true },
    });

    // Get stats by status
    const statsByStatus = await prisma.inquiry.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Get today's inquiries count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.inquiry.count({
      where: { createdAt: { gte: today } },
    });

    // Get this week's count
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = await prisma.inquiry.count({
      where: { createdAt: { gte: weekStart } },
    });

    // Get this month's count
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthCount = await prisma.inquiry.count({
      where: { createdAt: { gte: monthStart } },
    });

    // Transform stats
    const typeStats = statsByType.reduce((acc: any, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {});

    const statusStats = statsByStatus.reduce((acc: any, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        byType: typeStats,
        byStatus: statusStats,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// POST - Create new inquiry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      type = "MANUAL",
      name,
      mobile,
      email,
      requirement,
      budget,
      note,
      status = "NEW",
      source,
      followUpDate,
    } = body;

    // Validate required fields
    if (!name || !mobile) {
      return NextResponse.json(
        { error: "Name and mobile are required" },
        { status: 400 }
      );
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        type,
        name,
        mobile,
        email: email || null,
        requirement: requirement || null,
        budget: budget || null,
        note: note || null,
        status,
        source: source || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      inquiry,
      message: "Inquiry created successfully",
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to create inquiry" },
      { status: 500 }
    );
  }
}
