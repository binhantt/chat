import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  User,
  UserLockType,
  UserRole,
} from '../../../src/users/entities/user.entity';
import { UsersService } from '../../../src/users/users.service';

describe('UsersService', () => {
  let repository: {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let dataSource: {
    createQueryRunner: jest.Mock;
    synchronize: jest.Mock;
    transaction: jest.Mock;
  };
  let passwordService: { hash: jest.Mock; verify: jest.Mock };
  let eventBus: {
    emit: jest.Mock;
    on: jest.Mock;
    getAll: jest.Mock;
  };
  let userFactoryService: {
    createGoogleUser: jest.Mock;
    createEmailUser: jest.Mock;
    createAdminUser: jest.Mock;
  };
  let service: UsersService;

  const makeUser = (overrides: Partial<User> = {}) =>
    Object.assign(new User(), {
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      fullName: 'User One',
      role: UserRole.User,
      isActive: true,
      lockType: UserLockType.None,
      lockedUntil: null,
      lockReason: null,
      lockedByReportId: null,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      ...overrides,
    });

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(async (user) => user),
      createQueryBuilder: jest.fn(),
    };
    dataSource = {
      createQueryRunner: jest.fn(),
      synchronize: jest.fn(),
      transaction: jest.fn(),
    };
    passwordService = {
      hash: jest.fn().mockReturnValue('admin-hash'),
      verify: jest.fn(),
    };
    eventBus = {
      emit: jest.fn(),
      on: jest.fn(),
      getAll: jest.fn(),
    };
    userFactoryService = {
      createGoogleUser: jest.fn(),
      createEmailUser: jest.fn(),
      createAdminUser: jest.fn(),
    };
    service = new UsersService(
      repository as never,
      dataSource as never,
      passwordService as never,
      userFactoryService as never,
      eventBus as never,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns safe users without password hashes', async () => {
    repository.createQueryBuilder.mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          email: 'user@example.com',
          fullName: 'User One',
          avatarUrl: null,
          role: UserRole.User,
          isActive: true,
          lockType: UserLockType.None,
          lockedUntil: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ]),
      orderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    });

    await expect(service.findAll()).resolves.toEqual({
      items: [expect.objectContaining({ id: 'user-1', passwordHash: null })],
      limit: 20,
      nextCursor: null,
    });
  });

  it('throws when a user cannot be found by id', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findByIdOrFail('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates an admin user and rejects duplicate emails', async () => {
    repository.findOne.mockResolvedValue(null);
    userFactoryService.createEmailUser.mockReturnValue(
      makeUser({ passwordHash: 'hash:new' }),
    );

    await expect(
      service.createByAdmin({
        email: 'new@example.com',
        password: 'password',
        fullName: 'New User',
        role: UserRole.User,
      }),
    ).resolves.toMatchObject({ passwordHash: null });

    repository.findOne.mockResolvedValue(makeUser());
    await expect(
      service.createByAdmin({
        email: 'user@example.com',
        password: 'password',
        fullName: 'User One',
        role: UserRole.User,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('validates password through the selected password hash', async () => {
    repository.createQueryBuilder.mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(makeUser()),
    });
    passwordService.verify.mockReturnValue(true);

    await expect(
      service.validatePassword('user@example.com', 'password'),
    ).resolves.toMatchObject({ id: 'user-1', passwordHash: null });
  });

  it('prevents an admin from demoting or disabling themself', async () => {
    repository.findOne.mockResolvedValue(makeUser({ role: UserRole.Admin }));

    await expect(
      service.updateAccess(
        'admin-1',
        { role: UserRole.User, isActive: true },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.updateAccess(
        'admin-1',
        { role: UserRole.Admin, isActive: false },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('clears permanent lock fields when access is reactivated', async () => {
    repository.findOne.mockResolvedValue(
      makeUser({
        lockType: UserLockType.Permanent,
        isActive: false,
        lockReason: 'report',
        lockedByReportId: 'report-1',
      }),
    );

    await expect(
      service.updateAccess(
        'user-1',
        { role: UserRole.User, isActive: true },
        'admin-1',
      ),
    ).resolves.toMatchObject({
      isActive: true,
      lockType: UserLockType.None,
      lockReason: null,
      lockedByReportId: null,
    });
  });

  it('applies report lock durations and permanent locks', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    repository.findOne.mockResolvedValue(makeUser());

    const temporary = await service.lockFromReport(
      'user-1',
      UserLockType.FifteenDays,
      'report-1',
      'reason',
    );
    expect(temporary).toMatchObject({
      lockType: UserLockType.FifteenDays,
      isActive: true,
      lockedByReportId: 'report-1',
      lockReason: 'reason',
    });

    repository.findOne.mockResolvedValue(makeUser());
    await expect(
      service.lockFromReport(
        'user-1',
        UserLockType.Permanent,
        'report-2',
        'reason',
      ),
    ).resolves.toMatchObject({
      lockType: UserLockType.Permanent,
      isActive: false,
      lockedUntil: null,
    });
  });

  it('detects locked login states', () => {
    expect(service.isLoginLocked(makeUser({ isActive: false }))).toBe(true);
    expect(
      service.isLoginLocked(
        makeUser({ lockedUntil: new Date(Date.now() + 1000) }),
      ),
    ).toBe(true);
    expect(service.isLoginLocked(makeUser())).toBe(false);
  });

  it('deletes own account and related rows inside a transaction', async () => {
    repository.findOne.mockResolvedValue(makeUser());
    const manager = {
      query: jest
        .fn()
        .mockResolvedValueOnce([{ id: 'conversation-1' }])
        .mockResolvedValue([]),
    };
    dataSource.transaction.mockImplementation(async (callback) =>
      callback(manager),
    );

    await service.deleteOwnAccount('user-1');

    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM users'),
      ['user-1'],
    );
  });
});
