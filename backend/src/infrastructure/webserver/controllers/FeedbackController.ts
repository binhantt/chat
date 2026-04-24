import { User } from "../../../domain/entities/User";
import { IFeedbackRepository } from "../../../domain/repositories/IFeedbackRepository";
import { NotFoundError, ValidationError } from "../../../shared/errors/AppError";

const FEEDBACK_TITLE_MAX_LENGTH = 255;
const FEEDBACK_CONTENT_MAX_LENGTH = 4000;

const normalizeText = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export class FeedbackController {
  constructor(private readonly feedbackRepository: IFeedbackRepository) {}

  createFeedback = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User | undefined;
      if (!currentUser) {
        throw new NotFoundError("User not found.");
      }

      const title = normalizeText(req.body?.title);
      const content = normalizeText(req.body?.content);

      if (!title) {
        throw new ValidationError("Tiêu đề là bắt buộc.");
      }
      if (!content) {
        throw new ValidationError("Nội dung là bắt buộc.");
      }
      if (title.length > FEEDBACK_TITLE_MAX_LENGTH) {
        throw new ValidationError(`Tiêu đề không được vượt quá ${FEEDBACK_TITLE_MAX_LENGTH} ký tự.`);
      }
      if (content.length > FEEDBACK_CONTENT_MAX_LENGTH) {
        throw new ValidationError(`Nội dung không được vượt quá ${FEEDBACK_CONTENT_MAX_LENGTH} ký tự.`);
      }

      const feedback = await this.feedbackRepository.create({
        userId: currentUser.id,
        title,
        content
      });

      res.status(201).json({
        feedback: {
          id: feedback.id,
          userId: feedback.userId,
          title: feedback.title,
          content: feedback.content,
          createdAt: feedback.createdAt.toISOString(),
          user: {
            id: currentUser.id,
            displayName: currentUser.displayName,
            email: currentUser.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getMyFeedbacks = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const currentUser = req.currentUser as User | undefined;
      if (!currentUser) {
        throw new NotFoundError("User not found.");
      }

      const feedbacks = await this.feedbackRepository.getByUserId(currentUser.id);

      res.status(200).json({
        feedbacks: feedbacks.map((feedback) => ({
          id: feedback.id,
          userId: feedback.userId,
          title: feedback.title,
          content: feedback.content,
          createdAt: feedback.createdAt.toISOString(),
          user: {
            id: currentUser.id,
            displayName: currentUser.displayName,
            email: currentUser.email
          }
        }))
      });
    } catch (error) {
      next(error);
    }
  };
}
