import { cookies } from "next/headers";
import { Flex, Text } from "@radix-ui/themes";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import { BACKEND_URL } from "@/lib/env";
import styles from "./admin-current-user.module.css";

type CurrentUser = {
  avatarUrl?: string | null;
  email?: string | null;
  fullName?: string | null;
  badge?: string | null;
};

export async function AdminCurrentUser() {
  const user = await getCurrentUser();
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

async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieHeader = (await cookies())
    .getAll()
    .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  return response.json().catch(() => null) as Promise<CurrentUser | null>;
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
