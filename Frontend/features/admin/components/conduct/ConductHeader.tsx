import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { LockClosedIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

export function ConductHeader({
  loading,
  onAddRule,
  onRefresh,
}: {
  loading: boolean;
  onAddRule: () => void;
  onRefresh: () => void;
}) {
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      justify="between"
      style={{
        background: "linear-gradient(90deg, rgba(59,130,246,0.12), rgba(255,255,255,0.92))",
        borderRadius: 8,
        padding: 18,
      }}
    >
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          style={{
            background: authTheme.control,
            borderRadius: 8,
            color: "#FFFFFF",
            height: 48,
            width: 48,
          }}
        >
          <LockClosedIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size={{ initial: "5", md: "6" }} style={{ color: authTheme.text, letterSpacing: 0 }}>
            Quản lý ứng xử
          </Heading>
          <Text as="p" size="2" style={{ color: authTheme.muted, lineHeight: 1.55, margin: "4px 0 0", maxWidth: 720 }}>
            Theo dõi nội dung vi phạm, bật tắt luật lọc và giữ không gian trò chuyện an toàn hơn.
          </Text>
        </Box>
      </Flex>

      <Flex gap="2" wrap="wrap">
        <Button onClick={onAddRule} size="2" style={{ borderRadius: 8 }}>
          <PlusIcon />
          Thêm luật
        </Button>
        <Button disabled={loading} onClick={onRefresh} size="2" variant="soft" style={{ borderRadius: 8 }}>
          <ReloadIcon />
          Làm mới
        </Button>
      </Flex>
    </Flex>
  );
}
