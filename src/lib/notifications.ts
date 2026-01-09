import { prisma } from "@/lib/prisma";
import { NotificationType, NotificationPriority, Prisma } from "@prisma/client";

// Milestone thresholds
const REVENUE_MILESTONES = [10000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000];
const USER_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000, 50000];
const ORDER_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];
const VISIT_MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000];

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata?: Prisma.InputJsonValue;
}

// Create a notification
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        priority: params.priority || "NORMAL",
        entityType: params.entityType,
        entityId: params.entityId,
        actionUrl: params.actionUrl,
        metadata: params.metadata,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

// Notification creators for specific events
export async function notifyNewOrder(order: {
  id: string;
  orderNumber: string;
  total: number;
  customerName: string;
}) {
  return createNotification({
    type: "NEW_ORDER",
    title: "New Order Received",
    message: `Order ${order.orderNumber} from ${order.customerName} - ₹${order.total.toLocaleString("en-IN")}`,
    priority: "HIGH",
    entityType: "order",
    entityId: order.id,
    actionUrl: `/admin/orders/${order.id}`,
    metadata: { orderNumber: order.orderNumber, total: order.total },
  });
}

export async function notifyNewUser(user: {
  id: string;
  name: string;
  email: string;
}) {
  return createNotification({
    type: "NEW_USER",
    title: "New Customer Registered",
    message: `${user.name} (${user.email}) just signed up`,
    priority: "NORMAL",
    entityType: "user",
    entityId: user.id,
    actionUrl: `/admin/customers`,
    metadata: { name: user.name, email: user.email },
  });
}

export async function notifyNewInquiry(inquiry: {
  id: string;
  name: string;
  mobile: string;
  requirement?: string;
}) {
  return createNotification({
    type: "NEW_INQUIRY",
    title: "New Inquiry Received",
    message: `${inquiry.name} (${inquiry.mobile}) - ${inquiry.requirement?.slice(0, 50) || "No details"}...`,
    priority: "HIGH",
    entityType: "inquiry",
    entityId: inquiry.id,
    actionUrl: `/admin/inquiries`,
    metadata: { name: inquiry.name, mobile: inquiry.mobile },
  });
}

export async function notifyNewReview(review: {
  id: string;
  productName: string;
  reviewerName: string;
  rating: number;
}) {
  return createNotification({
    type: "NEW_REVIEW",
    title: "New Review Submitted",
    message: `${review.reviewerName} rated "${review.productName}" ${review.rating}/5 stars`,
    priority: "NORMAL",
    entityType: "review",
    entityId: review.id,
    actionUrl: `/admin/reviews`,
    metadata: { productName: review.productName, rating: review.rating },
  });
}

export async function notifyLowStock(product: {
  id: string;
  name: string;
  stockQuantity: number;
}) {
  return createNotification({
    type: "LOW_STOCK",
    title: "Low Stock Alert",
    message: `"${product.name}" has only ${product.stockQuantity} units left`,
    priority: "URGENT",
    entityType: "product",
    entityId: product.id,
    actionUrl: `/admin/products/edit/${product.id}`,
    metadata: { productName: product.name, stock: product.stockQuantity },
  });
}

export async function notifyOrderStatusChange(order: {
  id: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
}) {
  return createNotification({
    type: "ORDER_STATUS",
    title: "Order Status Updated",
    message: `Order ${order.orderNumber} changed from ${order.oldStatus} to ${order.newStatus}`,
    priority: "NORMAL",
    entityType: "order",
    entityId: order.id,
    actionUrl: `/admin/orders/${order.id}`,
    metadata: { oldStatus: order.oldStatus, newStatus: order.newStatus },
  });
}

// Format currency for Indian Rupees
function formatIndianCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

