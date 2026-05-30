import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Người Lạ",
    short_name: "Người Lạ",
    description:
      "Ứng dụng trò chuyện trực tuyến với hồ sơ cá nhân, gói VIP và công cụ báo cáo nội dung.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    categories: ["social", "communication"],
    lang: "vi",
    icons: [
      {
        src: "/nguoi-la-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
