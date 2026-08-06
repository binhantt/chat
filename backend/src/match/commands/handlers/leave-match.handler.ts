import { Injectable } from '@nestjs/common';
import type { LeaveMatchCommand } from '../leave-match.command';
import { MatchService } from '../../match.service';
import { SpeedBoostService } from '../../services/speed-boost.service';
import { AiChatService } from '../../../ai/ai-chat.service';
import { EventBusService } from '../../events/event-bus.service';
import { createMatchCancelledEvent } from '../../events/match-cancelled.event';

@Injectable()
export class LeaveMatchHandler {
  constructor(
    private readonly matchService: MatchService,
    private readonly speedBoostService: SpeedBoostService,
    private readonly aiChatService: AiChatService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: LeaveMatchCommand): Promise<void> {
    const { userId } = command;
    await this.matchService.cancelQueueStateForUser(userId);

    // Set cooldown after leaving (skip for boosted users)
    await this.speedBoostService.setCooldown(userId);

    const exitCount = this.matchService.incrementExitCount(userId);

    // After 5 exits, notify user that many people are online
    if (exitCount >= 5) {
      this.eventBus.emit(createMatchCancelledEvent(userId, 'ai_takeover'));
    } else {
      this.eventBus.emit(createMatchCancelledEvent(userId, 'user_left'));
    }
  }
}
