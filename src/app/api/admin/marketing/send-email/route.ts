import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBulkEmails, createEmailTemplate } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientType, selectedIds, subject, content, buttonText, buttonUrl } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    let recipients: { email: string; name?: string }[] = [];

    if (recipientType === "inquiries") {
      // Fetch inquiries
      const where = selectedIds?.length > 0 ? { id: { in: selectedIds } } : {};
      const inquiries = await prisma.inquiry.findMany({
        where,
        select: { id: true, name: true, email: true },
      });
      recipients = inquiries.map((i) => ({ email: i.email, name: i.name }));
    } else if (recipientType === "customers") {
      // Fetch users who have made orders
      const where = selectedIds?.length > 0 ? { id: { in: selectedIds } } : {};
      const users = await prisma.user.findMany({
        where: {
          ...where,
          orders: { some: {} },
        },
        select: { id: true, name: true, email: true },
      });
      recipients = users.map((u) => ({ email: u.email, name: u.name || undefined }));
    } else if (recipientType === "all_users") {
      // Fetch all users
      const where = selectedIds?.length > 0 ? { id: { in: selectedIds } } : {};
      const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true },
      });
      recipients = users.map((u) => ({ email: u.email, name: u.name || undefined }));
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 }
      );
    }

    // Create email HTML
    const html = createEmailTemplate(subject, content, buttonText, buttonUrl);

    // Send emails
    const results = await sendBulkEmails(recipients, subject, html);

    return NextResponse.json({
      success: true,
      message: `Emails sent: ${results.sent}, Failed: ${results.failed}`,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 10), // Only return first 10 errors
    });
  } catch (error) {
    console.error("Error sending marketing emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}

// Get recipients list
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "inquiries";
    const search = searchParams.get("search") || "";

    if (type === "inquiries") {
      const inquiries = await prisma.inquiry.findMany({
        where: {
          email: { not: null }, // Only inquiries with email
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          requirement: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      // Map to expected format
      const mappedInquiries = inquiries.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email || "",
        phone: i.mobile,
        subject: i.requirement,
        createdAt: i.createdAt,
      }));

      return NextResponse.json({ recipients: mappedInquiries, type: "inquiries" });
    } else if (type === "customers") {
      const customers = await prisma.user.findMany({
        where: {
          orders: { some: {} },
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { email: { contains: search } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return NextResponse.json({
        recipients: customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.mobile,
          createdAt: c.createdAt,
          orderCount: c._count.orders,
        })),
        type: "customers",
      });
    }

    return NextResponse.json({ recipients: [], type });
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}
