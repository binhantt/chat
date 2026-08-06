"use client";

import { Box, Flex, Text } from "@radix-ui/themes";

export function ContactSection() {
  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="1" align="center" style={{ marginBottom: 8 }}>
        <Text size="6" weight="bold" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)" }}>
          Liên hệ với chúng tôi
        </Text>
        <Text size="2" style={{ color: "var(--chat-muted)" }}>
          Chúng tôi luôn sẵn sàng hỗ trợ bạn
        </Text>
      </Flex>

      <Flex
        direction={{ initial: "column", sm: "row" }}
        gap="4"
      >
        {/* Email */}
        <Box
          style={{
            flex: 1,
            background: "var(--chat-surface)",
            border: "1px solid var(--chat-border)",
            borderRadius: 14,
            padding: "24px 20px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--chat-accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--chat-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Flex direction="column" gap="3" align="center" style={{ textAlign: "center" }}>
            <Flex
              align="center"
              justify="center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: 12,
                color: "#FFFFFF",
                height: 48,
                width: 48,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </Flex>
            <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>
              Email
            </Text>
            <a
              href="mailto:support@nguoila.vn"
              style={{ textDecoration: "none" }}
            >
              <Text
                size="2"
                weight="medium"
                style={{
                  color: "var(--chat-accent)",
                  cursor: "pointer",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--chat-accent)"; }}
              >
                support@nguoila.vn
              </Text>
            </a>
            <Text size="1" style={{ color: "var(--chat-muted)" }}>
              Phản hồi trong 24 giờ
            </Text>
          </Flex>
        </Box>

        {/* Hotline */}
        <Box
          style={{
            flex: 1,
            background: "var(--chat-surface)",
            border: "1px solid var(--chat-border)",
            borderRadius: 14,
            padding: "24px 20px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--chat-accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--chat-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Flex direction="column" gap="3" align="center" style={{ textAlign: "center" }}>
            <Flex
              align="center"
              justify="center"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                borderRadius: 12,
                color: "#FFFFFF",
                height: 48,
                width: 48,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </Flex>
            <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>
              Hotline
            </Text>
            <a
              href="tel:19001234"
              style={{ textDecoration: "none" }}
            >
              <Text
                size="2"
                weight="medium"
                style={{
                  color: "var(--chat-accent)",
                  cursor: "pointer",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--chat-accent)"; }}
              >
                1900 1234
              </Text>
            </a>
            <Text size="1" style={{ color: "var(--chat-muted)" }}>
              Hỗ trợ 24/7
            </Text>
          </Flex>
        </Box>

        {/* Zalo */}
        <Box
          style={{
            flex: 1,
            background: "var(--chat-surface)",
            border: "1px solid var(--chat-border)",
            borderRadius: 14,
            padding: "24px 20px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--chat-accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--chat-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Flex direction="column" gap="3" align="center" style={{ textAlign: "center" }}>
            <Flex
              align="center"
              justify="center"
              style={{
                background: "linear-gradient(135deg, #0068ff, #0047b3)",
                borderRadius: 12,
                color: "#FFFFFF",
                height: 48,
                width: 48,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
            </Flex>
            <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>
              Zalo
            </Text>
            <a
              href="https://cv-binh-an.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Text
                size="2"
                weight="medium"
                style={{
                  color: "var(--chat-accent)",
                  cursor: "pointer",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--chat-accent)"; }}
              >
                Nhắn tin trên Zalo
              </Text>
            </a>
            <Text size="1" style={{ color: "var(--chat-muted)" }}>
              Chat trực tiếp
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
