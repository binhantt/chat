"use client";

import { Flex, Text, Box, Card, Heading, TextField, Button, Badge, Avatar, Callout, Spinner, Dialog, Separator } from "@radix-ui/themes";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DotsHorizontalIcon,
  TrashIcon,
  LockOpen1Icon,
  ReloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { getAdminUser, getAdminUsers, updateAdminUserAccess, type AdminUser } from "@/features/athu";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagination } from "@/hooks/usePagination";

const USERS_PER_PAGE = 10;

const StatusBadge = memo(function StatusBadge({ user }: { user: AdminUser }) {
  const isLocked = !user.isActive || (user.lockType && user.lockType !== "none");
  const lockLabel: Record<string, string> = {
    "15_days": "Khóa 15 ngày",
    "30_days": "Khóa 30 ngày",
    permanent: "Khóa vĩnh viễn",
  };

  return (
    <Badge color={isLocked ? "red" : "green"} variant="soft" style={{ padding: "4px 12px" }}>
      {isLocked ? lockLabel[user.lockType || "permanent"] || "Đã khóa" : "Hoạt động"}
    </Badge>
  );
});

const RoleBadge = memo(function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string }> = {
    user: { label: "Người dùng", color: "gray" },
    admin: { label: "Quản trị viên", color: "indigo" },
    moderator: { label: "Giám sát", color: "violet" },
  };
  const { label, color } = config[role] || { label: role, color: "gray" };
  return (
    <Text size="2" style={{ color: `var(--${color}-9)`, background: `var(--${color}-3)`, padding: "2px 8px", borderRadius: 4 }}>
      {label}
    </Text>
  );
});

function formatDateTime(date?: string | null) {
  if (!date) return "Chưa cập nhật";

  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "Chưa cập nhật";
}

function genderLabel(gender?: AdminUser["gender"]) {
  const labels: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };

  return gender ? labels[gender] || gender : "Chưa cập nhật";
}

function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 720 }}>
        <Dialog.Title>Chi tiết tài khoản</Dialog.Title>
        <Dialog.Description>
          Thông tin hồ sơ và trạng thái truy cập của người dùng.
        </Dialog.Description>

        {user ? (
          <Flex direction="column" gap="4" mt="4">
            <Flex align="center" gap="4">
              <Avatar
                size="5"
                radius="full"
                src={user.avatarUrl || undefined}
                fallback={getInitials(user.fullName, user.email)}
                color="indigo"
              />
              <Flex direction="column" gap="1">
                <Heading size="5">{user.fullName || "Chưa đặt tên"}</Heading>
                <Text size="2" color="gray">{user.email}</Text>
                <Flex gap="2" align="center" wrap="wrap">
                  <RoleBadge role={user.role} />
                  <StatusBadge user={user} />
                </Flex>
              </Flex>
            </Flex>

            <Separator size="4" />

            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <DetailItem label="ID" value={user.id} />
              <DetailItem label="Google ID" value={formatValue(user.googleId)} />
              <DetailItem label="Số điện thoại" value={formatValue(user.phoneNumber)} />
              <DetailItem label="Giới tính" value={genderLabel(user.gender)} />
              <DetailItem label="Ngày sinh" value={user.dateOfBirth ? formatDateTime(user.dateOfBirth) : "Chưa cập nhật"} />
              <DetailItem label="Thành phố" value={formatValue(user.city)} />
              <DetailItem label="Ngày tạo" value={formatDateTime(user.createdAt)} />
              <DetailItem label="Cập nhật lần cuối" value={formatDateTime(user.updatedAt)} />
              <DetailItem label="Loại khóa" value={user.lockType && user.lockType !== "none" ? user.lockType : "Không khóa"} />
              <DetailItem label="Khóa đến" value={formatDateTime(user.lockedUntil)} />
              <DetailItem label="Lý do khóa" value={formatValue(user.lockReason)} />
              <DetailItem label="Report liên quan" value={formatValue(user.lockedByReportId)} />
            </Box>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium" color="gray">Tiểu sử</Text>
              <Box
                style={{
                  minHeight: 72,
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--gray-2)",
                  border: "1px solid var(--gray-4)",
                }}
              >
                <Text size="2">{formatValue(user.bio)}</Text>
              </Box>
            </Flex>

            <Flex justify="end">
              <Dialog.Close>
                <Button variant="soft">Đóng</Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        ) : (
          <Flex align="center" justify="center" p="6">
            <Spinner size="3" />
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" gap="1">
      <Text size="1" color="gray" weight="medium">{label}</Text>
      <Text size="2" style={{ wordBreak: "break-word" }}>{value}</Text>
    </Flex>
  );
}

