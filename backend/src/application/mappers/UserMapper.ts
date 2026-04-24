import { User } from "../../domain/entities/User";
import { UserDTO } from "../dtos/UserDTO";

export class UserMapper {
  static toDTO(user: User): UserDTO {
    const data = user.toPrimitives();

    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      trustScore: data.trustScore,
      attributes: data.attributes,
      personalDetail: data.personalDetail
    };
  }
}
