"use client";

import { AuthCopy } from "../components/AuthCopy";
import { AuthError } from "../components/AuthError";
import { AuthPanel } from "../components/AuthPanel";
import { AuthShell } from "../components/AuthShell";
import { AuthTerms } from "../components/AuthTerms";
import { AuthVisual } from "../components/AuthVisual";
import { AuthWebsiteIntro } from "../components/AuthWebsiteIntro";
import { GoogleButton } from "../components/GoogleButton";
import { GoogleLoadingButton } from "../components/GoogleLoadingButton";
import { useAuthUiStore } from "../store/useAuthUiStore";
import { PublicNavbar } from "@/components/layouts/users/PublicNavbar";
import { Box, Flex } from "@radix-ui/themes";

export function LoginPage() {
  const error = useAuthUiStore((state) => state.error);
  const isSubmitting = useAuthUiStore((state) => state.isSubmitting);

  return (
    <Box style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <PublicNavbar />
      <AuthShell>
        <Flex
          align="center"
          justify="center"
          gap={{ initial: "5", md: "8" }}
          wrap={{ initial: "wrap", md: "nowrap" }}
        >
          <AuthVisual />
          <AuthPanel>
            <AuthCopy />
            <AuthError message={error} />

            {/* Google sign-in */}
            <Box
              style={{
                background: "rgba(165, 139, 217, 0.04)",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <GoogleButton />
              <GoogleLoadingButton isVisible={isSubmitting} />
            </Box>

            <AuthTerms />
          </AuthPanel>
        </Flex>
      </AuthShell>
      <AuthWebsiteIntro />
    </Box>
  );
}
