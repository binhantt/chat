export function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(";");

  for (const pair of pairs) {
    const [rawName, ...rest] = pair.trim().split("=");
    if (!rawName || rest.length === 0) {
      continue;
    }

    const value = rest.join("=");
    cookies[rawName] = decodeURIComponent(value);
  }

  return cookies;
}

export function getCookie(req: any, cookieName: string): string | undefined {
  const header = typeof req?.headers?.cookie === "string" ? req.headers.cookie : undefined;
  const cookies = parseCookieHeader(header);
  return cookies[cookieName];
}
