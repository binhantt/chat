import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pháp lý & Người dùng",
  description:
    "Thông tin pháp lý, quy tắc cộng đồng và hướng dẫn dành cho người dùng nền tảng Người Lạ.",
  alternates: { canonical: "/phap-ly" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "Quy tắc cộng đồng",
    content: [
      "Tôn trọng lẫn nhau: Không xúc phạm, quấy rối hoặc có hành vi thiếu văn hóa với người dùng khác.",
      "Bảo vệ thông tin cá nhân: Không yêu cầu hoặc chia sẻ thông tin nhạy cảm của người khác khi chưa được đồng ý.",
      "Nội dung phù hợp: Không đăng tải nội dung khiêu dâm, bạo lực, hoặc vi phạm pháp luật.",
      "Một tài khoản: Mỗi người chỉ được sử dụng một tài khoản duy nhất trên nền tảng.",
      "Báo cáo vi phạm: Nếu thấy hành vi không phù hợp, hãy báo cáo ngay cho đội ngũ kiểm duyệt.",
    ],
  },
  {
    title: "Quyền của người dùng",
    content: [
      "Quyền truy cập: Bạn có thể xem mọi thông tin cá nhân mà chúng tôi lưu trữ về bạn.",
      "Quyền chỉnh sửa: Bạn có thể cập nhật hồ sơ cá nhân bất cứ lúc nào trong phần cài đặt.",
      "Quyền xóa dữ liệu: Bạn có thể yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.",
      "Quyền riêng tư: Thông tin của bạn được bảo mật và không chia sẻ với bên thứ ba khi chưa có sự đồng ý.",
      "Quyền khiếu nại: Bạn có thể khiếu nại quyết định kiểm duyệt hoặc khóa tài khoản.",
    ],
  },
  {
    title: "Trách nhiệm của người dùng",
    content: [
      "Tuân thủ tất cả quy tắc cộng đồng và điều khoản sử dụng của nền tảng.",
      "Không lợi dụng nền tảng để thực hiện hành vi lừa đảo, gian lận hoặc vi phạm pháp luật.",
      "Bảo mật thông tin tài khoản Google của mình và không chia sẻ với người khác.",
      "Sử dụng ngôn ngữ lịch sự, văn minh trong mọi tương tác trên nền tảng.",
      "Thông báo cho chúng tôi nếu phát hiện lỗ hổng bảo mật hoặc hành vi đáng ngờ.",
    ],
  },
  {
    title: "Xử lý vi phạm",
    content: [
      "Cảnh cáo: Người dùng vi phạm lần đầu sẽ nhận được cảnh cáo qua email hoặc thông báo.",
      "Tạm khóa: Vi phạm nhiều lần có thể dẫn đến tạm khóa tài khoản trong 7-30 ngày.",
      "Khóa vĩnh viễn: Các vi phạm nghiêm trọng (quấy rối, lừa đảo, nội dung bất hợp pháp) sẽ bị khóa vĩnh viễn.",
      "Khiếu nại: Người dùng có quyền khiếu nại quyết định xử lý qua email support@nguoila.vn.",
    ],
  },
  {
    title: "Thông tin pháp lý",
    content: [
      "Nền tảng Người Lạ được vận hành tuân thủ theo pháp luật Việt Nam về an ninh mạng và bảo vệ dữ liệu cá nhân.",
      "Mọi thông tin cá nhân được xử lý theo Chính sách bảo mật và Điều khoản sử dụng của nền tảng.",
      "Người Lạ hợp tác với cơ quan chức năng khi có yêu cầu pháp lý hợp lệ.",
      "Dịch vụ được cung cấp \"nguyên trạng\" và chúng tôi không ngừng cải thiện để mang lại trải nghiệm tốt nhất.",
    ],
  },
];

export default function PhapLyPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pháp lý & Người dùng",
        item: `${siteUrl}/phap-ly`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Pháp lý & Người dùng
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: 15,
            color: "var(--text-secondary)",
            marginBottom: 48,
            lineHeight: 1.6,
          }}
        >
          Quy tắc, quyền lợi, trách nhiệm và thông tin pháp lý dành cho người dùng nền tảng Người Lạ.
        </p>

        {sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              {section.title}
            </h2>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {section.content.map((item, i) => (
                <li
                  key={i}
                  style={{
                    lineHeight: 1.7,
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p
          style={{
            textAlign: "center",
            marginTop: 48,
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          Cập nhật lần cuối: Tháng 7, 2026
        </p>
      </main>
    </>
  );
}
