import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../../shared/errors/AppError";

const toSerializableUser = (user: User) => user.toPrimitives();

const sanitizeAttributes = (input: unknown): Record<string, string | number | boolean | null> => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const result: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      result[key] = value as string | number | boolean | null;
    }
  }

  return result;
};

export class UsersController {
  constructor(private readonly userRepository: IUserRepository) {}

  getProfile = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      if (!currentUser) {
        throw new NotFoundError("User not found.");
      }

      res.status(200).json({
        user: toSerializableUser(currentUser)
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User | undefined;
      if (!currentUser) {
        throw new NotFoundError("User not found.");
      }

      const payload = req.body ?? {};
      const mergedAttributes = {
        ...(currentUser.attributes ?? {}),
        ...sanitizeAttributes(payload.attributes)
      };

      const updatedUser = new User({
        ...currentUser.toPrimitives(),
        displayName:
          typeof payload.displayName === "string" && payload.displayName.trim()
            ? payload.displayName.trim()
            : currentUser.displayName,
        email:
          typeof payload.email === "string" && payload.email.trim()
            ? payload.email.trim().toLowerCase()
            : currentUser.email,
        attributes: mergedAttributes
      });

      const savedUser = await this.userRepository.update(updatedUser);

      res.status(200).json({
        user: toSerializableUser(savedUser)
      });
    } catch (error) {
      next(error);
    }
  };
}
