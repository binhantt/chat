export function getCsrfHeaders(): HeadersInit {
  if (typeof document === "undefined") return {};
  const csrfToken = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrf_token="))
    ?.split("=")
    .slice(1)
    .join("=");
  return csrfToken
    ? { "x-csrf-token": decodeURIComponent(csrfToken) }
    : {};
}
