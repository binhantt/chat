import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Trang không tìm thấy",
  description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      role="main"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        textAlign: "center",
        padding: "0 24px",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: "var(--primary)",
          margin: 0,
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: 18,
          margin: "16px 0 32px",
          color: "var(--text-secondary)",
          maxWidth: 400,
        }}
      >
        Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 28px",
          borderRadius: 12,
          background: "var(--primary)",
          color: "#FFFFFF",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        Về trang chủ
      </Link>
    </main>
  );
}
