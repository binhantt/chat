import { Badge, Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { AdminReport } from "./types";
import { authTheme } from "@/features/athu/styles/authTheme";
import { formatReportDate, getReportBody, getReportStatus, getReportTitle, reportReasonLabel } from "./reportUtils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportUserBlock } from "./ReportUserBlock";
import { reportsInnerBorder } from "@/features/admin/styles/reportsTheme";

export function ReportRow({
  expanded,
  onOpen,
  report,
}: {
  expanded: boolean;
  onOpen: (report: AdminReport) => void;
  report: AdminReport;
}) {
  const status = getReportStatus(report);

  return (
    <Box
      style={{
        background: expanded ? "var(--auth-soft-control)" : authTheme.panel,
        border: reportsInnerBorder,
        borderRadius: 8,
        boxShadow: expanded ? "0 14px 34px rgba(37, 99, 235, 0.10)" : "none",
        overflow: "hidden",
      }}
    >
      <Grid align="center" columns={{ initial: "1", lg: "1.25fr 0.9fr 0.9fr 150px 92px" }} gap="3" p="3">
        <Flex direction="column" gap="2" style={{ minWidth: 0 }}>
          <Flex align="center" gap="2" wrap="wrap">
            <Badge color="indigo" variant="soft">
              {reportReasonLabel[report.reason] || report.reason}
            </Badge>
            <ReportStatusBadge status={report.status} />
          </Flex>
          <Box style={{ minWidth: 0 }}>
            <Text as="div" size="3" weight="bold" style={{ color: authTheme.text, lineHeight: 1.35 }}>
              {getReportTitle(report.description)}
            </Text>
            <Text
              as="div"
              size="2"
              style={{
                color: authTheme.muted,
                display: "-webkit-box",
                lineHeight: 1.45,
                marginTop: 3,
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {getReportBody(report.description)}
            </Text>
          </Box>
        </Flex>

        <Box style={{ minWidth: 0 }}>
          <Text as="div" size="1" style={{ color: authTheme.muted, marginBottom: 5 }}>
            Người báo cáo
          </Text>
          <ReportUserBlock user={report.reporter} />
        </Box>

        <Box style={{ minWidth: 0 }}>
          <Text as="div" size="1" style={{ color: authTheme.muted, marginBottom: 5 }}>
            Bị báo cáo
          </Text>
          <ReportUserBlock color="red" user={report.reportedUser} />
        </Box>

        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            Ngày gửi
          </Text>
          <Text as="div" size="2" weight="medium" style={{ color: authTheme.text, lineHeight: 1.45 }}>
            {formatReportDate(report.createdAt)}
          </Text>
        </Box>

        <Flex align="center" gap="2" justify={{ initial: "start", lg: "end" }}>
          <Box style={{ display: "none" }}>{status.label}</Box>
          <Button onClick={() => onOpen(report)} size="2" variant={expanded ? "solid" : "soft"} style={{ borderRadius: 8 }}>
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            Xử lý
          </Button>
        </Flex>
      </Grid>
    </Box>
  );
}
