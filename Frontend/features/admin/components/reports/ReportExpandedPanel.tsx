import { Badge, Box, Button, Flex, Select, Text } from "@radix-ui/themes";
import { MagicWandIcon } from "@radix-ui/react-icons";
import type { AdminReport, ReportAiReview } from "./types";
import { authTheme } from "@/features/athu/styles/authTheme";
import { formatReportDate, reportLockOptions, reportStatusOptions } from "./reportUtils";
import { reportsInnerBorder } from "@/features/admin/styles/reportsTheme";

export function ReportExpandedPanel({
  aiReview,
  aiReviewing,
  lockType,
  newStatus,
  onAiReview,
  onApplyAiSuggestion,
  onLockTypeChange,
  onStatusChange,
  onUpdate,
  report,
  updating,
}: {
  aiReview: ReportAiReview | null;
  aiReviewing: boolean;
  lockType: string;
  newStatus: string;
  onAiReview: () => void;
  onApplyAiSuggestion: () => void;
  onLockTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onUpdate: () => void;
  report: AdminReport;
  updating: boolean;
}) {
  return (
    <Box
      style={{
        background: "var(--auth-panel-gradient)",
        border: reportsInnerBorder,
        borderRadius: 8,
        padding: 14,
      }}
    >
      <Flex align="stretch" direction={{ initial: "column", lg: "row" }} gap="3">
        <Box
          style={{
            background: authTheme.panel,
            border: reportsInnerBorder,
            borderRadius: 8,
            flex: "1 1 auto",
            minHeight: 150,
            padding: 14,
          }}
        >
          <Text size="2" weight="bold" style={{ color: authTheme.text }}>
            Nội dung báo cáo
          </Text>
          <Text
            as="div"
            size="2"
            style={{ color: authTheme.muted, lineHeight: 1.6, marginTop: 10, whiteSpace: "pre-wrap" }}
          >
            {report.description || "Người dùng chưa nhập nội dung chi tiết."}
          </Text>
        </Box>

        <Flex
          direction="column"
          gap="3"
          style={{
            background: authTheme.panel,
            border: reportsInnerBorder,
            borderRadius: 8,
            flex: "0 0 360px",
            padding: 14,
          }}
        >
          {report.recentPartners && report.recentPartners.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" style={{ color: authTheme.text }}>
                Người liên quan gần đây
              </Text>
              <Flex gap="2" wrap="wrap">
                {report.recentPartners.map((partner) => (
                  <Badge key={partner.id} color="cyan" variant="soft">
                    {partner.fullName || partner.email || "Ẩn danh"}
                  </Badge>
                ))}
              </Flex>
            </Flex>
          )}

          {report.reportedUser.lockType && report.reportedUser.lockType !== "none" && (
            <Badge color="red" variant="soft" style={{ width: "fit-content" }}>
              Đang khóa: {report.reportedUser.lockType}
              {report.reportedUser.lockedUntil ? ` đến ${formatReportDate(report.reportedUser.lockedUntil)}` : ""}
            </Badge>
          )}

          <Flex direction="column" gap="2">
            <Text size="2" weight="bold" style={{ color: authTheme.text }}>
              AI kiểm duyệt
            </Text>
            <Button
              disabled={aiReviewing}
              loading={aiReviewing}
              onClick={onAiReview}
              size="2"
              style={{ borderRadius: 8 }}
              variant="soft"
            >
              <MagicWandIcon />
              {aiReviewing ? "Đang so sánh..." : "So sánh với chat và ứng xử"}
            </Button>

            {aiReview && <ReportAiReviewBox aiReview={aiReview} onApply={onApplyAiSuggestion} />}
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="bold" style={{ color: authTheme.text }}>
              Xử lý báo cáo
            </Text>
            <Flex direction="column" gap="2">
              <Select.Root
                onValueChange={(value) => {
                  onStatusChange(value);
                  if (value !== "resolved") onLockTypeChange("");
                }}
                size="2"
                value={newStatus}
              >
                <Select.Trigger placeholder="Chọn trạng thái" style={{ width: "100%" }} />
                <Select.Content>
                  {reportStatusOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              {newStatus === "resolved" && (
                <Select.Root onValueChange={onLockTypeChange} size="2" value={lockType}>
                  <Select.Trigger placeholder="Chọn mức khóa" style={{ width: "100%" }} />
                  <Select.Content>
                    {reportLockOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            </Flex>
          </Flex>

          <Button
            color="green"
            disabled={!newStatus || updating || (newStatus === "resolved" && !lockType)}
            loading={updating}
            onClick={onUpdate}
            size="2"
            style={{ borderRadius: 8 }}
          >
            {updating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

function ReportAiReviewBox({
  aiReview,
  onApply,
}: {
  aiReview: ReportAiReview;
  onApply: () => void;
}) {
  return (
    <Box
      style={{
        background: "rgba(59,130,246,0.08)",
        border: reportsInnerBorder,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <Flex align="center" gap="2" justify="between" wrap="wrap">
        <Badge
          color={aiReview.riskLevel === "high" ? "red" : aiReview.riskLevel === "medium" ? "yellow" : "green"}
          variant="soft"
        >
          Điểm {aiReview.score}/100
        </Badge>
        <Badge color={aiReview.recommendation === "block" ? "red" : "blue"} variant="soft">
          {aiReview.recommendation === "block"
            ? "Đề xuất chặn"
            : aiReview.recommendation === "review"
              ? "Cần xem thêm"
              : "Chưa thấy vi phạm"}
        </Badge>
      </Flex>

      <Text as="div" size="2" style={{ color: authTheme.muted, lineHeight: 1.55, marginTop: 8 }}>
        {aiReview.summary}
      </Text>

      {aiReview.matchedRules.length > 0 && (
        <Flex gap="1" mt="2" wrap="wrap">
          {aiReview.matchedRules.map((rule) => (
            <Badge color="cyan" key={rule} variant="soft">
              {rule}
            </Badge>
          ))}
        </Flex>
      )}

      {aiReview.evidenceMessages.length > 0 && (
        <Flex direction="column" gap="1" mt="2">
          {aiReview.evidenceMessages.slice(0, 2).map((message) => (
            <Text as="div" key={message.id} size="1" style={{ color: authTheme.text, lineHeight: 1.45 }}>
              “{message.content}”
            </Text>
          ))}
        </Flex>
      )}

      {aiReview.recommendation !== "none" && (
        <Button mt="3" onClick={onApply} size="2" style={{ borderRadius: 8 }} variant="solid">
          Áp dụng đề xuất
        </Button>
      )}
    </Box>
  );
}
