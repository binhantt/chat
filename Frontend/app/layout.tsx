
import "@radix-ui/themes/styles.css";
import "@/app/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers/Providers";
import { getSiteUrl } from "@/lib/site";

const siteUrl = new URL(getSiteUrl());

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "ChatApp",
  title: {
    default: "ChatApp - Ket noi va tro chuyen truc tuyen",
    template: "%s | ChatApp",
  },
  description:
    "ChatApp giup nguoi dung ket noi, tro chuyen truc tuyen, quan ly ho so ca nhan va bao cao noi dung khong phu hop trong mot khong gian an toan.",
  keywords: [
    "ChatApp",
    "ung dung chat",
    "tro chuyen truc tuyen",
    "ket noi ban be",
    "chat an toan",
    "bao cao nguoi dung",
  ],
  authors: [{ name: "ChatApp" }],
  creator: "ChatApp",
  publisher: "ChatApp",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "ChatApp",
    title: "ChatApp - Ket noi va tro chuyen truc tuyen",
    description:
      "Ket noi, tro chuyen va quan ly trai nghiem chat truc tuyen trong mot khong gian gon gang, rieng tu va an toan.",
  },
  twitter: {
    card: "summary",
    title: "ChatApp - Ket noi va tro chuyen truc tuyen",
    description:
      "Ung dung chat truc tuyen voi ho so ca nhan, goi VIP va cong cu bao cao noi dung.",
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
  category: "communication",
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
            appearance="inherit"
          >
            {children}
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
