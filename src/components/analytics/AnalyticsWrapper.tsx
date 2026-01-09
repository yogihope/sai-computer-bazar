"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { AutoPageTracker } from "./PageTracker";

// Paths that should NOT be tracked (admin pages)
const EXCLUDED_PATHS = [
  "/admin",
  "/api",
];

function AnalyticsContent() {
  const pathname = usePathname();

  // Don't track admin or API routes
  const shouldTrack = !EXCLUDED_PATHS.some((path) => pathname.startsWith(path));

  if (!shouldTrack) {
    return null;
  }

  return <AutoPageTracker />;
}

export function AnalyticsWrapper() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  );
}
