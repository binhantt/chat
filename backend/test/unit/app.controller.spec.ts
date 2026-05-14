import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('AppController', () => {
  it('returns the health message from AppService', () => {
    const appService = {
      getHello: jest.fn().mockReturnValue('Backend is running'),
    } as unknown as AppService;
    const controller = new AppController(appService);

    expect(controller.getHello()).toBe('Backend is running');
    expect(appService.getHello).toHaveBeenCalledTimes(1);
  });
});
