import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventBusService } from './event-bus.service';
import { OutboxEvent } from './outbox-event.entity';
import { OutboxService } from './outbox.service';
import { OutboxPublisher } from './outbox-publisher.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent])],
  providers: [EventBusService, OutboxService, OutboxPublisher],
  exports: [EventBusService, OutboxService],
})
export class EventBusModule {}
