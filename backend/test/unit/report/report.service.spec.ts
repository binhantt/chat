import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Conversation } from '../../../src/chat/entities/conversation.entity';
import { User, UserLockType } from '../../../src/users/entities/user.entity';
import {
  ReportReason,
  ReportStatus,
} from '../../../src/report/entities/report.entity';
import { ReportService } from '../../../src/report/report.service';

describe('ReportService', () => {
  let reportRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let conversationRepository: { find: jest.Mock };
  let usersService: {
    lockFromReport: jest.Mock;
    findByIdOrFail: jest.Mock;
  };
  let service: ReportService;

  const reporter = Object.assign(new User(), {
    id: 'reporter-1',
    email: 'reporter@example.com',
    fullName: 'Reporter',
  });
  const reportedUser = Object.assign(new User(), {
    id: 'reported-1',
    email: 'reported@example.com',
    fullName: 'Reported',
    avatarUrl: null,
    lockType: UserLockType.None,
    lockedUntil: null,
    isActive: true,
  });
  const conversation = Object.assign(new Conversation(), {
    id: 'conversation-1',
    user1Id: reporter.id,
    user2Id: reportedUser.id,
    user1: reporter,
    user2: reportedUser,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    reportRepository = {
      create: jest.fn((data) => ({ id: 'report-1', ...data })),
      save: jest.fn(async (data) => data),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    conversationRepository = { find: jest.fn() };
    usersService = {
      lockFromReport: jest.fn(),
      findByIdOrFail: jest.fn(),
    };
    service = new ReportService(
      reportRepository as never,
      conversationRepository as never,
      usersService as never,
    );
  });

  it('creates a report only for a recent chat partner', async () => {
    conversationRepository.find.mockResolvedValue([conversation]);

    await expect(
      service.create(reporter.id, {
        reportedUserId: reportedUser.id,
        reason: ReportReason.Spam,
        description: 'Spam links',
      }),
    ).resolves.toMatchObject({
      reporterId: reporter.id,
      reportedUserId: reportedUser.id,
      reason: ReportReason.Spam,
      status: ReportStatus.Pending,
      lockType: UserLockType.None,
    });
  });

  it('rejects reports for users outside the recent partner list', async () => {
    conversationRepository.find.mockResolvedValue([]);

    await expect(
      service.create(reporter.id, {
        reportedUserId: reportedUser.id,
        reason: ReportReason.Spam,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deduplicates reportable users by most recent conversations', async () => {
    conversationRepository.find.mockResolvedValue([
      conversation,
      Object.assign(new Conversation(), {
        ...conversation,
        id: 'conversation-2',
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      }),
    ]);

    await expect(service.getReportableUsers(reporter.id)).resolves.toEqual([
      {
        id: reportedUser.id,
        fullName: reportedUser.fullName,
        email: reportedUser.email,
        avatarUrl: reportedUser.avatarUrl,
        lastConversationAt: conversation.updatedAt,
      },
    ]);
  });

  it('throws when admin cannot find a report', async () => {
    reportRepository.findOne.mockResolvedValue(null);

    await expect(service.findOneForAdmin('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('requires lock type when resolving a report', async () => {
    reportRepository.findOne.mockResolvedValue({
      id: 'report-1',
      reporter,
      reportedUser,
      reporterId: reporter.id,
      reportedUserId: reportedUser.id,
      reason: ReportReason.Spam,
      description: null,
      status: ReportStatus.Pending,
      lockType: UserLockType.None,
      createdAt: new Date(),
    });

    await expect(
      service.updateStatus(
        'report-1',
        { status: ReportStatus.Resolved },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('locks the reported user when resolving a violation', async () => {
    const report = {
      id: 'report-1',
      reporter,
      reportedUser,
      reporterId: reporter.id,
      reportedUserId: reportedUser.id,
      reason: ReportReason.Spam,
      description: null,
      status: ReportStatus.Pending,
      lockType: UserLockType.None,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    reportRepository.findOne.mockResolvedValue(report);
    usersService.findByIdOrFail.mockResolvedValue({
      ...reportedUser,
      lockType: UserLockType.FifteenDays,
    });
    conversationRepository.find.mockResolvedValue([]);

    await expect(
      service.updateStatus(
        'report-1',
        {
          status: ReportStatus.Resolved,
          lockType: UserLockType.FifteenDays,
        },
        'admin-1',
      ),
    ).resolves.toMatchObject({
      id: 'report-1',
      status: ReportStatus.Resolved,
      lockType: UserLockType.FifteenDays,
      reportedUser: { lockType: UserLockType.FifteenDays },
    });
    expect(usersService.lockFromReport).toHaveBeenCalledWith(
      reportedUser.id,
      UserLockType.FifteenDays,
      'report-1',
      'Vi pham theo bao cao report-1',
    );
  });
});
