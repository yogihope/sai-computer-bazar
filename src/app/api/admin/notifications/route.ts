import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (type) {
      where.type = type;
    }
    if (unreadOnly) {
      where.isRead = false;
    }

    // Fetch notifications and count in parallel
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminNotification.count({ where }),
      prisma.adminNotification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (action === "markAllRead") {
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (action === "markRead" && id) {
      await prisma.adminNotification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "markUnread" && id) {
      await prisma.adminNotification.update({
        where: { id },
        data: { isRead: false, readAt: null },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, deleteAll, deleteRead } = body;

    if (deleteAll) {
      await prisma.adminNotification.deleteMany({});
      return NextResponse.json({ success: true, message: "All notifications deleted" });
    }

    if (deleteRead) {
      await prisma.adminNotification.deleteMany({
        where: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Read notifications deleted" });
    }

    if (id) {
      await prisma.adminNotification.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
