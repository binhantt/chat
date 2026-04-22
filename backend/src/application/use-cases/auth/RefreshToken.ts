import { UnauthorizedError } from "../../../shared/errors/AppError";

export interface TokenPayload {
  userId: string;
}

export interface ITokenService {
  verifyRefreshToken(token: string): Promise<TokenPayload>;
  createAccessToken(payload: TokenPayload): Promise<string>;
  createRefreshToken(payload: TokenPayload): Promise<string>;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(private readonly tokenService: ITokenService) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required.");
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const nextPayload: TokenPayload = { userId: payload.userId };

    const [accessToken, nextRefreshToken] = await Promise.all([
      this.tokenService.createAccessToken(nextPayload),
      this.tokenService.createRefreshToken(nextPayload)
    ]);

    return {
      accessToken,
      refreshToken: nextRefreshToken
    };
  }
}
