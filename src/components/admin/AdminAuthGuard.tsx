"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok || !data.success) {
          // Not authenticated, redirect to login
          router.replace("/admin/login");
          return;
        }

        const user: User = data.user;

        // Check if user is admin
        if (user.role !== "ADMIN") {
          // Not an admin, redirect to login
          router.replace("/admin/login");
          return;
        }

        // User is authenticated and is admin
        setIsAuthenticated(true);
      } catch {
        // Error occurred, redirect to login
        router.replace("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
