import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { FileTextIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ReportsHeader({ onRefresh }: { onRefresh: () => void }) {
  const s = useAdminStyles();
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      justify="between"
      className={s.reports.header}
    >
      <Flex align="center" gap="3">
        <Flex
          align="center"
          justify="center"
          className={s.reports.headerIconBox}
        >
          <FileTextIcon height={22} width={22} />
        </Flex>
        <Box>
          <Heading size="6" className={s.reports.headerTitle}>
            Quản lý báo cáo
          </Heading>
          <Text as="p" size="2" className={s.reports.headerDescription}>
            Xem nội dung, đối chiếu người liên quan và xử lý vi phạm trong một màn hình gọn.
          </Text>
        </Box>
      </Flex>
      <Button onClick={onRefresh} size="2" variant="solid" className={s.reports.roundedBtn}>
        <ReloadIcon />
        Làm mới
      </Button>
    </Flex>
  );
}
