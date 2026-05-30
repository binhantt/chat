import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { PersonIcon, ReloadIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

export function UsersHeader({ count, onRefresh }: { count: number; onRefresh: () => void }) {
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="4"
      justify="between"
      style={{
        background: "linear-gradient(135deg, var(--auth-panel-gradient), rgba(59,130,246,0.08))",
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        padding: "18px clamp(16px, 2vw, 22px)",
      }}
    >
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #22D3EE)",
            borderRadius: 8,
            color: "#FFFFFF",
            height: 48,
            width: 48,
          }}
        >
          <PersonIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size={{ initial: "5", md: "6" }} style={{ color: authTheme.text, letterSpacing: 0 }}>
            Quản lý người dùng
          </Heading>
          <Text as="p" size="2" style={{ color: authTheme.muted, margin: "6px 0 0" }}>
            Theo dõi tài khoản, trạng thái khóa và thao tác quản trị nhanh.
          </Text>
        </Box>
      </Flex>

      <Flex align="center" gap="3" wrap="wrap">
        <Box
          style={{
            background: "var(--auth-soft-control)",
            border: `1px solid ${authTheme.line}`,
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            Đang hiển thị
          </Text>
          <Text as="div" size="4" weight="bold" style={{ color: authTheme.text }}>
            {count}
          </Text>
        </Box>
        <Button onClick={onRefresh} size="3" variant="soft" style={{ borderRadius: 8 }}>
          <ReloadIcon />
          Làm mới
        </Button>
      </Flex>
    </Flex>
  );
}
