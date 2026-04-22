import { User } from "../entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
