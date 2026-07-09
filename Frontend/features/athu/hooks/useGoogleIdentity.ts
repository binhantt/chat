"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGoogleLogin } from "./useGoogleLogin";
import { useAuthUiStore } from "../store/useAuthUiStore";

type GoogleCredentialResponse = {
  credential: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              logo_alignment?: "left" | "center";
              shape?: "rectangular" | "pill" | "circle" | "square";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              theme?: "outline" | "filled_blue" | "filled_black";
              width?: string;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services";

/**
 * Global error interceptor: Google GSI's internal code calls postMessage
 * to a hidden iframe. If the iframe is null (race condition during init),
 * this throws an uncaught TypeError. We suppress ONLY that specific error
 * so it never reaches the console or error boundaries.
 */
function installPostMessageGuard() {
  const handler = (event: ErrorEvent) => {
    const msg = event?.message ?? "";
    if (
      msg.includes("Cannot read properties of null (reading 'postMessage')") ||
      msg.includes("Cannot read properties of null (reading 'contentWindow')")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("error", handler, { capture: true });
  }
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("error", handler, { capture: true });
    }
  };
}

export function useGoogleIdentity() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithCredential } = useGoogleLogin();
  const setError = useAuthUiStore((state) => state.setError);
  const setGoogleReady = useAuthUiStore((state) => state.setGoogleReady);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const renderGoogleButton = useCallback(() => {
    if (!buttonRef.current || !window.google?.accounts?.id || !clientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            void loginWithCredential(response.credential);
          }
        },
      });

      const doRender = () => {
        if (!buttonRef.current || !window.google?.accounts?.id) return;
        try {
          window.google.accounts.id.renderButton(buttonRef.current, {
            logo_alignment: "center",
            shape: "pill",
            size: "large",
            text: "continue_with",
            theme: "outline",
            width: "360",
          });
          setGoogleReady(true);
        } catch (err) {
          console.error("[Google] Render error:", err);
          setGoogleReady(false);
        }
      };

      // Wait for GSI iframe to mount before calling renderButton.
      // initialize() creates a hidden iframe for postMessage communication.
      // If renderButton runs before the iframe exists, GSI throws
      // "Cannot read properties of null (reading 'postMessage')".
      const waitForFrame = (retries = 0) => {
        if (
          document.querySelector('iframe[src*="accounts.google.com/gsi"]') ||
          document.querySelector('iframe[src*="accounts.google.com/o2"]')
        ) {
          doRender();
        } else if (retries < 10) {
          setTimeout(() => waitForFrame(retries + 1), 150);
        } else {
          // Fallback: try anyway, the guard will catch any residual error
          doRender();
        }
      };
      waitForFrame();
    } catch (err) {
      console.error("[Google] Init error:", err);
      setGoogleReady(false);
    }
  }, [clientId, loginWithCredential, setGoogleReady]);

  useEffect(() => {
    if (!clientId) {
      setError("Thieu NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      setGoogleReady(false);
      return;
    }

    let mounted = true;
    const cleanupGuard = installPostMessageGuard();

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      if (mounted) renderGoogleButton();
      return () => {
        mounted = false;
        cleanupGuard();
      };
    }

    const script = document.createElement("script");
    script.async = true;
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      if (mounted) {
        // Extra delay after script load to let GSI fully bootstrap
        setTimeout(() => renderGoogleButton(), 50);
      }
    };
    script.onerror = () => {
      if (mounted) {
        setError("Không tải được Google Identity Services");
        setGoogleReady(false);
      }
    };

    document.head.appendChild(script);

    return () => {
      mounted = false;
      cleanupGuard();
    };
  }, [clientId, renderGoogleButton, setError, setGoogleReady]);

  return { buttonRef };
}
