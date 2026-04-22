import { MAX_TEXT_MESSAGE_LENGTH } from "../../shared/constants/AppConstants";
import { ValidationError } from "../../shared/errors/AppError";

export type MessageContentType = "text" | "image" | "audio";

export interface MessageProps {
  id: string;
  roomId: string;
  senderId: string;
  contentType: MessageContentType;
  content: string;
  createdAt: Date;
}

export class Message {
  private readonly props: MessageProps;

  constructor(props: MessageProps) {
    if (!props.id || !props.roomId || !props.senderId) {
      throw new ValidationError("Message id, roomId and senderId are required.");
    }
    if (!["text", "image", "audio"].includes(props.contentType)) {
      throw new ValidationError("Unsupported content type.");
    }
    if (!props.content || !props.content.trim()) {
      throw new ValidationError("Message content is required.");
    }
    if (props.contentType === "text" && props.content.length > MAX_TEXT_MESSAGE_LENGTH) {
      throw new ValidationError(`Text message exceeds ${MAX_TEXT_MESSAGE_LENGTH} characters.`);
    }

    this.props = { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get roomId(): string {
    return this.props.roomId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get contentType(): MessageContentType {
    return this.props.contentType;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  toPrimitives(): MessageProps {
    return {
      ...this.props,
      createdAt: new Date(this.props.createdAt)
    };
  }
}
