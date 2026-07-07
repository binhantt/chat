import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { LockClosedIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ConductHeader({
  loading,
  onAddRule,
  onRefresh,
}: {
  loading: boolean;
  onAddRule: () => void;
  onRefresh: () => void;
}) {
  const s = useAdminStyles();
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      justify="between"
      className={s.conduct.header}
    >
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          className={s.conduct.headerIcon}
        >
          <LockClosedIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size={{ initial: "5", md: "6" }} className={s.conduct.headerTitle}>
            Quản lý ứng xử
          </Heading>
          <Text as="p" size="2" className={s.conduct.headerDesc}>
            Theo dõi nội dung vi phạm, bật tắt luật lọc và giữ không gian trò chuyện an toàn hơn.
          </Text>
        </Box>
      </Flex>

      <Flex gap="2" wrap="wrap">
        <Button onClick={onAddRule} size="2" className={s.conduct.headerBtn}>
          <PlusIcon />
          Thêm luật
        </Button>
        <Button disabled={loading} onClick={onRefresh} size="2" variant="soft" className={s.conduct.headerBtn}>
          <ReloadIcon />
          Làm mới
        </Button>
      </Flex>
    </Flex>
  );
}
