import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create inquiry from public forms (welcome modal, chat widget, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type = "MANUAL",
      name,
      mobile,
      email,
      requirement,
      budget,
      source,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Validate required fields
    if (!name || !mobile) {
      return NextResponse.json(
        { error: "Name and mobile are required" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["MANUAL", "MODAL_WEB", "CHAT_WEB", "AD_WEB", "SOCIAL_MEDIA", "PHONE_CALL", "WALK_IN"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid inquiry type" },
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
        source: source || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
