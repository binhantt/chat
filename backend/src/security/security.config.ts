import type { NextFunction, Request, Response } from 'express';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const INTERNAL_PROXY_HEADER = 'x-internal-api-proxy';
const CSRF_EXEMPT_PATHS = [
  '/api/v1/auth/google-login',
  '/api/v1/auth/email-login',
  '/api/v1/auth/refresh',
  '/api/v1/manager/login',
  '/api/v1/subscription/',
  '/api/v1/payment/',
  '/api/v1/ad/',
  '/api/v1/manager/subscription/',
  '/api/v1/manager/payment/',
  '/api/v1/manager/ad/',
];

export function getAllowedOrigins(): string[] {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.CORS_ORIGINS,
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(','))
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value));

  return Array.from(
    new Set(
      configuredOrigins.length > 0
        ? configuredOrigins
        : DEFAULT_ALLOWED_ORIGINS,
    ),
  );
}

export function createCorsOriginChecker(allowedOrigins = getAllowedOrigins()) {
  return (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(normalizeOrigin(origin) ?? ''));
  };
}

export function securityHeadersMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader(
    'Referrer-Policy',
    process.env.REFERRER_POLICY || 'no-referrer',
  );
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  );

  if (process.env.NODE_ENV === 'production') {
    response.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  next();
}

export function createOriginGuard(allowedOrigins = getAllowedOrigins()) {
  return (request: Request, response: Response, next: NextFunction): void => {
    // Bypass CSRF for subscription/payment/ad routes (proxied via Next.js)
    if (isInternalProxyRoute(request)) {
      next();
      return;
    }

    if (!UNSAFE_METHODS.has(request.method.toUpperCase())) {
      next();
      return;
    }

    const requestOrigin = getRequestOrigin(request);

    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      if (!hasValidCsrfToken(request)) {
        response.status(403).json({ message: 'CSRF token invalid or missing' });
        return;
      }

      next();
      return;
    }

    response.status(403).json({ message: 'Cross-origin request blocked' });
  };
}

function isInternalProxyRoute(request: Request): boolean {
  const path = request.path;
  const proxyPrefixes = [
    '/api/v1/subscription/',
    '/api/v1/payment/',
    '/api/v1/ad/',
    '/api/v1/manager/subscription/',
    '/api/v1/manager/payment/',
    '/api/v1/manager/ad/',
  ];
  return proxyPrefixes.some((prefix) => path.startsWith(prefix));
}

function getRequestOrigin(request: Request): string | null {
  const origin = normalizeOrigin(request.headers.origin);

  if (origin) {
    return origin;
  }

  const referer = request.headers.referer ?? request.headers.referrer;
  if (Array.isArray(referer)) {
    return normalizeOrigin(referer[0]);
  }

  return normalizeOrigin(referer);
}

function normalizeOrigin(value: string | undefined): string | null {
  if (!value || value.trim() === '*') {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    return null;
  }
}

function hasValidCsrfToken(request: Request): boolean {
  if (isCsrfExemptPath(request.path)) {
    return true;
  }

  if (getSingleHeaderValue(request.headers[INTERNAL_PROXY_HEADER]) === 'next') {
    return true;
  }

  const cookies = parseCookieHeader(request.headers.cookie);
  const cookieToken = cookies.get(CSRF_TOKEN_COOKIE);
  const hasAuthCookie =
    cookies.has('access_token') || cookies.has('refresh_token');

  if (!cookieToken) {
    return !hasAuthCookie;
  }

  const headerToken = getSingleHeaderValue(request.headers[CSRF_TOKEN_HEADER]);

  return Boolean(headerToken && headerToken === cookieToken);
}

function isCsrfExemptPath(path: string): boolean {
  return CSRF_EXEMPT_PATHS.some((exempt) => path.startsWith(exempt));
}

function parseCookieHeader(
  cookieHeader: string | undefined,
): Map<string, string> {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const item of cookieHeader.split(';')) {
    const [name, ...valueParts] = item.trim().split('=');
    if (!name || valueParts.length === 0) {
      continue;
    }

    cookies.set(name, decodeURIComponent(valueParts.join('=')));
  }

  return cookies;
}

function getSingleHeaderValue(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
