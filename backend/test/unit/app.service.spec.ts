import { AppService } from '../../src/app.service';

describe('AppService', () => {
  it('returns the backend health message', () => {
    expect(new AppService().getHello()).toBe('Backend is running');
  });
});
