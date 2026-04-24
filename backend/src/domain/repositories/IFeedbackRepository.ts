export interface FeedbackRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface CreateFeedbackInput {
  userId: string;
  title: string;
  content: string;
}

export interface IFeedbackRepository {
  create(input: CreateFeedbackInput): Promise<FeedbackRecord>;
  getByUserId(userId: string): Promise<FeedbackRecord[]>;
}
