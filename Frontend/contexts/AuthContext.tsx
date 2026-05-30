"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  bio: string | null;
  gender: "male" | "female" | "other" | null;
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  fetchUser: async () => {},
  updateUser: async () => {},
  logout: () => {},
});

const USER_CACHE_TTL_MS = 5 * 60 * 1000;
const USER_CACHE_STORAGE_KEY = "chatapp.currentUser";
const USER_CACHE_EVENT = "chatapp.currentUser.changed";
const FORCE_LOGOUT_EVENT = "chatapp.auth.forceLogout";
let cachedUser: { user: User | null; expiresAt: number } | null = null;
let pendingUserRequest: Promise<User | null> | null = null;

export function primeAuthUserCache(user: User | null) {
  pendingUserRequest = null;
  cachedUser = {
    user,
    expiresAt: Date.now() + USER_CACHE_TTL_MS,
  };

  if (typeof window === "undefined") {
    return;
  }

  clearStoredUserCache();
  window.dispatchEvent(new CustomEvent<User | null>(USER_CACHE_EVENT, { detail: user }));
}

async function requestCurrentUser(): Promise<User | null> {
  if (cachedUser && cachedUser.expiresAt > Date.now()) {
    return cachedUser.user;
  }

  if (pendingUserRequest) {
    return pendingUserRequest;
  }

  pendingUserRequest = fetch("/api/v1/users/me", {
    method: "GET",
    credentials: "include",
  })
    .then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        primeAuthUserCache(null);
        if (isLockedSessionResponse(data)) {
          dispatchForceLogout(getResponseMessage(data));
        }
        return null;
      }

      const user = data as User;
      primeAuthUserCache(user);
      return user;
    })
    .finally(() => {
      pendingUserRequest = null;
    });

  return pendingUserRequest;
}

function clearStoredUserCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_CACHE_STORAGE_KEY);
  window.sessionStorage.removeItem(USER_CACHE_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const freshUser = getFreshCachedUser();
    if (freshUser !== undefined) {
      setUser(freshUser);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await requestCurrentUser();
      setUser(getFreshCachedUser() ?? currentUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      // Use frontend API route instead of direct backend call
      const res = await fetch("/api/v1/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const data = await res.json();
        primeAuthUserCache(data);
        setUser(data);
        return data;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    primeAuthUserCache(null);
    pendingUserRequest = null;
    setUser(null);
    setLoading(false);
    void fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
      keepalive: true,
    }).catch(() => undefined);
    router.replace("/login");
  }, [router]);

  const forceLogout = useCallback(
    (message?: string) => {
      primeAuthUserCache(null);
      pendingUserRequest = null;
      setUser(null);
      setLoading(false);
      void fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        keepalive: true,
      }).catch(() => undefined);
      if (message && typeof window !== "undefined") {
        window.sessionStorage.setItem("chatapp.auth.message", message);
      }
      router.replace("/login");
    },
    [router],
  );

  useEffect(() => {
    let isActive = true;
    clearStoredUserCache();

    if (pathname?.startsWith("/admin")) {
      queueMicrotask(() => {
        if (isActive) {
          setUser(null);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }

    const freshUser = getFreshCachedUser();
    if (freshUser !== undefined) {
      queueMicrotask(() => {
        if (isActive) {
          setUser(freshUser);
          setLoading(false);
        }
      });
      return () => {
        isActive = false;
      };
    }

    requestCurrentUser()
      .then((currentUser) => {
        if (isActive) {
          setUser(getFreshCachedUser() ?? currentUser);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        if (isActive) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

  useEffect(() => {
    const syncUser = (event: Event) => {
      const nextUser = (event as CustomEvent<User | null>).detail ?? null;
      setUser(nextUser);
      setLoading(false);
    };

    window.addEventListener(USER_CACHE_EVENT, syncUser);
    return () => window.removeEventListener(USER_CACHE_EVENT, syncUser);
  }, []);

  useEffect(() => {
    const onForceLogout = (event: Event) => {
      const message = (event as CustomEvent<string | undefined>).detail;
      forceLogout(message);
    };

    window.addEventListener(FORCE_LOGOUT_EVENT, onForceLogout);
    return () => window.removeEventListener(FORCE_LOGOUT_EVENT, onForceLogout);
  }, [forceLogout]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      fetchUser,
      updateUser,
      logout,
    }),
    [fetchUser, loading, logout, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

function getFreshCachedUser(): User | null | undefined {
  if (!cachedUser || cachedUser.expiresAt <= Date.now()) {
    return undefined;
  }

  return cachedUser.user;
}

function dispatchForceLogout(message?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(FORCE_LOGOUT_EVENT, { detail: message }));
}

function getResponseMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return undefined;
  }

  return String(data.message);
}

function isLockedSessionResponse(data: unknown): boolean {
  const message = getResponseMessage(data)?.toLowerCase() ?? "";

  return (
    message.includes("khoa") ||
    message.includes("vi pham") ||
    message.includes("banned") ||
    message.includes("locked")
  );
}
