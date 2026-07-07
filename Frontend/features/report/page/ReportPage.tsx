"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Text, Button, Select, TextField, TextArea, Badge, Avatar } from "@radix-ui/themes";
import { ExclamationTriangleIcon, LockClosedIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/contexts/AuthContext";
import { getCsrfHeaders } from "@/lib/csrf";

interface ReportableUser {
  id: string; email: string; fullName: string | null; avatarUrl: string | null; lastConversationAt: string;
}
interface Report {
  id: string; reason: string; description: string | null; status: string; createdAt: string;
  reporter: { id: string; fullName: string | null; email: string };
  reportedUser: { id: string; fullName: string | null; email: string };
}

const reportReasons = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Quấy rối" },
  { value: "inappropriate_content", label: "Nội dung không phù hợp" },
  { value: "fake_profile", label: "Tài khoản giả" },
  { value: "underage", label: "Chưa đủ tuổi" },
  { value: "other", label: "Khác" },
];

const catLabel: Record<string, string> = {
  spam: "Spam", harassment: "Quấy rối", inappropriate_content: "Nội dung không phù hợp",
  fake_profile: "Tài khoản giả", underage: "Chưa đủ tuổi", other: "Khác",
};
const statusColor: Record<string, "yellow" | "violet" | "green" | "red"> = {
  pending: "yellow", reviewed: "violet", resolved: "green", rejected: "red",
};
const statusLabel: Record<string, string> = {
  pending: "Chờ xử lý", reviewed: "Đã xem xét", resolved: "Đã giải quyết", rejected: "Từ chối",
};

