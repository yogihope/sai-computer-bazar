"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  RefreshCcw,
  Trash2,
  ChevronDown,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  Calendar,
  Loader2,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string | null;
    name: string;
    email: string | null;
    phone: string;
  };
  items: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  trackingNumber: string | null;
  courierName: string | null;
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

const getPaymentStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PAID: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    PENDING: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    FAILED: "bg-red-500/20 text-red-500 border-red-500/30",
    REFUNDED: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    COD_PENDING: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  };
  return styles[status] || styles.PENDING;
};

const getOrderStatusConfig = (status: string) => {
  const config: Record<string, { style: string; icon: any }> = {
    PENDING: { style: "bg-gray-500/20 text-gray-500 border-gray-500/30", icon: Clock },
    CONFIRMED: { style: "bg-blue-500/20 text-blue-500 border-blue-500/30", icon: CheckCircle2 },
    PROCESSING: { style: "bg-violet-500/20 text-violet-500 border-violet-500/30", icon: Package },
    SHIPPED: { style: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30", icon: Truck },
    OUT_FOR_DELIVERY: { style: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30", icon: Truck },
    DELIVERED: { style: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30", icon: CheckCircle2 },
    CANCELLED: { style: "bg-red-500/20 text-red-500 border-red-500/30", icon: XCircle },
    RETURNED: { style: "bg-orange-500/20 text-orange-500 border-orange-500/30", icon: RefreshCcw },
    REFUNDED: { style: "bg-purple-500/20 text-purple-500 border-purple-500/30", icon: RefreshCcw },
  };
  return config[status] || config.PENDING;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatCompactPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)}Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)}L`;
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return formatPrice(price);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPaymentFilter("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update order");
      }
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Phone", "Items", "Total", "Payment Method", "Payment Status", "Order Status", "Date"];
    const csvData = orders.map((order) => [
      order.orderNumber,
      order.customer.name,
      order.customer.email || "",
      order.customer.phone,
      order.items,
      order.total,
      order.paymentMethod,
      order.paymentStatus,
      order.status,
      new Date(order.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders Management"
        subtitle="View, track, update and process all orders in real-time"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: stats?.totalOrders || 0,
            subValue: `${stats?.todayOrders || 0} today`,
            icon: Package,
            color: "text-cyan-500",
          },
          {
            label: "Total Revenue",
            value: formatCompactPrice(stats?.totalRevenue || 0),
            subValue: `${formatCompactPrice(stats?.todayRevenue || 0)} today`,
            icon: DollarSign,
            color: "text-emerald-500",
          },
          {
            label: "Pending/Processing",
            value: (stats?.pendingOrders || 0) + (stats?.processingOrders || 0),
            subValue: `${stats?.shippedOrders || 0} shipped`,
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Delivered",
            value: stats?.deliveredOrders || 0,
            subValue: `${stats?.cancelledOrders || 0} cancelled`,
            icon: CheckCircle2,
            color: "text-green-500",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
              </div>
              <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, customer name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(statusFilter || paymentFilter) && (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              )}
            </Button>

            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {selectedOrders.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedOrders.length})
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrders[0], "PROCESSING")}>
                    Mark as Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrders[0], "SHIPPED")}>
                    Mark as Shipped
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Cancel Orders</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button type="button" variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <Button type="button" variant="outline" onClick={fetchOrders}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="COD_PENDING">COD Pending</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter || paymentFilter || searchQuery) && (
              <Button type="button" variant="ghost" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter || paymentFilter
                ? "Try adjusting your filters"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusConfig = getOrderStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <TableRow key={order.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.customer.email || order.customer.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs">{order.paymentMethod}</span>
                        <Badge className={`${getPaymentStatusBadge(order.paymentStatus)} border capitalize w-fit text-xs`}>
                          {order.paymentStatus.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.style} border capitalize flex items-center gap-1 w-fit text-xs`}>
                        <StatusIcon className="h-3 w-3" />
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Order
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "PROCESSING")}>
                            <Package className="h-4 w-4 mr-2" />
                            Mark Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "SHIPPED")}>
                            <Truck className="h-4 w-4 mr-2" />
                            Mark Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "DELIVERED")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
            {pagination.totalCount} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  className={pagination.page === pageNum ? "bg-primary/20 text-primary" : ""}
                  onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
