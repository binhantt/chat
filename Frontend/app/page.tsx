import type { Metadata } from "next";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { HomePageClient } from "@/components/home/HomePageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn | Người Lạ",
  description:
    "Chat người lạ online miễn phí — kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn. Đăng nhập bằng Google, bắt đầu chat ngay với hàng ngàn người Việt.",
  keywords: [
    "chat người lạ",
    "chat người lạ online",
    "trò chuyện với người lạ",
    "chat random Việt Nam",
    "chat ẩn danh",
    "kết bạn online",
    "trò chuyện trực tuyến",
    "kết nối người Việt",
    "chat miễn phí",
    "làm quen online",
    "tìm bạn trò chuyện",
    "chat online Việt Nam",
    "kết bạn bốn phương",
    "tán gẫu trực tuyến",
    "nhắn tin miễn phí",
    "kết nối ngẫu nhiên",
    "trò chuyện tâm sự",
    "chat private",
    "chat với người lạ online",
    "tinder Việt Nam",
  ],
  alternates: {
    canonical: "https://nguoila.online",
  },
  openGraph: {
    title: "Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn | Người Lạ",
    description:
      "Chat người lạ online miễn phí — kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn. Đăng nhập bằng Google, bắt đầu chat ngay.",
    url: "https://nguoila.online",
    siteName: "Người Lạ",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn",
    description:
      "Chat người lạ online miễn phí — kết nối nhanh, riêng tư và an toàn. Đăng nhập bằng Google và bắt đầu chat ngay.",
  },
};

export default function HomePage() {
  const siteUrl = getSiteUrl();

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cách chat với người lạ trên Người Lạ",
    description: "Hướng dẫn từng bước cách sử dụng Người Lạ để chat với người lạ trực tuyến miễn phí, an toàn và riêng tư.",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        name: "Đăng nhập",
        text: "Truy cập nguoila.online và nhấn nút 'Đăng nhập bằng Google' hoặc chọn 'Trò chuyện ẩn danh' để bắt đầu ngay.",
        url: `${siteUrl}/login`,
      },
      {
        "@type": "HowToStep",
        name: "Cập nhật hồ sơ",
        text: "Thêm tên hiển thị, giới tính và thành phố để hệ thống ghép đôi bạn với người phù hợp.",
      },
      {
        "@type": "HowToStep",
        name: "Tìm kiếm và trò chuyện",
        text: "Nhấn nút 'Tìm kiếm' để hệ thống ghép đôi ngẫu nhiên. Khi tìm thấy đối phương, nhấn 'Bắt đầu trò chuyện' để chat ngay.",
      },
    ],
    tool: [
      { "@type": "HowToTool", name: "Trình duyệt web" },
      { "@type": "HowToTool", name: "Tài khoản Google (tùy chọn)" },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={howToSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Static shell for SEO crawlers + LCP */}
      <noscript>
        <div style={{ padding: 40, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn</h1>
          <p style={{ fontSize: 16, color: "#333", lineHeight: 1.7, marginBottom: 16 }}>
            Người Lạ là nền tảng chat người lạ online miễn phí dành cho người Việt. Kết nối nhanh chóng, ghép đôi thông minh, trò chuyện ẩn danh an toàn và riêng tư.
          </p>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Cách chat với người lạ</h2>
          <ol style={{ fontSize: 15, color: "#555", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Đăng nhập bằng Google hoặc chọn trò chuyện ẩn danh</li>
            <li>Cập nhật hồ sơ: tên, giới tính, thành phố</li>
            <li>Nhấn &quot;Tìm kiếm&quot; để ghép đôi ngẫu nhiên</li>
            <li>Bắt đầu trò chuyện ngay khi tìm thấy đối phương</li>
          </ol>
          <h2 style={{ fontSize: 20, marginBottom: 8, marginTop: 24 }}>Tính năng nổi bật</h2>
          <ul style={{ fontSize: 15, color: "#555", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Chat người lạ miễn phí 100%</li>
            <li>Ghép đôi thông minh theo khu vực</li>
            <li>Trò chuyện ẩn danh, riêng tư tuyệt đối</li>
            <li>Báo cáo người dùng vi phạm</li>
            <li>Gói VIP với tính năng cao cấp</li>
          </ul>
          <p style={{ fontSize: 14, color: "#999", marginTop: 20 }}>
            Vui lòng bật JavaScript để sử dụng ứng dụng. Truy cập <a href="/login">nguoila.online/login</a> để đăng nhập.
          </p>
        </div>
      </noscript>

      {/* Client app */}
      <HomePageClient />
    </>
  );
}
