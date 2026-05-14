'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    // Load Google Identity Services
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(buttonRef.current!, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
        });
      }
    };
    document.head.appendChild(script);
  }, [clientId]);

  async function handleCredentialResponse(response: { credential: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
        credentials: "include",
      });

      if (res.ok) {
        // Force a full page reload to ensure AuthContext re-fetches user data
        window.location.href = "/";
      } else {
        const error = await res.json();
        alert("Đăng nhập thất bại: " + (error.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={buttonRef} style={{ display: "flex", justifyContent: "center" }}>
      {loading && (
        <Button size="3" variant="outline" disabled style={{ width: "100%" }}>
          Đang đăng nhập...
        </Button>
      )}
    </div>
  );
}
