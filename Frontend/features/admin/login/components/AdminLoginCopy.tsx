import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

export function AdminLoginCopy() {
  return (
    <Flex align="center" direction="column" gap="3" style={{ textAlign: "center" }}>
      <Flex
        align="center"
        justify="center"
        style={{
          background: `linear-gradient(135deg, ${authTheme.control}, ${authTheme.cyan})`,
          borderRadius: 8,
          color: "#FFFFFF",
          height: 52,
          width: 52,
        }}
      >
        <LockClosedIcon height={24} width={24} />
      </Flex>
      <Box>
        <Text size="2" weight="medium" style={{ color: authTheme.control }}>
          Bảng quản trị
        </Text>
        <Heading as="h1" size="6" style={{ color: authTheme.text, letterSpacing: 0, lineHeight: 1.08, margin: 0 }}>
          Đăng nhập quản trị
        </Heading>
      </Box>
      <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.55, maxWidth: 320 }}>
        Chỉ dành cho tài khoản được cấp quyền quản trị hệ thống.
      </Text>
    </Flex>
  );
}
