import "@radix-ui/themes/styles.css";
import "@/app/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";
import { Roboto, Poppins } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { getSiteUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { SkipLink } from "@/components/seo/SkipLink";

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
const logoPath = "/nguoi-la-logo.png";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Người Lạ",
  title: {
    default: "Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn | Người Lạ",
    template: "%s | Người Lạ",
  },
  description:
    "Chat người lạ online miễn phí — kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn. Đăng nhập bằng Google, bắt đầu chat ngay với hàng ngàn người Việt trên Người Lạ.",
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
    "nhắn tin miễn phí",
    "chat với người lạ",
    "tán gẫu trực tuyến",
    "kết bạn bốn phương",
    "tìm bạn chat",
    "trò chuyện tâm sự",
    "chat random Việt Nam",
    "làm quen online",
    "kết nối cộng đồng",
    "nhắn tin nhanh",
    "chat nhóm trực tuyến",
    "giao lưu bạn bè",
    "tìm kiếm bạn bè",
    "kết bạn tâm giao",
    "trò chuyện mọi lúc mọi nơi",
    "chat với người lạ online",
    "trò chuyện cùng người lạ",
    "kết bạn với người lạ",
    "tìm người trò chuyện",
    "chat random",
    "tán gẫu với người lạ",
    "làm quen với người lạ",
    "kết nối ngẫu nhiên",
    "chat riêng tư",
    "trò chuyện ẩn danh",
    "tìm bạn tâm sự",
    "kết bạn nói chuyện",
    "chat miễn phí Việt Nam",
    "ứng dụng kết bạn",
    "tinder Việt Nam",
    "bumble Việt Nam",
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
        alt: "Chat Người Lạ Online - Kết nối trò chuyện an toàn",
        url: "/opengraph-image",
        width: 1200,
        height: 630,
      },
    ],
    siteName: "Người Lạ",
    title: "Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn | Người Lạ",
    description:
      "Chat người lạ online miễn phí — kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn. Đăng nhập bằng Google, bắt đầu chat ngay.",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    title: "Chat Người Lạ Online - Kết Nối Trò Chuyện An Toàn",
    description:
      "Chat người lạ online miễn phí — kết nối nhanh, riêng tư và an toàn. Đăng nhập bằng Google và bắt đầu chat ngay.",
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
        logo: `${siteUrl.origin}/nguoi-la-logo.png`,
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
        name: "Người Lạ - Chat Người Lạ Online",
        description:
          "Chat người lạ online miễn phí — kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn.",
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
        name: "Người Lạ - Chat Người Lạ Online",
        description:
          "Chat người lạ online miễn phí — kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn và riêng tư.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0 }}>
        <JsonLd data={jsonLd} />
        <SkipLink />
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
