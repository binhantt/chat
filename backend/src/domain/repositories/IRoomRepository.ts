export interface RoomRecord {
  id: string;
  participantA: string;
  participantB: string;
  active: boolean;
  identityRevealed: boolean;
  participantALikedAt?: Date;
  participantBLikedAt?: Date;
  revealedAt?: Date;
  createdAt: Date;
}

export interface IRoomRepository {
  findById(roomId: string): Promise<RoomRecord | null>;
  findActiveByParticipants(userAId: string, userBId: string): Promise<RoomRecord | null>;
  createPrivateRoom(userAId: string, userBId: string): Promise<RoomRecord>;
  likeRoom(roomId: string, userId: string): Promise<RoomRecord | null>;
  deactivate(roomId: string): Promise<RoomRecord | null>;
}
