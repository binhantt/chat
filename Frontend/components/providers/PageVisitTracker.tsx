"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getCsrfHeaders } from "@/lib/csrf";

export function PageVisitTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    const path = "/";

    if (lastTrackedPathRef.current === path) return;
    lastTrackedPathRef.current = path;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void fetch("/api/v1/analytics/visit", {
        body: JSON.stringify({ path }),
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        keepalive: true,
        method: "POST",
        signal: controller.signal,
      }).catch(() => null);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [pathname]);

  return null;
}
