import { GetHistoryUseCase } from "../../../application/use-cases/chat/GetHistory";
import { SendMessageUseCase } from "../../../application/use-cases/chat/SendMessage";
import { User } from "../../../domain/entities/User";
import { IRoomRepository } from "../../../domain/repositories/IRoomRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { getNotificationService } from "../../external-services/NotificationService";

type NormalizedGender = "nam" | "nu" | "khac" | "";

const normalizeGender = (value: unknown): NormalizedGender => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "nam" || raw === "male") return "nam";
  if (raw === "nu" || raw === "female") return "nu";
  if (raw === "khac" || raw === "other") return "khac";
  return "";
};

const getOppositeGender = (gender: NormalizedGender): NormalizedGender => {
  if (gender === "nam") return "nu";
  if (gender === "nu") return "nam";
  return "";
};

const statusPriority = (status: string): number => {
  const normalized = status.toLowerCase();
  if (normalized === "online") return 0;
  if (normalized === "away") return 1;
  return 2;
};

const toChatUserResponse = (user: User) => {
  const raw = user.toPrimitives();
  const attributes = raw.attributes ?? {};
  const gender = normalizeGender(attributes.gender);
  const status = typeof attributes.status === "string" ? attributes.status : "Offline";

  return {
    id: raw.id,
    displayName: raw.displayName,
    name: raw.displayName,
    email: raw.email,
    avatar: typeof attributes.avatar === "string" ? attributes.avatar : undefined,
    status,
    address: typeof attributes.address === "string" ? attributes.address : undefined,
    gender
  };
};

interface MatchmakingQueueEntry {
  userId: string;
  preferredGender: NormalizedGender;
  joinedAt: number;
}

interface PendingMatchEntry {
  roomId: string;
  partnerId: string;
  createdAt: number;
}

const MATCHMAKING_ENTRY_TTL_MS = 5 * 60 * 1000;
const matchmakingQueue: MatchmakingQueueEntry[] = [];
const pendingMatches = new Map<string, PendingMatchEntry>();

const removeFromQueue = (userId: string): void => {
  const index = matchmakingQueue.findIndex((entry) => entry.userId === userId);
  if (index >= 0) {
    matchmakingQueue.splice(index, 1);
  }
};

const cleanupQueue = (): void => {
  const now = Date.now();
  for (let index = matchmakingQueue.length - 1; index >= 0; index -= 1) {
    if (now - matchmakingQueue[index].joinedAt > MATCHMAKING_ENTRY_TTL_MS) {
      matchmakingQueue.splice(index, 1);
    }
  }
};

const cleanupPendingMatches = (): void => {
  const now = Date.now();
  for (const [userId, entry] of pendingMatches.entries()) {
    if (now - entry.createdAt > MATCHMAKING_ENTRY_TTL_MS) {
      pendingMatches.delete(userId);
    }
  }
};

const isGenderCompatible = (
  currentPreferredGender: NormalizedGender,
  otherPreferredGender: NormalizedGender,
  currentGender: NormalizedGender,
  otherGender: NormalizedGender
): boolean => {
  const currentSatisfied = !currentPreferredGender || !otherGender || currentPreferredGender === otherGender;
  const otherSatisfied = !otherPreferredGender || !currentGender || otherPreferredGender === currentGender;
  return currentSatisfied && otherSatisfied;
};

