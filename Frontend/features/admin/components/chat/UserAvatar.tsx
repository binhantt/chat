import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";

interface UserAvatarProps {
  user?: {
    avatarUrl?: string | null;
    fullName?: string | null;
    email?: string;
    badge?: string | null;
  };
  size?: "1" | "2" | "3";
}

export function UserAvatar({ user, size = "2" }: UserAvatarProps) {
  const initials = (user?.fullName || user?.email || "??").slice(0, 2).toUpperCase();
  return (
    <AvatarWithVipBadge
      size={size}
      radius="full"
      src={user?.avatarUrl || undefined}
      fallback={initials}
      badge={user?.badge}
      color="indigo"
    />
  );
}