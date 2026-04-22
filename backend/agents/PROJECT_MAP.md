# PROJECT MAP - Banked Backend

## 1) Kien truc tong the
Du an theo huong layer:
- `src/domain`: business rules
- `src/application`: use-case orchestration
- `src/infrastructure`: framework, db, security, webserver
- `src/shared`: constants, errors, utils

## 2) File trung tam can biet
- Server wiring:
  - `src/infrastructure/webserver/server.ts`
  - `src/infrastructure/webserver/main.ts`
- Auth:
  - `src/infrastructure/webserver/controllers/AuthController.ts`
  - `src/infrastructure/security/JwtStrategy.ts`
  - `src/infrastructure/security/AuthCookies.ts`
  - `src/infrastructure/external-services/GoogleAuth.ts`
- Authorization:
  - `src/infrastructure/security/AbacMiddleware.ts`
  - `src/domain/services/PermissionCheck.ts`
- Chat use-cases:
  - `src/application/use-cases/chat/SendMessage.ts`
  - `src/application/use-cases/chat/GetHistory.ts`
- DB:
  - `src/infrastructure/database/connection.ts`
  - `src/infrastructure/database/repositories/KnexUserRepository.ts`
  - `src/infrastructure/database/repositories/KnexMessageRepository.ts`
  - `src/infrastructure/database/migrations/*`

## 3) Luong request mac dinh
1. Route vao controller.
2. Middleware auth/authz xac thuc token va quyen.
3. Controller goi use-case.
4. Use-case su dung repository interface.
5. Infrastructure repository thao tac MySQL qua Knex.

## 4) Scripts quan trong
- `npm run build`: compile TypeScript.
- `npm run dev`: build + run server.
- `npm run db:setup`: tao database + run migrations.
- `npm run test:unit`: chay unit test use-cases.

## 5) Testing hien tai
- Unit test dang o:
  - `tests/unit/use-cases.unit.test.js`
- Kieu test:
  - mock repository/service
  - tap trung logic use-case
