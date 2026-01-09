import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Helper to extract YouTube video ID and generate thumbnail
function extractYouTubeThumbnail(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\?\/]+)/,
    /youtube\.com\/v\/([^&\?\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  return null;
}

// Helper to generate SEO fields automatically
function generateSEO(title: string, description: string | null, platform: string) {
  const seoTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  const seoDescription = description
    ? (description.length > 160 ? description.substring(0, 157) + "..." : description)
    : `Watch this ${platform.toLowerCase()} video: ${title}`;
  const seoKeywords = `${title.toLowerCase()}, ${platform.toLowerCase()} video, sai computer bazar`;

  return { seoTitle, seoDescription, seoKeywords };
}

// GET single social video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const video = await prisma.socialVideo.findUnique({
      where: { id },
      include: {
        badges: {
          include: {
            badge: { select: { id: true, name: true, slug: true, color: true } },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        prebuiltPC: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryImage: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Social video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Error fetching social video:", error);
    return NextResponse.json(
      { error: "Failed to fetch social video" },
      { status: 500 }
    );
  }
}

// PUT update social video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      videoUrl,
      videoType,
      platform,
      thumbnailUrl,
      status,
      isFeatured,
      productId,
      prebuiltPCId,
      badges,
      viewCount,
      likeCount,
      sortOrder,
    } = body;

    // Check if video exists
    const existingVideo = await prisma.socialVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { error: "Social video not found" },
        { status: 404 }
      );
    }

    // Auto-extract thumbnail for YouTube if URL changed and no thumbnail provided
    let finalThumbnail = thumbnailUrl;
    if (videoUrl && videoUrl !== existingVideo.videoUrl && !thumbnailUrl) {
      const newPlatform = platform || existingVideo.platform;
      if (newPlatform === "YOUTUBE") {
        finalThumbnail = extractYouTubeThumbnail(videoUrl);
      }
    }

    // Auto-generate SEO if title changed
    let seoUpdate = {};
    if (title && title !== existingVideo.title) {
      seoUpdate = generateSEO(
        title,
        description !== undefined ? description : existingVideo.description,
        platform || existingVideo.platform
      );
    }

    // Update video
    const video = await prisma.socialVideo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(videoType !== undefined && { videoType }),
        ...(platform !== undefined && { platform }),
        ...(finalThumbnail !== undefined && { thumbnailUrl: finalThumbnail }),
        ...(status !== undefined && { status }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(productId !== undefined && { productId: productId || null }),
        ...(prebuiltPCId !== undefined && { prebuiltPCId: prebuiltPCId || null }),
        ...(viewCount !== undefined && { viewCount }),
        ...(likeCount !== undefined && { likeCount }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...seoUpdate,
      },
      include: {
        badges: { include: { badge: true } },
        product: { select: { id: true, name: true, slug: true } },
        prebuiltPC: { select: { id: true, name: true, slug: true } },
      },
    });

    // Update badges if provided
    if (badges !== undefined) {
      // Delete existing badge connections
      await prisma.socialVideoBadge.deleteMany({ where: { socialVideoId: id } });

      // Create new badge connections
      if (badges?.length) {
        for (const badgeId of badges) {
          await prisma.socialVideoBadge.create({
            data: { socialVideoId: id, badgeId },
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Error updating social video:", error);
    return NextResponse.json(
      { error: "Failed to update social video" },
      { status: 500 }
    );
  }
}

// DELETE social video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if video exists
    const video = await prisma.socialVideo.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Social video not found" },
        { status: 404 }
      );
    }

    // Delete video (cascades to badges)
    await prisma.socialVideo.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting social video:", error);
    return NextResponse.json(
      { error: "Failed to delete social video" },
      { status: 500 }
    );
  }
}

// PATCH for quick updates (status, featured, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const video = await prisma.socialVideo.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Error updating social video:", error);
    return NextResponse.json(
      { error: "Failed to update social video" },
      { status: 500 }
    );
  }
}
