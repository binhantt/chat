"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

type AdminAuthPanelProps = {
  children: ReactNode;
};

export function AdminAuthPanel({ children }: AdminAuthPanelProps) {
  const s = useAdminStyles();
  return (
    <Box className={s.authPanel.authPanel}>
      <Box className={s.authPanel.authPanelGradient} />
      <Flex direction="column" gap="4" p="5">
        {children}
      </Flex>
    </Box>
  );
}
