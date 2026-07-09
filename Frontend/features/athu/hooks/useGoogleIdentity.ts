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
 * Suppress Google GSI postMessage errors that occur when the
 * gsi/transform iframe communicates with a destroyed parent window.
 */
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

  const renderGoogleButton = useCallback(() => {
    if (!buttonRef.current || !clientId) return;

    // Poll until window.google.accounts.id is fully bootstrapped.
    // Calling initialize() before the API is ready creates a broken
    // iframe at gsi/transform that can never postMessage back.
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

          // Wait for iframe to exist before renderButton
          const waitForFrame = (r = 0) => {
            const iframes = document.querySelectorAll("iframe");
            let found = false;
            for (const f of iframes) {
              if ((f.src || "").includes("accounts.google.com")) {
                found = true;
                break;
              }
            }
            if (found || r >= 20) {
              doRender();
            } else {
              setTimeout(() => waitForFrame(r + 1), 150);
            }
          };
          waitForFrame();
        } catch (err) {
          console.error("[Google] Init error:", err);
          setGoogleReady(false);
        }
      } else if (retries < 50) {
        // Poll up to 5 seconds (50 * 100ms)
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
        // Delay to let GSI fully bootstrap its internal state
        setTimeout(() => renderGoogleButton(), 100);
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
