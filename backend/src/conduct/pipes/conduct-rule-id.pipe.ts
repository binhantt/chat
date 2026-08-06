import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ConductRuleIdPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    if (typeof value !== 'string' || !uuidPattern.test(value)) {
      throw new BadRequestException('Id luat ung xu khong hop le');
    }

    return value;
  }
}