// Check and create milestone notifications
export async function checkMilestones() {
  try {
    // Check revenue milestones
    const totalRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    });
    const revenue = Number(totalRevenue._sum.total || 0);
    await checkAndNotifyMilestone("revenue", "all_time", revenue, REVENUE_MILESTONES, "MILESTONE_REVENUE");

    // Check user milestones
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    await checkAndNotifyMilestone("users", "all_time", totalUsers, USER_MILESTONES, "MILESTONE_USERS");

    // Check order milestones
    const totalOrders = await prisma.order.count();
    await checkAndNotifyMilestone("orders", "all_time", totalOrders, ORDER_MILESTONES, "MILESTONE_ORDERS");

    // Check daily milestones
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenue = await prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: today } },
      _sum: { total: true },
    });
    const dailyRevenue = Number(todayRevenue._sum.total || 0);
    if (dailyRevenue >= 100000) {
      await checkAndNotifyMilestone("revenue", "daily", dailyRevenue, [100000, 500000, 1000000], "MILESTONE_REVENUE");
    }

    const todayOrders = await prisma.order.count({ where: { createdAt: { gte: today } } });
    if (todayOrders >= 10) {
      await checkAndNotifyMilestone("orders", "daily", todayOrders, [10, 25, 50, 100], "MILESTONE_ORDERS");
    }

  } catch (error) {
    console.error("Error checking milestones:", error);
  }
}

async function checkAndNotifyMilestone(
  type: string,
  period: string,
  currentValue: number,
  milestones: number[],
  notificationType: NotificationType
) {
  try {
    // Get or create tracker
    let tracker = await prisma.milestoneTracker.findUnique({
      where: { type_period: { type, period } },
    });

    const now = new Date();
    const periodStart = period === "daily" ? new Date(now.setHours(0, 0, 0, 0)) : new Date(0);

    if (!tracker) {
      tracker = await prisma.milestoneTracker.create({
        data: {
          type,
          period,
          currentValue,
          lastMilestone: 0,
          periodStart,
        },
      });
    }

    // Find the highest milestone reached
    const lastMilestone = Number(tracker.lastMilestone);
    let newMilestone = lastMilestone;

    for (const milestone of milestones) {
      if (currentValue >= milestone && milestone > lastMilestone) {
        newMilestone = milestone;
      }
    }

    // If we've hit a new milestone, notify
    if (newMilestone > lastMilestone) {
      const periodLabel = period === "all_time" ? "" : ` (${period})`;
      let title = "";
      let message = "";

      switch (type) {
        case "revenue":
          title = `Revenue Milestone${periodLabel}`;
          message = `Congratulations! You've reached ${formatIndianCurrency(newMilestone)} in revenue${periodLabel}!`;
          break;
        case "users":
          title = `Customer Milestone${periodLabel}`;
          message = `You now have ${newMilestone.toLocaleString()} registered customers!`;
          break;
        case "orders":
          title = `Order Milestone${periodLabel}`;
          message = `You've completed ${newMilestone.toLocaleString()} orders${periodLabel}!`;
          break;
        case "visits":
          title = `Traffic Milestone${periodLabel}`;
          message = `Your store has received ${newMilestone.toLocaleString()} visits${periodLabel}!`;
          break;
      }

      await createNotification({
        type: notificationType,
        title,
        message,
        priority: "HIGH",
        metadata: { milestone: newMilestone, currentValue, period },
      });

      // Update tracker
      await prisma.milestoneTracker.update({
        where: { id: tracker.id },
        data: { currentValue, lastMilestone: newMilestone },
      });
    } else {
      // Just update current value
      await prisma.milestoneTracker.update({
        where: { id: tracker.id },
        data: { currentValue },
      });
    }
  } catch (error) {
    console.error(`Error checking ${type} milestone:`, error);
  }
}

// Get unread notification count
export async function getUnreadCount() {
  return prisma.adminNotification.count({ where: { isRead: false } });
}

// Get recent notifications
export async function getRecentNotifications(limit = 5) {
  return prisma.adminNotification.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

// Mark notification as read
export async function markAsRead(id: string) {
  return prisma.adminNotification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}

// Mark all as read
export async function markAllAsRead() {
  return prisma.adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
