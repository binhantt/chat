"use client";

import { Flex, Text, Box, Card, Heading, TextField, Button, Badge, Avatar, Callout, Spinner } from "@radix-ui/themes";
import {
  PersonIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DotsHorizontalIcon,
  TrashIcon,
  LockOpen1Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect, useCallback } from "react";
import { getAdminUsers, updateAdminUserAccess, type AdminUser } from "@/features/athu";

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge color={isActive ? "green" : "red"} variant="soft" style={{ padding: "4px 12px" }}>
      {isActive ? "Hoạt động" : "Đã khóa"}
    </Badge>
  );
}

function RoleBadge({ role }: { role: string }) {
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
}

function UserActions({
  user,
  onUpdate,
}: {
  user: AdminUser;
  onUpdate: () => void;
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
              onClick={() => setOpen(false)}
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "banned" && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    banned: users.filter((u) => !u.isActive).length,
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
              {filteredUsers.map((user) => (
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
                    <StatusBadge isActive={user.isActive} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Text size="2" color="gray">{formatDate(user.createdAt)}</Text>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <UserActions user={user} onUpdate={fetchUsers} />
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
      </Card>
    </Flex>
  );
}