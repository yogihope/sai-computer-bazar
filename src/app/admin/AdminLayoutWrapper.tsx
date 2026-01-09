"use client";

import { usePathname } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login page with AdminLayout or AuthGuard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // All other admin pages require authentication
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
}
