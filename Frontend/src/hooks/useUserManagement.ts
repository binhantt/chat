"use client";

import { useMemo, useState } from "react";
import type { AdminUserRecord } from "@/lib/admin-users";

export function useUserManagement(users: AdminUserRecord[]) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => {
      return [user.fullName, user.email, user.role, user.status, user.team]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, users]);

  return {
    query,
    filteredUsers,
    resultCount: filteredUsers.length,
    setQuery,
  };
}
