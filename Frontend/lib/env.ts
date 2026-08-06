export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const SEPPAY_MERCHANT_ID =
  process.env.NEXT_PUBLIC_SEPPAY_MERCHANT_ID || "";

export const SEPPAY_ENDPOINT =
  process.env.NEXT_PUBLIC_SEPPAY_ENDPOINT?.replace(/\/$/, "") ||
  "https://api.seppay.vn";
