import { User } from "../../domain/entities/User";
import { UserDTO } from "../dtos/UserDTO";

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      trustScore: user.trustScore
    };
  }
}
