import { createHmac } from "crypto";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS
} from "../../shared/constants/AppConstants";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { TokenPayload } from "../../application/use-cases/auth/RefreshToken";

interface JwtPayload extends TokenPayload {
  exp: number;
  iat: number;
  typ: "access" | "refresh";
}

export class JwtStrategy {
  private readonly secret: string;

  constructor(secret = process.env.JWT_SECRET ?? "banked-dev-secret") {
    this.secret = secret;
  }

  async createAccessToken(payload: TokenPayload): Promise<string> {
    return this.sign(payload, ACCESS_TOKEN_TTL_SECONDS, "access");
  }

  async createRefreshToken(payload: TokenPayload): Promise<string> {
    return this.sign(payload, REFRESH_TOKEN_TTL_SECONDS, "refresh");
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = this.verify(token, "access");
    return { userId: payload.userId };
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = this.verify(token, "refresh");
    return { userId: payload.userId };
  }

  private sign(payload: TokenPayload, ttlSeconds: number, typ: "access" | "refresh"): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const body: JwtPayload = {
      userId: payload.userId,
      iat: now,
      exp: now + ttlSeconds,
      typ
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedBody = this.base64UrlEncode(JSON.stringify(body));
    const signature = this.signRaw(`${encodedHeader}.${encodedBody}`);
    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  private verify(token: string, expectedType: "access" | "refresh"): JwtPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedError("Invalid token format.");
    }

    const [encodedHeader, encodedBody, signature] = parts;
    const expectedSignature = this.signRaw(`${encodedHeader}.${encodedBody}`);
    if (signature !== expectedSignature) {
      throw new UnauthorizedError("Invalid token signature.");
    }

    const payload = JSON.parse(this.base64UrlDecode(encodedBody)) as JwtPayload;
    if (payload.typ !== expectedType) {
      throw new UnauthorizedError(`Expected ${expectedType} token.`);
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new UnauthorizedError("Token expired.");
    }

    return payload;
  }

  private signRaw(value: string): string {
    return createHmac("sha256", this.secret).update(value).digest("base64url");
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value, "utf-8").toString("base64url");
  }

  private base64UrlDecode(value: string): string {
    return Buffer.from(value, "base64url").toString("utf-8");
  }
}
