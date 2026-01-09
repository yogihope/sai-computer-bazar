import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Record a new page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      sessionId,
      visitorId,
      userId,
      pagePath,
      pageTitle,
      pageType,
      referenceId,
      referenceName,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      deviceType,
      browser,
      os,
      screenWidth,
      screenHeight,
    } = body;

    // Validate required fields
    if (!sessionId || !pagePath || !pageType) {
      return NextResponse.json(
        { error: "sessionId, pagePath, and pageType are required" },
        { status: 400 }
      );
    }

    // Extract referrer domain
    let referrerDomain = null;
    if (referrer && referrer !== "") {
      try {
        const url = new URL(referrer);
        referrerDomain = url.hostname;
      } catch {
        // Invalid URL, ignore
      }
    }

    // Create page view record
    const pageView = await prisma.pageView.create({
      data: {
        sessionId,
        visitorId: visitorId || null,
        userId: userId || null,
        pagePath,
        pageTitle: pageTitle || null,
        pageType,
        referenceId: referenceId || null,
        referenceName: referenceName || null,
        referrer: referrer || null,
        referrerDomain,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        deviceType: deviceType || null,
        browser: browser || null,
        os: os || null,
        screenWidth: screenWidth || null,
        screenHeight: screenHeight || null,
        isBounce: true, // Default to bounce, will update when user interacts
        enteredAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      viewId: pageView.id,
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}

// PUT - Update page view with engagement data (dwell time, scroll, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      viewId,
      dwellTime,
      scrollDepth,
      interactions,
      isBounce,
      isExit,
    } = body;

    if (!viewId) {
      return NextResponse.json(
        { error: "viewId is required" },
        { status: 400 }
      );
    }

    // Update the page view
    await prisma.pageView.update({
      where: { id: viewId },
      data: {
        dwellTime: dwellTime !== undefined ? dwellTime : undefined,
        scrollDepth: scrollDepth !== undefined ? scrollDepth : undefined,
        interactions: interactions !== undefined ? interactions : undefined,
        isBounce: isBounce !== undefined ? isBounce : undefined,
        isExit: isExit !== undefined ? isExit : undefined,
        exitedAt: isExit ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating page view:", error);
    return NextResponse.json(
      { error: "Failed to update page view" },
      { status: 500 }
    );
  }
}
