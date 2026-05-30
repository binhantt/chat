import { Badge, Box, Button, Flex, Select, Text } from "@radix-ui/themes";
import type { AdminReport } from "./types";
import { authTheme } from "@/features/athu/styles/authTheme";
import { formatReportDate, reportLockOptions, reportStatusOptions } from "./reportUtils";
import { reportsInnerBorder } from "@/features/admin/styles/reportsTheme";

export function ReportExpandedPanel({
  lockType,
  newStatus,
  onLockTypeChange,
  onStatusChange,
  onUpdate,
  report,
  updating,
}: {
  lockType: string;
  newStatus: string;
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
            Report content
          </Text>
          <Text as="div" size="2" style={{ color: authTheme.muted, lineHeight: 1.6, marginTop: 10, whiteSpace: "pre-wrap" }}>
            {report.description || "User did not provide detailed description."}
          </Text>
        </Box>

        <Flex
          direction="column"
          gap="3"
          style={{
            background: authTheme.panel,
            border: reportsInnerBorder,
            borderRadius: 8,
            flex: "0 0 330px",
            padding: 14,
          }}
        >
          {report.recentPartners && report.recentPartners.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" style={{ color: authTheme.text }}>
                Recent related
              </Text>
              <Flex gap="2" wrap="wrap">
                {report.recentPartners.map((partner) => (
                  <Badge key={partner.id} color="cyan" variant="soft">
                    {partner.fullName || partner.email || "Anonymous"}
                  </Badge>
                ))}
              </Flex>
            </Flex>
          )}

          {report.reportedUser.lockType && report.reportedUser.lockType !== "none" && (
            <Badge color="red" variant="soft" style={{ width: "fit-content" }}>
              Locked: {report.reportedUser.lockType}
              {report.reportedUser.lockedUntil ? ` until ${formatReportDate(report.reportedUser.lockedUntil)}` : ""}
            </Badge>
          )}

          <Flex direction="column" gap="2">
            <Text size="2" weight="bold" style={{ color: authTheme.text }}>
              Process report
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
                <Select.Trigger placeholder="Select status" style={{ width: "100%" }} />
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
                  <Select.Trigger placeholder="Select lock level" style={{ width: "100%" }} />
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
            {updating ? "Updating..." : "Update"}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
