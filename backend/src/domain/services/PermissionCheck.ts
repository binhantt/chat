import { User } from "../entities/User";
import { PermissionAction } from "../../shared/constants/PermissionActions";

export class PermissionCheck {
  can(user: User, action: PermissionAction, context: Record<string, unknown> = {}): boolean {
    if (user.hasAttribute("role", "admin")) {
      return true;
    }

    switch (action) {
      case "chat:send":
        return user.trustScore >= 20 && Boolean(context.roomId);
      case "chat:history":
        return Boolean(context.roomId);
      case "room:join":
        return user.trustScore >= 10;
      case "admin:moderate":
        return false;
      case "notifications:read":
        return true;
      case "notifications:update":
        return true;
      case "notifications:delete":
        return true;
      default:
        return false;
    }
  }
}
