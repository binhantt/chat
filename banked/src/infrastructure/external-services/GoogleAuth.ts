import { IGoogleAuthService, GoogleProfile } from "../../application/use-cases/auth/LoginWithGoogle";
import { UnauthorizedError } from "../../shared/errors/AppError";

export class GoogleAuth implements IGoogleAuthService {
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!idToken || typeof idToken !== "string") {
      throw new UnauthorizedError("Google id token is missing.");
    }

    if (idToken.startsWith("demo:")) {
      const [_, googleId, email, name] = idToken.split(":");
      if (!googleId || !name) {
        throw new UnauthorizedError("Invalid demo token format.");
      }
      return {
        googleId,
        email: email || undefined,
        name
      };
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new UnauthorizedError(
        "GOOGLE_CLIENT_ID is missing. Please set GOOGLE_CLIENT_ID in .env before using real Google login."
      );
    }

    throw new UnauthorizedError(
      "Real Google token verification is not configured yet. Current mode supports demo token: demo:<googleId>:<email>:<name>."
    );
  }
}
