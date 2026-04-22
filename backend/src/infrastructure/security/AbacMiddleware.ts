import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { PermissionCheck } from "../../domain/services/PermissionCheck";
import { PermissionAction } from "../../shared/constants/PermissionActions";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { JwtStrategy } from "./JwtStrategy";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME
} from "../../shared/constants/AppConstants";
import { getCookie } from "../../shared/utils/Cookie";
import { verifyTokenPairIntegrity } from "./SessionIntegrity";

export function createAbacMiddleware(
  userRepository: IUserRepository,
  permissionCheck: PermissionCheck,
  jwtStrategy: JwtStrategy,
  action: PermissionAction
) {
  return async (req: any, _res: any, next: any): Promise<void> => {
    try {
      const authHeader = req.headers["authorization"];
      const tokenFromBearer =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ")
          ? authHeader.slice("Bearer ".length).trim()
          : undefined;
      const tokenFromCookie = getCookie(req, ACCESS_TOKEN_COOKIE_NAME);
      const token = tokenFromBearer ?? tokenFromCookie;

      if (!token) {
        throw new UnauthorizedError("Access token is required (Bearer or cookie).");
      }

      let accessPayload;
      if (tokenFromBearer) {
        accessPayload = await jwtStrategy.verifyAccessToken(tokenFromBearer);
      } else {
        const refreshTokenFromCookie = getCookie(req, REFRESH_TOKEN_COOKIE_NAME);
        if (!refreshTokenFromCookie) {
          throw new UnauthorizedError("Refresh token cookie is required for session integrity check.");
        }

        const [verifiedAccessPayload, verifiedRefreshPayload] = await Promise.all([
          jwtStrategy.verifyAccessToken(tokenFromCookie as string),
          jwtStrategy.verifyRefreshToken(refreshTokenFromCookie)
        ]);

        const validPair = verifyTokenPairIntegrity(
          verifiedAccessPayload,
          verifiedRefreshPayload
        );
        if (!validPair) {
          throw new UnauthorizedError("Session integrity check failed (AT/RT mismatch).");
        }

        accessPayload = verifiedAccessPayload;
      }

      const user = await userRepository.findById(accessPayload.userId);
      if (!user) {
        throw new UnauthorizedError("Invalid user.");
      }

      const allowed = permissionCheck.can(user, action, {
        roomId: req.params?.roomId ?? req.body?.roomId
      });
      if (!allowed) {
        throw new UnauthorizedError("Permission denied.");
      }

      req.currentUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
