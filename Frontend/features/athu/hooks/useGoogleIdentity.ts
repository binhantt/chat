"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
            auto_select?: boolean;
          }) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services";

function installPostMessageGuard() {
  const handler = (event: ErrorEvent) => {
    const msg = event?.message ?? "";
    if (
      msg.includes("postMessage") ||
      msg.includes("contentWindow") ||
      msg.includes("Cannot read properties of null")
    ) {
      const stack = event?.error?.stack || "";
      if (
        stack.includes("accounts.google.com") ||
        stack.includes("gsi/client") ||
        stack.includes("gsi/transform") ||
        msg.includes("postMessage")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
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
  const initDone = useRef(false);
  const [triggerGoogle, setTriggerGoogle] = useState<(() => void) | null>(null);

  const initGoogle = useCallback(() => {
    if (!clientId) return;

    const pollApi = (retries = 0) => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response?.credential) {
                void loginWithCredential(response.credential);
              }
            },
            auto_select: false,
          });

          setGoogleReady(true);

          // Expose trigger function for custom button
          setTriggerGoogle(() => () => {
            window.google?.accounts?.id?.prompt((notification) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // One Tap not shown — fallback: reload page to retry
                console.warn("[Google] One Tap not displayed, retrying...");
              }
            });
          });
        } catch (err) {
          console.error("[Google] Init error:", err);
          setGoogleReady(false);
        }
      } else if (retries < 50) {
        setTimeout(() => pollApi(retries + 1), 100);
      } else {
        console.error("[Google] API not available after 5s");
        setGoogleReady(false);
      }
    };
    pollApi();
  }, [clientId, loginWithCredential, setGoogleReady]);

  useEffect(() => {
    if (!clientId || initDone.current) return;
    initDone.current = true;

    let mounted = true;
    const cleanupGuard = installPostMessageGuard();

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      if (mounted) initGoogle();
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
        setTimeout(() => initGoogle(), 100);
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
  }, [clientId, initGoogle, setError, setGoogleReady]);

  return { buttonRef, triggerGoogle };
}