function UserActions({
  user,
  onUpdate,
  onView,
}: {
  user: AdminUser;
  onUpdate: () => void;
  onView: (user: AdminUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleBan = async () => {
    setLoading(true);
    try {
      await updateAdminUserAccess(user.id, { isActive: !user.isActive });
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Flex style={{ position: "relative" }}>
      <Button
        variant="ghost"
        size="1"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      >
        <DotsHorizontalIcon width={16} height={16} />
      </Button>
      {open && (
        <Box
          style={{
            position: "absolute",
            right: 0,
            top: 32,
            background: "var(--gray-1)",
            border: "1px solid var(--gray-4)",
            borderRadius: 8,
            padding: 4,
            minWidth: 160,
            boxShadow: "0 4px 12px var(--gray-6)",
            zIndex: 10,
          }}
        >
          <Flex direction="column" gap="1">
            <Flex
              align="center"
              gap="2"
              p="2"
              style={{ padding: "8px 12px", borderRadius: 4, cursor: "pointer" }}
              onClick={() => {
                onView(user);
                setOpen(false);
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <PersonIcon width={14} height={14} />
              <Text size="2">Xem chi tiết</Text>
            </Flex>
            <Flex
              align="center"
              gap="2"
              p="2"
              style={{ padding: "8px 12px", borderRadius: 4, cursor: "pointer" }}
              onClick={handleToggleBan}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {loading ? (
                <Spinner size="1" />
              ) : user.isActive ? (
                <TrashIcon width={14} height={14} color="var(--red-9)" />
              ) : (
                <LockOpen1Icon width={14} height={14} color="var(--green-9)" />
              )}
              <Text size="2" color={user.isActive ? "red" : "green"}>
                {user.isActive ? "Khóa tài khoản" : "Mở khóa"}
              </Text>
            </Flex>
          </Flex>
        </Box>
      )}
    </Flex>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = async (user: AdminUser) => {
    setSelectedUser(null);
    setDetailOpen(true);

    try {
      const data = await getAdminUser(user.id);
      setSelectedUser(data);
    } catch (err) {
      console.error("Error fetching user detail:", err);
      setDetailOpen(false);
      setError("Không thể tải chi tiết tài khoản");
    }
  };

  const filteredUsers = useMemo(() => users.filter((user) => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      user.fullName?.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive && (!user.lockType || user.lockType === "none")) ||
      (statusFilter === "banned" && (!user.isActive || (user.lockType && user.lockType !== "none")));
    return matchesSearch && matchesStatus;
  }), [debouncedSearch, statusFilter, users]);

  const {
    currentPage,
    pageItems: paginatedUsers,
    pageStart,
    setPage,
    totalPages,
  } = usePagination(filteredUsers, {
    pageSize: USERS_PER_PAGE,
    resetKeys: [debouncedSearch, statusFilter],
  });

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.isActive && (!u.lockType || u.lockType === "none")).length,
    banned: users.filter((u) => !u.isActive || (u.lockType && u.lockType !== "none")).length,
  }), [users]);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Flex direction="column" align="center" gap="3">
          <Spinner size="3" />
          <Text color="gray">Đang tải danh sách người dùng...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center">
        <Heading size="6">Quản lý người dùng</Heading>
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            Tổng: {filteredUsers.length} người dùng
          </Text>
          <Button variant="ghost" size="1" onClick={fetchUsers}>
            <ReloadIcon width={16} height={16} />
          </Button>
        </Flex>
      </Flex>

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Stats */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Tổng số</Text>
            <Heading size="5">{stats.total}</Heading>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Hoạt động</Text>
            <Heading size="5" color="green">{stats.active}</Heading>
          </Flex>
        </Card>
        <Card size="1" style={{ flex: 1 }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">Đã khóa</Text>
            <Heading size="5" color="red">{stats.banned}</Heading>
          </Flex>
        </Card>
      </Box>

      {/* Search and Filter */}
      <Card size="2">
        <Flex gap="3" align="center" wrap="wrap">
          <TextField.Root
            placeholder="Tìm kiếm tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 280 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} color="var(--gray-9)" />
            </TextField.Slot>
          </TextField.Root>
          <Flex gap="2">
            <Button
              variant={statusFilter === "all" ? "solid" : "soft"}
              size="2"
              onClick={() => setStatusFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === "active" ? "solid" : "soft"}
              color="green"
              size="2"
              onClick={() => setStatusFilter("active")}
            >
              Hoạt động
            </Button>
            <Button
              variant={statusFilter === "banned" ? "solid" : "soft"}
              color="red"
              size="2"
              onClick={() => setStatusFilter("banned")}
            >
              Đã khóa
            </Button>
          </Flex>
          <Button size="2" variant="solid" style={{ marginLeft: "auto" }}>
            <PlusIcon width={16} height={16} />
            Thêm người dùng
          </Button>
        </Flex>
      </Card>

      {/* Users Table */}
      <Card size="2">
        <Box style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-4)" }}>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Người dùng</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Email</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Vai trò</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Trạng thái</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Ngày tham gia</Text>
                </th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>
                  <Text size="2" color="gray" weight="medium">Hành động</Text>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--gray-3)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Flex gap="3" align="center">
                      <Avatar
                        size="2"
                        radius="full"
                        src={user.avatarUrl || undefined}
                        fallback={getInitials(user.fullName, user.email)}
                        color="indigo"
                      />
                      <div>
                        <Text size="2" weight="medium">
                          {user.fullName || "Chưa đặt tên"}
                        </Text>
                        <Text size="1" color="gray">ID: {user.id.slice(0, 8)}</Text>
                      </div>
                    </Flex>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">{user.email}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <RoleBadge role={user.role} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge user={user} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">{formatDate(user.createdAt)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <UserActions user={user} onUpdate={fetchUsers} onView={handleViewUser} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <Flex justify="center" align="center" p="8" direction="column" gap="2">
              <PersonIcon width={48} height={48} color="var(--gray-6)" />
              <Text size="3" color="gray">Không tìm thấy người dùng nào</Text>
              <Text size="2" color="gray">Thử thay đổi điều kiện tìm kiếm</Text>
            </Flex>
          )}
        </Box>

        {filteredUsers.length > 0 && (
          <Flex justify="between" align="center" gap="3" mt="4" wrap="wrap">
            <Text size="2" color="gray">
              Hiển thị {pageStart + 1}-{Math.min(pageStart + USERS_PER_PAGE, filteredUsers.length)} / {filteredUsers.length}
            </Text>
            <Flex align="center" gap="2">
              <Button
                size="2"
                variant="soft"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeftIcon width={16} height={16} />
                Trước
              </Button>
              <Text size="2" color="gray">
                Trang {currentPage} / {totalPages}
              </Text>
              <Button
                size="2"
                variant="soft"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Sau
                <ChevronRightIcon width={16} height={16} />
              </Button>
            </Flex>
          </Flex>
        )}
      </Card>

      <UserDetailDialog
        user={selectedUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </Flex>
  );
}
