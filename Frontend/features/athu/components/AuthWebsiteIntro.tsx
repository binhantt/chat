"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  HeartFilledIcon,
  LockClosedIcon,
  PersonIcon,
  StarIcon,
  ExclamationTriangleIcon,
  GlobeIcon,
  InstagramLogoIcon,
  TwitterLogoIcon,
  GitHubLogoIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

const sections = [
  {
    icon: ChatBubbleIcon,
    title: "Trò chuyện trực tuyến",
    items: [
      "Kết nối với những người dùng khác trong thời gian thực.",
      "Phòng chat riêng tư, chỉ bạn và người được ghép mới có thể thấy.",
      "Hỗ trợ gửi tin nhắn văn bản nhanh chóng và ổn định.",
    ],
  },
  {
    icon: HeartFilledIcon,
    title: "Ghép đôi thông minh",
    items: [
      "Hệ thống tự động tìm người phù hợp dựa trên sở thích và hồ sơ.",
      "Chỉ một cú nhấp chuột để bắt đầu trò chuyện với người mới.",
      "Tính năng tìm kiếm nâng cao giúp bạn kết nối đúng người.",
    ],
  },
  {
    icon: LockClosedIcon,
    title: "An toàn và bảo mật",
    items: [
      "Xác thực qua Google để bảo vệ tài khoản an toàn tuyệt đối.",
      "Hệ thống báo cáo và kiểm duyệt nội dung mạnh mẽ.",
      "Kiểm soát quyền riêng tư: ẩn thông tin cá nhân khi cần.",
    ],
  },
  {
    icon: PersonIcon,
    title: "Hồ sơ cá nhân",
    items: [
      "Tạo và quản lý hồ sơ với ảnh đại diện, tiểu sử và sở thích.",
      "Đồng bộ thông tin từ tài khoản Google một cách nhanh chóng.",
      "Cập nhật thông tin mọi lúc mọi nơi.",
    ],
  },
  {
    icon: StarIcon,
    title: "Gói VIP",
    items: [
      "Trải nghiệm cao cấp với nhiều tính năng độc quyền.",
      "Ưu tiên ghép đôi, nhìn thấy ai đã thích bạn.",
      "Không quảng cáo và hỗ trợ khách hàng ưu tiên.",
    ],
  },
  {
    icon: ExclamationTriangleIcon,
    title: "Báo cáo và kiểm duyệt",
    items: [
      "Báo cáo người dùng hoặc nội dung không phù hợp dễ dàng.",
      "Đội ngũ kiểm duyệt xử lý nhanh chóng và công bằng.",
      "Quy tắc ứng xử rõ ràng, giúp duy trì cộng đồng lành mạnh.",
    ],
  },
];

