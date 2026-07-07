"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

type AdminAuthShellProps = {
  children: ReactNode;
};

export function AdminAuthShell({ children }: AdminAuthShellProps) {
  const s = useAdminStyles();
  return (
    <Box asChild className={s.authShell.authShell}>
      <main>
        <Flex align="center" justify="center" className={s.authShell.authShellInner}>
          {children}
        </Flex>
      </main>
    </Box>
  );
}
