import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Helper to get date range based on filter
function getDateRange(filter: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (filter) {
    case "today":
      return { start: today, end: tomorrow };

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    }

    case "this_week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return { start: startOfWeek, end: tomorrow };
    }

    case "last_week": {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 7);
      return { start: startOfLastWeek, end: endOfLastWeek };
    }

    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth, end: tomorrow };
    }

    case "last_month": {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfLastMonth, end: endOfLastMonth };
    }

    case "this_year": {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { start: startOfYear, end: tomorrow };
    }

    case "last_year": {
      const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(now.getFullYear(), 0, 1);
      return { start: startOfLastYear, end: endOfLastYear };
    }

    case "lifetime":
    default:
      // Return a very old start date for lifetime
      return { start: new Date(2020, 0, 1), end: tomorrow };
  }
}

// Helper to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";

    const { start, end } = getDateRange(filter);

    // Get page views in the date range
    const pageViews = await prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate metrics
    const totalPageViews = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map((pv) => pv.visitorId || pv.sessionId)).size;
    const uniqueSessions = new Set(pageViews.map((pv) => pv.sessionId)).size;

    // Dwell time calculation
    const viewsWithDwellTime = pageViews.filter((pv) => pv.dwellTime > 0);
    const totalDwellTime = viewsWithDwellTime.reduce((sum, pv) => sum + pv.dwellTime, 0);
    const avgDwellTime = viewsWithDwellTime.length > 0
      ? Math.round(totalDwellTime / viewsWithDwellTime.length)
      : 0;

    // Bounce rate
    const bounces = pageViews.filter((pv) => pv.isBounce).length;
    const bounceRate = totalPageViews > 0
      ? Math.round((bounces / totalPageViews) * 100)
      : 0;

    // Scroll depth
    const viewsWithScroll = pageViews.filter((pv) => pv.scrollDepth > 0);
    const avgScrollDepth = viewsWithScroll.length > 0
      ? Math.round(viewsWithScroll.reduce((sum, pv) => sum + pv.scrollDepth, 0) / viewsWithScroll.length)
      : 0;

    // Device breakdown
    const deviceBreakdown = {
      desktop: pageViews.filter((pv) => pv.deviceType === "desktop").length,
      mobile: pageViews.filter((pv) => pv.deviceType === "mobile").length,
      tablet: pageViews.filter((pv) => pv.deviceType === "tablet").length,
    };

    // Page type breakdown
    const pageTypeBreakdown: Record<string, number> = {};
    pageViews.forEach((pv) => {
      pageTypeBreakdown[pv.pageType] = (pageTypeBreakdown[pv.pageType] || 0) + 1;
    });

    // Top pages by views
    const pageViewCounts: Record<string, { count: number; title: string; type: string; dwellTime: number; bounces: number }> = {};
    pageViews.forEach((pv) => {
      if (!pageViewCounts[pv.pagePath]) {
        pageViewCounts[pv.pagePath] = {
          count: 0,
          title: pv.pageTitle || pv.pagePath,
          type: pv.pageType,
          dwellTime: 0,
          bounces: 0,
        };
      }
      pageViewCounts[pv.pagePath].count++;
      pageViewCounts[pv.pagePath].dwellTime += pv.dwellTime;
      if (pv.isBounce) pageViewCounts[pv.pagePath].bounces++;
    });

    const topPages = Object.entries(pageViewCounts)
      .map(([path, data]) => ({
        path,
        title: data.title,
        type: data.type,
        views: data.count,
        avgDwellTime: data.count > 0 ? Math.round(data.dwellTime / data.count) : 0,
        bounceRate: data.count > 0 ? Math.round((data.bounces / data.count) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Traffic sources
    const sourceCounts: Record<string, number> = { direct: 0 };
    pageViews.forEach((pv) => {
      if (pv.utmSource) {
        sourceCounts[pv.utmSource] = (sourceCounts[pv.utmSource] || 0) + 1;
      } else if (pv.referrerDomain) {
        sourceCounts[pv.referrerDomain] = (sourceCounts[pv.referrerDomain] || 0) + 1;
      } else {
        sourceCounts.direct++;
      }
    });

    const trafficSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count, percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Hourly breakdown (for today/yesterday)
    const hourlyBreakdown: Record<number, number> = {};
    if (filter === "today" || filter === "yesterday") {
      for (let i = 0; i < 24; i++) {
        hourlyBreakdown[i] = 0;
      }
      pageViews.forEach((pv) => {
        const hour = new Date(pv.createdAt).getHours();
        hourlyBreakdown[hour]++;
      });
    }

    // Daily breakdown (for week/month views)
    const dailyBreakdown: { date: string; views: number }[] = [];
    if (filter !== "today" && filter !== "yesterday") {
      const dailyCounts: Record<string, number> = {};
      pageViews.forEach((pv) => {
        const dateStr = new Date(pv.createdAt).toISOString().split("T")[0];
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      });
      Object.entries(dailyCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([date, views]) => {
          dailyBreakdown.push({ date, views });
        });
    }

    // Get comparison data (previous period)
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = start;

    const previousPageViews = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    });

    const previousVisitors = await prisma.pageView.groupBy({
      by: ["visitorId"],
      where: {
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    });

    // Calculate change percentages
    const pageViewsChange = previousPageViews > 0
      ? Math.round(((totalPageViews - previousPageViews) / previousPageViews) * 100)
      : totalPageViews > 0 ? 100 : 0;

    const visitorsChange = previousVisitors.length > 0
      ? Math.round(((uniqueVisitors - previousVisitors.length) / previousVisitors.length) * 100)
      : uniqueVisitors > 0 ? 100 : 0;

    // Top products by views
    const productViews = pageViews.filter((pv) => pv.pageType === "product" && pv.referenceId);
    const productViewCounts: Record<string, { name: string; views: number; avgDwell: number }> = {};
    productViews.forEach((pv) => {
      const id = pv.referenceId!;
      if (!productViewCounts[id]) {
        productViewCounts[id] = { name: pv.referenceName || "Unknown", views: 0, avgDwell: 0 };
      }
      productViewCounts[id].views++;
      productViewCounts[id].avgDwell += pv.dwellTime;
    });

    const topProducts = Object.entries(productViewCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        views: data.views,
        avgDwellTime: data.views > 0 ? Math.round(data.avgDwell / data.views) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return NextResponse.json({
      filter,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      overview: {
        totalPageViews,
        uniqueVisitors,
        uniqueSessions,
        avgDwellTime,
        avgDwellTimeFormatted: formatDuration(avgDwellTime),
        bounceRate,
        avgScrollDepth,
        pageViewsChange,
        visitorsChange,
      },
      deviceBreakdown,
      pageTypeBreakdown,
      topPages,
      topProducts,
      trafficSources,
      hourlyBreakdown: filter === "today" || filter === "yesterday" ? hourlyBreakdown : null,
      dailyBreakdown: filter !== "today" && filter !== "yesterday" ? dailyBreakdown : null,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
