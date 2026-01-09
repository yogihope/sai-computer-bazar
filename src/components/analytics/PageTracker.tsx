"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface PageTrackerProps {
  pageType: string;
  referenceId?: string;
  referenceName?: string;
  userId?: string;
}

// Generate a unique session ID
function generateSessionId(): string {
  return "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Generate a unique visitor ID (persistent)
function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  let visitorId = localStorage.getItem("sai_visitor_id");
  if (!visitorId) {
    visitorId = "vis_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("sai_visitor_id", visitorId);
  }
  return visitorId;
}

// Get or create session ID (expires after 30 min of inactivity)
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const stored = sessionStorage.getItem("sai_session");

  if (stored) {
    const { id, lastActive } = JSON.parse(stored);
    if (Date.now() - lastActive < SESSION_TIMEOUT) {
      // Update last active time
      sessionStorage.setItem("sai_session", JSON.stringify({ id, lastActive: Date.now() }));
      return id;
    }
  }

  // Create new session
  const newSessionId = generateSessionId();
  sessionStorage.setItem("sai_session", JSON.stringify({ id: newSessionId, lastActive: Date.now() }));
  return newSessionId;
}

// Detect device type
function getDeviceType(): string {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

// Get browser name
function getBrowser(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera")) return "Opera";
  return "Other";
}

// Get OS name
function getOS(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

// Get UTM parameters from URL
function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    utmContent: params.get("utm_content") || "",
  };
}

export function PageTracker({ pageType, referenceId, referenceName, userId }: PageTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const interactionsRef = useRef<number>(0);
  const hasInteractedRef = useRef<boolean>(false);

  // Track page view on mount
  const trackPageView = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const visitorId = getOrCreateVisitorId();
      const utmParams = getUTMParams();

      const response = await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          visitorId,
          userId: userId || null,
          pagePath: pathname,
          pageTitle: document.title,
          pageType,
          referenceId: referenceId || null,
          referenceName: referenceName || null,
          referrer: document.referrer || null,
          deviceType: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          ...utmParams,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        viewIdRef.current = data.viewId;
      }
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  }, [pathname, pageType, referenceId, referenceName, userId]);

  // Update engagement data
  const updateEngagement = useCallback(async (isExit = false) => {
    if (!viewIdRef.current) return;

    const dwellTime = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      await fetch("/api/analytics/track", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewId: viewIdRef.current,
          dwellTime,
          scrollDepth: maxScrollRef.current,
          interactions: interactionsRef.current,
          isBounce: !hasInteractedRef.current,
          isExit,
        }),
      });
    } catch (error) {
      console.error("Failed to update engagement:", error);
    }
  }, []);

  // Track scroll depth
  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
      }
    }

    // Mark as interacted if scrolled more than 25%
    if (maxScrollRef.current > 25) {
      hasInteractedRef.current = true;
    }
  }, []);

  // Track interactions (clicks)
  const handleInteraction = useCallback(() => {
    interactionsRef.current++;
    hasInteractedRef.current = true;
  }, []);

  useEffect(() => {
    // Reset refs for new page
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    interactionsRef.current = 0;
    hasInteractedRef.current = false;
    viewIdRef.current = null;

    // Track the page view
    trackPageView();

    // Set up scroll tracking
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Set up interaction tracking
    document.addEventListener("click", handleInteraction);

    // Periodic update (every 30 seconds)
    const updateInterval = setInterval(() => {
      updateEngagement(false);
    }, 30000);

    // Update on visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updateEngagement(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Update on page unload
    const handleBeforeUnload = () => {
      updateEngagement(true);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(updateInterval);

      // Final update when leaving the page
      updateEngagement(true);
    };
  }, [pathname, trackPageView, handleScroll, handleInteraction, updateEngagement]);

  // This component doesn't render anything visible
  return null;
}

// Helper component that auto-detects page type from pathname
export function AutoPageTracker({ userId }: { userId?: string }) {
  const pathname = usePathname();

  // Determine page type from pathname
  const getPageInfo = useCallback(() => {
    // Home
    if (pathname === "/") {
      return { pageType: "home" };
    }

    // Product page
    if (pathname.startsWith("/product/")) {
      const slug = pathname.replace("/product/", "");
      return { pageType: "product", referenceId: slug };
    }

    // Prebuilt PC page
    if (pathname.startsWith("/prebuilt-pc/")) {
      const slug = pathname.replace("/prebuilt-pc/", "");
      return { pageType: "prebuilt-pc", referenceId: slug };
    }

    // Products listing
    if (pathname === "/products") {
      return { pageType: "products-listing" };
    }

    // Prebuilt PCs listing
    if (pathname === "/prebuilt-pcs") {
      return { pageType: "prebuilt-pcs-listing" };
    }

    // Build PC
    if (pathname === "/build-pc") {
      return { pageType: "build-pc" };
    }

    // Cart
    if (pathname === "/cart") {
      return { pageType: "cart" };
    }

    // Checkout
    if (pathname === "/checkout") {
      return { pageType: "checkout" };
    }

    // Order success
    if (pathname === "/order-success") {
      return { pageType: "order-success" };
    }

    // Order pages
    if (pathname.startsWith("/order/") || pathname.startsWith("/orders")) {
      return { pageType: "order" };
    }

    // Account
    if (pathname === "/account") {
      return { pageType: "account" };
    }

    // Wishlist
    if (pathname === "/wishlist") {
      return { pageType: "wishlist" };
    }

    // Blog
    if (pathname.startsWith("/blog/")) {
      const slug = pathname.replace("/blog/", "");
      return { pageType: "blog", referenceId: slug };
    }

    if (pathname === "/blog") {
      return { pageType: "blog-listing" };
    }

    // Auth pages
    if (pathname === "/login" || pathname === "/register") {
      return { pageType: "auth" };
    }

    // Default
    return { pageType: "other" };
  }, [pathname]);

  const { pageType, referenceId } = getPageInfo();

  return (
    <PageTracker
      pageType={pageType}
      referenceId={referenceId}
      userId={userId}
    />
  );
}
