"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

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
  role: string;
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

const USER_CACHE_TTL_MS = 3000;
let cachedUser: { user: User | null; expiresAt: number } | null = null;
let pendingUserRequest: Promise<User | null> | null = null;

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
      const user = res.ok ? ((await res.json()) as User) : null;
      cachedUser = {
        user,
        expiresAt: Date.now() + USER_CACHE_TTL_MS,
      };
      return user;
    })
    .finally(() => {
      pendingUserRequest = null;
    });

  return pendingUserRequest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setUser(await requestCurrentUser());
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
        cachedUser = {
          user: data,
          expiresAt: Date.now() + USER_CACHE_TTL_MS,
        };
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
    cachedUser = null;
    pendingUserRequest = null;
    setUser(null);
    void fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      window.location.href = "/login";
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

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
