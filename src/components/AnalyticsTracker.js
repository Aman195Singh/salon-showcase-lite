"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks page views by sending a lightweight event to our API.
 * No cookies, no personal data. Just: page path + referrer + timestamp.
 * Place this once in the layout — it auto-tracks on every route change.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track dashboard/admin pages
    if (pathname?.startsWith("/dashboard") || pathname === "/login" || pathname === "/signup") {
      return;
    }

    // Small delay to avoid tracking fast navigations
    const timer = setTimeout(() => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "page_view",
          page_path: pathname,
          referrer: document.referrer || null,
        }),
      }).catch(() => {
        // Silently fail — analytics should never break the site
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // This component renders nothing
}
