import { Badge, Box, Card, Flex, Grid, Text } from "@radix-ui/themes";
import { FaqSection } from "../components/FaqSection";
import { ContactSection } from "../components/ContactSection";
import {
  ChatBubbleIcon,
  GlobeIcon,
  HeartFilledIcon,
  LockClosedIcon,
  PersonIcon,
  RocketIcon,
  StarIcon,
} from "@radix-ui/react-icons";

const features = [
  {
    title: "Kết nối nhanh",
    icon: <ChatBubbleIcon width={20} height={20} />,
  },
  {
    title: "Hồ sơ rõ ràng",
    icon: <PersonIcon width={20} height={20} />,
  },
  {
    title: "An toàn hơn",
    icon: <LockClosedIcon width={20} height={20} />,
  },
  {
    title: "Ghép đôi thông minh",
    icon: <StarIcon width={20} height={20} />,
  },
  {
    title: "Miễn phí 100%",
    icon: <HeartFilledIcon width={20} height={20} />,
  },
  {
    title: "Hỗ trợ 24/7",
    icon: <RocketIcon width={20} height={20} />,
  },
];

export function WebsiteIntroPage() {
  return (
    <Box style={{ padding: "28px clamp(16px, 2.2vw, 32px)", background: "var(--bg-primary)", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <Flex direction="column" gap="6" style={{ margin: "0 auto", maxWidth: 1100, width: "100%", flex: 1 }}>

        {/* Hero section */}
        <Box
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--secondary) 100%)",
            borderRadius: 20,
            padding: "40px 44px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <Box style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <Box style={{ position: "absolute", bottom: -40, left: "30%", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <Box style={{ position: "absolute", top: "20%", right: "20%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <Flex direction="column" gap="4" style={{ position: "relative", zIndex: 1 }}>
            <Badge
              size="3"
              style={{
                alignSelf: "flex-start",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#FFFFFF",
              }}
            >
              <GlobeIcon width={14} height={14} /> Website Người Lạ
            </Badge>

            <Text
              size="8"
              weight="bold"
              style={{
                color: "#FFFFFF",
                fontFamily: "var(--font-heading)",
                lineHeight: 1.1,
                maxWidth: 600,
              }}
            >
              Nền tảng trò chuyện trực tuyến thân thiện và an toàn.
            </Text>

            <Text
              size="3"
              style={{
                color: "rgba(255,255,255,0.75)",
                fontFamily: "var(--font-body)",
                lineHeight: 1.7,
                maxWidth: 560,
              }}
            >
              Người Lạ giúp người dùng kết nối, trò chuyện, quản lý hồ sơ và báo cáo nội dung
              trong một không gian gọn gàng, riêng tư và an toàn.
            </Text>

            {/* Stats row */}
            <Flex gap="5" mt="2">
              {[
                { value: "5+", label: "Tính năng" },
                { value: "1k+", label: "Người dùng" },
                { value: "Beta", label: "Trạng thái" },
              ].map((s) => (
                <Box key={s.label}>
                  <Text size="5" weight="bold" style={{ color: "#FFFFFF", lineHeight: 1 }}>
                    {s.value}
                  </Text>
                  <Text size="2" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {s.label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Flex>
        </Box>

        {/* Feature grid */}
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {features.map((f) => (
            <Card
              key={f.title}
              size="1"
              variant="surface"
              style={{
                background: "var(--chat-surface)",
                border: "1px solid var(--chat-border)",
                borderRadius: 14,
              }}
            >
              <Flex align="center" gap="3">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                    borderRadius: 10,
                    color: "#FFFFFF",
                    flexShrink: 0,
                    height: 40,
                    width: 40,
                  }}
                >
                  {f.icon}
                </Flex>
                <Text size="3" weight="bold" style={{ color: "var(--chat-text)" }}>
                  {f.title}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>

        {/* FAQ Section */}
        <FaqSection />

        {/* Contact Section */}
        <ContactSection />
      </Flex>

      {/* Professional Footer */}
      <Box
        style={{
          marginTop: 48,
          padding: "32px 0 24px",
          borderTop: "1px solid var(--chat-border)",
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}
        >
          {/* Logo & Name */}
          <Flex align="center" gap="3">
            <Flex
              align="center"
              justify="center"
              style={{
                background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                borderRadius: 10,
                color: "#FFFFFF",
                height: 36,
                width: 36,
              }}
            >
              <ChatBubbleIcon width={18} height={18} />
            </Flex>
            <Text size="4" weight="bold" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)" }}>
              Người Lạ
            </Text>
          </Flex>

          {/* Contact Info */}
          <Flex align="center" gap="4" wrap="wrap" justify="center">
            <a
              href="mailto:support@nguoila.vn"
              style={{ textDecoration: "none" }}
            >
              <Flex
                align="center"
                gap="2"
                px="4"
                py="2"
                style={{
                  background: "var(--chat-accent-soft)",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; e.currentTarget.style.color = "inherit"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <Text size="2" weight="medium">support@nguoila.vn</Text>
              </Flex>
            </a>
            <a
              href="tel:19001234"
              style={{ textDecoration: "none" }}
            >
              <Flex
                align="center"
                gap="2"
                px="4"
                py="2"
                style={{
                  background: "var(--chat-accent-soft)",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; e.currentTarget.style.color = "inherit"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <Text size="2" weight="medium">1900 1234</Text>
              </Flex>
            </a>
          </Flex>

          {/* Copyright */}
          <Flex
            align="center"
            justify="center"
            gap="2"
            style={{
              paddingTop: 16,
              borderTop: "1px solid var(--chat-border)",
              width: "100%",
            }}
          >
            <Text size="1" style={{ color: "var(--chat-muted)" }}>
              © 2026 Người Lạ. Bảo lưu mọi quyền.
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
