"use client";

import { Flex, Text, Box, Tabs } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { ReportForm, ReportHistory, AdminReportManagement } from "../components";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

export function ReportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Text size="3">Đang tải...</Text>
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, padding: "24px" }}>
      <Flex direction="column" gap="6" style={{ maxWidth: 1200, margin: "0 auto" }}>

        <Flex direction="column" gap="1">
          <Text size="6" weight="bold" color="indigo">Báo cáo</Text>
          <Text size="2" color="gray">
            {user?.role === 'admin'
              ? "Quản lý báo cáo và xem xét các vấn đề"
              : "Gửi báo cáo vấn đề hoặc phản hồi"}
          </Text>
        </Flex>

        <Tabs.Root defaultValue="user-reports" style={{ width: "100%" }}>
          <Tabs.List style={{ marginBottom: "24px" }}>
            <Tabs.Trigger value="user-reports">Báo cáo của tôi</Tabs.Trigger>
            {user?.role === 'admin' && (
              <Tabs.Trigger value="admin-management">Quản lý báo cáo</Tabs.Trigger>
            )}
          </Tabs.List>

          <Tabs.Content value="user-reports" style={{ width: "100%" }}>
            <ReportForm />
            <ReportHistory />
          </Tabs.Content>

          {user?.role === 'admin' && (
            <Tabs.Content value="admin-management" style={{ width: "100%" }}>
              <AdminReportManagement />
            </Tabs.Content>
          )}
        </Tabs.Root>
      </Flex>
    </Box>
  );
}
