# Backend Layering

## Goal

Backend separates responsibilities so code is easy to maintain, test, and prevents security logic leakage into controllers or repositories.

## Routes / Controllers

- Declare route, guard, policy, and validate input format.
- Controllers must be thin: only extract HTTP parameters, call service, and return response.
- Don't write DB queries, encoding, business calculations, or retry logic in controllers.

## Services

- Contain application business logic.
- Contain security rules, encoding, hashing, small caching, and multi-step workflows.
- Call repositories to read/write data.
- Throw meaningful business exceptions like `BadRequestException`, `ConflictException`, `NotFoundException`.

## Repositories

- Contain no business logic.
- Only contain optimized DB queries with parameters, projection/select for needed fields.
- Use cursor pagination instead of offset when lists can be large.
- Don't return sensitive fields if caller doesn't need them.
- Prefer queries that fetch multiple rows via JOIN/IN to avoid N+1.

## Already Applied

- `conduct`: `ConductService` handles conduct rules and caching; `ConductRuleRepository` handles rule queries.
- `analytics`: `AnalyticsService` handles normalize/hash requests; `PageVisitRepository` handles visit inserts and statistics.

## Convention for New Modules

```txt
feature/
  feature.controller.ts
  feature.service.ts
  repositories/
    feature.repository.ts
  dto/
  entities/
```

Controller does not import TypeORM. Service does not write query builder directly if the query can be placed in the repository.
