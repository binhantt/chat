import { Box, Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { DotsHorizontalIcon, LockClosedIcon, LockOpen1Icon, PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { AdminUser } from "@/features/athu";
import { updateAdminUserAccess } from "@/features/athu";
import { isUserLocked } from "./userUtils";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UserActions({
  onUpdate,
  onView,
  user,
}: {
  onUpdate: () => void;
  onView: (user: AdminUser) => void;
  user: AdminUser;
}) {
  const s = useAdminStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const locked = isUserLocked(user);

  const handleToggleBan = async () => {
    setLoading(true);
    try {
      await updateAdminUserAccess(user.id, { isActive: locked });
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={s.users.actionsContainer}>
      <Button onClick={() => setOpen((value) => !value)} size="2" variant="ghost" className={s.users.actionsBtn}>
        <DotsHorizontalIcon />
      </Button>
      {open && (
        <Box className={s.users.actionsMenu}>
          <Flex direction="column" gap="1">
            <ActionRow
              icon={<PersonIcon />}
              label="Xem chi tiết"
              onClick={() => {
                onView(user);
                setOpen(false);
              }}
            />
            <ActionRow
              icon={loading ? <Spinner size="1" /> : locked ? <LockOpen1Icon /> : <LockClosedIcon />}
              label={locked ? "Mở khóa" : "Khóa tài khoản"}
              onClick={handleToggleBan}
              tone={locked ? "green" : "red"}
            />
          </Flex>
        </Box>
      )}
    </Box>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
  tone = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "blue" | "green" | "red";
}) {
  const s = useAdminStyles();
  const color = tone === "red" ? "#DC2626" : tone === "green" ? "#16A34A" : "var(--primary)";

  return (
    <Flex align="center" gap="2" onClick={onClick} className={s.users.actionRow} style={{ color }}>
      {icon}
      <Text size="2">{label}</Text>
    </Flex>
  );
}
