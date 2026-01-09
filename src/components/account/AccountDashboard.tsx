"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Loader2,
  ShoppingBag,
  CreditCard,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  avatar: string | null;
}

const AccountDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.success) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      icon: Package,
      label: "My Orders",
      description: "Track, return, or buy things again",
      href: "/orders",
    },
    {
      icon: MapPin,
      label: "Addresses",
      description: "Manage your delivery addresses",
      href: "/account/addresses",
    },
    {
      icon: Heart,
      label: "Wishlist",
      description: "Your saved items",
      href: "/wishlist",
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      description: "Manage payment options",
      href: "/account/payments",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage notification preferences",
      href: "/account/notifications",
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Update your profile & password",
      href: "/account/settings",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Wishlist Items</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Saved Addresses</p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AccountDashboard;