export class ChatController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  sendMessage = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const payload = {
        roomId: req.body?.roomId,
        senderId: req.currentUser?.id ?? req.body?.senderId,
        contentType: req.body?.contentType ?? "text",
        content: req.body?.content
      };

      const message = await this.sendMessageUseCase.execute(payload);

      const notificationService = getNotificationService();
      const room = await this.roomRepository.findById(message.roomId);
      const roomMembersFromRoom = room
        ? [room.participantA, room.participantB]
        : [];
      const roomMembersFromBody = Array.isArray(req.body?.roomMembers)
        ? req.body.roomMembers
        : [];
      const roomMembers = [...roomMembersFromRoom, ...roomMembersFromBody].filter(
        (memberId: string, index: number, arr: string[]) =>
          Boolean(memberId) && arr.indexOf(memberId) === index
      );

      if (roomMembers.length > 0) {
        await notificationService.broadcastNotification(
          roomMembers.filter((memberId: string) => memberId !== message.senderId),
          {
            type: "MESSAGE",
            title: "New Message",
            content: message.content,
            roomId: message.roomId,
            senderId: message.senderId,
            metadata: {
              messageId: message.id,
              contentType: message.contentType
            }
          }
        );
      }

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const history = await this.getHistoryUseCase.execute({
        roomId: req.params?.roomId,
        requesterId: req.currentUser?.id ?? req.query?.requesterId,
        limit: req.query?.limit ? Number(req.query.limit) : undefined,
        before: req.query?.before ? new Date(req.query.before) : undefined
      });

      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const keyword = typeof req.query?.q === "string" ? req.query.q : undefined;
      const users = await this.userRepository.search(keyword, 30);
      const currentUser = req.currentUser as User | undefined;
      const currentUserId = currentUser?.id;
      const preferredGender = getOppositeGender(normalizeGender(currentUser?.attributes?.gender));

      const filteredUsers = users.filter((user) => {
        if (user.id === currentUserId) return false;
        if (!preferredGender) return true;

        const gender = normalizeGender(user.attributes?.gender);
        return !gender || gender === preferredGender;
      });

      const mappedUsers = filteredUsers
        .map((user) => toChatUserResponse(user))
        .sort((a, b) => {
          const statusCompare = statusPriority(a.status) - statusPriority(b.status);
          if (statusCompare !== 0) return statusCompare;
          return a.name.localeCompare(b.name);
        });

      res.status(200).json({ users: mappedUsers });
    } catch (error) {
      next(error);
    }
  };

  searchMatch = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User;
      const currentUserGender = normalizeGender(currentUser.attributes?.gender);
      const currentUserPreferredGender = getOppositeGender(currentUserGender);

      cleanupQueue();
      cleanupPendingMatches();

      const pendingMatch = pendingMatches.get(currentUser.id);
      if (pendingMatch) {
        pendingMatches.delete(currentUser.id);
        const pendingPartner = await this.userRepository.findById(pendingMatch.partnerId);

        if (pendingPartner) {
          res.status(200).json({
            status: "matched",
            roomId: pendingMatch.roomId,
            partner: toChatUserResponse(pendingPartner)
          });
          return;
        }
      }

      removeFromQueue(currentUser.id);

      const queueSnapshot = [...matchmakingQueue];
      let matchedEntry: MatchmakingQueueEntry | null = null;

      for (const entry of queueSnapshot) {
        if (entry.userId === currentUser.id) continue;
        const candidate = await this.userRepository.findById(entry.userId);
        if (!candidate) {
          removeFromQueue(entry.userId);
          continue;
        }

        const candidateGender = normalizeGender(candidate.attributes?.gender);
        const compatible = isGenderCompatible(
          currentUserPreferredGender,
          entry.preferredGender,
          currentUserGender,
          candidateGender
        );

        if (compatible) {
          matchedEntry = entry;
          break;
        }
      }

      if (!matchedEntry) {
        matchmakingQueue.push({
          userId: currentUser.id,
          preferredGender: currentUserPreferredGender,
          joinedAt: Date.now()
        });
        res.status(200).json({
          status: "waiting",
          queueSize: matchmakingQueue.length
        });
        return;
      }

      removeFromQueue(matchedEntry.userId);
      const partner = await this.userRepository.findById(matchedEntry.userId);
      if (!partner) {
        matchmakingQueue.push({
          userId: currentUser.id,
          preferredGender: currentUserPreferredGender,
          joinedAt: Date.now()
        });
        res.status(200).json({
          status: "waiting",
          queueSize: matchmakingQueue.length
        });
        return;
      }

      const existingRoom = await this.roomRepository.findActiveByParticipants(
        currentUser.id,
        partner.id
      );
      const room = existingRoom ?? (await this.roomRepository.createPrivateRoom(currentUser.id, partner.id));
      const pendingCreatedAt = Date.now();
      pendingMatches.set(currentUser.id, {
        roomId: room.id,
        partnerId: partner.id,
        createdAt: pendingCreatedAt
      });
      pendingMatches.set(partner.id, {
        roomId: room.id,
        partnerId: currentUser.id,
        createdAt: pendingCreatedAt
      });

      res.status(200).json({
        status: "matched",
        roomId: room.id,
        partner: toChatUserResponse(partner)
      });
    } catch (error) {
      next(error);
    }
  };

  cancelMatchSearch = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User;
      removeFromQueue(currentUser.id);
      pendingMatches.delete(currentUser.id);
      res.status(200).json({
        status: "cancelled"
      });
    } catch (error) {
      next(error);
    }
  };
}