export function ReportPage() {
  const { user: currentUser, loading: authLoading } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [reportedUserId, setReportedUserId] = useState("");
  const [reportableUsers, setReportableUsers] = useState<ReportableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // History state
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    queueMicrotask(() => { void fetchReportableUsers(); void fetchHistory(); });
  }, []);

  async function fetchReportableUsers() {
    try {
      const res = await fetch("/api/v1/reports/reportable-users");
      if (res.ok) {
        const users = await res.json();
        setReportableUsers(Array.isArray(users) ? users.filter((u: ReportableUser, i: number, a: ReportableUser[]) => a.findIndex(x => x.id === u.id) === i) : []);
      }
    } catch { /* ignore */ } finally { setLoadingUsers(false); }
  }

  async function fetchHistory() {
    try {
      const res = await fetch("/api/v1/reports/my-reports");
      if (res.ok) setReports(await res.json());
    } catch { /* ignore */ } finally { setLoadingHistory(false); }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !reason || !reportedUserId) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ reportedUserId, reason, description: `${title}\n\n${content}` }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => { setTitle(""); setContent(""); setReason(""); setReportedUserId(""); setSubmitted(false); void fetchHistory(); }, 3000);
      } else {
        const d = await res.json().catch(() => null);
        setError(d?.message || "Không thể gửi báo cáo.");
      }
    } catch { setError("Không thể kết nối đến server."); } finally { setSubmitting(false); }
  };

  const inputStyle = { background: "var(--chat-accent-soft)", border: "1px solid var(--chat-border)", borderRadius: 10, color: "var(--chat-text)" };

  if (authLoading) {
    return (
      <Box style={{ padding: "28px", background: "var(--bg-primary)", minHeight: "100%" }}>
        <Flex align="center" justify="center" style={{ minHeight: 320 }}>
          <Text style={{ color: "var(--chat-muted)" }}>Đang tải...</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box style={{ padding: "28px clamp(16px, 2.2vw, 32px)", background: "var(--bg-primary)", minHeight: "100%" }}>
      <Flex direction="column" gap="5" style={{ margin: "0 auto", maxWidth: 900, width: "100%" }}>

        {/* Hero */}
        <Box style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))", borderRadius: 20, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
          <Box style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <Flex direction="column" gap="4" style={{ position: "relative", zIndex: 1 }}>
            <Badge size="3" style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
              <ExclamationTriangleIcon width={14} height={14} /> Báo cáo và an toàn
            </Badge>
            <Text size="7" weight="bold" style={{ color: "#FFFFFF", fontFamily: "var(--font-heading)", lineHeight: 1.1, maxWidth: 500 }}>
              Công cụ bảo vệ cộng đồng Người Lạ.
            </Text>
            <Text size="3" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)", lineHeight: 1.7, maxWidth: 540 }}>
              Gửi báo cáo khi gặp hành vi không phù hợp để giữ trải nghiệm trò chuyện an toàn.
            </Text>
            <Flex gap="4" mt="1">
              <Metric icon={<LockClosedIcon width={16} height={16} />} label="Đúng ngữ cảnh" value="Chỉ báo cáo người đã trò chuyện" />
              <Metric icon={<FileTextIcon width={16} height={16} />} label="Minh bạch" value="Theo dõi trạng thái xử lý" />
            </Flex>
          </Flex>
        </Box>

        {/* Form card */}
        <Box style={{ background: "var(--chat-surface)", borderRadius: 16, padding: 24 }}>
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold" style={{ color: "var(--chat-text)" }}>Gửi báo cáo mới</Text>
            <Text size="2" style={{ color: "var(--chat-muted)" }}>Chỉ hiện 10 người bạn đã nói chuyện gần nhất để báo cáo.</Text>

            <Flex gap="4" wrap="wrap">
              <Box style={{ flex: 1, minWidth: 220 }}>
                <Text size="2" weight="medium" mb="1" style={{ color: "var(--chat-text)", display: "block" }}>Người bị báo cáo</Text>
                <Select.Root value={reportedUserId} onValueChange={setReportedUserId} size="3">
                  <Select.Trigger placeholder={loadingUsers ? "Đang tải..." : "Chọn người"} style={{ width: "100%", ...inputStyle }} />
                  <Select.Content>
                    {reportableUsers.map((u) => (
                      <Select.Item key={u.id} value={u.id}>{u.fullName || u.email}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {!loadingUsers && reportableUsers.length === 0 && <Text size="1" style={{ color: "var(--chat-muted)", marginTop: 4 }}>Bạn chưa có cuộc trò chuyện nào để báo cáo.</Text>}
              </Box>
              <Box style={{ flex: 1, minWidth: 220 }}>
                <Text size="2" weight="medium" mb="1" style={{ color: "var(--chat-text)", display: "block" }}>Lý do báo cáo</Text>
                <Select.Root value={reason} onValueChange={setReason} size="3">
                  <Select.Trigger placeholder="Chọn lý do" style={{ width: "100%", ...inputStyle }} />
                  <Select.Content>
                    {reportReasons.map((r) => <Select.Item key={r.value} value={r.value}>{r.label}</Select.Item>)}
                  </Select.Content>
                </Select.Root>
              </Box>
            </Flex>

            <Box>
              <Text size="2" weight="medium" mb="1" style={{ color: "var(--chat-text)", display: "block" }}>Tiêu đề</Text>
              <TextField.Root placeholder="Nhập tiêu đề báo cáo" value={title} onChange={(e) => setTitle(e.target.value)} size="3" style={inputStyle} />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="1" style={{ color: "var(--chat-text)", display: "block" }}>Nội dung</Text>
              <TextArea placeholder="Mô tả chi tiết vấn đề..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} style={{ ...inputStyle, resize: "none" }} />
            </Box>

            {currentUser && <Text size="1" style={{ color: "var(--chat-muted)" }}>Đăng nhập với: {currentUser.fullName || currentUser.email}</Text>}
            {error && <Text size="2" style={{ color: "var(--chat-danger)" }}>{error}</Text>}
            {submitted && <Badge style={{ background: "rgba(22, 163, 74, 0.1)", color: "#16a34a", width: "fit-content" }}>Đã gửi báo cáo</Badge>}

            <Button size="3" onClick={handleSubmit} disabled={submitted || submitting || !title.trim() || !content.trim() || !reason || !reportedUserId} loading={submitting}
              style={{ background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))", borderRadius: 10, color: "#FFFFFF", width: "100%", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </Flex>
        </Box>

        {/* History card */}
        <Box style={{ background: "var(--chat-surface)", borderRadius: 16, padding: 24 }}>
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold" style={{ color: "var(--chat-text)" }}>Lịch sử báo cáo</Text>
            {loadingHistory ? (
              <Text size="2" style={{ color: "var(--chat-muted)" }}>Đang tải...</Text>
            ) : reports.length === 0 ? (
              <Text size="2" style={{ color: "var(--chat-muted)" }}>Chưa có báo cáo nào</Text>
            ) : (
              reports.map((r) => (
                <Box key={r.id} style={{ borderBottom: "1px solid var(--chat-border)", paddingBottom: 12 }}>
                  <Flex justify="between" align="start" gap="3">
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium" style={{ color: "var(--chat-text)" }}>{catLabel[r.reason] || r.reason}</Text>
                      <Text size="1" style={{ color: "var(--chat-muted)" }}>Báo cáo bởi {r.reporter.fullName || r.reporter.email}</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Badge color={statusColor[r.status] || "yellow"}>{statusLabel[r.status] || r.status}</Badge>
                      <Text size="1" style={{ color: "var(--chat-muted)" }}>{formatDate(r.createdAt)}</Text>
                    </Flex>
                  </Flex>
                  {r.description && <Text size="1" style={{ color: "var(--chat-muted)", marginTop: 4, display: "block" }}>{r.description.length > 100 ? `${r.description.substring(0, 100)}...` : r.description}</Text>}
                </Box>
              ))
            )}
          </Flex>
        </Box>

      </Flex>
    </Box>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Flex align="center" gap="2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", flex: 1 }}>
      <Box style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Text as="div" size="1" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</Text>
        <Text as="div" size="1" style={{ color: "rgba(255,255,255,0.7)" }}>{value}</Text>
      </Box>
    </Flex>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 1) return "Hôm qua";
  if (diff < 7) return `${diff} ngày trước`;
  if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
  return `${Math.floor(diff / 30)} tháng trước`;
}
