import { Injectable } from '@nestjs/common';
import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

@Injectable()
export class PasswordService {
  hash(password: string): string {
    const salt = randomUUID();
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  verify(password: string, passwordHash: string): boolean {
    const [salt, storedHash] = passwordHash.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    return this.compareHash(password, salt, storedHash);
  }

  private compareHash(
    password: string,
    salt: string,
    storedHash: string,
  ): boolean {
    const hash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      hash.length === storedHashBuffer.length &&
      timingSafeEqual(hash, storedHashBuffer)
    );
  }
}
