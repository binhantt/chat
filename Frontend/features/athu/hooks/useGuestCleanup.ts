"use client";

/**
 * Guest cleanup is now handled explicitly by:
 * 1. LoginPage — when user clicks "Thoát ẩn danh"
 * 2. ChatArea — when guest ends conversation
 *
 * This hook is intentionally empty.
 * We removed beforeunload / pagehide / unmount cleanup so that
 * refreshing the page (F5) does NOT destroy the guest session.
 */
export function useGuestCleanup() {
  // no-op — cleanup is triggered only by explicit user actions
}
