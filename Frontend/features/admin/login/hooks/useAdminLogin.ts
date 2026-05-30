import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { primeAuthUserCache, type User } from "@/contexts/AuthContext";
import { useAdminLoginStore } from "../store/useAdminLoginStore";

export function useAdminLogin() {
  const router = useRouter();
  const email = useAdminLoginStore((state) => state.email);
  const password = useAdminLoginStore((state) => state.password);
  const setError = useAdminLoginStore((state) => state.setError);
  const setSubmitting = useAdminLoginStore((state) => state.setSubmitting);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/manager/login", {
        body: JSON.stringify({ email, password }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.ok) {
        const data = (await response.json().catch(() => null)) as {
          user?: User;
        } | null;

        primeAuthUserCache(data?.user ?? null);
        router.replace("/admin");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(
        data?.message ||
          "Email hoac mat khau khong dung, hoac tai khoan khong co quyen admin",
      );
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Đã xảy ra lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  return { login };
}
