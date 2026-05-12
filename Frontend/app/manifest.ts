import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChatApp",
    short_name: "ChatApp",
    description:
      "Ung dung tro chuyen truc tuyen voi ho so ca nhan, goi VIP va cong cu bao cao noi dung.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    categories: ["social", "communication"],
    lang: "vi",
    icons: [
      {
        src: "/window.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
