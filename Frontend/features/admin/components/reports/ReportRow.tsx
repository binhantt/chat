import { Badge, Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import type { AdminReport } from "./types";
import { formatReportDate, getReportBody, getReportStatus, getReportTitle, reportReasonLabel } from "./reportUtils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportUserBlock } from "./ReportUserBlock";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ReportRow({
  expanded,
  onOpen,
  report,
}: {
  expanded: boolean;
  onOpen: (report: AdminReport) => void;
  report: AdminReport;
}) {
  const s = useAdminStyles();
  const status = getReportStatus(report);

  return (
    <Box
      className={`${s.reports.reportRow} ${expanded ? s.reports.reportRowExpanded : s.reports.reportRowCollapsed}`}
    >
      <Grid align="center" columns={{ initial: "1", lg: "1.25fr 0.9fr 0.9fr 150px 92px" }} gap="3" p="3">
        <Flex direction="column" gap="2" className={s.reports.reportRowMinWidth}>
          <Flex align="center" gap="2" wrap="wrap">
            <Badge color="indigo" variant="soft">
              {reportReasonLabel[report.reason] || report.reason}
            </Badge>
            <ReportStatusBadge status={report.status} />
          </Flex>
          <Box className={s.reports.reportRowMinWidth}>
            <Text as="div" size="3" weight="bold" className={s.reports.reportRowTitle}>
              {getReportTitle(report.description)}
            </Text>
            <Text
              as="div"
              size="2"
              className={s.reports.reportRowBody}
            >
              {getReportBody(report.description)}
            </Text>
          </Box>
        </Flex>

        <Box className={s.reports.reportRowMinWidth}>
          <Text as="div" size="1" className={s.reports.reportRowLabel}>
            Người báo cáo
          </Text>
          <ReportUserBlock user={report.reporter} />
        </Box>

        <Box className={s.reports.reportRowMinWidth}>
          <Text as="div" size="1" className={s.reports.reportRowLabel}>
            Bị báo cáo
          </Text>
          <ReportUserBlock color="red" user={report.reportedUser} />
        </Box>

        <Box>
          <Text as="div" size="1" className={s.reports.reportRowLabel}>
            Ngày gửi
          </Text>
          <Text as="div" size="2" weight="medium" className={s.reports.reportRowDate}>
            {formatReportDate(report.createdAt)}
          </Text>
        </Box>

        <Flex align="center" gap="2" justify={{ initial: "start", lg: "end" }}>
          <Box className={s.reports.flexNone}>{status.label}</Box>
          <Button onClick={() => onOpen(report)} size="2" variant={expanded ? "solid" : "soft"} className={s.reports.roundedBtn}>
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            Xử lý
          </Button>
        </Flex>
      </Grid>
    </Box>
  );
}
