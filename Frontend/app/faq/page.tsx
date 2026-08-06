import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { PublicNavbar } from "@/components/layouts/users/PublicNavbar";

export const metadata: Metadata = {
  title: "Câu Hỏi Thường Gặp - Chat Người Lạ Online | Người Lạ",
  description:
    "Giải đáp câu hỏi thường gặp về chat người lạ online — cách đăng nhập, trò chuyện, bảo mật, báo cáo vi phạm, gói VIP. Chat miễn phí an toàn trên Người Lạ.",
  keywords: [
    "chat người lạ",
    "chat người lạ online",
    "cách chat với người lạ",
    "trò chuyện với người lạ",
    "chat random Việt Nam",
    "FAQ Người Lạ",
    "cách đăng nhập Người Lạ",
    "chat ẩn danh",
    "bảo mật chat",
  ],
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Câu Hỏi Thường Gặp - Chat Người Lạ Online | Người Lạ",
    description:
      "Giải đáp câu hỏi thường gặp về chat người lạ online — cách đăng nhập, trò chuyện, bảo mật và gói VIP.",
    url: "/faq",
  },
};

const faqItems = [
  {
    question: "Chat người lạ online là gì?",
    answer:
      "Chat người lạ online là hình thức kết nối và trò chuyện trực tuyến với những người không quen biết. Trên Người Lạ, bạn có thể chat người lạ miễn phí, ghép đôi ngẫu nhiên và bắt đầu trò chuyện ngay lập tức. Hệ thống ghép đôi thông minh giúp bạn tìm được người phù hợp.",
  },
  {
    question: "Làm thế nào để chat với người lạ trên Người Lạ?",
    answer:
      "Để chat với người lạ, bạn chỉ cần truy cập nguoila.online, đăng nhập bằng Google hoặc chọn trò chuyện ẩn danh. Sau đó cập nhật hồ sơ (tên, giới tính, thành phố) và nhấn nút 'Tìm kiếm'. Hệ thống sẽ ghép bạn với người phù hợp để bắt đầu chat ngay.",
  },
  {
    question: "Chat người lạ trên Người Lạ có miễn phí không?",
    answer:
      "Có, chat người lạ trên Người Lạ hoàn toàn miễn phí. Bạn có thể đăng nhập, tạo hồ sơ, ghép đôi và trò chuyện không giới hạn. Ngoài ra còn có gói VIP với các tính năng cao cấp như ưu tiên ghép đôi, biểu tượng độc quyền.",
  },
  {
    question: "Chat người lạ có an toàn không?",
    answer:
      "Người Lạ đặt an toàn lên hàng đầu. Thông tin cá nhân được bảo vệ, bạn có thể trò chuyện ẩn danh, và hệ thống hỗ trợ báo cáo người dùng vi phạm. Đội ngũ quản trị viên luôn sẵn sàng xử lý các báo cáo để đảm bảo môi trường chat an toàn.",
  },
  {
    question: "Làm thế nào để bắt đầu trò chuyện?",
    answer:
      "Sau khi đăng nhập, bạn cập nhật hồ sơ của mình (tên, giới tính, sở thích). Hệ thống sẽ ghép bạn với những người phù hợp. Bạn có thể nhấn 'Tìm kiếm' để bắt đầu ghép đôi và chat ngay lập tức.",
  },
  {
    question: "Chat ẩn danh hoạt động như thế nào?",
    answer:
      "Khi chọn trò chuyện ẩn danh, bạn không cần đăng nhập bằng Google. Hệ thống sẽ tự động tạo tài khoản khách với tên ngẫu nhiên. Bạn có thể chat ngay mà không cần cung cấp thông tin cá nhân. Tuy nhiên, tài khoản khách sẽ bị xóa sau khi đăng xuất.",
  },
  {
    question: "Tôi có thể chat với nhiều người cùng lúc không?",
    answer:
      "Hiện tại, Người Lạ cho phép bạn chat 1-1 với một người tại một thời điểm. Điều này giúp đảm bảo trải nghiệm trò chuyện tập trung và chất lượng. Bạn có thể kết thúc cuộc trò chuyện hiện tại và tìm người mới bất cứ lúc nào.",
  },
  {
    question: "Làm thế nào để báo cáo người dùng vi phạm?",
    answer:
      "Nếu gặp người dùng có hành vi không phù hợp khi chat, hãy sử dụng tính năng báo cáo trong cuộc trò chuyện. Đội ngũ quản trị viên sẽ xem xét và xử lý nhanh chóng để bảo vệ cộng đồng chat người lạ.",
  },
  {
    question: "Gói VIP có những lợi ích gì khi chat?",
    answer:
      "Gói VIP mang đến nhiều tính năng đặc biệt: ưu tiên ghép đôi khi chat, xem ai đã thích hồ sơ, không giới hạn lượt trò chuyện, biểu tượng VIP độc quyền và nhiều lợi ích khác giúp trải nghiệm chat tốt hơn.",
  },
  {
    question: "Tôi có thể xóa tài khoản và dữ liệu chat không?",
    answer:
      "Có, bạn có thể xóa tài khoản bất cứ lúc nào trong phần cài đặt. Tất cả dữ liệu chat và thông tin cá nhân sẽ được xóa vĩnh viễn khỏi hệ thống. Đối với tài khoản khách, dữ liệu tự động xóa khi đăng xuất.",
  },
];

export default function FaqPage() {
  const siteUrl = getSiteUrl();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${siteUrl}/faq` },
    ],
  };

  return (
    <>
      <PublicNavbar />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <header style={{ textAlign: "center", padding: "32px 16px 0", maxWidth: 800, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Câu hỏi thường gặp
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 48,
            fontSize: 16,
          }}
        >
          Những câu hỏi phổ biến về Người Lạ
        </p>
      </header>
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 16px 60px",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {faqItems.map((item, index) => (
            <details
              key={index}
              style={{
                border: "1px solid var(--border-color, #e0e0e0)",
                borderRadius: 12,
                padding: "16px 20px",
                cursor: "pointer",
                background: "var(--card-bg, #fff)",
              }}
            >
              <summary
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  outline: "none",
                }}
              >
                {item.question}
              </summary>
              <p
                style={{
                  marginTop: 12,
                  color: "var(--text-secondary, #666)",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
