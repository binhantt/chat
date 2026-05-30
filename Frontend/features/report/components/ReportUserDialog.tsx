"use client";

import { Flex, Text, Button, Select, TextArea, Avatar, Dialog, Box, Callout } from "@radix-ui/themes";
import { useState } from "react";
import { createReport, ReportReason } from "@/features/athu/api/reportApi";
import { useTheme } from "@/contexts/ThemeContext";

interface Partner {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface ReportedUser {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface ReportUserDialogProps {
  reportedUser: ReportedUser;
  recentPartners: Partner[];
  onSuccess?: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam / Quảng cáo" },
  { value: "harassment", label: "Quấy rối / Lăng mạ" },
  { value: "inappropriate_content", label: "Nội dung không phù hợp" },
  { value: "fake_profile", label: "Tài khoản giả mạo" },
  { value: "underage", label: "Người dùng chưa đủ tuổi" },
  { value: "other", label: "Khác" },
];

function getInitials(name: string | null, email: string) {
  if (!name) return email.slice(0, 2).toUpperCase();
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ReportUserDialog({ reportedUser, recentPartners, onSuccess }: ReportUserDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fieldStyle = {
    background: isDark ? "#111827" : "var(--gray-1)",
    color: isDark ? "#e5e7eb" : "var(--gray-12)",
    border: `1px solid ${isDark ? "#334155" : "var(--gray-5)"}`,
  };
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await createReport({
        reportedUserId: reportedUser.id,
        reason,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setReason("");
        setDescription("");
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi báo cáo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button variant="soft" color="red" size="1" style={{ cursor: "pointer" }}>
          🚩 Báo cáo
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 480 }}>
        <Dialog.Title>Báo cáo vi phạm</Dialog.Title>
        <Dialog.Description size="2" mb="3">
          Gửi báo cáo về người dùng này tới quản trị viên.
        </Dialog.Description>

        {/* Reported User */}
        <Box
          mb="3"
          p="3"
          style={{
            borderRadius: "var(--radius-3)",
            background: isDark ? "#111827" : "var(--gray-2)",
            border: `1px solid ${isDark ? "#334155" : "var(--gray-5)"}`,
          }}
        >
          <Flex align="center" gap="3">
            <Avatar
              size="2"
              radius="full"
              src={reportedUser.avatarUrl || undefined}
              fallback={getInitials(reportedUser.fullName, reportedUser.email)}
              style={{ background: "var(--red-9)", color: "white" }}
            />
            <Flex direction="column" gap="0">
              <Text size="2" weight="bold">{reportedUser.fullName || reportedUser.email}</Text>
              <Text size="1" color="gray">Người bị báo cáo</Text>
            </Flex>
          </Flex>
        </Box>

        {/* Recent Partners */}
        {recentPartners.length > 0 && (
          <Box mb="3">
            <Text size="2" weight="medium" color="gray" mb="1">
              Người trò chuyện gần đây (trong báo cáo):
            </Text>
            <Flex gap="2" wrap="wrap">
              {recentPartners.map((p) => (
                <Flex
                  key={p.id}
                  align="center"
                  gap="1"
                  px="2"
                  py="1"
                  style={{
                    borderRadius: "var(--radius-full)",
                    background: isDark ? "#1f2937" : "var(--gray-3)",
                    border: `1px solid ${isDark ? "#334155" : "var(--gray-5)"}`,
                  }}
                >
                  <Avatar
                    size="1"
                    radius="full"
                    src={p.avatarUrl || undefined}
                    fallback={getInitials(p.fullName, p.id)}
                  />
                  <Text size="1">{p.fullName || p.id.slice(0, 8) + "..."}</Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        )}

        {/* Reason Select */}
        <Flex direction="column" gap="1" mb="3">
          <Text size="2" weight="medium" color="gray">Loại vi phạm</Text>
          <Select.Root value={reason} onValueChange={(v) => setReason(v as ReportReason)} size="3">
            <Select.Trigger
              placeholder="Chọn loại vi phạm"
              style={{ width: "100%", ...fieldStyle }}
            />
            <Select.Content>
              {REPORT_REASONS.map((r) => (
                <Select.Item key={r.value} value={r.value}>{r.label}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        {/* Description */}
        <Flex direction="column" gap="1" mb="4">
          <Text size="2" weight="medium" color="gray">Mô tả chi tiết (tùy chọn)</Text>
          <TextArea
            placeholder="Mô tả chi tiết vấn đề..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              ...fieldStyle,
              resize: "none",
            }}
          />
        </Flex>

        {error && (
          <Callout.Root color="red" mb="3">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {success && (
          <Callout.Root color="green" mb="3">
            <Callout.Text>✅ Đã gửi báo cáo thành công!</Callout.Text>
          </Callout.Root>
        )}

        <Flex justify="end" gap="2">
          <Dialog.Close>
            <Button variant="soft" disabled={submitting}>Hủy</Button>
          </Dialog.Close>
          <Button
            color="red"
            onClick={handleSubmit}
            disabled={!reason || submitting || success}
          >
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
