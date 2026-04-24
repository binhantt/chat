import { GetHistoryUseCase } from "../../../application/use-cases/chat/GetHistory";
import { SendMessageUseCase } from "../../../application/use-cases/chat/SendMessage";
import { User } from "../../../domain/entities/User";
import { IRoomRepository, RoomRecord } from "../../../domain/repositories/IRoomRepository";
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

const ANONYMOUS_DISPLAY_NAME = "Người lạ bí mật";

const toChatUserResponse = (user: User) => {
  const raw = user.toPrimitives();
  const attributes = raw.attributes ?? {};
  const gender = normalizeGender(raw.personalDetail?.gender ?? attributes.gender);
  const status = typeof attributes.status === "string" ? attributes.status : "Offline";
  const pictureUrl =
    typeof attributes.avatar === "string" && attributes.avatar.trim()
      ? attributes.avatar
      : typeof attributes.pictureUrl === "string" && attributes.pictureUrl.trim()
        ? attributes.pictureUrl
        : undefined;

  return {
    id: raw.id,
    displayName: raw.displayName,
    name: raw.displayName,
    email: raw.email,
    avatar: pictureUrl,
    status,
    address: typeof attributes.address === "string" ? attributes.address : undefined,
    gender,
    birthDate: raw.personalDetail?.birthDate,
    isAnonymous: false
  };
};

const toAnonymousChatUserResponse = (user: User) => {
  const base = toChatUserResponse(user);

  return {
    ...base,
    displayName: ANONYMOUS_DISPLAY_NAME,
    name: ANONYMOUS_DISPLAY_NAME,
    email: undefined,
    avatar: undefined,
    address: undefined,
    gender: undefined,
    birthDate: undefined,
    isAnonymous: true
  };
};

const isParticipantA = (room: RoomRecord, userId: string): boolean => room.participantA === userId;

const hasCurrentUserLiked = (room: RoomRecord, userId: string): boolean =>
  isParticipantA(room, userId) ? Boolean(room.participantALikedAt) : Boolean(room.participantBLikedAt);

const hasPartnerLiked = (room: RoomRecord, userId: string): boolean =>
  isParticipantA(room, userId) ? Boolean(room.participantBLikedAt) : Boolean(room.participantALikedAt);

