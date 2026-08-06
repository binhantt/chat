# DOC 08 - Event-Driven Architecture

Updated: 18/06/2026

This document describes the Event-Driven Architecture currently applied in the project, focusing on the **conduct** module as a reference example. When expanding to other modules, follow this structure.

## Introduction

Event-Driven Architecture is a software architecture where components communicate through **events** instead of direct calls.

In this project, we apply Event-Driven combined with **CQRS** (Command Query Responsibility Segregation):

- **Command** receives requests (Create, Update, Delete) -> executes -> **emits event**
- **Query** reads data, does not create events
- **Event** is published for other components to listen and react

## Processing Flow

```text
Client request
       │
       ▼
  Controller
       │
       ▼
  Command Handler  ──► DB operation
       │                 │
       │                 ▼
       │            Cache refresh
       │                 │
       ▼                 ▼
  EventBus.emit() ──► Event Listeners
                          │
                          ├── Logger
                          ├── Audit log
                          ├── Notification
                          └── ...

  Query Handler ──► DB read ──► Response
```

## Directory Structure

Currently Event-Driven is applied in `backend/src/conduct`:

```text
backend/src/conduct/
├── commands/                          # Command definitions
│   ├── create-conduct-rule.command.ts
│   ├── update-conduct-rule.command.ts
│   ├── delete-conduct-rule.command.ts
│   └── handlers/                      # Command handlers
│       ├── create-conduct-rule.handler.ts
│       ├── update-conduct-rule.handler.ts
│       └── delete-conduct-rule.handler.ts
├── queries/                           # Query definitions
│   ├── get-conduct-rules.query.ts
│   ├── check-message.query.ts
│   └── handlers/                      # Query handlers
│       ├── get-conduct-rules.handler.ts
│       └── check-message.handler.ts
├── events/                            # Event system
│   ├── event-bus.service.ts           # EventBus (RxJS)
│   ├── conduct-rule-created.event.ts
│   ├── conduct-rule-updated.event.ts
│   └── conduct-rule-deleted.event.ts
├── entities/
├── pipes/
├── repositories/
└── services/
```

## EventBusService

`EventBusService` is a custom event bus using RxJS `Subject`. It is located in `events/event-bus.service.ts`.

### API

```typescript
export interface EventPayload {
  eventName: string;      // Event name, e.g. 'conduct.rule.created'
  aggregateId: string;    // ID of the affected entity
  occurredAt: Date;       // When it happened
  data: Record<string, unknown>;  // Event data
}

// Emit event
eventBus.emit(payload);

// Listen to specific event
eventBus.on('conduct.rule.created').subscribe(payload => {
  // payload.eventName === 'conduct.rule.created'
  // payload.aggregateId === rule.id
  // payload.data.phrase === rule.phrase
});

// Listen to all events
eventBus.getAll().subscribe(payload => {
  console.log(payload.eventName, payload.aggregateId);
});
```

## Event Factory (Event Classes)

Each event is a **factory function** + **string constant**:

```typescript
// events/conduct-rule-created.event.ts
export const CONDUCT_RULE_CREATED = 'conduct.rule.created';

export function createConductRuleCreatedEvent(
  ruleId: string,
  phrase: string,
): EventPayload {
  return {
    eventName: CONDUCT_RULE_CREATED,
    aggregateId: ruleId,
    occurredAt: new Date(),
    data: { phrase },
  };
}
```

### Existing Events

| Event | Name | Data | Emitted When |
|-------|------|------|-------------|
| `conduct-rule-created.event` | `conduct.rule.created` | `{ phrase }` | New rule created |
| `conduct-rule-updated.event` | `conduct.rule.updated` | `{ phrase?, note?, isActive? }` | Rule updated |
| `conduct-rule-deleted.event` | `conduct.rule.deleted` | `{}` | Rule deleted |

## How Command Handlers Emit Events

In handlers, events are emitted **after** DB operation and cache refresh complete:

```typescript
@Injectable()
export class CreateConductRuleHandler {
  constructor(
    private readonly conductRuleRepository: ConductRuleRepository,
    private readonly cache: ConductRuleCacheService,
    private readonly normalizer: ConductRuleNormalizerService,
    private readonly eventBus: EventBusService,  // Inject EventBus
  ) {}

  async execute(command: CreateConductRuleCommand): Promise<ConductRule> {
    // 1. Validate
    const normalizedPhrase = this.normalizer.cleanPhrase(command.phrase);

    // 2. DB operation
    const rule = await this.conductRuleRepository.saveOne(...);

    // 3. Cache refresh
    await this.cache.refresh();

    // 4. Emit event (after everything succeeds)
    this.eventBus.emit(createConductRuleCreatedEvent(rule.id, rule.phrase));

    return rule;
  }
}
```

