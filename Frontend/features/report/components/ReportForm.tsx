"use client";

import { Box, Flex, Text, TextField, Button, Select, TextArea, Badge } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

interface ReportableUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  lastConversationAt: string;
}

const reportReasons = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Quay roi" },
  { value: "inappropriate_content", label: "Noi dung khong phu hop" },
  { value: "fake_profile", label: "Tai khoan gia" },
  { value: "underage", label: "Chua du tuoi" },
  { value: "other", label: "Khac" },
];

export function ReportForm() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reportedUserId, setReportedUserId] = useState("");
  const [reportableUsers, setReportableUsers] = useState<ReportableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchReportableUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchReportableUsers = async () => {
    try {
      const response = await fetch("/api/reports/reportable-users");
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
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !reason || !reportedUserId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setError(errorData.message || "Khong the gui bao cao. Vui long thu lai.");
      }
    } catch (err) {
      setError("Khong the ket noi den server. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="1">
          <Text size="4" weight="bold">Gui bao cao moi</Text>
          <Text size="2" color="gray">
            Chi hien 10 nguoi ban da noi chuyen gan nhat de bao cao.
          </Text>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Nguoi bi bao cao</Text>
          <Select.Root value={reportedUserId} onValueChange={setReportedUserId} size="3">
            <Select.Trigger
              placeholder={loadingUsers ? "Dang tai danh sach..." : "Chon nguoi da noi chuyen"}
              style={{ width: "100%", background: isDark ? "var(--gray-10)" : "var(--gray-1)" }}
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
              Ban chua co cuoc tro chuyen nao de bao cao.
            </Text>
          )}
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Ly do bao cao</Text>
          <Select.Root value={reason} onValueChange={setReason} size="3">
            <Select.Trigger
              placeholder="Chon ly do"
              style={{ width: "100%", background: isDark ? "var(--gray-10)" : "var(--gray-1)" }}
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
          <Text size="2" weight="medium" color="gray">Tieu de</Text>
          <TextField.Root
            placeholder="Nhap tieu de bao cao"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="3"
            style={{ background: isDark ? "var(--gray-10)" : "var(--gray-1)" }}
          />
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" weight="medium" color="gray">Noi dung</Text>
          <TextArea
            placeholder="Mo ta chi tiet van de..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{
              background: isDark ? "var(--gray-10)" : "var(--gray-1)",
              resize: "none",
            }}
          />
        </Flex>

        {currentUser && (
          <Text size="1" color="gray">
            Dang nhap voi: {currentUser.fullName || currentUser.email}
          </Text>
        )}

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}

        {submitted && (
          <Badge color="green" variant="soft" style={{ width: "fit-content" }}>
            Da gui bao cao cho admin
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
          {loading ? "Dang gui..." : "Gui bao cao"}
        </Button>
      </Flex>
    </Box>
  );
}
