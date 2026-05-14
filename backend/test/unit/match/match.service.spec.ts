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

describe('MatchService', () => {
  let matchQueueRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let userRepository: { findOne: jest.Mock };
  let conversationRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let realtimeService: {
    emitConversationCreated: jest.Mock;
    emitConversationEnded: jest.Mock;
  };
  let service: MatchService;

  beforeEach(() => {
    matchQueueRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: Partial<MatchQueue>) => ({
        id: 'queue-1',
        ...data,
      })),
      save: jest.fn((data: MatchQueue) => Promise.resolve(data)),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    userRepository = { findOne: jest.fn() };
    conversationRepository = {
      create: jest.fn((data: Partial<Conversation>) => ({
        id: 'conversation-1',
        ...data,
      })),
      save: jest.fn((data: Conversation) => Promise.resolve(data)),
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };
    realtimeService = {
      emitConversationCreated: jest.fn(),
      emitConversationEnded: jest.fn(),
    };
    service = new MatchService(
      matchQueueRepository as never,
      userRepository as never,
      conversationRepository as never,
      realtimeService as never,
    );
  });

  function mockQueueBuilder(matchedQueue: MatchQueue | null = null) {
    matchQueueRepository.createQueryBuilder.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 0 }),
      getOne: jest.fn().mockResolvedValue(matchedQueue),
    });
  }

  it('rejects queue joins for missing users or incomplete profiles', async () => {
    userRepository.findOne.mockResolvedValue(null);
    await expect(service.joinQueue('missing')).rejects.toThrow(
      NotFoundException,
    );

    userRepository.findOne.mockResolvedValue({ id: 'user-1', gender: null });
    await expect(service.joinQueue('user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('cancels stale queue state before creating a fresh search', async () => {
    const queue = { id: 'queue-existing', status: MatchQueueStatus.Waiting };
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      gender: UserGender.Male,
      city: 'Hanoi',
    });
    matchQueueRepository.findOne.mockResolvedValue(queue);
    mockQueueBuilder();

    await expect(service.joinQueue('user-1')).resolves.toMatchObject({
      id: 'queue-1',
      userId: 'user-1',
      status: MatchQueueStatus.Waiting,
    });
    expect(matchQueueRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        status: MatchQueueStatus.Waiting,
      }),
    );
  });

  it('creates a match and conversation when a compatible queue exists', async () => {
    const matchedQueue = {
      id: 'queue-2',
      userId: 'user-2',
      status: MatchQueueStatus.Waiting,
    };
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      gender: UserGender.Male,
      city: 'Hanoi',
    });
    matchQueueRepository.findOne.mockResolvedValue(null);
    mockQueueBuilder(matchedQueue as MatchQueue);

    const result = await service.joinQueue('user-1');

    expect(conversationRepository.create).toHaveBeenCalledWith({
      user1Id: 'user-1',
      user2Id: 'user-2',
      status: ConversationStatus.Active,
      user1Accepted: false,
      user2Accepted: false,
    });
    expect(result).toMatchObject({
      status: MatchQueueStatus.Matched,
      matchedWithUserId: 'user-2',
      conversationId: 'conversation-1',
    });
    expect(realtimeService.emitConversationCreated).toHaveBeenCalled();
  });

  it('cancels the active conversation before starting a new search', async () => {
    const activeConversation = {
      id: 'conversation-old',
      user1Id: 'user-1',
      user2Id: 'user-2',
      status: ConversationStatus.Active,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      gender: UserGender.Male,
      city: 'Hanoi',
    });
    matchQueueRepository.findOne.mockResolvedValue(null);
    conversationRepository.find.mockResolvedValue([activeConversation]);
    mockQueueBuilder();

    await service.joinQueue('user-1');

    expect(activeConversation.status).toBe(ConversationStatus.Ended);
    expect(conversationRepository.save).toHaveBeenCalledWith(
      activeConversation,
    );
    expect(matchQueueRepository.update).toHaveBeenCalledWith(
      { conversationId: 'conversation-old' },
      { status: MatchQueueStatus.Cancelled },
    );
    expect(realtimeService.emitConversationEnded).toHaveBeenCalledWith(
      ['user-1', 'user-2'],
      'conversation-old',
      'user-1',
    );
    expect(matchQueueRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
    );
  });

  it('cancels a waiting queue on leave', async () => {
    mockQueueBuilder();

    await service.leaveQueue('user-1');

    expect(matchQueueRepository.createQueryBuilder).toHaveBeenCalled();
  });

  it('returns matched status with hidden partner details until both users accept', async () => {
    matchQueueRepository.findOne.mockResolvedValue({
      status: MatchQueueStatus.Matched,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      matchedWithUserId: 'user-2',
      conversationId: 'conversation-1',
    });
    conversationRepository.findOne.mockResolvedValue({
      id: 'conversation-1',
      status: ConversationStatus.Active,
      user1Id: 'user-1',
      user2Id: 'user-2',
      user1Accepted: true,
      user2Accepted: false,
    });
    userRepository.findOne.mockResolvedValue({
      id: 'user-2',
      email: 'partner@example.com',
      fullName: 'Partner',
      avatarUrl: 'avatar.png',
      gender: UserGender.Female,
      city: 'Hanoi',
    });

    await expect(
      service.getQueueStatusResponse('user-1'),
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

  it('does not restore a matched queue whose conversation is already ended', async () => {
    const queue = {
      status: MatchQueueStatus.Matched,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      matchedWithUserId: 'user-2',
      conversationId: 'conversation-1',
    };
    matchQueueRepository.findOne.mockResolvedValue(queue);
    conversationRepository.findOne.mockResolvedValue({
      id: 'conversation-1',
      status: ConversationStatus.Ended,
      user1Id: 'user-1',
      user2Id: 'user-2',
    });

    await expect(service.getQueueStatusResponse('user-1')).resolves.toEqual({
      inQueue: false,
      status: MatchQueueStatus.Cancelled,
      joinedAt: queue.createdAt,
    });
    expect(queue.status).toBe(MatchQueueStatus.Cancelled);
    expect(matchQueueRepository.save).toHaveBeenCalledWith(queue);
  });

  it('expires stale queues during retry matching', async () => {
    const expiredQueue = {
      id: 'queue-1',
      userId: 'user-1',
      status: MatchQueueStatus.Waiting,
      expiresAt: new Date(Date.now() - 1000),
    };
    matchQueueRepository.find.mockResolvedValue([expiredQueue]);

    await service.retryMatching();

    expect(expiredQueue.status).toBe(MatchQueueStatus.Expired);
    expect(matchQueueRepository.save).toHaveBeenCalledWith(expiredQueue);
  });
});
