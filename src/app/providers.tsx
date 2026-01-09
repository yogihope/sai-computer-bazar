"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import CartDrawer from "@/components/CartDrawer";
import { AnalyticsWrapper } from "@/components/analytics/AnalyticsWrapper";
import { SeasonalEffects } from "@/components/seasonal";
import FloatingElements from "@/components/FloatingElements";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
              <AnalyticsWrapper />
              <SeasonalEffects />
              {/* Floating Ads & Chat widgets - only on public pages */}
              {!isAdminPage && <FloatingElements />}
            </WishlistProvider>
          </CartProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
