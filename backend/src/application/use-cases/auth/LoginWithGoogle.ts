import { randomUUID } from "crypto";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserDTO } from "../../dtos/UserDTO";
import { UserMapper } from "../../mappers/UserMapper";

export interface GoogleProfile {
  googleId: string;
  email?: string;
  name: string;
  pictureUrl?: string;
}

export interface IGoogleAuthService {
  verifyIdToken(idToken: string): Promise<GoogleProfile>;
}

export class LoginWithGoogleUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly googleAuthService: IGoogleAuthService
  ) {}

  async execute(idToken: string): Promise<UserDTO> {
    const profile = await this.googleAuthService.verifyIdToken(idToken);

    const existing = await this.userRepository.findByGoogleId(profile.googleId);
    if (existing) {
      return UserMapper.toDTO(existing);
    }

    const newUser = new User({
      id: randomUUID(),
      googleId: profile.googleId,
      email: profile.email,
      displayName: profile.name,
      attributes: {
        authProvider: "google",
        pictureUrl: profile.pictureUrl ?? ""
      }
    });

    const saved = await this.userRepository.save(newUser);
    return UserMapper.toDTO(saved);
  }
}
