import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../../shared/errors/AppError";

const toSerializableUser = (user: User) => user.toPrimitives();
const RESERVED_PERSONAL_DETAIL_KEYS = new Set(["gender", "birthDate"]);

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
      if (RESERVED_PERSONAL_DETAIL_KEYS.has(key)) {
        continue;
      }

      result[key] = value as string | number | boolean | null;
    }
  }

  return result;
};

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const resolvePersonalDetail = (
  payload: Record<string, unknown>,
  currentUser: User
) => {
  const currentPersonalDetail = currentUser.personalDetail ?? {};
  const nextPersonalDetail = {
    ...currentPersonalDetail
  } as {
    gender?: string;
    birthDate?: string;
  };

  const personalDetailPayload =
    payload.personalDetail && typeof payload.personalDetail === "object" && !Array.isArray(payload.personalDetail)
      ? (payload.personalDetail as Record<string, unknown>)
      : {};

  if ("gender" in personalDetailPayload) {
    nextPersonalDetail.gender = normalizeOptionalText(personalDetailPayload.gender);
  } else if ("gender" in payload) {
    nextPersonalDetail.gender = normalizeOptionalText(payload.gender);
  }

  if ("birthDate" in personalDetailPayload) {
    nextPersonalDetail.birthDate = normalizeOptionalText(personalDetailPayload.birthDate);
  } else if ("birthDate" in payload) {
    nextPersonalDetail.birthDate = normalizeOptionalText(payload.birthDate);
  }

  if (!nextPersonalDetail.gender && !nextPersonalDetail.birthDate) {
    return undefined;
  }

  return nextPersonalDetail;
};

export class UsersController {
  constructor(private readonly userRepository: IUserRepository) {}

  getProfile = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser;
      res.status(200).json({
        user: currentUser ? toSerializableUser(currentUser) : null
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

      const payload =
        req.body && typeof req.body === "object" && !Array.isArray(req.body)
          ? (req.body as Record<string, unknown>)
          : {};
      const currentAttributes = {
        ...(currentUser.attributes ?? {})
      };
      delete currentAttributes.gender;
      delete currentAttributes.birthDate;

      const mergedAttributes = {
        ...currentAttributes,
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
        attributes: mergedAttributes,
        personalDetail: resolvePersonalDetail(payload, currentUser)
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
