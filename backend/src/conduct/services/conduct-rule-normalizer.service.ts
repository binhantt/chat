import { Injectable } from '@nestjs/common';

@Injectable()
export class ConductRuleNormalizerService {
  cleanPhrase(phrase: string): string {
    return phrase.trim().replace(/\s+/g, ' ').slice(0, 160);
  }

  normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
