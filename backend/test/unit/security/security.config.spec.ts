import type { Request, Response } from 'express';
import {
  createCorsOriginChecker,
  createOriginGuard,
  getAllowedOrigins,
  securityHeadersMiddleware,
} from '../../../src/security/security.config';

describe('security config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('normalizes configured CORS origins and ignores wildcard values', () => {
    process.env.CORS_ORIGINS = 'https://chat.example.com/app, *, bad-url';
    process.env.FRONTEND_URL = 'https://admin.example.com/dashboard';

    expect(getAllowedOrigins()).toEqual([
      'https://admin.example.com',
      'https://chat.example.com',
    ]);
  });

  it('allows only configured browser origins for CORS', () => {
    const checker = createCorsOriginChecker(['https://chat.example.com']);
    const callback = jest.fn();

    checker(undefined, callback);
    checker('https://chat.example.com/page', callback);
    checker('https://evil.example.com', callback);

    expect(callback).toHaveBeenNthCalledWith(1, null, true);
    expect(callback).toHaveBeenNthCalledWith(2, null, true);
    expect(callback).toHaveBeenNthCalledWith(3, null, false);
  });

  it('sets defensive headers for API responses', () => {
    const setHeader = jest.fn();
    const response = { setHeader } as unknown as Response;
    const next = jest.fn();

    securityHeadersMiddleware({} as Request, response, next);

    expect(setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("frame-ancestors 'none'"),
    );
    expect(setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer');
    expect(setHeader).toHaveBeenCalledWith(
      'Cross-Origin-Opener-Policy',
      'same-origin',
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('blocks unsafe cross-origin requests and allows trusted origins', () => {
    const guard = createOriginGuard(['https://chat.example.com']);
    const next = jest.fn();
    const status = jest.fn().mockReturnThis();
    const response = {
      status,
      json: jest.fn(),
    } as unknown as Response;

    guard(
      {
        method: 'POST',
        headers: { origin: 'https://evil.example.com' },
      } as Request,
      response,
      next,
    );

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();

    guard(
      {
        method: 'PATCH',
        headers: { origin: 'https://chat.example.com' },
      } as Request,
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('requires matching csrf header when csrf cookie is present', () => {
    const guard = createOriginGuard(['https://chat.example.com']);
    const next = jest.fn();
    const status = jest.fn().mockReturnThis();
    const response = {
      status,
      json: jest.fn(),
    } as unknown as Response;

    guard(
      {
        method: 'POST',
        path: '/api/reports',
        headers: {
          origin: 'https://chat.example.com',
          cookie: 'csrf_token=token-1; access_token=access',
        },
      } as Request,
      response,
      next,
    );

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();

    guard(
      {
        method: 'POST',
        path: '/api/reports',
        headers: {
          origin: 'https://chat.example.com',
          cookie: 'csrf_token=token-1; access_token=access',
          'x-csrf-token': 'token-1',
        },
      } as Request,
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects authenticated unsafe requests without a csrf cookie', () => {
    const guard = createOriginGuard(['https://chat.example.com']);
    const next = jest.fn();
    const status = jest.fn().mockReturnThis();
    const response = {
      status,
      json: jest.fn(),
    } as unknown as Response;

    guard(
      {
        method: 'POST',
        path: '/api/chat/conversations/conversation-1/messages',
        headers: {
          origin: 'https://chat.example.com',
          cookie: 'access_token=access',
        },
      } as Request,
      response,
      next,
    );

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('exempts login endpoints from csrf checks so sessions can be created', () => {
    const guard = createOriginGuard(['https://chat.example.com']);
    const next = jest.fn();
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    guard(
      {
        method: 'POST',
        path: '/api/auth/email-login',
        headers: { origin: 'https://chat.example.com' },
      } as Request,
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});