const getPartnerId = (room: RoomRecord, userId: string): string | null => {
  if (room.participantA === userId) return room.participantB;
  if (room.participantB === userId) return room.participantA;
  return null;
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

  private getPartnerResponse = (partner: User, room: RoomRecord) =>
    room.identityRevealed
      ? toChatUserResponse(partner)
      : toAnonymousChatUserResponse(partner);

  private buildRoomSummary = (room: RoomRecord, currentUserId: string, partner: User) => ({
    id: room.id,
    active: room.active,
    identityRevealed: room.identityRevealed,
    currentUserLiked: hasCurrentUserLiked(room, currentUserId),
    partnerLiked: hasPartnerLiked(room, currentUserId),
    partner: this.getPartnerResponse(partner, room)
  });

  private loadRoomContext = async (roomId: string, currentUserId: string) => {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      return { status: 404 as const };
    }

    const partnerId = getPartnerId(room, currentUserId);
    if (!partnerId) {
      return { status: 403 as const };
    }

    const partner = await this.userRepository.findById(partnerId);
    if (!partner) {
      return { status: 404 as const };
    }

    return {
      status: 200 as const,
      room,
      partner
    };
  };

  sendMessage = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const payload = {
        roomId: req.body?.roomId,
        senderId: req.currentUser?.id ?? req.body?.senderId,
        contentType: req.body?.contentType ?? "text",
        content: req.body?.content
      };

      const room = await this.roomRepository.findById(payload.roomId);
      if (!room) {
        res.status(404).json({ error: "Room not found." });
        return;
      }

      if (!room.active) {
        res.status(409).json({ error: "Room is no longer active." });
        return;
      }

      if (room.participantA !== payload.senderId && room.participantB !== payload.senderId) {
        res.status(403).json({ error: "You are not a participant of this room." });
        return;
      }

      const message = await this.sendMessageUseCase.execute(payload);

      const notificationService = getNotificationService();
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

  getRoom = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User;
      const roomId = req.params?.roomId;

      if (!roomId) {
        res.status(400).json({ error: "Room id is required." });
        return;
      }

      const context = await this.loadRoomContext(roomId, currentUser.id);
      if (context.status === 404) {
        res.status(404).json({ error: "Room not found." });
        return;
      }
      if (context.status === 403) {
        res.status(403).json({ error: "You are not a participant of this room." });
        return;
      }

      res.status(200).json({
        room: this.buildRoomSummary(context.room, currentUser.id, context.partner)
      });
    } catch (error) {
      next(error);
    }
  };

  likeRoom = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User;
      const roomId = req.params?.roomId;

      if (!roomId) {
        res.status(400).json({ error: "Room id is required." });
        return;
      }

      const currentContext = await this.loadRoomContext(roomId, currentUser.id);
      if (currentContext.status === 404) {
        res.status(404).json({ error: "Room not found." });
        return;
      }
      if (currentContext.status === 403) {
        res.status(403).json({ error: "You are not a participant of this room." });
        return;
      }
      if (!currentContext.room.active) {
        res.status(409).json({ error: "Room is no longer active." });
        return;
      }

      const wasRevealed = currentContext.room.identityRevealed;
      const alreadyLiked = hasCurrentUserLiked(currentContext.room, currentUser.id);
      if (wasRevealed && alreadyLiked) {
        res.status(200).json({
          room: this.buildRoomSummary(currentContext.room, currentUser.id, currentContext.partner)
        });
        return;
      }

      const updatedRoom = await this.roomRepository.likeRoom(roomId, currentUser.id);
      if (!updatedRoom) {
        res.status(404).json({ error: "Room not found." });
        return;
      }

      const partnerId = getPartnerId(updatedRoom, currentUser.id);
      if (!partnerId) {
        res.status(403).json({ error: "You are not a participant of this room." });
        return;
      }

      const [partner, refreshedCurrentUser] = await Promise.all([
        this.userRepository.findById(partnerId),
        this.userRepository.findById(currentUser.id)
      ]);

      if (!partner || !refreshedCurrentUser) {
        res.status(404).json({ error: "Room partner not found." });
        return;
      }

      if (!wasRevealed) {
        const notificationService = getNotificationService();
        const currentUserProfile = toChatUserResponse(refreshedCurrentUser);
        const partnerProfile = toChatUserResponse(partner);

        await Promise.allSettled([
          notificationService.sendNotification({
            userId: currentUser.id,
            type: "SYSTEM",
            title: "Đã mở tên",
            content: "Một lượt thích đã mở tên cho cả hai bên.",
            roomId: updatedRoom.id,
            metadata: {
              kind: "ROOM_IDENTITY_REVEALED",
              roomId: updatedRoom.id,
              partner: partnerProfile
            }
          }),
          notificationService.sendNotification({
            userId: partner.id,
            type: "SYSTEM",
            title: "Đã mở tên",
            content: "Một lượt thích đã mở tên cho cả hai bên.",
            roomId: updatedRoom.id,
            metadata: {
              kind: "ROOM_IDENTITY_REVEALED",
              roomId: updatedRoom.id,
              partner: currentUserProfile
            }
          })
        ]);
      }

      res.status(200).json({
        room: this.buildRoomSummary(updatedRoom, currentUser.id, partner)
      });
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
      const preferredGender = getOppositeGender(
        normalizeGender(currentUser?.personalDetail?.gender ?? currentUser?.attributes?.gender)
      );

      const filteredUsers = users.filter((user) => {
        if (user.id === currentUserId) return false;
        if (!preferredGender) return true;

        const gender = normalizeGender(user.personalDetail?.gender ?? user.attributes?.gender);
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
      const currentUserGender = normalizeGender(
        currentUser.personalDetail?.gender ?? currentUser.attributes?.gender
      );
      const currentUserPreferredGender = getOppositeGender(currentUserGender);

      cleanupQueue();
      cleanupPendingMatches();

      const pendingMatch = pendingMatches.get(currentUser.id);
      if (pendingMatch) {
        pendingMatches.delete(currentUser.id);
        const pendingPartner = await this.userRepository.findById(pendingMatch.partnerId);
        const pendingRoom = await this.roomRepository.findById(pendingMatch.roomId);

        if (pendingPartner && pendingRoom) {
          res.status(200).json({
            status: "matched",
            roomId: pendingMatch.roomId,
            partner: this.getPartnerResponse(pendingPartner, pendingRoom)
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

        const candidateGender = normalizeGender(
          candidate.personalDetail?.gender ?? candidate.attributes?.gender
        );
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

      const notificationService = getNotificationService();
      const currentUserProfile = this.getPartnerResponse(currentUser, room);
      const partnerProfile = this.getPartnerResponse(partner, room);

      await Promise.allSettled([
        notificationService.sendNotification({
          userId: currentUser.id,
          type: "SYSTEM",
          title: "Đã ghép cặp",
          content: room.identityRevealed
            ? `Bạn đã được ghép với ${partnerProfile.name}.`
            : "Bạn đã được ghép với một người mới. Tên sẽ mở khi một trong hai bấm thích.",
          roomId: room.id,
          metadata: {
            kind: "MATCHMAKING_MATCHED",
            roomId: room.id,
            partner: partnerProfile
          }
        }),
        notificationService.sendNotification({
          userId: partner.id,
          type: "SYSTEM",
          title: "Đã ghép cặp",
          content: room.identityRevealed
            ? `Bạn đã được ghép với ${currentUserProfile.name}.`
            : "Bạn đã được ghép với một người mới. Tên sẽ mở khi một trong hai bấm thích.",
          roomId: room.id,
          metadata: {
            kind: "MATCHMAKING_MATCHED",
            roomId: room.id,
            partner: currentUserProfile
          }
        })
      ]);

      res.status(200).json({
        status: "matched",
        roomId: room.id,
        partner: this.getPartnerResponse(partner, room)
      });
    } catch (error) {
      next(error);
    }
  };

  leaveRoom = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User;
      const roomId = req.params?.roomId;

      if (!roomId) {
        res.status(400).json({ error: "Room id is required." });
        return;
      }

      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        res.status(404).json({ error: "Room not found." });
        return;
      }

      if (room.participantA !== currentUser.id && room.participantB !== currentUser.id) {
        res.status(403).json({ error: "You are not a participant of this room." });
        return;
      }

      if (!room.active) {
        res.status(200).json({ status: "ended" });
        return;
      }

      const partnerId = room.participantA === currentUser.id ? room.participantB : room.participantA;
      const notificationService = getNotificationService();
      const currentUserProfile = this.getPartnerResponse(currentUser, room);

      await Promise.all([
        this.roomRepository.deactivate(room.id),
        notificationService.sendNotification({
          userId: partnerId,
          type: "SYSTEM",
          title: "Cuộc trò chuyện đã kết thúc",
          content: room.identityRevealed
            ? `${currentUserProfile.name} đã rời cuộc trò chuyện.`
            : "Người trò chuyện cùng bạn đã rời cuộc trò chuyện.",
          roomId: room.id,
          senderId: currentUser.id,
          metadata: {
            kind: "CONVERSATION_ENDED",
            roomId: room.id,
            byUser: currentUserProfile
          }
        })
      ]);

      res.status(200).json({
        status: "ended"
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
