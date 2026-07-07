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

export function useGoogleIdentity() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithCredential } = useGoogleLogin();
  const setError = useAuthUiStore((state) => state.setError);
  const setGoogleReady = useAuthUiStore((state) => state.setGoogleReady);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const renderGoogleButton = useCallback(() => {
    if (!buttonRef.current || !window.google || !clientId) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        void loginWithCredential(response.credential);
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      logo_alignment: "center",
      shape: "pill",
      size: "large",
      text: "continue_with",
      theme: "outline",
      width: "100%",
    });

    setGoogleReady(true);
  }, [clientId, loginWithCredential, setGoogleReady]);

  useEffect(() => {
    if (!clientId) {
      setError("Thieu NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      setGoogleReady(false);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = renderGoogleButton;
    script.onerror = () => {
      setError("Không tải được Google Identity Services");
      setGoogleReady(false);
    };

    document.head.appendChild(script);
  }, [clientId, renderGoogleButton, setError, setGoogleReady]);

  return { buttonRef };
}
