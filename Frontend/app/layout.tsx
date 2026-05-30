import "@radix-ui/themes/styles.css";
import "@/app/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers/Providers";
import { getSiteUrl } from "@/lib/site";

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
    "Người Lạ giúp người dùng kết nối, trò chuyện trực tuyến, quản lý hồ sơ cá nhân và báo cáo nội dung không phù hợp trong một không gian an toàn.",
  keywords: [
    "Người Lạ",
    "ứng dụng trò chuyện",
    "trò chuyện trực tuyến",
    "kết nối bạn bè",
    "trò chuyện an toàn",
    "báo cáo người dùng",
  ],
  authors: [{ name: "Người Lạ" }],
  creator: "Người Lạ",
  publisher: "Người Lạ",
  alternates: {
    canonical: "/",
  },
  icons: {
    apple: logoPath,
    icon: logoPath,
    shortcut: logoPath,
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    images: [
      {
        alt: "Người Lạ",
        url: logoPath,
      },
    ],
    siteName: "Người Lạ",
    title: "Người Lạ - Kết nối và trò chuyện trực tuyến",
    description:
      "Kết nối, trò chuyện và quản lý trải nghiệm trực tuyến trong một không gian gọn gàng, riêng tư và an toàn.",
  },
  twitter: {
    card: "summary",
    images: [logoPath],
    title: "Người Lạ - Kết nối và trò chuyện trực tuyến",
    description:
      "Ứng dụng trò chuyện trực tuyến với hồ sơ cá nhân, gói VIP và công cụ báo cáo nội dung.",
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
  themeColor: "#4f46e5",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body style={{ margin: 0 }}>
        <Providers>
          <Theme
            accentColor="indigo"
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
