"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  MoreVertical,
  ShoppingCart,
  Users,
  MessageSquare,
  Star,
  Package,
  TrendingUp,
  Trophy,
  AlertTriangle,
  Settings,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const notificationTypes = [
  { value: "all", label: "All Types" },
  { value: "NEW_ORDER", label: "New Orders" },
  { value: "NEW_USER", label: "New Users" },
  { value: "NEW_INQUIRY", label: "New Inquiries" },
  { value: "NEW_REVIEW", label: "New Reviews" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "ORDER_STATUS", label: "Order Status" },
  { value: "MILESTONE_REVENUE", label: "Revenue Milestones" },
  { value: "MILESTONE_USERS", label: "User Milestones" },
  { value: "MILESTONE_ORDERS", label: "Order Milestones" },
  { value: "MILESTONE_VISITS", label: "Visit Milestones" },
  { value: "SYSTEM", label: "System" },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "NEW_ORDER":
      return <ShoppingCart className="w-5 h-5" />;
    case "NEW_USER":
      return <Users className="w-5 h-5" />;
    case "NEW_INQUIRY":
      return <MessageSquare className="w-5 h-5" />;
    case "NEW_REVIEW":
      return <Star className="w-5 h-5" />;
    case "LOW_STOCK":
      return <Package className="w-5 h-5" />;
    case "ORDER_STATUS":
      return <TrendingUp className="w-5 h-5" />;
    case "MILESTONE_REVENUE":
    case "MILESTONE_USERS":
    case "MILESTONE_ORDERS":
    case "MILESTONE_VISITS":
      return <Trophy className="w-5 h-5" />;
    case "SYSTEM":
      return <Settings className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
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
    case "ORDER_STATUS":
      return "text-indigo-500 bg-indigo-500/10";
    case "MILESTONE_REVENUE":
    case "MILESTONE_USERS":
    case "MILESTONE_ORDERS":
    case "MILESTONE_VISITS":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    case "HIGH":
      return <Badge variant="default" className="text-xs bg-orange-500">High</Badge>;
    default:
      return null;
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
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<"all" | "read" | null>(null);

  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (selectedType !== "all") {
        params.set("type", selectedType);
      }
      if (showUnreadOnly) {
        params.set("unread", "true");
      }

      const res = await fetch(`/api/admin/notifications?${params}`);
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [selectedType, showUnreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id }),
      });

      if (res.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markUnread", id }),
      });

      if (res.ok) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, isRead: false, readAt: null } : n
        ));
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error marking as unread:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });

      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const deleted = notifications.find(n => n.id === id);
        setNotifications(notifications.filter(n => n.id !== id));
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteAction === "all" ? { deleteAll: true } : { deleteRead: true }),
      });

      if (res.ok) {
        if (deleteAction === "all") {
          setNotifications([]);
          setUnreadCount(0);
        } else {
          setNotifications(notifications.filter(n => !n.isRead));
        }
        toast.success(deleteAction === "all" ? "All notifications deleted" : "Read notifications deleted");
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error("Failed to delete notifications");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteAction(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications()}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setDeleteAction("read"); setDeleteDialogOpen(true); }}>
                  Delete Read Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => { setDeleteAction("all"); setDeleteDialogOpen(true); }}
                >
                  Delete All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
              {showUnreadOnly ? "Showing Unread" : "Show Unread Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground text-center">
              {showUnreadOnly
                ? "You're all caught up! No unread notifications."
                : "No notifications to display."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              className={cn(
                "bg-card/50 backdrop-blur-xl border-border/50 transition-all cursor-pointer hover:border-primary/50",
                !notification.isRead && "bg-primary/5 border-primary/20"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl flex-shrink-0",
                    getNotificationColor(notification.type, notification.priority)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {notification.isRead ? (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsUnread(notification.id); }}>
                          <Bell className="w-4 h-4 mr-2" />
                          Mark as Unread
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteAction === "all" ? "Delete All Notifications?" : "Delete Read Notifications?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAction === "all"
                ? "This will permanently delete all notifications. This action cannot be undone."
                : "This will permanently delete all read notifications. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
