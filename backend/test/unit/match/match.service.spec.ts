import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  Conversation,
  ConversationStatus,
} from '../../../src/chat/entities/conversation.entity';
import { UserGender } from '../../../src/users/entities/user.entity';
import {
  MatchQueue,
  MatchQueueStatus,
} from '../../../src/match/entities/match-queue.entity';
import { MatchService } from '../../../src/match/match.service';
import { MatchQueueRepository } from '../../../src/match/repositories/match-queue.repository';
import { JoinMatchHandler } from '../../../src/match/commands/handlers/join-match.handler';
import { LeaveMatchHandler } from '../../../src/match/commands/handlers/leave-match.handler';
import { GetMatchStatusHandler } from '../../../src/match/queries/handlers/get-match-status.handler';

describe('MatchModule - CQRS', () => {
  let matchQueueRepo: jest.Mocked<MatchQueueRepository>;
  let userRepo: { findOne: jest.Mock };
  let conversationRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    update: jest.Mock;
  };
  let realtimeService: {
    emitConversationCreated: jest.Mock;
    emitConversationEnded: jest.Mock;
  };
  let eventBus: { emit: jest.Mock };
  let matchService: MatchService;
  let joinHandler: JoinMatchHandler;
  let leaveHandler: LeaveMatchHandler;
  let getStatusHandler: GetMatchStatusHandler;

  beforeEach(() => {
    userRepo = { findOne: jest.fn() };
    conversationRepo = {
      create: jest.fn((data: Partial<Conversation>) => ({
        id: 'conversation-1',
        ...data,
      })),
      save: jest.fn((data: Conversation) => Promise.resolve(data)),
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    };
    realtimeService = {
      emitConversationCreated: jest.fn(),
      emitConversationEnded: jest.fn(),
    };
    eventBus = { emit: jest.fn() };

    // Build MatchQueueRepository with mocked underlying TypeORM Repository
    const rawRepo = {
      create: jest.fn((data: Partial<MatchQueue>) => ({
        id: 'queue-1',
        ...data,
      })),
      save: jest.fn((data: MatchQueue) => Promise.resolve(data)),
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
        getOne: jest.fn().mockResolvedValue(null),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    } as any;

    matchQueueRepo = new MatchQueueRepository(rawRepo) as any;
    matchService = new MatchService(
      userRepo as any,
      conversationRepo as any,
      matchQueueRepo,
      realtimeService as any,
      eventBus as any,
    );
    joinHandler = new JoinMatchHandler(
      userRepo as any,
      matchQueueRepo,
      matchService,
      eventBus as any,
    );
    leaveHandler = new LeaveMatchHandler(matchService, eventBus as any);
    getStatusHandler = new GetMatchStatusHandler(
      matchQueueRepo,
      userRepo as any,
      conversationRepo as any,
    );
  });

  describe('JoinMatchHandler', () => {
    it('rejects queue joins for missing users or incomplete profiles', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        joinHandler.execute({ userId: 'missing' }),
      ).rejects.toThrow(NotFoundException);

      userRepo.findOne.mockResolvedValue({ id: 'user-1', gender: null });
      await expect(
        joinHandler.execute({ userId: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('cancels stale queue state and creates a fresh search', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        gender: UserGender.Male,
        city: 'Hanoi',
      });

      await expect(
        joinHandler.execute({ userId: 'user-1' }),
      ).resolves.toMatchObject({
        id: 'queue-1',
        userId: 'user-1',
        status: MatchQueueStatus.Waiting,
      });
      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: 'match.joined' }),
      );
    });
  });

  describe('LeaveMatchHandler', () => {
    it('cancels a waiting queue on leave', async () => {
      await leaveHandler.execute({ userId: 'user-1' });
      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventName: 'match.cancelled' }),
      );
    });
  });

  describe('GetMatchStatusHandler', () => {
    it('returns not-in-queue when no status exists', async () => {
      matchQueueRepo.findLatestByUserId = jest.fn().mockResolvedValue(null);

      const result = await getStatusHandler.execute({ userId: 'user-1' });
      expect(result).toEqual({ inQueue: false });
    });

    it('returns matched status with hidden partner details', async () => {
      matchQueueRepo.findLatestByUserId = jest.fn().mockResolvedValue({
        status: MatchQueueStatus.Matched,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        matchedWithUserId: 'user-2',
        conversationId: 'conversation-1',
      });
      conversationRepo.findOne.mockResolvedValue({
        id: 'conversation-1',
        status: ConversationStatus.Active,
        user1Id: 'user-1',
        user2Id: 'user-2',
        user1Accepted: true,
        user2Accepted: false,
      });
      userRepo.findOne.mockResolvedValue({
        id: 'user-2',
        email: 'partner@example.com',
        fullName: 'Partner',
        avatarUrl: 'avatar.png',
        gender: UserGender.Female,
        city: 'Hanoi',
      });

      await expect(
        getStatusHandler.execute({ userId: 'user-1' }),
      ).resolves.toMatchObject({
        inQueue: false,
        currentUserAccepted: true,
        partnerAccepted: false,
        chatReady: false,
        matchedUser: {
          id: 'user-2',
          email: '',
          fullName: null,
          avatarUrl: null,
        },
      });
    });

    it('does not restore a matched queue whose conversation already ended', async () => {
      const queue = {
        status: MatchQueueStatus.Matched,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        matchedWithUserId: 'user-2',
        conversationId: 'conversation-1',
      };
      matchQueueRepo.findLatestByUserId = jest.fn().mockResolvedValue(queue);
      conversationRepo.findOne.mockResolvedValue({
        id: 'conversation-1',
        status: ConversationStatus.Ended,
        user1Id: 'user-1',
        user2Id: 'user-2',
      });
      matchQueueRepo.saveOne = jest.fn().mockResolvedValue(queue);

      const result = await getStatusHandler.execute({ userId: 'user-1' });
      expect(result).toEqual({
        inQueue: false,
        status: MatchQueueStatus.Cancelled,
        joinedAt: queue.createdAt,
      });
    });
  });

  describe('MatchService', () => {
    it('expires stale queues during retry matching', async () => {
      const expiredQueue = {
        id: 'queue-1',
        userId: 'user-1',
        status: MatchQueueStatus.Waiting,
        expiresAt: new Date(Date.now() - 1000),
      };
      matchQueueRepo.findWaitingWithExpiry = jest
        .fn()
        .mockResolvedValue([expiredQueue]);
      matchQueueRepo.expireAllExpired = jest.fn().mockResolvedValue(undefined);
      matchQueueRepo.findWaiting = jest.fn().mockResolvedValue([]);

      await matchService.retryMatching();

      expect(matchQueueRepo.expireAllExpired).toHaveBeenCalled();
      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'match.expired',
          aggregateId: 'user-1',
        }),
      );
    });
  });
});
