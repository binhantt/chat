"use client";

import { useCallback, useState } from "react";
import { primeAuthUserCache } from "@/contexts/AuthContext";

const DISPLAY_NAME_REGEX = /^[a-zA-ZÀ-ỹ\s]+$/;

function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length === 0) return null; // empty → auto-generate on server
  if (trimmed.length < 2) return "Ten phai co it nhat 2 ky tu";
  if (trimmed.length > 30) return "Ten khong duoc vuot qua 30 ky tu";
  if (!DISPLAY_NAME_REGEX.test(trimmed)) return "Ten chi duoc dung chu cai, dau tieng Viet va khoang trang";
  return null;
}

export function useGuestLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginAsGuest = useCallback(async (displayName?: string) => {
    setLoading(true);
    setError(null);

    const trimmed = displayName?.trim();

    // Client-side validation
    if (trimmed) {
      const validationError = validateDisplayName(trimmed);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/v1/auth/guest-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Khong the dang nhap an danh");
      }

      const data = await res.json();
      primeAuthUserCache(data.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Co loi xay ra";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loginAsGuest, loading, error };
}
