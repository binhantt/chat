const { LoginWithGoogleUseCase } = require("../../dist/application/use-cases/auth/LoginWithGoogle");
const { RefreshTokenUseCase } = require("../../dist/application/use-cases/auth/RefreshToken");
const { SendMessageUseCase } = require("../../dist/application/use-cases/chat/SendMessage");
const { GetHistoryUseCase } = require("../../dist/application/use-cases/chat/GetHistory");
const { User } = require("../../dist/domain/entities/User");
const { Message } = require("../../dist/domain/entities/Message");
const { NotFoundError, UnauthorizedError } = require("../../dist/shared/errors/AppError");
const { DEFAULT_HISTORY_LIMIT } = require("../../dist/shared/constants/AppConstants");

function createUser(id = "user-1") {
  return new User({
    id,
    displayName: `User ${id}`,
    email: `${id}@example.com`,
    trustScore: 80,
    attributes: { role: "user" }
  });
}

describe("Unit Testing - Application Use Cases", () => {
  describe("LoginWithGoogleUseCase", () => {
    test("returns existing user without creating new user", async () => {
      const existingUser = createUser("existing-user");
      const userRepository = {
        findByGoogleId: jest.fn().mockResolvedValue(existingUser),
        save: jest.fn(),
        findById: jest.fn(),
        update: jest.fn()
      };
      const googleAuthService = {
        verifyIdToken: jest.fn().mockResolvedValue({
          googleId: "gg-1",
          email: "existing@example.com",
          name: "Existing"
        })
      };

      const useCase = new LoginWithGoogleUseCase(userRepository, googleAuthService);
      const result = await useCase.execute("token-demo");

      expect(result.id).toBe("existing-user");
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    test("creates new user when googleId does not exist", async () => {
      const userRepository = {
        findByGoogleId: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation(async (user) => user),
        findById: jest.fn(),
        update: jest.fn()
      };
      const googleAuthService = {
        verifyIdToken: jest.fn().mockResolvedValue({
          googleId: "gg-new",
          email: "new@example.com",
          name: "New User"
        })
      };

      const useCase = new LoginWithGoogleUseCase(userRepository, googleAuthService);
      const result = await useCase.execute("token-new");

      expect(result.email).toBe("new@example.com");
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("RefreshTokenUseCase", () => {
    test("throws UnauthorizedError when refresh token is missing", async () => {
      const tokenService = {
        verifyRefreshToken: jest.fn(),
        createAccessToken: jest.fn(),
        createRefreshToken: jest.fn()
      };
      const useCase = new RefreshTokenUseCase(tokenService);

      await expect(useCase.execute("")).rejects.toBeInstanceOf(UnauthorizedError);
      expect(tokenService.verifyRefreshToken).not.toHaveBeenCalled();
    });

    test("returns new accessToken and refreshToken", async () => {
      const tokenService = {
        verifyRefreshToken: jest.fn().mockResolvedValue({ userId: "u-123" }),
        createAccessToken: jest.fn().mockResolvedValue("access-123"),
        createRefreshToken: jest.fn().mockResolvedValue("refresh-456")
      };
      const useCase = new RefreshTokenUseCase(tokenService);
      const result = await useCase.execute("refresh-old");

      expect(result).toEqual({
        accessToken: "access-123",
        refreshToken: "refresh-456"
      });
    });
  });

  describe("SendMessageUseCase", () => {
    test("throws NotFoundError when sender does not exist", async () => {
      const userRepository = {
        findById: jest.fn().mockResolvedValue(null),
        findByGoogleId: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
      };
      const messageRepository = {
        save: jest.fn(),
        getRoomHistory: jest.fn()
      };
      const permissionCheck = { can: jest.fn() };
      const useCase = new SendMessageUseCase(
        userRepository,
        messageRepository,
        permissionCheck
      );

      await expect(
        useCase.execute({
          roomId: "room-1",
          senderId: "missing-user",
          contentType: "text",
          content: "hello"
        })
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("throws UnauthorizedError when permission check fails", async () => {
      const sender = createUser("sender-1");
      const userRepository = {
        findById: jest.fn().mockResolvedValue(sender),
        findByGoogleId: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
      };
      const messageRepository = {
        save: jest.fn(),
        getRoomHistory: jest.fn()
      };
      const permissionCheck = { can: jest.fn().mockReturnValue(false) };
      const useCase = new SendMessageUseCase(
        userRepository,
        messageRepository,
        permissionCheck
      );

      await expect(
        useCase.execute({
          roomId: "room-1",
          senderId: "sender-1",
          contentType: "text",
          content: "hello"
        })
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test("sends message successfully and returns MessageDTO", async () => {
      const sender = createUser("sender-2");
      const userRepository = {
        findById: jest.fn().mockResolvedValue(sender),
        findByGoogleId: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
      };
      const messageRepository = {
        save: jest.fn().mockImplementation(async (message) => message),
        getRoomHistory: jest.fn()
      };
      const permissionCheck = { can: jest.fn().mockReturnValue(true) };
      const useCase = new SendMessageUseCase(
        userRepository,
        messageRepository,
        permissionCheck
      );

      const result = await useCase.execute({
        roomId: "room-2",
        senderId: "sender-2",
        contentType: "text",
        content: "unit test message"
      });

      expect(result.roomId).toBe("room-2");
      expect(result.senderId).toBe("sender-2");
      expect(messageRepository.save).toHaveBeenCalledTimes(1);
      expect(messageRepository.save.mock.calls[0][0]).toBeInstanceOf(Message);
    });
  });

  describe("GetHistoryUseCase", () => {
    test("uses default history limit when limit is undefined", async () => {
      const requester = createUser("requester-1");
      const userRepository = {
        findById: jest.fn().mockResolvedValue(requester),
        findByGoogleId: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
      };
      const historyMessage = new Message({
        id: "m1",
        roomId: "room-9",
        senderId: "sender-9",
        contentType: "text",
        content: "history",
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      });
      const messageRepository = {
        save: jest.fn(),
        getRoomHistory: jest.fn().mockResolvedValue([historyMessage])
      };
      const permissionCheck = { can: jest.fn().mockReturnValue(true) };
      const useCase = new GetHistoryUseCase(
        userRepository,
        messageRepository,
        permissionCheck
      );

      const result = await useCase.execute({
        roomId: "room-9",
        requesterId: "requester-1"
      });

      expect(messageRepository.getRoomHistory).toHaveBeenCalledWith(
        "room-9",
        DEFAULT_HISTORY_LIMIT,
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("m1");
    });
  });
});
