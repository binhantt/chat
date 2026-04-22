import { User } from "../entities/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  search(keyword?: string, limit?: number): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
