import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { PersonIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UsersHeader({
  count,
  onRefresh,
}: {
  count: number;
  onRefresh: () => void;
}) {
  const s = useAdminStyles();
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      justify="between"
      className={s.users.headerCard}
    >
      <Flex align="center" gap="3">
        <Flex align="center" justify="center" className={s.users.headerIcon}>
          <PersonIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size="6" className={s.users.headerTitle}>
            Quản lý người dùng
          </Heading>
          <Text as="p" size="2" className={s.users.headerDesc}>
            Theo dõi tài khoản, trạng thái khóa và thao tác quản trị nhanh.
            Đang hiển thị {count} tài khoản trên trang này.
          </Text>
        </Box>
      </Flex>
      <Button onClick={onRefresh} size="2" variant="solid" className={s.users.headerBtn}>
        <ReloadIcon />
        Làm mới
      </Button>
    </Flex>
  );
}
