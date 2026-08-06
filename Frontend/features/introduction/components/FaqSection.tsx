"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";

const faqs = [
  {
    q: "Người Lạ là gì?",
    a: "Người Lạ là nền tảng trò chuyện trực tuyến giúp bạn kết nối với những người xa lạ một cách nhanh chóng, an toàn và riêng tư. Bạn có thể tìm người phù hợp để trò chuyện mà không cần lo lắng về vấn đề bảo mật.",
  },
  {
    q: "Làm sao để đăng ký tài khoản?",
    a: "Bạn chỉ cần đăng nhập bằng tài khoản Google hiện có. Không cần tạo mật khẩu phức tạp hay điền thông tin dài dòng. Chỉ cần một cú click là bạn đã có tài khoản.",
  },
  {
    q: "Người Lạ có miễn phí không?",
    a: "Có, Người Lạ hoàn toàn miễn phí cho tất cả người dùng. Bạn có thể trò chuyện, kết nối và sử dụng tất cả tính năng cơ bản mà không tốn bất kỳ chi phí nào.",
  },
  {
    q: "Làm sao để tìm người trò chuyện?",
    a: "Sau khi đăng nhập và cập nhật hồ sơ (giới tính, thành phố), hãy bấm \"Tìm kiếm\" trên trang chủ. Hệ thống sẽ tự động ghép đôi bạn với người đang sẵn sàng trò chuyện.",
  },
  {
    q: "Tôi cần cung cấp thông tin gì?",
    a: "Bạn chỉ cần cập nhật giới tính và thành phố để có thể tìm kiếm. Các thông tin khác như họ tên, ảnh đại diện, tiểu sử là tùy chọn nhưng sẽ giúp bạn có trải nghiệm tốt hơn.",
  },
  {
    q: "Làm sao nếu gặp người không phù hợp?",
    a: "Bạn có thể kết thúc cuộc trò chuyện bất kỳ lúc nào bằng cách bấm nút \"Kết thúc\". Ngoài ra, nếu gặp nội dung vi phạm, bạn có thể sử dụng chức năng \"Báo cáo\" để thông báo cho quản trị viên.",
  },
  {
    q: "Thông tin cá nhân có được bảo mật?",
    a: "Có, chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Các cuộc trò chuyện được mã hóa, thông tin chỉ hiển thị khi bạn đồng ý, và bạn có quyền xóa tài khoản bất kỳ lúc nào.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="1" align="center" style={{ marginBottom: 8 }}>
        <Text size="6" weight="bold" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)" }}>
          Câu hỏi thường gặp
        </Text>
        <Text size="2" style={{ color: "var(--chat-muted)" }}>
          Giải đáp thắc mắc phổ biến về Người Lạ
        </Text>
      </Flex>

      <Flex direction="column" gap="2">
        {faqs.map((faq, i) => (
          <Box
            key={i}
            style={{
              background: "var(--chat-surface)",
              border: "1px solid var(--chat-border)",
              borderRadius: 12,
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "16px 18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Text
                size="3"
                weight="medium"
                style={{ color: "var(--chat-text)", flex: 1, paddingRight: 12 }}
              >
                {faq.q}
              </Text>
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: openIndex === i ? "var(--chat-accent)" : "var(--chat-accent-soft)",
                  color: openIndex === i ? "#FFFFFF" : "var(--chat-accent)",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ChevronDownIcon width={16} height={16} />
              </Flex>
            </button>
            <Box
              style={{
                maxHeight: openIndex === i ? 200 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <Box
                style={{
                  padding: "0 18px 16px",
                  borderTop: openIndex === i ? "1px solid var(--chat-border)" : "none",
                }}
              >
                <Text
                  size="2"
                  style={{
                    color: "var(--chat-muted)",
                    lineHeight: 1.7,
                    paddingTop: 12,
                    display: "block",
                  }}
                >
                  {faq.a}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
