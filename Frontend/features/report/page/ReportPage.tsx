"use client";

import { Box, Flex, Spinner, Tabs, Text } from "@radix-ui/themes";
import {
  ExclamationTriangleIcon,
  FileTextIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import { useAuth } from "@/contexts/AuthContext";
import { authTheme } from "@/features/athu/styles/authTheme";
import {
  FeatureTile,
  UserHero,
  UserPageShell,
  UserPanel,
} from "@/features/user-layout/components";
import { ReportForm, ReportHistory } from "../components";

export function ReportPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <UserPageShell>
        <Flex align="center" gap="3" justify="center" style={{ minHeight: 320 }}>
          <Spinner />
          <Text style={{ color: authTheme.muted }}>Đang tải...</Text>
        </Flex>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell>
      <UserHero
        badge="Báo cáo và an toàn"
        description="Gửi báo cáo khi gặp hành vi không phù hợp để giữ trải nghiệm trò chuyện an toàn."
        icon={<ExclamationTriangleIcon />}
        title="Công cụ bảo vệ cộng đồng Người Lạ."
      >
        <UserPanel maxWidth={340}>
          <Flex direction="column" gap="3">
            <FeatureTile
              description="Chỉ báo cáo người bạn đã từng trò chuyện."
              icon={<LockClosedIcon height={22} width={22} />}
              title="Đúng ngữ cảnh"
              tone="cyan"
            />
            <FeatureTile
              description="Theo dõi trạng thái xử lý báo cáo của bạn."
              icon={<FileTextIcon height={22} width={22} />}
              title="Minh bạch"
              tone="blue"
            />
          </Flex>
        </UserPanel>
      </UserHero>

      <UserPanel>
        <Tabs.Root defaultValue="user-reports" style={{ width: "100%" }}>
          <Tabs.List style={{ marginBottom: 20 }}>
            <Tabs.Trigger value="user-reports">Báo cáo của tôi</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="user-reports" style={{ width: "100%" }}>
            <Flex direction="column" gap="4">
              <Box
                style={{
                  background: "rgba(255, 255, 255, 0.66)",
                  borderRadius: 8,
                }}
              >
                <ReportForm />
              </Box>
              <Box
                style={{
                  background: "rgba(255, 255, 255, 0.66)",
                  borderRadius: 8,
                }}
              >
                <ReportHistory />
              </Box>
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </UserPanel>
    </UserPageShell>
  );
}
