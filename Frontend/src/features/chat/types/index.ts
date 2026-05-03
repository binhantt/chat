export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  messageType: "text" | "emoji" | "image";
  timestamp: number;
  isOwn: boolean;
}

export type ChatRole = "A" | "B";

export interface ChannelMsg {
  type: "message" | "like" | "unlike" | "exit" | "ready";
  senderId: string;
  id?: string;
  content?: string;
  messageType?: "text" | "emoji" | "image";
  timestamp?: number;
}

export interface QueueMsg {
  type: "join" | "match" | "leave";
  userId: string;
  roomId?: string;
  partnerId?: string;
}
