import "@radix-ui/themes/styles.css";
import "@/app/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";
import { Roboto, Poppins } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { getSiteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";

const bodyFont = Roboto({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

const headingFont = Poppins({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = new URL(getSiteUrl());
const logoPath = "/nguoi-la-logo.svg";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Người Lạ",
  title: {
    default: "Người Lạ - Kết nối và trò chuyện trực tuyến",
    template: "%s | Người Lạ",
  },
  description:
    "Người Lạ là nền tảng kết nối và trò chuyện trực tuyến số 1 dành cho người Việt — kết nối nhanh, hồ sơ rõ ràng, ghép đôi thông minh, riêng tư và an toàn. Hỗ trợ báo cáo nội dung không phù hợp, quản lý hồ sơ, gói VIP và trò chuyện ẩn danh. Miễn phí 100%, đăng nhập bằng Google.",
  other: {
    "google-site-verification": "4fFkqdCP5Ywwwyo_b7LjG2bENj8DpmfU3u6-8ekbsw0",
    "fb:app_id": "nguoilaonline",
    "msvalidate.01": "",
  },
  keywords: [
    "Người Lạ",
    "trò chuyện trực tuyến",
    "kết nối bạn bè",
    "chat online Việt Nam",
    "kết nối nhanh",
    "trò chuyện an toàn",
    "ghép đôi thông minh",
    "báo cáo người dùng",
    "ứng dụng trò chuyện Việt Nam",
    "mạng xã hội Việt Nam",
    "trò chuyện với người lạ",
    "kết bạn online",
    "tìm bạn trò chuyện",
    "chat ẩn danh",
    "kết nối người Việt",
  ],
  authors: [{ name: "Người Lạ" }],
  creator: "Người Lạ",
  publisher: "Người Lạ",
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
    },
  },
  icons: {
    apple: logoPath,
    icon: logoPath,
    shortcut: logoPath,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Người Lạ",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    images: [
      {
        alt: "Người Lạ - Kết nối và trò chuyện trực tuyến",
        url: "/opengraph-image",
        width: 1200,
        height: 630,
      },
    ],
    siteName: "Người Lạ",
    title: "Người Lạ - Kết nối và trò chuyện trực tuyến",
    description:
      "Người Lạ là nền tảng trò chuyện trực tuyến thân thiện và an toàn dành cho người Việt. Kết nối nhanh, hồ sơ rõ ràng, ghép đôi thông minh, miễn phí 100%. Đăng nhập bằng Google, cập nhật hồ sơ, tìm người phù hợp và bắt đầu trò chuyện ngay.",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "Người Lạ - Kết nối và trò chuyện trực tuyến",
    description:
      "Nền tảng trò chuyện trực tuyến cho người Việt — kết nối nhanh, hồ sơ rõ ràng, ghép đôi thông minh, riêng tư và an toàn. Đăng nhập bằng Google và bắt đầu ngay.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "mạng xã hội",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4B2E83",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl.origin}/#organization`,
        name: "Người Lạ",
        url: siteUrl.origin,
        logo: `${siteUrl.origin}/nguoi-la-logo.svg`,
        image: `${siteUrl.origin}/opengraph-image`,
        description:
          "Nền tảng kết nối và trò chuyện trực tuyến dành cho người Việt.",
        sameAs: [],
        foundingDate: "2025",
        areaServed: "VN",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["Vietnamese", "English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl.origin}/#website`,
        url: siteUrl.origin,
        name: "Người Lạ",
        description:
          "Kết nối, trò chuyện và quản lý trải nghiệm trực tuyến trong không gian gọn gàng, riêng tư và an toàn.",
        publisher: { "@id": `${siteUrl.origin}/#organization` },
        inLanguage: "vi-VN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl.origin}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl.origin}/#webapp`,
        url: siteUrl.origin,
        name: "Người Lạ",
        description:
          "Trò chuyện trực tuyến với người lạ một cách an toàn và riêng tư.",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        applicationCategory: "SocialNetworking",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "VND",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl.origin}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl.origin,
          },
        ],
      },
    ],
  };

  return (
    <html lang="vi" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body style={{ margin: 0 }}>
        <JsonLd data={jsonLd} />
        <Providers>
          <Theme
            accentColor="violet"
            panelBackground="solid"
            radius="small"
            scaling="105%"
            appearance="inherit"
          >
            {children}
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
