import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { VideoStatus, VideoType, VideoPlatform } from "@prisma/client";

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

// GET all social videos
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as VideoStatus | null;
    const platform = searchParams.get("platform") as VideoPlatform | null;
    const videoType = searchParams.get("videoType") as VideoType | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(status && { status }),
      ...(platform && { platform }),
      ...(videoType && { videoType }),
    };

    const [videos, total, stats] = await Promise.all([
      prisma.socialVideo.findMany({
        where,
        include: {
          badges: {
            include: {
              badge: { select: { id: true, name: true, slug: true, color: true } },
            },
          },
          product: {
            select: { id: true, name: true, slug: true },
          },
          prebuiltPC: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.socialVideo.count({ where }),
      // Get stats
      Promise.all([
        prisma.socialVideo.count(),
        prisma.socialVideo.count({ where: { status: "PUBLISHED" } }),
        prisma.socialVideo.count({ where: { status: "DRAFT" } }),
        prisma.socialVideo.count({ where: { platform: "YOUTUBE" } }),
        prisma.socialVideo.count({ where: { platform: "INSTAGRAM" } }),
        prisma.socialVideo.count({ where: { platform: "FACEBOOK" } }),
        prisma.socialVideo.count({ where: { videoType: "SHORT" } }),
        prisma.socialVideo.count({ where: { videoType: "VIDEO" } }),
        prisma.socialVideo.aggregate({ _sum: { viewCount: true, likeCount: true } }),
      ]),
    ]);

    const [
      totalVideos,
      published,
      draft,
      youtube,
      instagram,
      facebook,
      shorts,
      regularVideos,
      engagement,
    ] = stats;

    return NextResponse.json({
      videos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalVideos,
        published,
        draft,
        youtube,
        instagram,
        facebook,
        shorts,
        videos: regularVideos,
        totalViews: engagement._sum.viewCount || 0,
        totalLikes: engagement._sum.likeCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching social videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch social videos" },
      { status: 500 }
    );
  }
}

// POST create social video
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

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

    // Validate required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      );
    }

    // Auto-extract thumbnail for YouTube if not provided
    let finalThumbnail = thumbnailUrl;
    if (!finalThumbnail && platform === "YOUTUBE") {
      finalThumbnail = extractYouTubeThumbnail(videoUrl);
    }

    // Auto-generate SEO
    const seo = generateSEO(title, description, platform || "YOUTUBE");

    // Create social video
    const video = await prisma.socialVideo.create({
      data: {
        title,
        description,
        videoUrl,
        videoType: videoType || "VIDEO",
        platform: platform || "YOUTUBE",
        thumbnailUrl: finalThumbnail,
        status: status || "DRAFT",
        isFeatured: isFeatured ?? false,
        productId: productId || null,
        prebuiltPCId: prebuiltPCId || null,
        viewCount: viewCount || 0,
        likeCount: likeCount || 0,
        sortOrder: sortOrder || 0,
        seoTitle: seo.seoTitle,
        seoDescription: seo.seoDescription,
        seoKeywords: seo.seoKeywords,
      },
      include: {
        badges: { include: { badge: true } },
        product: { select: { id: true, name: true, slug: true } },
        prebuiltPC: { select: { id: true, name: true, slug: true } },
      },
    });

    // Handle badges
    if (badges?.length) {
      for (const badgeId of badges) {
        await prisma.socialVideoBadge.create({
          data: {
            socialVideoId: video.id,
            badgeId,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error("Error creating social video:", error);
    return NextResponse.json(
      { error: "Failed to create social video" },
      { status: 500 }
    );
  }
}
