# Chat Project

This is the main documentation index for the chat project. All documents below are located at the root or relevant subdirectories.

## Quick Index

- [Architecture Overview](ARCHITECTURE.md)
- [Project Structure](DOC_01_CAU_TRUC.md)
- [Product Vision](DOC_02_Y_TUONG.md)
- [System Optimization](DOC_03_TOI_UU.md)
- [Code Summary](DOC_04_CODE_TONG_HOP.md)
- [UI Color Palette](DOC_05_BANG_MAU.md)
- [Security](DOC_06_BAO_MAT.md)
- [Environment Variables](DOC_07_ENV.md)
- [Event-Driven Architecture](DOC_08_EVENT_DRIVEN.md)

## Documentation by Category

### Overview

- [ARCHITECTURE.md](ARCHITECTURE.md): system architecture overview.
- [DOC_01_CAU_TRUC.md](DOC_01_CAU_TRUC.md): frontend, backend structure and module breakdown.
- [DOC_02_Y_TUONG.md](DOC_02_Y_TUONG.md): product vision and development direction.
- [DOC_08_EVENT_DRIVEN.md](DOC_08_EVENT_DRIVEN.md): event-driven architecture.

### Technical

- [DOC_03_TOI_UU.md](DOC_03_TOI_UU.md): query optimization, pagination, indexes, and performance.
- [DOC_04_CODE_TONG_HOP.md](DOC_04_CODE_TONG_HOP.md): summary of key code points.
- [DOC_06_BAO_MAT.md](DOC_06_BAO_MAT.md): security, auth, cookie, CSRF, and access control.
- [DOC_07_ENV.md](DOC_07_ENV.md): `.env` variables, related files, and configuration guide.

### UI

- [DOC_05_BANG_MAU.md](DOC_05_BANG_MAU.md): UI color palette and design conventions.
- [Frontend/README.md](Frontend/README.md): frontend run guide and frontend environment variables.
- [backend/README.md](backend/README.md): backend API and env documentation links.

## Sample Env Files

- [backend/.env.example](backend/.env.example): backend config template.
- [Frontend/.env.example](Frontend/.env.example): frontend config template.

## Notes

- Do not commit actual `.env` files as they may contain secrets.
- If adding new config variables, update both `.env.example` and [DOC_07_ENV.md](DOC_07_ENV.md).
