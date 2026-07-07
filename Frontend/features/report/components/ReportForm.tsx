"use client";

import { Box, Flex, Text, TextField, Button, Select, TextArea, Badge } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCsrfHeaders } from "@/lib/csrf";

interface ReportableUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  lastConversationAt: string;
}

const reportReasons = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Quấy rối" },
  { value: "inappropriate_content", label: "Nội dung không phù hợp" },
  { value: "fake_profile", label: "Tài khoản giả" },
  { value: "underage", label: "Chưa đủ tuổi" },
  { value: "other", label: "Khác" },
];

export function ReportForm() {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const isDark = theme === "dark";
  const fieldStyle = {
    background: isDark ? "#111827" : "var(--gray-1)",
    color: isDark ? "#e5e7eb" : "var(--gray-12)",
    border: `1px solid ${isDark ? "#334155" : "var(--gray-5)"}`,
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportedUserId, setReportedUserId] = useState("");
  const [reportableUsers, setReportableUsers] = useState<ReportableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  async function fetchReportableUsers() {
    try {
      const response = await fetch("/api/v1/reports/reportable-users");
      if (response.ok) {
        const users = await response.json();
        const uniqueUsers = Array.isArray(users)
          ? users.filter(
              (user: ReportableUser, index: number, list: ReportableUser[]) =>
                list.findIndex((item) => item.id === user.id) === index,
            )
          : [];
        setReportableUsers(uniqueUsers);
      }
    } catch (error) {
      console.error("Failed to fetch reportable users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void fetchReportableUsers();
    });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !reason || !reportedUserId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        body: JSON.stringify({
          reportedUserId,
          reason,
          description: `${title}\n\n${content}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setTitle("");
          setContent("");
          setReason("");
          setReportedUserId("");
          setSubmitted(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Không thể gửi báo cáo. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="1">
          <Text size="4" weight="bold">Gửi báo cáo mới</Text>
          <Text size="2" color="gray">
            Chỉ hiện 10 người bạn đã nói chuyện gần nhất để báo cáo.
          </Text>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Người bị báo cáo</Text>
          <Select.Root value={reportedUserId} onValueChange={setReportedUserId} size="3">
            <Select.Trigger
              placeholder={loadingUsers ? "Đang tải danh sách..." : "Chọn người đã nói chuyện"}
              style={{ width: "100%", ...fieldStyle }}
            />
            <Select.Content>
              {reportableUsers.map((user) => (
                <Select.Item key={`reportable-${user.id}`} value={user.id}>
                  {user.fullName || user.email}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {!loadingUsers && reportableUsers.length === 0 && (
            <Text size="1" color="gray">
              Bạn chưa có cuộc trò chuyện nào để báo cáo.
            </Text>
          )}
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Lý do báo cáo</Text>
          <Select.Root value={reason} onValueChange={setReason} size="3">
            <Select.Trigger
              placeholder="Chọn lý do"
              style={{ width: "100%", ...fieldStyle }}
            />
            <Select.Content>
              {reportReasons.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Tiêu đề</Text>
          <TextField.Root
            placeholder="Nhập tiêu đề báo cáo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="3"
            style={fieldStyle}
          />
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Nội dung</Text>
          <TextArea
            placeholder="Mô tả chi tiết vấn đề..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{
              ...fieldStyle,
              resize: "none",
            }}
          />
        </Flex>

        {currentUser && (
          <Text size="1" color="gray">
            Đăng nhập với: {currentUser.fullName || currentUser.email}
          </Text>
        )}

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}

        {submitted && (
          <Badge color="green" variant="soft" style={{ width: "fit-content" }}>
            Đã gửi báo cáo cho quản trị
          </Badge>
        )}

        <Button
          size="3"
          color="indigo"
          onClick={handleSubmit}
          disabled={
            submitted ||
            loading ||
            !title.trim() ||
            !content.trim() ||
            !reason ||
            !reportedUserId
          }
          loading={loading}
        >
          {loading ? "Đang gửi..." : "Gửi báo cáo"}
        </Button>
      </Flex>
    </Box>
  );
}
