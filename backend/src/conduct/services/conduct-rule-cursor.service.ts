import { Injectable } from '@nestjs/common';
import { ConductRule } from '../entities/conduct-rule.entity';
import { ConductRuleCursor } from '../repositories/conduct-rule.repository';

@Injectable()
export class ConductRuleCursorService {
  encode(rule: ConductRule): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: rule.createdAt.toISOString(),
        id: rule.id,
      }),
    ).toString('base64url');
  }

  decode(cursor?: string): ConductRuleCursor | null {
    if (!cursor) return null;

    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: string; id?: string };
      if (!parsed.createdAt || !parsed.id) return null;

      const createdAt = new Date(parsed.createdAt);
      if (Number.isNaN(createdAt.getTime())) return null;

      return { createdAt, id: parsed.id };
    } catch {
      return null;
    }
  }
}
