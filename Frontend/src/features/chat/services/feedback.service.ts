import axiosClient from '../../../shared/api/axiosClient'
import { API_ENDPOINTS } from '../../../shared/constants/config'

export interface FeedbackItem {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
  user?: {
    id: string
    displayName?: string
    email?: string
  }
}

const feedbackService = {
  create: async (payload: { title: string; content: string }): Promise<FeedbackItem> => {
    const response = await axiosClient.post<{ feedback: FeedbackItem }>(API_ENDPOINTS.FEEDBACK.CREATE, payload)
    return response.data.feedback
  },

  getMine: async (): Promise<FeedbackItem[]> => {
    const response = await axiosClient.get<{ feedbacks?: FeedbackItem[] }>(API_ENDPOINTS.FEEDBACK.MINE)
    return response.data.feedbacks ?? []
  },
}

export default feedbackService