export function AuthWebsiteIntro() {
  return (
    <Box
      style={{
        background: "var(--auth-bg)",
        borderTop: "1px solid var(--auth-line)",
        padding: "40px 16px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Box
        style={{
          marginInline: "auto",
          maxWidth: 1100,
          width: "100%",
        }}
      >
        {/* Section header */}
        <Flex direction="column" gap="3" mb="9" style={{ textAlign: "center" }}>
          <Flex align="center" justify="center" gap="2">
            <GlobeIcon width={20} height={20} style={{ color: "var(--auth-control)" }} />
            <Text
              size="2"
              weight="bold"
              style={{
                color: "var(--auth-control)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Giới thiệu
            </Text>
          </Flex>
          <Text
            as="p"
            size="7"
            weight="bold"
            style={{
              color: "var(--auth-text)",
              fontFamily: "var(--font-heading)",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Người Lạ là gì?
          </Text>
          <Text
            as="p"
            size="3"
            style={{
              color: "var(--auth-muted)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.7,
              margin: "0 auto",
              maxWidth: 600,
            }}
          >
            Người Lạ là nền tảng kết nối và trò chuyện trực tuyến, nơi bạn có thể gặp gỡ
            những người mới, xây dựng mối quan hệ và chia sẻ câu chuyện của mình
            trong một không gian an toàn, riêng tư và thân thiện.
          </Text>
        </Flex>

        {/* Feature sections grid */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {sections.map(({ icon: Icon, title, items }) => (
            <Box
              key={title}
              style={{
                background: "var(--auth-panel)",
                border: "1px solid var(--auth-line)",
                borderRadius: 16,
                padding: 24,
              }}
            >
              <Flex align="center" gap="3" mb="4">
                <Box
                  style={{
                    alignItems: "center",
                    background: "var(--auth-soft-control)",
                    borderRadius: 10,
                    color: "var(--auth-control)",
                    display: "flex",
                    height: 36,
                    justifyContent: "center",
                    width: 36,
                    flexShrink: 0,
                  }}
                >
                  <Icon width={18} height={18} />
                </Box>
                <Text
                  size="3"
                  weight="bold"
                  style={{
                    color: "var(--auth-text)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {title}
                </Text>
              </Flex>
              <Flex direction="column" gap="2">
                {items.map((item, i) => (
                  <Flex key={i} align="start" gap="2">
                    <Text
                      size="1"
                      style={{
                        color: "var(--auth-control)",
                        marginTop: 3,
                        flexShrink: 0,
                      }}
                    >
                      ◆
                    </Text>
                    <Text
                      size="2"
                      style={{
                        color: "var(--auth-muted)",
                        fontFamily: "var(--font-body)",
                        lineHeight: 1.6,
                      }}
                    >
                      {item}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box
          mt="9"
          pt="7"
          style={{
            borderTop: "1px solid var(--auth-line)",
          }}
        >
          <Flex
            justify="between"
            gap="8"
            wrap="wrap"
            style={{ width: "100%" }}
          >
            {/* Brand column */}
            <Flex direction="column" gap="3" style={{ minWidth: 200, flex: 1 }}>
              <Flex align="center" gap="2">
                <Box
                  style={{
                    borderRadius: 8,
                    flexShrink: 0,
                    height: 36,
                    overflow: "hidden",
                    position: "relative",
                    width: 44,
                  }}
                >
                  <img
                    alt="Người Lạ"
                    src="/nguoi-la-logo.svg"
                    style={{ height: "100%", width: "100%", objectFit: "contain", padding: 4 }}
                  />
                </Box>
                <Text
                  size="3"
                  weight="bold"
                  style={{ color: "var(--auth-text)", fontFamily: "var(--font-heading)" }}
                >
                  Người Lạ
                </Text>
              </Flex>
              <Text
                size="2"
                style={{ color: "var(--auth-muted)", lineHeight: 1.6, maxWidth: 280 }}
              >
                Nền tảng kết nối và trò chuyện trực tuyến dành cho người Việt —
                kết nối nhanh, hồ sơ rõ ràng, ghép đôi thông minh, riêng tư và an toàn.
              </Text>
              <Flex gap="2">
                {[InstagramLogoIcon, TwitterLogoIcon, GitHubLogoIcon].map((Icon, i) => (
                  <Flex
                    key={i}
                    align="center"
                    justify="center"
                    style={{
                      background: "var(--auth-soft-control)",
                      borderRadius: 8,
                      color: "var(--auth-control)",
                      cursor: "pointer",
                      height: 32,
                      width: 32,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--auth-control)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--auth-soft-control)";
                      e.currentTarget.style.color = "var(--auth-control)";
                    }}
                  >
                    <Icon width={16} height={16} />
                  </Flex>
                ))}
              </Flex>
            </Flex>

            {/* Links columns */}
            <Flex gap="8" wrap="wrap">
              <Flex direction="column" gap="2" style={{ minWidth: 120 }}>
                <Text
                  size="2"
                  weight="bold"
                  style={{ color: "var(--auth-text)", fontFamily: "var(--font-heading)", marginBottom: 4 }}
                >
                  Sản phẩm
                </Text>
                {[
                  { label: "Giới thiệu sản phẩm", href: "/" },
                  { label: "Trò chuyện", href: "/" },
                  { label: "Ghép đôi", href: "/" },
                  { label: "Hồ sơ cá nhân", href: "/" },
                  { label: "Gói VIP", href: "/" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{
                      color: "var(--auth-muted)",
                      fontSize: 13,
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--auth-control)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--auth-muted)"; }}
                  >
                    {label}
                  </Link>
                ))}
              </Flex>

              <Flex direction="column" gap="2" style={{ minWidth: 120 }}>
                <Text
                  size="2"
                  weight="bold"
                  style={{ color: "var(--auth-text)", fontFamily: "var(--font-heading)", marginBottom: 4 }}
                >
                  Hỗ trợ
                </Text>
                {[
                  { label: "Trung tâm trợ giúp", href: "/faq" },
                  { label: "Liên hệ", href: "/" },
                  { label: "Báo cáo lỗi", href: "/" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{
                      color: "var(--auth-muted)",
                      fontSize: 13,
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--auth-control)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--auth-muted)"; }}
                  >
                    {label}
                  </Link>
                ))}
                {/* Zalo contact */}
                <a
                  href="https://zalo.me/0329104253"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--auth-muted)",
                    fontSize: 13,
                    textDecoration: "none",
                    transition: "color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--auth-control)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--auth-muted)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                  </svg>
                  Nhắn Zalo
                </a>
              </Flex>

              <Flex direction="column" gap="2" style={{ minWidth: 120 }}>
                <Text
                  size="2"
                  weight="bold"
                  style={{ color: "var(--auth-text)", fontFamily: "var(--font-heading)", marginBottom: 4 }}
                >
                  Pháp lý
                </Text>
                {[
                  { label: "Điều khoản sử dụng", href: "/terms" },
                  { label: "Chính sách bảo mật", href: "/privacy" },
                  { label: "Quy tắc cộng đồng", href: "/phap-ly" },
                  { label: "Người dùng", href: "/phap-ly" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{
                      color: "var(--auth-muted)",
                      fontSize: 13,
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--auth-control)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--auth-muted)"; }}
                  >
                    {label}
                  </Link>
                ))}
              </Flex>
            </Flex>
          </Flex>

          {/* Bottom bar */}
          <Flex
            align="center"
            justify="between"
            wrap="wrap"
            gap="3"
            mt="7"
            pt="5"
            style={{ borderTop: "1px solid var(--auth-line)" }}
          >
            <Text
              size="1"
              style={{ color: "var(--auth-muted)", fontFamily: "var(--font-body)" }}
            >
              &copy; {new Date().getFullYear()} Người Lạ. Bảo lưu mọi quyền.
            </Text>
            <Flex align="center" gap="3">
              <Flex
                align="center"
                gap="2"
                px="3"
                py="2"
                style={{
                  background: "var(--auth-soft-control)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--auth-control)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--auth-soft-control)"; e.currentTarget.style.color = "inherit"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <Text size="1">support@nguoila.vn</Text>
              </Flex>
              <Flex
                align="center"
                gap="2"
                px="3"
                py="2"
                style={{
                  background: "var(--auth-soft-control)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--auth-control)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--auth-soft-control)"; e.currentTarget.style.color = "inherit"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <Text size="1">1900 1234</Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
