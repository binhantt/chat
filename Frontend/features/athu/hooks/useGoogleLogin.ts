"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { primeAuthUserCache, type User } from "@/contexts/AuthContext";
import { useAuthUiStore } from "../store/useAuthUiStore";

export function useGoogleLogin() {
  const router = useRouter();
  const setError = useAuthUiStore((state) => state.setError);
  const setSubmitting = useAuthUiStore((state) => state.setSubmitting);

  const loginWithCredential = useCallback(
    async (credential: string) => {
      setSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/v1/auth/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: credential }),
          credentials: "include",
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          throw new Error(data?.message ?? "Đăng nhập Google thất bại");
        }

        const data = (await response.json().catch(() => null)) as {
          user?: User;
        } | null;
        primeAuthUserCache(data?.user ?? null);
        router.replace("/");
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Đăng nhập Google thất bại",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [router, setError, setSubmitting],
  );

  return { loginWithCredential };
}
