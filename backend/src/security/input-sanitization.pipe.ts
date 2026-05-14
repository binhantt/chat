import {
  BadRequestException,
  Injectable,
  type ArgumentMetadata,
  type PipeTransform,
} from '@nestjs/common';

const DANGEROUS_INPUT_PATTERNS = [
  /<\s*\/?\s*script\b/i,
  /<\s*\/?\s*style\b/i,
  /<[^>]+\son\w+\s*=/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\0/,
  /(?:^|[\\/])\.\.(?:[\\/]|$)/,
];

@Injectable()
export class InputSanitizationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (!['body', 'query', 'param'].includes(metadata.type)) {
      return value;
    }

    return this.validateValue(value);
  }

  private validateValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.validateString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.validateValue(item));
    }

    if (value && typeof value === 'object') {
      for (const [key, nestedValue] of Object.entries(value)) {
        this.validateString(key);
        this.validateValue(nestedValue);
      }
    }

    return value;
  }

  private validateString(value: string): string {
    if (DANGEROUS_INPUT_PATTERNS.some((pattern) => pattern.test(value))) {
      throw new BadRequestException('Input contains unsafe content');
    }

    return value;
  }
}
