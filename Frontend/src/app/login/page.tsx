"use client";

import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Callout, Flex, Spinner, Text } from "@radix-ui/themes";
import {
  ArrowRightIcon,
  ChatBubbleIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { googleLogin, AuthRequestError } from "@/features/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

export default function UserLoginPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const handleGoogleCredential = useEffectEvent(async (credential?: string) => {
    if (!credential) {
      setError("Google khong tra ve credential hop le.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await googleLogin({ idToken: credential });

      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("chat.user.profile")
          : null;

      if (raw) {
        router.replace("/find");
      } else {
        router.replace("/profile-setup");
      }
    } catch (err) {
      if (err instanceof AuthRequestError) {
        setError(err.message);
      } else {
        setError("Da xay ra loi khong mong muon. Vui long thu lai.");
      }
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!isGoogleReady || !GOOGLE_CLIENT_ID || !googleButtonRef.current || !window.google) {
      return;
    }

    googleButtonRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        void handleGoogleCredential(credential);
      },
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "filled_blue",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 352,
      logo_alignment: "left",
    });

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [isGoogleReady]);

  const missingGoogleClientId = GOOGLE_CLIENT_ID.length === 0;

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(8,145,178,0.22) 0%, transparent 70%), " +
          "radial-gradient(ellipse 60% 50% at 80% 100%, rgba(103,232,249,0.18) 0%, transparent 60%), " +
          "linear-gradient(180deg, #f0f9ff 0%, #eef4f8 55%, #e8f0f7 100%)",
      }}
    >
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsGoogleReady(true)}
        onError={() => setError("Khong tai duoc Google Identity Services.")}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "45%",
          height: "55%",
          borderRadius: "50%",
          background: "rgba(103,232,249,0.25)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-8%",
          width: "40%",
          height: "50%",
          borderRadius: "50%",
          background: "rgba(56,189,248,0.18)",
          filter: "blur(110px)",
          pointerEvents: "none",
        }}
      />

      <Flex
        direction="column"
        align="center"
        gap="7"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          margin: "0 16px",
          padding: "52px 44px",
          borderRadius: 28,
          background: "rgba(255,255,255,0.78)",
          boxShadow:
            "0 32px 80px -20px rgba(8,145,178,0.16), 0 8px 32px -8px rgba(15,23,42,0.10)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.85)",
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(135deg, #0891b2 0%, #0284c7 100%)",
              boxShadow: "0 8px 24px rgba(8,145,178,0.35)",
            }}
          >
            <ChatBubbleIcon width={30} height={30} color="white" />
          </div>

          <Flex direction="column" align="center" gap="1">
            <Text
              size="6"
              weight="bold"
              style={{
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Chat vs Nguoi La 2
            </Text>
            <Text size="2" style={{ color: "#64748b" }}>
              Ket noi · Tro chuyen · Kham pha
            </Text>
          </Flex>
        </Flex>

        <div
          style={{
            width: "100%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(8,145,178,0.18), transparent)",
          }}
        />

        <Flex direction="column" align="center" gap="5" style={{ width: "100%" }}>
          <Flex direction="column" align="center" gap="1">
            <Text
              size="4"
              weight="semibold"
              style={{ color: "#0f172a", letterSpacing: "-0.01em" }}
            >
              Chao mung tro lai
            </Text>
            <Text size="2" style={{ color: "#94a3b8", textAlign: "center" }}>
              Dang nhap bang tai khoan Google cua ban
            </Text>
          </Flex>

          {error && (
            <Callout.Root color="red" size="1" style={{ width: "100%" }}>
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          {missingGoogleClientId ? (
            <Callout.Root color="amber" size="1" style={{ width: "100%" }}>
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>
                Thieu `NEXT_PUBLIC_GOOGLE_CLIENT_ID` tren frontend nen chua the dang nhap Google.
              </Callout.Text>
            </Callout.Root>
          ) : (
            <Flex direction="column" align="center" gap="3" style={{ width: "100%" }}>
              <div
                ref={googleButtonRef}
                style={{
                  width: "100%",
                  minHeight: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />

              {!isGoogleReady && (
                <Text size="2" style={{ color: "#64748b" }}>
                  Dang tai Google Identity Services...
                </Text>
              )}
            </Flex>
          )}

          <Button
            id="google-login-btn"
            size="4"
            disabled={loading || !isGoogleReady || missingGoogleClientId}
            onClick={() => window.google?.accounts.id.prompt()}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              cursor:
                loading || !isGoogleReady || missingGoogleClientId
                  ? "not-allowed"
                  : "pointer",
              background: loading
                ? "rgba(8,145,178,0.6)"
                : "linear-gradient(135deg, #0891b2 0%, #0284c7 100%)",
              boxShadow: loading
                ? "none"
                : "0 4px 16px rgba(8,145,178,0.32), 0 1px 4px rgba(8,145,178,0.18)",
              border: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (loading || !isGoogleReady || missingGoogleClientId) return;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(8,145,178,0.38), 0 2px 8px rgba(8,145,178,0.2)";
            }}
            onMouseLeave={(e) => {
              if (loading || !isGoogleReady || missingGoogleClientId) return;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(8,145,178,0.32), 0 1px 4px rgba(8,145,178,0.18)";
            }}
          >
            {loading ? (
              <>
                <Spinner size="2" />
                Dang dang nhap...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="rgba(255,255,255,0.95)"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="rgba(255,255,255,0.85)"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="rgba(255,255,255,0.75)"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="rgba(255,255,255,0.9)"
                  />
                </svg>
                Mo hop thoai Google
                <ArrowRightIcon width={17} height={17} />
              </>
            )}
          </Button>
        </Flex>

        <Text size="1" style={{ color: "#cbd5e1", textAlign: "center" }}>
          Bang cach dang nhap, ban dong y voi{" "}
          <span
            style={{
              color: "#94a3b8",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Dieu khoan dich vu
          </span>{" "}
          cua chung toi.
        </Text>
      </Flex>
    </main>
  );
}
