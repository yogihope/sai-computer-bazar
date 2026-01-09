import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayoutContent = ({ children }: AdminLayoutProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          "lg:ml-[280px]",
          isCollapsed && "lg:ml-[84px]"
        )}
      >
        <div className="p-6 pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
};
