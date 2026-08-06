import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ConductRuleUpdateInput } from '../interfaces/conduct-rule-input.interface';

type RawConductRuleUpdate = {
  isActive?: unknown;
  note?: unknown;
  phrase?: unknown;
};

@Injectable()
export class ConductRuleUpdatePipe
  implements PipeTransform<RawConductRuleUpdate, ConductRuleUpdateInput>
{
  transform(value: RawConductRuleUpdate): ConductRuleUpdateInput {
    const data: ConductRuleUpdateInput = {};

    if ('phrase' in value) {
      data.phrase = this.parseRequiredText(value.phrase, 'phrase', 160);
    }

    if ('note' in value) {
      data.note = this.parseNullableText(value.note, 'note', 255);
    }

    if ('isActive' in value) {
      data.isActive = this.parseBoolean(value.isActive, 'isActive');
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Can it nhat mot truong de cap nhat');
    }

    return data;
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

  private parseNullableText(
    value: unknown,
    field: string,
    maxLength: number,
  ): string | null {
    if (value === undefined || value === null || value === '') {
      return null;
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

  private parseBoolean(value: unknown, field: string): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    throw new BadRequestException(`${field} phai la boolean`);
  }
}