**Event emission rules:**
- Always emit **after** DB + cache, not before success is confirmed.
- Emit right before `return` to ensure transaction has committed.
- A handler can emit multiple events if needed.

## How to Listen to Events

To listen to events, inject `EventBusService` into any provider:

```typescript
@Injectable()
export class ConductAuditService {
  constructor(private readonly eventBus: EventBusService) {
    // Listen when rule is created
    this.eventBus.on(CONDUCT_RULE_CREATED).subscribe((event) => {
      console.log(`Rule created: ${event.aggregateId} - ${event.data.phrase}`);
    });

    // Listen when rule is updated
    this.eventBus.on(CONDUCT_RULE_UPDATED).subscribe((event) => {
      console.log(`Rule updated: ${event.aggregateId}`, event.data);
    });

    // Listen when rule is deleted
    this.eventBus.on(CONDUCT_RULE_DELETED).subscribe((event) => {
      console.log(`Rule deleted: ${event.aggregateId}`);
    });
  }
}
```

## Expanding Event-Driven to Other Modules

To apply Event-Driven to other modules (e.g. report, users, chat), follow these steps:

### Step 1: Create Event Files

```text
backend/src/report/events/
├── event-bus.service.ts       # Shared EventBusService (global)
├── report-created.event.ts
├── report-status-changed.event.ts
└── report-resolved.event.ts
```

### Step 2: Define Event Factory

```typescript
export const REPORT_CREATED = 'report.created';

export function createReportCreatedEvent(
  reportId: string,
  reporterId: string,
  reportedUserId: string,
  reason: string,
): EventPayload {
  return {
    eventName: REPORT_CREATED,
    aggregateId: reportId,
    occurredAt: new Date(),
    data: { reporterId, reportedUserId, reason },
  };
}
```

### Step 3: Command Handler Emits Event

Inject `EventBusService` into handler, emit after processing completes.

### Step 4: Create Listener (if needed)

Listeners can be in the same module or a different module. Inject `EventBusService` and subscribe.

## Template for Event Listener

```typescript
// ConductLogListener.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService, CONDUCT_RULE_CREATED, CONDUCT_RULE_DELETED } from './events';

@Injectable()
export class ConductLogListener implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit() {
    this.eventBus.on(CONDUCT_RULE_CREATED).subscribe((event) => {
      // Log, send notification, sync data...
    });

    this.eventBus.on(CONDUCT_RULE_DELETED).subscribe((event) => {
      // Clean up, notify...
    });
  }
}
```

Register listener in module providers:

```typescript
@Module({
  providers: [
    ConductLogListener,
    // ...
  ],
})
export class ConductModule {}
```

## Full Diagram: CQRS + Event-Driven

```text
┌────────────────────────────────────────────────────────────┐
│                        Client                             │
└──────────────┬───────────────────────────────┬────────────┘
               │  POST/PATCH/DELETE            │  GET
               ▼                               ▼
        ┌──────────────┐              ┌──────────────┐
        │   Controller  │              │   Controller  │
        └──────┬───────┘              └──────┬───────┘
               │ injects                     │ injects
               ▼                             ▼
        ┌──────────────┐              ┌──────────────┐
        │    Command   │              │    Query     │
        │   Handler    │              │   Handler    │
        └──────┬───────┘              └──────┬───────┘
               │                             │
               ▼                             ▼
        ┌──────────────┐              ┌──────────────┐
        │     DB +     │              │     DB       │
        │    Cache     │              │    Read      │
        └──────┬───────┘              └──────┬───────┘
               │                             │
               ▼                             ▼
        ┌──────────────┐              ┌──────────────┐
        │ EventBus     │              │   Response   │
        │ .emit()      │              │              │
        └──────┬───────┘              └──────────────┘
               │
               ▼
        ┌──────────────┐
        │  Listeners   │
        │ (Logger,     │
        │  Audit, etc) │
        └──────────────┘
```

## Benefits

- **Decoupled**: Command handlers don't need to know who listens to events.
- **Easily extensible**: Add new listeners without modifying handler code.
- **Consistency guarantee**: Cache refresh completes before event emission.
- **Testable**: Inject mock EventBus to verify events were emitted.
- **Reactive response**: Listeners can execute asynchronously.

## Notes

- `EventBusService` is a **global singleton** in the NestJS DI container.
- Events are emitted **synchronously** within the same process (no queue/Message Broker).
- If queue is needed later (RabbitMQ, Kafka), replace EventBus with message broker client, keeping the `emit()` / `on()` interface.
- Don't subscribe in constructor; use `OnModuleInit` to avoid circular dependency issues.
- Event payload should be plain objects, not class instances, for easy serialization later.
