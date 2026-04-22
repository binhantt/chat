import { timingSafeEqual } from "crypto";
import { TokenPayload } from "../../application/use-cases/auth/RefreshToken";

export function verifyTokenPairIntegrity(
  accessPayload: TokenPayload,
  refreshPayload: TokenPayload
): boolean {
  const left = Buffer.from(accessPayload.userId, "utf-8");
  const right = Buffer.from(refreshPayload.userId, "utf-8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
