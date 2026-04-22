export interface RoomRecord {
  id: string;
  participantA: string;
  participantB: string;
  active: boolean;
  createdAt: Date;
}

export interface IRoomRepository {
  findById(roomId: string): Promise<RoomRecord | null>;
  findActiveByParticipants(userAId: string, userBId: string): Promise<RoomRecord | null>;
  createPrivateRoom(userAId: string, userBId: string): Promise<RoomRecord>;
}
