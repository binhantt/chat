import { ImageResponse } from "next/og";
import { getSiteUrl } from "@/lib/site";

export const alt = "Chat Người Lạ Online - Kết nối trò chuyện an toàn | Người Lạ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const siteUrl = getSiteUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1A1228 0%, #2D1B4E 50%, #4B2E83 100%)",
          padding: 0,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: "20%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "10%",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "48px 56px",
            position: "relative",
            zIndex: 1,
            gap: 32,
          }}
        >
          {/* Left column: branding + desc */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.4,
              justifyContent: "center",
            }}
          >
            {/* Logo + name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.12)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C084FC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                Chat Người Lạ
              </span>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
                marginBottom: 12,
              }}
            >
              Chat người lạ online miễn phí — an toàn và riêng tư
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
                maxWidth: 500,
                marginBottom: 24,
              }}
            >
              Kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh. Dành cho người Việt, miễn phí 100%.
            </div>

            {/* Feature badges */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                "Chat người lạ",
                "Kết nối nhanh",
                "Ẩn danh",
                "Ghép đôi thông minh",
                "Miễn phí 100%",
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: stats + steps */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              gap: 16,
              paddingLeft: 16,
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Stats */}
            <div style={{ display: "flex", gap: 28 }}>
              {[
                { value: "5+", label: "Tính năng" },
                { value: "1k+", label: "Người dùng" },
                { value: "Beta", label: "Trạng thái" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#C084FC" }}>
                    {s.value}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "1. Đăng nhập bằng Google",
                "2. Cập nhật hồ sơ cá nhân",
                "3. Tìm người phù hợp và trò chuyện",
              ].map((step) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 56px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
            {siteUrl.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
