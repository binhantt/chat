import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Về Người Lạ - Nền Tảng Chat Người Lạ Online",
  description:
    "Tìm hiểu về Người Lạ — nền tảng chat người lạ online miễn phí dành cho người Việt. Kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn và riêng tư.",
  keywords: [
    "chat người lạ",
    "chat người lạ online",
    "về Người Lạ",
    "nền tảng chat Việt Nam",
    "trò chuyện trực tuyến",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Về Người Lạ - Nền Tảng Chat Người Lạ Online",
    description:
      "Tìm hiểu về Người Lạ — nền tảng chat người lạ online miễn phí dành cho người Việt.",
    url: "/about",
  },
};

export default function AboutPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Về Người Lạ",
        item: `${siteUrl}/about`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <header style={{ textAlign: "center", padding: "40px 24px 0" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Về Người Lạ
        </h1>
      </header>
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Sứ mệnh của chúng tôi
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 16, color: "var(--text-secondary)" }}>
            Người Lạ được tạo ra với sứ mệnh kết nối mọi người Việt Nam lại gần
            nhau hơn thông qua các cuộc trò chuyện trực tuyến ý nghĩa. Chúng tôi
            tin rằng mỗi cuộc trò chuyện đều có thể mở ra những cơ hội kết nối
            mới.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Giá trị cốt lõi
          </h2>
          <ul
            style={{
              lineHeight: 1.8,
              fontSize: 16,
              color: "var(--text-secondary)",
              paddingLeft: 20,
            }}
          >
            <li>
              <strong>An toàn:</strong> Bảo vệ thông tin và trải nghiệm của
              người dùng là ưu tiên hàng đầu.
            </li>
            <li>
              <strong>Riêng tư:</strong> Tôn trọng quyền riêng tư và kiểm soát dữ
              liệu cá nhân.
            </li>
            <li>
              <strong>Kết nối:</strong> Tạo điều kiện để mọi người dễ dàng tìm
              thấy nhau.
            </li>
            <li>
              <strong>Cộng đồng:</strong> Xây dựng một cộng đồng trực tuyến lành
              mạnh và thân thiện.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Câu chuyện của chúng tôi
          </h2>
          <p style={{ lineHeight: 1.7, fontSize: 16, color: "var(--text-secondary)" }}>
            Người Lạ ra đời từ ý tưởng về một nền tảng kết nối đơn giản nhưng
            hiệu quả dành riêng cho người Việt. Chúng tôi nhận thấy nhu cầu kết
            nối trực tuyến ngày càng tăng, nhưng các nền tảng hiện có chưa thực
            sự đáp ứng được nhu cầu về sự an toàn và thân thiện. Từ đó, Người Lạ
            được xây dựng với trọng tâm là trải nghiệm người dùng và sự an toàn.
          </p>
        </section>
      </main>
    </>
  );
}
