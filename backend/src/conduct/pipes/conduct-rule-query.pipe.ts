import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ConductRuleQueryInput } from '../interfaces/conduct-rule-input.interface';

type RawConductRuleQuery = {
  cursor?: unknown;
  limit?: unknown;
};

@Injectable()
export class ConductRuleQueryPipe
  implements PipeTransform<RawConductRuleQuery, ConductRuleQueryInput>
{
  transform(value: RawConductRuleQuery): ConductRuleQueryInput {
    return {
      cursor: this.parseCursor(value.cursor),
      limit: this.parseLimit(value.limit),
    };
  }

  private parseCursor(cursor: unknown): string | undefined {
    if (cursor === undefined || cursor === null || cursor === '') {
      return undefined;
    }

    if (typeof cursor !== 'string') {
      throw new BadRequestException('Cursor khong hop le');
    }

    return cursor;
  }

  private parseLimit(limit: unknown): number | undefined {
    if (limit === undefined || limit === null || limit === '') {
      return undefined;
    }

    const parsed = Number(limit);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      throw new BadRequestException('Limit phai la so nguyen tu 1 den 100');
    }

    return parsed;
  }
}
