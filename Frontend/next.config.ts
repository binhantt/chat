import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value:
              process.env.REFERRER_POLICY || "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), bluetooth=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://pagead2.googlesyndication.com https://adservice.google.com https://adservice.google.com.vn https://3nbf4.com https://al5sm.com; style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https://accounts.google.com https://pagead2.googlesyndication.com https://adservice.google.com https://adservice.google.com.vn https://3nbf4.com https://al5sm.com https://255md.com https://my.rtmark.net; frame-src https://accounts.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://3nbf4.com https://al5sm.com; base-uri 'self'; form-action 'self'; worker-src 'self' blob: https://3nbf4.com;",
          },
        ],
      },
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "purpose",
            value: "prefetch",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001";
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
