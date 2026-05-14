import { PasswordService } from '../../../../src/users/services/password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes passwords and verifies only the original password', () => {
    const hash = service.hash('secret');

    expect(hash).toContain(':');
    expect(service.verify('secret', hash)).toBe(true);
    expect(service.verify('wrong', hash)).toBe(false);
  });

  it('rejects malformed password hashes', () => {
    expect(service.verify('secret', 'not-a-valid-hash')).toBe(false);
    expect(service.verify('secret', ':')).toBe(false);
  });
});
