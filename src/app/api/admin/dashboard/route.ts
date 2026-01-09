import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Fetch all stats in parallel
    const [
      // Total counts
      totalProducts,
      totalOrders,
      totalCategories,
      totalCustomers,
      totalPrebuiltPCs,
      totalBlogs,

      // Today's stats
      todayOrders,
      yesterdayOrders,

      // Pending items
      pendingReviews,
      newInquiries,
      lowStockProducts,

      // Orders by status
      ordersByStatus,

      // Recent orders
      recentOrders,

      // Top products (by order count)
      topProducts,

      // Category stats
      categoryStats,

      // Revenue calculation
      todayRevenue,
      yesterdayRevenue,
      totalRevenue,

      // Weekly sales data
      weeklySalesRaw,

      // SEO scores
      productSeoScores,
      blogSeoScores,

      // Recent notifications
      recentNotifications,
      unreadNotificationCount,
    ] = await Promise.all([
      // Total counts
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.order.count(),
      prisma.category.count({ where: { isVisible: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.prebuiltPC.count({ where: { status: "PUBLISHED" } }),
      prisma.blog.count({ where: { status: "PUBLISHED" } }),

      // Today's orders
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      // Yesterday's orders
      prisma.order.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),

      // Pending reviews
      prisma.review.count({ where: { isApproved: false } }),
      // New inquiries
      prisma.inquiry.count({ where: { status: "NEW" } }),
      // Low stock products (less than 5)
      prisma.product.count({
        where: {
          status: "PUBLISHED",
          stockQuantity: { lt: 5 },
        },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          shippingName: true,
        },
      }),

      // Top products by order count
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { productId: { not: null } },
        _count: { id: true },
        _sum: { total: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),

      // Category stats
      prisma.category.findMany({
        where: { isVisible: true, parentId: null },
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      }),

      // Today's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      // Yesterday's revenue
      prisma.order.aggregate({
        where: { createdAt: { gte: yesterday, lt: today }, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      // Total revenue
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),

      // Weekly sales (last 7 days)
      prisma.order.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true, total: true, paymentStatus: true },
      }),

      // Product SEO scores
      prisma.product.aggregate({
        where: { status: "PUBLISHED" },
        _avg: { seoScore: true },
      }),
      // Blog SEO scores
      prisma.blog.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true },
      }),

      // Recent notifications
      prisma.adminNotification.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          priority: true,
          actionUrl: true,
          isRead: true,
          createdAt: true,
        },
      }),
      // Unread notification count
      prisma.adminNotification.count({ where: { isRead: false } }),
    ]);

    // Get product details for top products
    const topProductIds = topProducts
      .filter((p) => p.productId)
      .map((p) => p.productId as string);

    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        ratingAvg: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    // Process weekly sales data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySales = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName = days[date.getDay()];
      const dayOrders = weeklySalesRaw.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth()
        );
      });
      const sales = dayOrders.reduce(
        (sum, o) => sum + (o.paymentStatus === "PAID" ? Number(o.total) : 0),
        0
      );
      return {
        name: dayName,
        sales: Math.round(sales),
        orders: dayOrders.length,
      };
    });

    // Process top products with details
    const topProductsWithDetails = topProducts
      .map((p) => {
        const details = topProductDetails.find((d) => d.id === p.productId);
        if (!details) return null;
        return {
          id: details.id,
          name: details.name,
          revenue: p._sum.total ? Number(p._sum.total) : 0,
          rating: details.ratingAvg ? Number(details.ratingAvg) : 0,
          stock: details.stockQuantity,
          image: details.images[0]?.url || null,
          orderCount: p._count.id,
        };
      })
      .filter(Boolean);

    // Process category performance
    const categoryPerformance = categoryStats.map((c) => ({
      name: c.name,
      value: c._count.products,
    }));

    // Calculate today's units sold
    const todayOrderItems = await prisma.orderItem.aggregate({
      where: {
        order: { createdAt: { gte: today } },
      },
      _sum: { quantity: true },
    });

    // Payment method distribution (from orders)
    const paymentMethods = await prisma.order.groupBy({
      by: ["paymentMethod"],
      _count: { id: true },
    });

    const paymentData = paymentMethods.map((p) => ({
      name: p.paymentMethod,
      value: p._count.id,
    }));

    // Calculate percentages
    const todayRevenueValue = Number(todayRevenue._sum.total || 0);
    const yesterdayRevenueValue = Number(yesterdayRevenue._sum.total || 0);
    const revenueChange = yesterdayRevenueValue
      ? ((todayRevenueValue - yesterdayRevenueValue) / yesterdayRevenueValue) * 100
      : 0;

    const ordersChange = yesterdayOrders
      ? todayOrders - yesterdayOrders
      : todayOrders;

    // SEO score calculation
    const avgProductSeo = productSeoScores._avg.seoScore || 0;
    const overallSeoScore = Math.round(avgProductSeo);

    return NextResponse.json({
      // Summary stats
      stats: {
        todayRevenue: todayRevenueValue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        todayOrders,
        ordersChange,
        unitsSold: todayOrderItems._sum.quantity || 0,
        totalProducts,
        totalOrders,
        totalCustomers,
        totalCategories,
        totalPrebuiltPCs,
        totalBlogs,
        totalRevenue: Number(totalRevenue._sum.total || 0),
      },

      // Alerts
      alerts: {
        lowStockProducts,
        pendingReviews,
        newInquiries,
      },

      // Orders by status
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count.id,
      })),

      // Charts data
      weeklySales,
      categoryPerformance,
      paymentData,

      // Recent orders
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
        customerName: o.shippingName,
      })),

      // Top products
      topProducts: topProductsWithDetails,

      // SEO scores
      seoScore: {
        overall: overallSeoScore,
        products: Math.round(avgProductSeo),
        blogs: 0, // Can be calculated if blogs have seoScore
      },

      // Notifications
      notifications: {
        recent: recentNotifications,
        unreadCount: unreadNotificationCount,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
