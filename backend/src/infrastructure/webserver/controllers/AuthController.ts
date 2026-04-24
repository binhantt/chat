import { randomUUID } from "crypto";
import { LoginWithGoogleUseCase } from "../../../application/use-cases/auth/LoginWithGoogle";
import { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshToken";
import { UserDTO } from "../../../application/dtos/UserDTO";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UnauthorizedError, ValidationError } from "../../../shared/errors/AppError";
import { getCookie } from "../../../shared/utils/Cookie";
import { REFRESH_TOKEN_COOKIE_NAME } from "../../../shared/constants/AppConstants";
import { JwtStrategy } from "../../security/JwtStrategy";
import { clearAuthCookies, setAuthCookies } from "../../security/AuthCookies";

type LoginRequest = {
  email?: string;
  password?: string;
  displayName?: string;
};

const toSerializableUser = (user: User | UserDTO) =>
  user instanceof User ? user.toPrimitives() : user;

export class AuthController {
  constructor(
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly jwtStrategy: JwtStrategy,
    private readonly userRepository: IUserRepository
  ) {}

  private issueAuthTokens = async (userId: string) => {
    const tokenPayload = { userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtStrategy.createAccessToken(tokenPayload),
      this.jwtStrategy.createRefreshToken(tokenPayload)
    ]);

    return { accessToken, refreshToken };
  };

  loginWithEmailPassword = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const payload = req.body as LoginRequest;
      const email = payload?.email?.trim().toLowerCase();
      const password = payload?.password?.trim();

      if (!email) {
        throw new ValidationError("Email is required.");
      }
      if (!password) {
        throw new ValidationError("Password is required.");
      }

      let user = await this.userRepository.findByEmail(email);
      if (!user) {
        const defaultDisplayName = payload?.displayName?.trim() || email.split("@")[0] || "User";
        user = new User({
          id: randomUUID(),
          email,
          displayName: defaultDisplayName,
          attributes: {
            role: "user",
            authPassword: password,
            joinedAt: new Date().toISOString()
          }
        });
        user = await this.userRepository.save(user);
      } else {
        const attributes = user.attributes ?? {};
        const existingPassword = typeof attributes.authPassword === "string"
          ? attributes.authPassword
          : undefined;

        if (existingPassword && existingPassword !== password) {
          throw new UnauthorizedError("Invalid email or password.");
        }

        if (!existingPassword) {
          const updatedUser = new User({
            ...user.toPrimitives(),
            attributes: {
              ...attributes,
              authPassword: password
            }
          });
          user = await this.userRepository.update(updatedUser);
        }
      }

      const tokens = await this.issueAuthTokens(user.id);
      setAuthCookies(res, tokens);
      res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);

      res.status(200).json({
        user: toSerializableUser(user),
        useCookieAuth: true
      });
    } catch (error) {
      next(error);
    }
  };

  loginWithGoogle = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const user = await this.loginWithGoogleUseCase.execute(req.body?.idToken);
      const tokens = await this.issueAuthTokens(user.id);

      setAuthCookies(res, tokens);
      res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);

      res.status(200).json({
        user: toSerializableUser(user),
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
      const user = await this.userRepository.findById(
        (await this.jwtStrategy.verifyAccessToken(result.accessToken)).userId
      );

      res.status(200).json({
        useCookieAuth: true,
        ...(user ? { user: toSerializableUser(user) } : {})
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
