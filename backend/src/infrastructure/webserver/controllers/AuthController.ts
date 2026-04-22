import { LoginWithGoogleUseCase } from "../../../application/use-cases/auth/LoginWithGoogle";
import { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshToken";
import { JwtStrategy } from "../../security/JwtStrategy";
import { getCookie } from "../../../shared/utils/Cookie";
import {
  REFRESH_TOKEN_COOKIE_NAME
} from "../../../shared/constants/AppConstants";
import { clearAuthCookies, setAuthCookies } from "../../security/AuthCookies";

export class AuthController {
  constructor(
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly jwtStrategy: JwtStrategy
  ) {}

  loginWithGoogle = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const user = await this.loginWithGoogleUseCase.execute(req.body?.idToken);
      const tokenPayload = { userId: user.id };
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtStrategy.createAccessToken(tokenPayload),
        this.jwtStrategy.createRefreshToken(tokenPayload)
      ]);

      setAuthCookies(res, { accessToken, refreshToken });
      res.setHeader("Authorization", `Bearer ${accessToken}`);

      res.status(200).json({
        user,
        authToken: accessToken,
        accessToken,
        useCookieAuth: true
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const refreshTokenFromBody = req.body?.refreshToken;
      const refreshTokenFromCookie = getCookie(req, REFRESH_TOKEN_COOKIE_NAME);
      const refreshToken = refreshTokenFromBody ?? refreshTokenFromCookie;

      const result = await this.refreshTokenUseCase.execute(refreshToken);
      setAuthCookies(res, result);
      res.setHeader("Authorization", `Bearer ${result.accessToken}`);

      res.status(200).json({
        authToken: result.accessToken,
        accessToken: result.accessToken,
        useCookieAuth: true
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: any, res: any, next: any): Promise<void> => {
    try {
      clearAuthCookies(res);
      res.status(200).json({ loggedOut: true });
    } catch (error) {
      next(error);
    }
  };
}
