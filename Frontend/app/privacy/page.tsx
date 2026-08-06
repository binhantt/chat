import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { PublicNavbar } from "@/components/layouts/users/PublicNavbar";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo mật của Người Lạ — cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn trên nền tảng kết nối trực tuyến.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Chính sách bảo mật",
        item: `${siteUrl}/privacy`,
      },
    ],
  };

  return (
    <>
      <PublicNavbar />
      <JsonLd data={breadcrumbSchema} />
      <header style={{ textAlign: "center", padding: "32px 16px 0", maxWidth: 720, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          Chính sách bảo mật
        </h1>
      </header>
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 16px 60px",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            1. Thông tin chúng tôi thu thập
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Khi bạn sử dụng Người Lạ, chúng tôi có thể thu thập: tên, email (từ
            tài khoản Google), ảnh đại diện, giới tính, sở thích và các thông tin
            khác bạn tự nguyện cung cấp trong hồ sơ. Chúng tôi cũng thu thập dữ
            liệu về cách bạn tương tác với nền tảng để cải thiện trải nghiệm.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            2. Cách chúng tôi sử dụng thông tin
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Thông tin của bạn được sử dụng để: tạo và quản lý tài khoản, ghép đôi
            với người phù hợp, cải thiện thuật toán gợi ý, gửi thông báo liên
            quan đến dịch vụ và xử lý báo cáo vi phạm.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            3. Chia sẻ thông tin
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba. Thông
            tin chỉ được chia sẻ khi: có sự đồng ý của bạn, tuân thủ yêu cầu pháp
            lý, hoặc bảo vệ quyền lợi hợp pháp của nền tảng.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            4. Bảo mật dữ liệu
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn để bảo vệ thông
            tin của bạn khỏi truy cập trái phép, sửa đổi hoặc tiết lộ. Dữ liệu
            được mã hóa trong quá trình truyền tải và lưu trữ.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            5. Quyền của bạn
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bất cứ
            lúc nào trong phần cài đặt tài khoản. Bạn cũng có thể yêu cầu chúng
            tôi xuất dữ liệu hoặc xóa tài khoản vĩnh viễn.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            6. Cookie
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Chúng tôi sử dụng cookie và công nghệ tương tự để duy trì phiên đăng
            nhập, phân tích lưu lượng truy cập và cải thiện trải nghiệm người
            dùng. Bạn có thể tùy chỉnh cài đặt cookie trong trình duyệt.
          </p>
        </section>

        <p
          style={{
            textAlign: "center",
            marginTop: 48,
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          Cập nhật lần cuối: Tháng 7, 2025
        </p>
      </main>
    </>
  );
}
