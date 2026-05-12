import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createPublicKey, verify as verifySignature } from 'node:crypto';
import { GoogleTokenPayload } from '../interfaces/google-token-payload.interface';

type GoogleJwtHeader = {
  alg?: string;
  kid?: string;
};

type GoogleJwtPayload = GoogleTokenPayload & {
  aud?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  email_verified?: boolean;
};

@Injectable()
export class GoogleAuthService {
  private cachedCertificates: {
    certificates: Record<string, string>;
    expiresAt: number;
  } | null = null;

  async verifyToken(idToken: string): Promise<GoogleTokenPayload> {
    if (!idToken) {
      throw new BadRequestException('Thieu Google idToken');
    }

    const clientIds = this.getAllowedClientIds();
    const { header, payload, signingInput, signature } = this.parseJwt(idToken);

    if (header.alg !== 'RS256' || !header.kid) {
      throw new UnauthorizedException('Google idToken khong hop le');
    }

    const certificates = await this.getGoogleCertificates();
    const certificate = certificates[header.kid];

    if (!certificate) {
      throw new UnauthorizedException(
        'Khong tim thay Google signing key phu hop',
      );
    }

    const isValidSignature = verifySignature(
      'RSA-SHA256',
      Buffer.from(signingInput),
      createPublicKey(certificate),
      signature,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('Chu ky Google idToken khong hop le');
    }

    this.validatePayload(payload, clientIds);

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }

  private getAllowedClientIds(): string[] {
    const rawClientIds =
      process.env.GOOGLE_CLIENT_ID?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

    if (!rawClientIds) {
      throw new InternalServerErrorException(
        'Thieu cau hinh GOOGLE_CLIENT_ID hoac NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      );
    }

    return rawClientIds
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private parseJwt(idToken: string): {
    header: GoogleJwtHeader;
    payload: GoogleJwtPayload;
    signingInput: string;
    signature: Buffer;
  } {
    const segments = idToken.split('.');

    if (segments.length !== 3) {
      throw new UnauthorizedException(
        'Google idToken khong dung dinh dang JWT',
      );
    }

    const [encodedHeader, encodedPayload, encodedSignature] = segments;

    let header: GoogleJwtHeader;
    let payload: GoogleJwtPayload;

    try {
      header = JSON.parse(
        this.decodeBase64Url(encodedHeader),
      ) as GoogleJwtHeader;
      payload = JSON.parse(
        this.decodeBase64Url(encodedPayload),
      ) as GoogleJwtPayload;
    } catch {
      throw new UnauthorizedException('Khong doc duoc Google idToken');
    }

    return {
      header,
      payload,
      signingInput: `${encodedHeader}.${encodedPayload}`,
      signature: this.decodeBase64UrlToBuffer(encodedSignature),
    };
  }

  private decodeBase64Url(value: string): string {
    return this.decodeBase64UrlToBuffer(value).toString('utf8');
  }

  private decodeBase64UrlToBuffer(value: string): Buffer {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    const padded =
      padding === 0
        ? normalized
        : normalized.padEnd(normalized.length + (4 - padding), '=');

    return Buffer.from(padded, 'base64');
  }

  private async getGoogleCertificates(): Promise<Record<string, string>> {
    if (
      this.cachedCertificates &&
      this.cachedCertificates.expiresAt > Date.now()
    ) {
      return this.cachedCertificates.certificates;
    }

    let response: Response;

    try {
      response = await fetch('https://www.googleapis.com/oauth2/v1/certs', {
        cache: 'no-store',
      });
    } catch {
      throw new UnauthorizedException(
        'Khong the ket noi toi Google de xac thuc token',
      );
    }

    if (!response.ok) {
      throw new UnauthorizedException('Google cert endpoint tra ve loi');
    }

    const certificates = (await response.json()) as Record<string, string>;
    const maxAge = this.getMaxAgeSeconds(response.headers.get('cache-control'));

    this.cachedCertificates = {
      certificates,
      expiresAt: Date.now() + maxAge * 1000,
    };

    return certificates;
  }

  private getMaxAgeSeconds(cacheControl: string | null): number {
    const match = cacheControl?.match(/max-age=(\d+)/i);
    return match ? Number.parseInt(match[1], 10) : 3600;
  }

  private validatePayload(payload: GoogleJwtPayload, clientIds: string[]) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Google token thieu thong tin tai khoan');
    }

    if (!payload.aud || !clientIds.includes(payload.aud)) {
      throw new UnauthorizedException('Google token khong dung client id');
    }

    if (
      payload.iss !== 'accounts.google.com' &&
      payload.iss !== 'https://accounts.google.com'
    ) {
      throw new UnauthorizedException('Google token co issuer khong hop le');
    }

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      throw new UnauthorizedException('Google token da het han');
    }

    if (payload.iat && payload.iat * 1000 > Date.now() + 60_000) {
      throw new UnauthorizedException(
        'Google token co thoi gian tao khong hop le',
      );
    }

    if (payload.email_verified === false) {
      throw new UnauthorizedException('Tai khoan Google chua xac minh email');
    }
  }
}
