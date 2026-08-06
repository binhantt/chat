"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        top: -40,
        left: 0,
        background: "var(--primary, #4B2E83)",
        color: "#fff",
        padding: "8px 16px",
        zIndex: 100,
        fontWeight: 600,
        fontSize: 14,
        textDecoration: "none",
        borderRadius: "0 0 8px 0",
      }}
      onFocus={(e) => { e.currentTarget.style.top = "0"; }}
      onBlur={(e) => { e.currentTarget.style.top = "-40px"; }}
    >
      Chuyển đến nội dung chính
    </a>
  );
}
