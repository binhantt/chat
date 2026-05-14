import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConductService } from '../../../src/conduct/conduct.service';

describe('ConductService', () => {
  let repository: {
    count: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let service: ConductService;

  beforeEach(() => {
    repository = {
      count: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => data),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    service = new ConductService(repository as never);
  });

  it('seeds default rules when repository is empty', async () => {
    repository.count.mockResolvedValue(0);

    await service.onModuleInit();

    expect(repository.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ isActive: true, note: expect.any(String) }),
      ]),
    );
  });

  it('does not seed when rules already exist', async () => {
    repository.count.mockResolvedValue(1);

    await service.onModuleInit();

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('creates a normalized rule', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.create('  Spam   link  ', ' note ')).resolves.toEqual({
      phrase: 'Spam link',
      note: 'note',
      isActive: true,
    });
  });

  it('rejects empty and duplicate rules', async () => {
    await expect(service.create('   ')).rejects.toThrow(BadRequestException);

    repository.findOne.mockResolvedValue({ id: 'rule-1' });
    await expect(service.create('spam')).rejects.toThrow(ConflictException);
  });

  it('updates phrase, note, and active state', async () => {
    const rule = { id: 'rule-1', phrase: 'spam', note: null, isActive: true };
    repository.findOne.mockResolvedValue(rule);

    await expect(
      service.update('rule-1', {
        phrase: ' scam ',
        note: ' updated ',
        isActive: false,
      }),
    ).resolves.toEqual({
      id: 'rule-1',
      phrase: 'scam',
      note: 'updated',
      isActive: false,
    });
  });

  it('detects active rule matches without accents or case sensitivity', async () => {
    const rule = { phrase: 'quay roi', isActive: true };
    repository.find.mockResolvedValue([rule]);

    await expect(service.checkMessage('Ban dang QUẤY RỐI')).resolves.toEqual({
      violated: true,
      rule,
    });
  });

  it('allows empty or clean messages', async () => {
    await expect(service.checkMessage('   ')).resolves.toEqual({
      violated: false,
    });

    repository.find.mockResolvedValue([{ phrase: 'spam', isActive: true }]);
    await expect(service.checkMessage('hello')).resolves.toEqual({
      violated: false,
    });
  });
});
