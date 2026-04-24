import { Router } from "express";
import { FeedbackController } from "../controllers/FeedbackController";

export function buildFeedbackRoutes(feedbackController: FeedbackController, feedbackMiddleware: any) {
  const router = Router();

  router.post("/", feedbackMiddleware, feedbackController.createFeedback);
  router.get("/mine", feedbackMiddleware, feedbackController.getMyFeedbacks);

  return router;
}
