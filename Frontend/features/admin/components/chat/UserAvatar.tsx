import { Avatar } from "@radix-ui/themes";

interface UserAvatarProps {
  user?: {
    avatarUrl?: string | null;
    fullName?: string | null;
    email?: string;
  };
  size?: "1" | "2" | "3";
}

export function UserAvatar({ user, size = "2" }: UserAvatarProps) {
  const initials = (user?.fullName || user?.email || "??").slice(0, 2).toUpperCase();
  return (
    <Avatar
      size={size}
      radius="full"
      src={user?.avatarUrl || undefined}
      fallback={initials}
      color="indigo"
    />
  );
}