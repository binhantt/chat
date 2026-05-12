import { Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Message } from './entities/message.entity';

type ChatEvent =
  | {
      type: 'message.created';
      message: Message;
    }
  | {
      type: 'typing';
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }
  | {
      type: 'conversation.ended';
      conversationId: string;
      endedByUserId: string;
    };

@Injectable()
export class ChatRealtimeService {
  private readonly logger = new Logger(ChatRealtimeService.name);
  private readonly clients = new Map<string, Set<Response>>();

  subscribe(userId: string, response: Response): void {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');
    response.flushHeaders?.();

    this.addClient(userId, response);
    this.writeEvent(response, 'ready', { userId });

    const heartbeat = setInterval(() => {
      response.write(': heartbeat\n\n');
    }, 25000);

    response.on('close', () => {
      clearInterval(heartbeat);
      this.removeClient(userId, response);
    });
  }

  emitMessage(userIds: string[], message: Message): void {
    const event: ChatEvent = {
      type: 'message.created',
      message,
    };

    this.emitToUsers(userIds, event);
  }

  emitTyping(
    userIds: string[],
    conversationId: string,
    userId: string,
    isTyping: boolean,
  ): void {
    this.emitToUsers(userIds, {
      type: 'typing',
      conversationId,
      userId,
      isTyping,
    });
  }

  emitConversationEnded(
    userIds: string[],
    conversationId: string,
    endedByUserId: string,
  ): void {
    this.emitToUsers(userIds, {
      type: 'conversation.ended',
      conversationId,
      endedByUserId,
    });
  }

  private emitToUsers(userIds: string[], event: ChatEvent): void {
    for (const userId of new Set(userIds)) {
      const clients = this.clients.get(userId);

      if (!clients?.size) {
        continue;
      }

      for (const client of clients) {
        this.writeEvent(client, 'chat', event);
      }
    }
  }

  private addClient(userId: string, response: Response): void {
    const clients = this.clients.get(userId) ?? new Set<Response>();
    clients.add(response);
    this.clients.set(userId, clients);
    this.logger.log(`SSE connected: ${userId} (${clients.size})`);
  }

  private removeClient(userId: string, response: Response): void {
    const clients = this.clients.get(userId);

    if (!clients) {
      return;
    }

    clients.delete(response);

    if (clients.size === 0) {
      this.clients.delete(userId);
    }

    this.logger.log(`SSE disconnected: ${userId}`);
  }

  private writeEvent(response: Response, event: string, data: unknown): void {
    response.write(`event: ${event}\n`);
    response.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
