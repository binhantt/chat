import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { GetMatchStatusQuery } from '../get-match-status.query';
import { User, UserGender } from '../../../users/entities/user.entity';
import {
  Conversation,
  ConversationStatus,
} from '../../../chat/entities/conversation.entity';
import { MatchQueue, MatchQueueStatus } from '../../entities/match-queue.entity';
import { MatchQueueRepository } from '../../repositories/match-queue.repository';

export interface MatchStatusResponse {
  inQueue: boolean;
  status?: MatchQueueStatus;
  joinedAt?: Date;
  conversationId?: string | null;
  matchedWithUserId?: string | null;
  currentUserAccepted?: boolean;
  partnerAccepted?: boolean;
  chatReady?: boolean;
  matchedUser?: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    gender: UserGender | null;
    city: string | null;
  };
}

@Injectable()
export class GetMatchStatusHandler {
  constructor(
    private readonly matchQueueRepository: MatchQueueRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async execute(query: GetMatchStatusQuery): Promise<MatchStatusResponse> {
    const { userId } = query;
    const status = await this.matchQueueRepository.findLatestByUserId(userId);

    if (!status) {
      return { inQueue: false };
    }

    const result: MatchStatusResponse = {
      inQueue: status.status === MatchQueueStatus.Waiting,
      status: status.status,
      joinedAt: status.createdAt,
    };

    if (
      status.status === MatchQueueStatus.Matched &&
      status.matchedWithUserId &&
      status.conversationId
    ) {
      const [conversation, matchedUser] = await Promise.all([
        this.conversationRepository.findOne({
          where: { id: status.conversationId },
        }),
        this.userRepository.findOne({
          select: {
            avatarUrl: true,
            city: true,
            email: true,
            fullName: true,
            gender: true,
            id: true,
          },
          where: { id: status.matchedWithUserId },
        }),
      ]);

      if (!conversation || conversation.status !== ConversationStatus.Active) {
        status.status = MatchQueueStatus.Cancelled;
        await this.matchQueueRepository.saveOne(status);
        return {
          inQueue: false,
          status: MatchQueueStatus.Cancelled,
          joinedAt: status.createdAt,
        };
      }

      const currentUserAccepted =
        conversation.user1Id === userId
          ? conversation.user1Accepted === true
          : conversation.user2Accepted === true;
      const partnerAccepted =
        conversation.user1Id === userId
          ? conversation.user2Accepted === true
          : conversation.user1Accepted === true;
      const chatReady = currentUserAccepted && partnerAccepted;

      result.conversationId = status.conversationId;
      result.matchedWithUserId = status.matchedWithUserId;
      result.currentUserAccepted = currentUserAccepted;
      result.partnerAccepted = partnerAccepted;
      result.chatReady = chatReady;

      if (matchedUser) {
        result.matchedUser = {
          id: matchedUser.id,
          email: chatReady ? matchedUser.email : '',
          fullName: chatReady ? matchedUser.fullName : null,
          avatarUrl: chatReady ? matchedUser.avatarUrl : null,
          gender: matchedUser.gender,
          city: matchedUser.city,
        };
      }
    }

    return result;
  }
}
