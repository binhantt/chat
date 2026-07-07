import { Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, PersonIcon } from "@radix-ui/react-icons";
import type { AdminUser } from "@/features/athu";
import { UserListRow } from "./UserListRow";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UserListPanel({
  currentPage,
  filteredCount,
  hasNext,
  hasPrevious,
  loadingPage,
  onNext,
  onPrevious,
  onUpdate,
  onView,
  pageEnd,
  pageStart,
  users,
}: {
  currentPage: number;
  filteredCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  loadingPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onUpdate: () => void;
  onView: (user: AdminUser) => void;
  pageEnd: number;
  pageStart: number;
  users: AdminUser[];
}) {
  const s = useAdminStyles();
  return (
    <Flex direction="column" gap="3" className={s.users.userListPanel}>
      <Flex
        align={{ initial: "start", sm: "center" }}
        direction={{ initial: "column", sm: "row" }}
        gap="2"
        justify="between"
      >
        <Flex align="center" gap="2">
          <PersonIcon color="var(--primary)" />
          <Box>
            <Text as="div" size="4" weight="bold" className={s.users.listTitle}>
              Danh sách người dùng
            </Text>
            <Text as="div" size="2" className={s.users.listDesc}>
              Quản lý trạng thái và xem nhanh thông tin tài khoản.
            </Text>
          </Box>
        </Flex>
        <Text size="2" className={s.users.listInfo}>
          {filteredCount > 0 ? `Hiển thị ${pageStart + 1}-${pageEnd}` : "Chưa có dữ liệu"}
        </Text>
      </Flex>

      {users.length === 0 ? (
        <Flex align="center" direction="column" gap="2" justify="center" className={s.users.emptyState}>
          <Flex align="center" justify="center" className={s.users.emptyIcon}>
            <PersonIcon height={34} width={34} />
          </Flex>
          <Text size="3" weight="bold" className={s.users.emptyTitle}>
            Không tìm thấy người dùng
          </Text>
          <Text size="2" className={s.users.emptyDesc}>
            Thử thay đổi từ khóa hoặc bộ lọc trạng thái.
          </Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          <Grid
            display={{ initial: "none", lg: "grid" }}
            columns="minmax(240px, 1.35fr) minmax(220px, 1fr) 140px 160px 54px"
            className={s.users.gridHeader}
          >
            <HeaderCell>Tài khoản</HeaderCell>
            <HeaderCell>Email</HeaderCell>
            <HeaderCell>Trạng thái</HeaderCell>
            <HeaderCell>Ngày tham gia</HeaderCell>
            <HeaderCell />
          </Grid>

          {users.map((user) => (
            <UserListRow key={user.id} onUpdate={onUpdate} onView={onView} user={user} />
          ))}
        </Flex>
      )}

      {filteredCount > 0 && (
        <Flex align="center" gap="3" justify="between" pt="1" wrap="wrap">
          <Text size="2" className={s.users.listInfo}>
            Trang {currentPage}
          </Text>
          <Flex align="center" gap="2">
            <Button disabled={!hasPrevious || loadingPage} onClick={onPrevious} size="2" variant="soft" className={s.users.headerBtn}>
              <ChevronLeftIcon />
              Trước
            </Button>
            <Button disabled={!hasNext || loadingPage} onClick={onNext} size="2" variant="soft" className={s.users.headerBtn}>
              {loadingPage ? "Đang tải..." : "Sau"}
              <ChevronRightIcon />
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

function HeaderCell({ children }: { children?: React.ReactNode }) {
  const s = useAdminStyles();
  return (
    <Text size="1" weight="bold" className={s.users.gridHeaderText}>
      {children}
    </Text>
  );
}
