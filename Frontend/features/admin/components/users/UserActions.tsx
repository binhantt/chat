import { Box, Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { DotsHorizontalIcon, LockClosedIcon, LockOpen1Icon, PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import type { AdminUser } from "@/features/athu";
import { updateAdminUserAccess } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { isUserLocked } from "./userUtils";

export function UserActions({
  onUpdate,
  onView,
  user,
}: {
  onUpdate: () => void;
  onView: (user: AdminUser) => void;
  user: AdminUser;
}) {
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
    <Box style={{ position: "relative" }}>
      <Button onClick={() => setOpen((value) => !value)} size="2" variant="ghost" style={{ borderRadius: 8 }}>
        <DotsHorizontalIcon />
      </Button>
      {open && (
        <Box
          style={{
            background: authTheme.panel,
            border: `1px solid ${authTheme.line}`,
            borderRadius: 8,
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
            minWidth: 178,
            padding: 6,
            position: "absolute",
            right: 0,
            top: 36,
            zIndex: 10,
          }}
        >
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
  const color = tone === "red" ? "#DC2626" : tone === "green" ? "#16A34A" : authTheme.control;

  return (
    <Flex
      align="center"
      gap="2"
      onClick={onClick}
      style={{ borderRadius: 6, color, cursor: "pointer", padding: "8px 10px" }}
    >
      {icon}
      <Text size="2">{label}</Text>
    </Flex>
  );
}
