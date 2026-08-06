"use client";

import { useEffect, useState } from "react";
import { Flex, Text } from "@radix-ui/themes";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import styles from "./admin-current-user.module.css";

type CurrentUser = {
  avatarUrl?: string | null;
  email?: string | null;
  fullName?: string | null;
  badge?: string | null;
};

export function AdminCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/v1/users/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => {});
  }, []);

  const displayName = user?.fullName || user?.email || "Chưa đăng nhập";

  return (
    <Flex align="center" gap="2">
      <AvatarWithVipBadge
        fallback={getUserInitials(displayName)}
        radius="full"
        size="2"
        src={user?.avatarUrl || undefined}
        badge={user?.badge}
        className={styles.avatar}
      />
      <Flex direction="column" display={{ initial: "none", sm: "flex" }}>
        <Text size="2" weight="bold" className={styles.userName}>
          {displayName}
        </Text>
        <Text size="1" className={styles.userRole}>
          Quản lý
        </Text>
      </Flex>
    </Flex>
  );
}

function getUserInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
