import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { PublicNavbar } from "@/components/layouts/users/PublicNavbar";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description:
    "Điều khoản sử dụng dịch vụ Người Lạ — quy định về quyền và nghĩa vụ của người dùng khi sử dụng nền tảng kết nối và trò chuyện trực tuyến.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Điều khoản sử dụng",
        item: `${siteUrl}/terms`,
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
          Điều khoản sử dụng
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
            1. Chấp nhận điều khoản
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Bằng việc truy cập và sử dụng nền tảng Người Lạ, bạn đồng ý tuân thủ
            các điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ điều
            khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            2. Tài khoản người dùng
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Bạn chịu trách nhiệm bảo mật thông tin tài khoản Google của mình. Mọi
            hoạt động diễn ra trong tài khoản đều do bạn chịu trách nhiệm. Bạn
            không được sử dụng tài khoản của người khác mà không có sự đồng ý.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            3. Quy tắc ứng xử
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Người dùng cam kết không đăng tải nội dung vi phạm pháp luật, xúc
            phạm, quấy rối hoặc gây khó chịu cho người khác. Chúng tôi có quyền
            khóa tài khoản nếu phát hiện vi phạm.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            4. Quyền sở hữu trí tuệ
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Tất cả nội dung, logo, thương hiệu trên nền tảng Người Lạ đều thuộc
            sở hữu của chúng tôi. Người dùng không được sao chép, sửa đổi hoặc
            phân phối mà không có sự cho phép bằng văn bản.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            5. Giới hạn trách nhiệm
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Người Lạ không chịu trách nhiệm cho các thiệt hại phát sinh từ việc
            sử dụng dịch vụ. Chúng tôi không đảm bảo dịch vụ sẽ không bị gián
            đoạn hoặc không có lỗi.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            6. Thay đổi điều khoản
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text-secondary)" }}>
            Chúng tôi có thể cập nhật điều khoản sử dụng bất kỳ lúc nào. Việc
            tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn
            chấp nhận các điều khoản mới.
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
