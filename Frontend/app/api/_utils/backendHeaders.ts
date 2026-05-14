import { randomBytes } from "node:crypto";

const CSRF_TOKEN_COOKIE = "csrf_token";
const CSRF_TOKEN_HEADER = "X-CSRF-Token";
const INTERNAL_PROXY_HEADER = "X-Internal-Api-Proxy";

export function getCookieHeader(request: Request): string {
  return request.headers.get("cookie") || "";
}

export function buildBackendHeaders(
  request: Request,
  headers: Record<string, string> = {},
): Record<string, string> {
  let cookieHeader = getCookieHeader(request);
  const csrfToken =
    request.headers.get(CSRF_TOKEN_HEADER) ||
    getCookieValue(cookieHeader, CSRF_TOKEN_COOKIE) ||
    createProxyCsrfToken(cookieHeader);

  if (csrfToken && !getCookieValue(cookieHeader, CSRF_TOKEN_COOKIE)) {
    cookieHeader = appendCookie(cookieHeader, CSRF_TOKEN_COOKIE, csrfToken);
  }

  return {
    ...headers,
    [INTERNAL_PROXY_HEADER]: "next",
    Cookie: cookieHeader,
    ...(csrfToken ? { [CSRF_TOKEN_HEADER]: csrfToken } : {}),
  };
}

export function buildBackendHeadersWithFreshCsrf(
  request: Request,
  headers: Record<string, string> = {},
): Record<string, string> {
  let cookieHeader = removeCookie(getCookieHeader(request), CSRF_TOKEN_COOKIE);
  const csrfToken = createProxyCsrfToken(cookieHeader);

  if (csrfToken) {
    cookieHeader = appendCookie(cookieHeader, CSRF_TOKEN_COOKIE, csrfToken);
  }

  return {
    ...headers,
    [INTERNAL_PROXY_HEADER]: "next",
    Cookie: cookieHeader,
    ...(csrfToken ? { [CSRF_TOKEN_HEADER]: csrfToken } : {}),
  };
}

export function buildBackendHeadersFromCookie(
  cookieHeader: string,
  headers: Record<string, string> = {},
): Record<string, string> {
  const csrfToken = getCookieValue(cookieHeader, CSRF_TOKEN_COOKIE);

  return {
    ...headers,
    [INTERNAL_PROXY_HEADER]: "next",
    Cookie: cookieHeader,
    ...(csrfToken ? { [CSRF_TOKEN_HEADER]: csrfToken } : {}),
  };
}

export function mergeSetCookiesIntoCookieHeader(
  cookieHeader: string,
  setCookies: string[],
): string {
  const cookies = new Map<string, string>();

  for (const item of cookieHeader.split(";")) {
    const [name, ...valueParts] = item.trim().split("=");
    if (name && valueParts.length > 0) {
      cookies.set(name, valueParts.join("="));
    }
  }

  for (const setCookie of setCookies) {
    const [cookiePair] = setCookie.split(";");
    const [name, ...valueParts] = cookiePair.trim().split("=");
    if (name && valueParts.length > 0) {
      cookies.set(name, valueParts.join("="));
    }
  }

  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export function applyCsrfCookie(
  response: Response,
  request: Request,
  backendHeaders?: Record<string, string>,
): void {
  if (getCookieValue(getCookieHeader(request), CSRF_TOKEN_COOKIE)) {
    return;
  }

  const csrfToken =
    getSingleHeaderValue(backendHeaders?.[CSRF_TOKEN_HEADER]) ||
    getCookieValue(backendHeaders?.Cookie || "", CSRF_TOKEN_COOKIE) ||
    createProxyCsrfToken(getCookieHeader(request));

  if (!csrfToken) {
    return;
  }

  response.headers.append(
    "Set-Cookie",
    `${CSRF_TOKEN_COOKIE}=${encodeURIComponent(
      csrfToken,
    )}; Path=/; SameSite=Strict`,
  );
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

function createProxyCsrfToken(cookieHeader: string): string | null {
  if (!hasAuthCookie(cookieHeader)) {
    return null;
  }

  return randomBytes(32).toString("base64url");
}

function hasAuthCookie(cookieHeader: string): boolean {
  return Boolean(
    getCookieValue(cookieHeader, "access_token") ||
      getCookieValue(cookieHeader, "refresh_token"),
  );
}

function appendCookie(cookieHeader: string, name: string, value: string): string {
  const cookie = `${name}=${encodeURIComponent(value)}`;

  if (!cookieHeader.trim()) {
    return cookie;
  }

  return `${cookieHeader}; ${cookie}`;
}

function removeCookie(cookieHeader: string, name: string): string {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item && !item.startsWith(`${name}=`))
    .join("; ");
}

function getSingleHeaderValue(value: string | undefined): string | null {
  return value ?? null;
}
