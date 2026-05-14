import { BadRequestException } from '@nestjs/common';
import { InputSanitizationPipe } from '../../../src/security/input-sanitization.pipe';

describe('InputSanitizationPipe', () => {
  const pipe = new InputSanitizationPipe();

  it('allows normal nested request data', () => {
    const value = {
      profile: {
        fullName: 'Nguyen Van A',
        bio: 'Xin chao moi nguoi',
      },
    };

    expect(pipe.transform(value, { type: 'body' })).toBe(value);
  });

  it('rejects high-risk script and traversal payloads', () => {
    const payloads = [
      { bio: '<script>alert(1)</script>' },
      { bio: '<img src=x onerror=alert(1)>' },
      { bio: '<style>body{display:none}</style>' },
      { avatarUrl: 'javascript:alert(1)' },
      { avatarUrl: '../secrets.txt' },
      { name: 'safe\0suffix' },
    ];

    for (const payload of payloads) {
      expect(() => pipe.transform(payload, { type: 'body' })).toThrow(
        BadRequestException,
      );
    }
  });

  it('does not reject SQL-looking text by itself because DB access is parameterized', () => {
    const value = { search: "' OR 1=1 --" };

    expect(pipe.transform(value, { type: 'query' })).toBe(value);
  });
});
