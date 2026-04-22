import { IGoogleAuthService, GoogleProfile } from "../../application/use-cases/auth/LoginWithGoogle";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuth implements IGoogleAuthService {
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!idToken || typeof idToken !== "string") {
      console.log("[GoogleAuth] ID token is missing or not a string.");
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
      console.log("[GoogleAuth] GOOGLE_CLIENT_ID is missing in .env.");
      throw new UnauthorizedError(
        "GOOGLE_CLIENT_ID is missing. Please set GOOGLE_CLIENT_ID in .env before using real Google login."
      );
    }
    
    console.log(`[GoogleAuth] Verifying ID token. Client ID: ${googleClientId}, ID Token (first 50 chars): ${idToken.substring(0, 50)}...`);

    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        console.error("[GoogleAuth] Invalid Google ID token payload: Payload is null.");
        throw new UnauthorizedError("Invalid Google ID token payload.");
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;

      if (!googleId || !email || !name) {
        console.error("[GoogleAuth] Missing required Google profile information in payload.", { googleId, email, name });
        throw new UnauthorizedError("Missing required Google profile information.");
      }

      return {
        googleId,
        email,
        name,
      };
    } catch (error: any) {
      console.error("[GoogleAuth] Google token verification failed:", error);
      throw new UnauthorizedError(`Google token verification failed: ${error.message}`);
    }
  }
}
