import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS
} from "../../shared/constants/AppConstants";

interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

function isSecureCookie(): boolean {
  return process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
}

function getCookieDomain(): string | undefined {
  const value = process.env.COOKIE_DOMAIN;
  return value && value.trim() ? value : undefined;
}

export function setAuthCookies(res: any, tokens: AuthTokenPair): void {
  const commonOptions = {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax" as const,
    domain: getCookieDomain()
  };

  res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    ...commonOptions,
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000
  });

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
    ...commonOptions,
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000
  });
}

export function clearAuthCookies(res: any): void {
  const commonOptions = {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax" as const,
    domain: getCookieDomain()
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, { ...commonOptions, path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { ...commonOptions, path: "/" });
}
