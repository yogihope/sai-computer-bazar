"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Search, Sun, LogOut, User, Settings } from "lucide-react";
import { useTheme } from "next-themes";

export const AdminHeader = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [notifications] = useState(3);

  const handleLogout = () => {
    localStorage.removeItem("scb_admin_auth");
    localStorage.removeItem("scb_admin_remember");
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-b border-border z-50">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              SCB
            </div>
            <span className="font-semibold hidden sm:block">Admin</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything (orders, customers, products)..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">Low Stock Alert</p>
                  <p className="text-muted-foreground text-xs">RTX 4090 - Only 2 units left</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">New Order</p>
                  <p className="text-muted-foreground text-xs">Order #12345 received</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">Review Pending</p>
                  <p className="text-muted-foreground text-xs">1 review awaiting moderation</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-10 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
