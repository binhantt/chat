import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ConductRuleCreateInput } from '../interfaces/conduct-rule-input.interface';

type RawConductRuleCreate = {
  note?: unknown;
  phrase?: unknown;
};

@Injectable()
export class ConductRuleCreatePipe
  implements PipeTransform<RawConductRuleCreate, ConductRuleCreateInput>
{
  transform(value: RawConductRuleCreate): ConductRuleCreateInput {
    const phrase = this.parseRequiredText(value?.phrase, 'phrase', 160);
    const note = this.parseOptionalText(value?.note, 'note', 255);

    return note === undefined ? { phrase } : { phrase, note };
  }

  private parseRequiredText(
    value: unknown,
    field: string,
    maxLength: number,
  ): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} phai la chuoi`);
    }

    const text = value.trim();
    if (!text) {
      throw new BadRequestException(`${field} khong duoc de trong`);
    }

    if (text.length > maxLength) {
      throw new BadRequestException(`${field} toi da ${maxLength} ky tu`);
    }

    return text;
  }

  private parseOptionalText(
    value: unknown,
    field: string,
    maxLength: number,
  ): string | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} phai la chuoi`);
    }

    const text = value.trim();
    if (text.length > maxLength) {
      throw new BadRequestException(`${field} toi da ${maxLength} ky tu`);
    }

    return text;
  }
}
