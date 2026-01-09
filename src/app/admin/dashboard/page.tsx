"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Users,
  Layers,
  Monitor,
  FileText,
  Bell,
  MessageSquare,
  Star,
  Trophy,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";

interface DashboardData {
  stats: {
    todayRevenue: number;
    revenueChange: number;
    todayOrders: number;
    ordersChange: number;
    unitsSold: number;
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalCategories: number;
    totalPrebuiltPCs: number;
    totalBlogs: number;
    totalRevenue: number;
  };
  alerts: {
    lowStockProducts: number;
    pendingReviews: number;
    newInquiries: number;
  };
  ordersByStatus: { status: string; count: number }[];
  weeklySales: { name: string; sales: number; orders: number }[];
  categoryPerformance: { name: string; value: number }[];
  paymentData: { name: string; value: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    revenue: number;
    rating: number;
    stock: number;
    image: string | null;
    orderCount: number;
  }[];
  seoScore: {
    overall: number;
    products: number;
    blogs: number;
  };
  notifications: {
    recent: {
      id: string;
      type: string;
      title: string;
      message: string;
      priority: string;
      actionUrl: string | null;
      isRead: boolean;
      createdAt: string;
    }[];
    unreadCount: number;
  };
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "NEW_ORDER":
      return <ShoppingCart className="w-4 h-4" />;
    case "NEW_USER":
      return <Users className="w-4 h-4" />;
    case "NEW_INQUIRY":
      return <MessageSquare className="w-4 h-4" />;
    case "NEW_REVIEW":
      return <Star className="w-4 h-4" />;
    case "LOW_STOCK":
      return <Package className="w-4 h-4" />;
    case "ORDER_STATUS":
      return <TrendingUp className="w-4 h-4" />;
    case "MILESTONE_REVENUE":
    case "MILESTONE_USERS":
    case "MILESTONE_ORDERS":
    case "MILESTONE_VISITS":
      return <Trophy className="w-4 h-4" />;
    case "SYSTEM":
      return <Settings className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  if (priority === "URGENT") return "text-red-500 bg-red-500/10";
  if (priority === "HIGH") return "text-orange-500 bg-orange-500/10";

  switch (type) {
    case "NEW_ORDER":
      return "text-green-500 bg-green-500/10";
    case "NEW_USER":
      return "text-blue-500 bg-blue-500/10";
    case "NEW_INQUIRY":
      return "text-purple-500 bg-purple-500/10";
    case "NEW_REVIEW":
      return "text-yellow-500 bg-yellow-500/10";
    case "LOW_STOCK":
      return "text-red-500 bg-red-500/10";
    case "MILESTONE_REVENUE":
    case "MILESTONE_USERS":
    case "MILESTONE_ORDERS":
    case "MILESTONE_VISITS":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatPaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    COD: "COD",
    RAZORPAY: "Razorpay",
    UPI: "UPI",
    CARD: "Card",
    NETBANKING: "Net Banking",
    WALLET: "Wallet",
  };
  return methods[method] || method;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PROCESSING: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    SHIPPED: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    OUT_FOR_DELIVERY: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    DELIVERED: "bg-green-500/10 text-green-600 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
    RETURNED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    REFUNDED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };
  return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error loading dashboard: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Welcome back, Admin. Here's what's happening today."
      />

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.todayRevenue)}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.stats.revenueChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {data.stats.revenueChange >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span>{data.stats.revenueChange >= 0 ? "+" : ""}{data.stats.revenueChange}% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Orders
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.todayOrders}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.stats.ordersChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {data.stats.ordersChange >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span>{data.stats.ordersChange >= 0 ? "+" : ""}{data.stats.ordersChange} from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Units Sold Today
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.unitsSold}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Total orders: {data.stats.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              All time earnings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Row 2 (Totals) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Products</span>
            </div>
            <div className="text-xl font-bold mt-1">{data.stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Prebuilt PCs</span>
            </div>
            <div className="text-xl font-bold mt-1">{data.stats.totalPrebuiltPCs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Categories</span>
            </div>
            <div className="text-xl font-bold mt-1">{data.stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Customers</span>
            </div>
            <div className="text-xl font-bold mt-1">{data.stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Orders</span>
            </div>
            <div className="text-xl font-bold mt-1">{data.stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Blogs</span>
            </div>
            <div className="text-xl font-bold mt-1">{data.stats.totalBlogs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Sales"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                  name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))" }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "Products"]}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Products" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {data.paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${formatPaymentMethod(name)} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, formatPaymentMethod(name)]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No payment data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Order Status
              <Link href="/admin/orders">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  View All
                </Badge>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.ordersByStatus.length > 0 ? (
              data.ordersByStatus.map((item) => (
                <div key={item.status} className="flex justify-between items-center">
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alerts & Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/admin/products?stock=low" className="block">
              <div className={`p-3 rounded-lg cursor-pointer transition-colors ${data.alerts.lowStockProducts > 0 ? "bg-destructive/10 border border-destructive/20 hover:bg-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}>
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.alerts.lowStockProducts > 0
                    ? `${data.alerts.lowStockProducts} products below threshold`
                    : "All products well stocked"}
                </p>
              </div>
            </Link>
            <Link href="/admin/reviews?status=pending" className="block">
              <div className={`p-3 rounded-lg cursor-pointer transition-colors ${data.alerts.pendingReviews > 0 ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20" : "bg-green-500/10 border border-green-500/20"}`}>
                <p className="text-sm font-medium">Pending Reviews</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.alerts.pendingReviews > 0
                    ? `${data.alerts.pendingReviews} reviews awaiting moderation`
                    : "No pending reviews"}
                </p>
              </div>
            </Link>
            <Link href="/admin/inquiries?status=new" className="block">
              <div className={`p-3 rounded-lg cursor-pointer transition-colors ${data.alerts.newInquiries > 0 ? "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20" : "bg-green-500/10 border border-green-500/20"}`}>
                <p className="text-sm font-medium">New Inquiries</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.alerts.newInquiries > 0
                    ? `${data.alerts.newInquiries} new inquiries`
                    : "No new inquiries"}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top Performing Products
              <Link href="/admin/products">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  View All
                </Badge>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.length > 0 ? (
                data.topProducts.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatCurrency(product.revenue)}</span>
                        <span>•</span>
                        <span>{product.rating > 0 ? `★ ${product.rating}` : "No rating"}</span>
                        <span>•</span>
                        <span>{product.stock} in stock</span>
                      </div>
                    </div>
                    <Link href={`/admin/products/edit/${product.id}`}>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No product sales data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Score Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="hsl(var(--primary))"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(data.seoScore.overall / 100) * 440} 440`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{data.seoScore.overall}</div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{data.seoScore.products}</div>
                  <div className="text-xs text-muted-foreground">Products Avg</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{data.seoScore.blogs}</div>
                  <div className="text-xs text-muted-foreground">Blogs Avg</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Orders
            <Link href="/admin/orders">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                View All Orders
              </Badge>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="block">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No orders yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
              {data.notifications.unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {data.notifications.unreadCount} new
                </Badge>
              )}
            </div>
            <Link href="/admin/notifications">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                View All
              </Badge>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.notifications.recent.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.notifications.recent.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.actionUrl || "/admin/notifications"}
                  className="block"
                >
                  <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${!notification.isRead ? "bg-primary/5 border border-primary/20" : "bg-muted/30"}`}>
                    <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No notifications yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
