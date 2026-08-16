import { request } from '@/lib/api/client';
import type {
  ChatMessage,
  ChatUnread,
  Conversation,
  ConversationDetail,
  ConversationType,
  FeedbackForm,
  MessageAttachment,
  Recommendation,
} from '@/lib/types';

export const chatApi = {
  conversations: () =>
    request<Conversation[]>('/chat/conversations', { unwrap: 'conversations' }),

  conversation: (id: string, limit = 50) =>
    request<ConversationDetail>(`/chat/conversations/${id}`, {
      query: { limit },
      unwrap: 'conversation',
    }),

  unreadCount: () => request<ChatUnread>('/chat/unread-count'),

  /** Opening a thread also posts the first message. */
  start: (body: { type: ConversationType; message?: string }) =>
    request<Conversation>('/chat/conversations', { method: 'POST', body, unwrap: 'conversation' }),

  sendMessage: (conversationId: string, body: { content: string; replyToId?: string }) =>
    request<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body,
      unwrap: 'message',
    }),

  editMessage: (conversationId: string, messageId: string, content: string) =>
    request<ChatMessage>(`/chat/conversations/${conversationId}/messages/${messageId}`, {
      method: 'PATCH',
      body: { content },
      unwrap: 'message',
    }),

  deleteMessage: (conversationId: string, messageId: string) =>
    request<{ purgeAfterDays: number }>(
      `/chat/conversations/${conversationId}/messages/${messageId}`,
      { method: 'DELETE' },
    ),

  /** Sending the same emoji twice toggles it off. */
  react: (conversationId: string, messageId: string, emoji: string) =>
    request<ChatMessage>(
      `/chat/conversations/${conversationId}/messages/${messageId}/reactions`,
      { method: 'POST', body: { emoji }, unwrap: 'message' },
    ),

  markRead: (conversationId: string) =>
    request<{ unreadCount: number }>(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
      body: {},
    }),

  sendVoiceNote: (
    conversationId: string,
    body: { audioBase64: string; mimeType: string; durationSeconds: number },
  ) =>
    request<ChatMessage>(`/chat/conversations/${conversationId}/voice-notes`, {
      method: 'POST',
      body,
      unwrap: 'message',
    }),

  voiceNote: (attachmentId: string) =>
    request<MessageAttachment>(`/chat/voice-notes/${attachmentId}`, { unwrap: 'attachment' }),

  /** Accepting creates the real activity or goal, still within the user's quota. */
  /** Responding twice returns 400, so callers should disable after the first press. */
  respondToRecommendation: (recommendationId: string, action: 'ACCEPT' | 'DISMISS') =>
    request<Recommendation>(`/chat/recommendations/${recommendationId}/respond`, {
      method: 'POST',
      body: { action },
      unwrap: 'recommendation',
    }),

  feedbackForms: () => request<FeedbackForm[]>('/chat/feedback-forms', { unwrap: 'forms' }),

  respondToFeedbackForm: (
    formId: string,
    body: {
      platformRating: number;
      lifeCoachRating?: number;
      fitnessRating?: number;
      comment?: string;
    },
  ) =>
    request<FeedbackForm>(`/chat/feedback-forms/${formId}/respond`, {
      method: 'POST',
      body,
      unwrap: 'form',
    }),
};
