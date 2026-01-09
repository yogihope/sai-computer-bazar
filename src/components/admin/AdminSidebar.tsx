"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NavLink } from "@/components/NavLink";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Package,
  Monitor,
  Tags,
  ShoppingCart,
  Users,
  Megaphone,
  Video,
  FileText,
  TrendingUp,
  Ticket,
  Star,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ShoppingBag,
  Menu,
  MessageSquareText,
  Plug,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSidebar } from "@/contexts/SidebarContext";

// Navigation with sections
const navigationSections = [
  {
    title: "Store",
    items: [
      { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Prebuilt PCs", href: "/admin/prebuilt-pcs", icon: Monitor },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Blogs", href: "/admin/blogs", icon: FileText },
      { name: "Social Videos", href: "/admin/social-videos", icon: Video },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "Growth",
    items: [
      { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquareText },
      { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
      { name: "SEO & Analytics", href: "/admin/seo-analytics", icon: TrendingUp },
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

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

export const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isCollapsed, isMobileOpen, toggleCollapse, setMobileOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const res = await fetch("/api/admin/notifications?limit=5");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when popover opens
  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen, fetchNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("scb_admin_auth");
    localStorage.removeItem("scb_admin_remember");
    router.push("/admin/login");
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id }),
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_ORDER":
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case "NEW_USER":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "NEW_INQUIRY":
        return <MessageSquareText className="w-4 h-4 text-purple-500" />;
      case "NEW_REVIEW":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "LOW_STOCK":
        return <Package className="w-4 h-4 text-red-500" />;
      case "ORDER_STATUS":
        return <ShoppingCart className="w-4 h-4 text-indigo-500" />;
      case "MILESTONE_REVENUE":
      case "MILESTONE_USERS":
      case "MILESTONE_ORDERS":
      case "MILESTONE_VISITS":
        return <TrendingUp className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setNotificationsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  // Check if path is active
  const isPathActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Filter navigation items based on search query
  const filteredSections = searchQuery.trim()
    ? navigationSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.items.length > 0)
    : navigationSections;

  // Get all matching items for quick navigation
  const allMatchingItems = searchQuery.trim()
    ? navigationSections.flatMap((section) =>
        section.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  // Handle search item click
  const handleSearchItemClick = (href: string) => {
    setSearchQuery("");
    setMobileOpen(false);
    router.push(href);
  };

  // Handle search keyboard events
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && allMatchingItems.length > 0) {
      e.preventDefault();
      handleSearchItemClick(allMatchingItems[0].href);
    } else if (e.key === "Escape") {
      setSearchQuery("");
    }
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-primary/30 text-primary font-medium rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border/50",
        isCollapsed && "justify-center px-2"
      )}>
        <div className="relative flex-shrink-0">
          <img
            src="/logo-black.png"
            alt="Sai Computer Bazar"
            className={cn(
              "w-auto transition-all duration-300 dark:hidden",
              isCollapsed ? "h-8" : "h-10"
            )}
          />
          <img
            src="/logo-white.png"
            alt="Sai Computer Bazar"
            className={cn(
              "w-auto transition-all duration-300 hidden dark:block",
              isCollapsed ? "h-8" : "h-10"
            )}
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate">SCB Admin</h1>
            <p className="text-xs text-muted-foreground truncate">Control Center</p>
          </div>
        )}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden lg:flex h-8 w-8 rounded-lg hover:bg-muted/80"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 pr-8 bg-muted/50 border-border/50 focus:bg-background transition-colors h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-muted"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            {/* Search Results Dropdown */}
            {searchQuery.trim() && allMatchingItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {allMatchingItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleSearchItemClick(item.href)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors",
                          "hover:bg-muted/80",
                          isPathActive(item.href) && "bg-primary/10 text-primary",
                          index === 0 && "bg-muted/50" // Highlight first result (will be selected on Enter)
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{highlightMatch(item.name, searchQuery)}</span>
                        {index === 0 && (
                          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Enter
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* No Results */}
            {searchQuery.trim() && allMatchingItems.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Search Icon */}
      {isCollapsed && (
        <div className="p-2 border-b border-border/50">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-10 rounded-lg hover:bg-muted/80"
                  onClick={() => toggleCollapse()}
                >
                  <Search className="w-5 h-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {isCollapsed && (
                <div className="h-px bg-border/50 mx-2 mb-2" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isPathActive(item.href);

                  if (isCollapsed) {
                    return (
                      <TooltipProvider key={item.name} delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <NavLink
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center justify-center w-full h-10 rounded-xl transition-all duration-200 relative group",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                              )}
                              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                            </NavLink>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={10}>
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Utility Dock */}
      <div className={cn(
        "border-t border-border/50 p-3 space-y-2 bg-muted/30",
        isCollapsed && "px-2"
      )}>
        {/* Action Buttons Row */}
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "flex-col" : "justify-between"
        )}>
          {/* Theme Toggle */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={cn(
                    "rounded-xl transition-all duration-300 hover:scale-105",
                    "hover:bg-primary/10 hover:text-primary",
                    isCollapsed ? "w-10 h-10" : "w-9 h-9"
                  )}
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"} sideOffset={10}>
                <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/admin/notifications")}
                  className={cn(
                    "rounded-xl relative transition-all duration-300 hover:scale-105",
                    "hover:bg-primary/10 hover:text-primary",
                    isCollapsed ? "w-10 h-10" : "w-9 h-9"
                  )}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground border-2 border-background">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"} sideOffset={10}>
                <p>Notifications {unreadCount > 0 ? `(${unreadCount} new)` : ""}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Collapse Toggle (expanded only, desktop) */}
          {!isCollapsed && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="hidden lg:flex w-9 h-9 rounded-xl hover:bg-muted/80"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10}>
                  <p>Collapse Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Expand Toggle (collapsed only) */}
          {isCollapsed && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="hidden lg:flex w-10 h-10 rounded-xl hover:bg-muted/80"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>Expand Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full rounded-xl transition-all duration-200 hover:bg-muted/80",
                isCollapsed ? "h-12 px-0 justify-center" : "h-14 px-3 justify-start"
              )}
            >
              <Avatar className={cn("border-2 border-primary/20", isCollapsed ? "w-9 h-9" : "w-10 h-10")}>
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left ml-3">
                  <p className="font-semibold text-sm truncate">Admin</p>
                  <p className="text-xs text-muted-foreground truncate">Super Admin</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isCollapsed ? "right" : "top"}
            align={isCollapsed ? "start" : "end"}
            className="w-56"
            sideOffset={10}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">admin@saicomputers.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/settings/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border/50 z-40 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[84px]" : "w-[280px]"
        )}
        style={{
          boxShadow: "4px 0 24px -12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-border z-50 lg:hidden transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 lg:hidden rounded-xl shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
};
