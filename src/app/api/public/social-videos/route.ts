import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch published social videos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // SHORT, VIDEO, or null for all
    const platform = searchParams.get("platform"); // YOUTUBE, INSTAGRAM, FACEBOOK
    const featured = searchParams.get("featured"); // true/false
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {
      status: "PUBLISHED",
    };

    if (type) {
      where.videoType = type;
    }

    if (platform) {
      where.platform = platform;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const videos = await prisma.socialVideo.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        videoType: true,
        platform: true,
        thumbnailUrl: true,
        isFeatured: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        prebuiltPC: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Extract video ID and generate thumbnail from URL
    const videosWithThumbnails = videos.map((video) => {
      let thumbnail = video.thumbnailUrl;
      let videoId = "";

      // Extract YouTube video ID and generate thumbnail
      if (video.platform === "YOUTUBE") {
        const youtubeMatch = video.videoUrl.match(
          /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
        );
        if (youtubeMatch) {
          videoId = youtubeMatch[1];
          if (!thumbnail) {
            thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }
        }
      }

      // For Instagram, use a placeholder if no thumbnail
      if (video.platform === "INSTAGRAM" && !thumbnail) {
        thumbnail = "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80";
      }

      // For Facebook, use a placeholder if no thumbnail
      if (video.platform === "FACEBOOK" && !thumbnail) {
        thumbnail = "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&q=80";
      }

      return {
        ...video,
        thumbnail,
        videoId,
        formattedViews: formatViews(video.viewCount),
        formattedLikes: formatViews(video.likeCount),
        timeAgo: getTimeAgo(video.createdAt),
      };
    });

    return NextResponse.json({
      success: true,
      videos: videosWithThumbnails,
    });
  } catch (error) {
    console.error("Error fetching social videos:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// Helper: Format view/like counts
function formatViews(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

// Helper: Get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}
