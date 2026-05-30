"use client";

import { AuthCopy } from "../components/AuthCopy";
import { AuthError } from "../components/AuthError";
import { AuthPanel } from "../components/AuthPanel";
import { AuthShell } from "../components/AuthShell";
import { AuthTerms } from "../components/AuthTerms";
import { AuthVisual } from "../components/AuthVisual";
import { GoogleButton } from "../components/GoogleButton";
import { GoogleLoadingButton } from "../components/GoogleLoadingButton";
import { useAuthUiStore } from "../store/useAuthUiStore";

export function LoginPage() {
  const error = useAuthUiStore((state) => state.error);
  const isSubmitting = useAuthUiStore((state) => state.isSubmitting);

  return (
    <AuthShell>
      <AuthVisual />
      <AuthPanel>
        <AuthCopy />
        <AuthError message={error} />
        <GoogleButton />
        <GoogleLoadingButton isVisible={isSubmitting} />
        <AuthTerms />
      </AuthPanel>
    </AuthShell>
  );
}
