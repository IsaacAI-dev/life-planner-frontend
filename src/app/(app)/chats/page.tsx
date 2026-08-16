'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, MessagesSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { chatApi } from '@/lib/api/chat';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { FeedbackFormCard } from '@/components/chat/FeedbackFormCard';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { RecommendationCard } from '@/components/chat/RecommendationCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { CONVERSATION_LABELS } from '@/lib/constants';
import { useChatSocket } from '@/lib/hooks/useChatSocket';
import { usePlan } from '@/lib/providers/PlanProvider';
import { useToast } from '@/lib/providers/ToastProvider';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const PRO_FEATURES = [
  'Unlimited messages with your coach',
  'Voice notes both ways',
  'The Fitness Assistant and meal plans',
];

function LockedPanel({ expired }: { expired: boolean }) {
  const router = useRouter();

  return (
    <Card className="flex flex-1 flex-col items-center justify-center gap-4 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-4 text-violet-ink">
        <Lock size={24} />
      </span>
      <h3 className="font-display text-2xl font-semibold">
        {expired ? 'Coach chats are paused' : 'Coach chats are part of Pro'}
      </h3>
      <p className="max-w-sm text-sm text-muted">
        {expired
          ? 'Your history stays readable. Renew Pro to message your coach again.'
          : 'On the Free plan you keep your calendar, goals and streaks. Messaging your coach and the Fitness Assistant needs Pro.'}
      </p>

      <ul className="flex flex-col gap-2.5 text-left">
        {PRO_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm font-semibold text-text-2">
            <MessagesSquare size={17} className="text-violet-ink" />
            {feature}
          </li>
        ))}
      </ul>

      <Button variant="accent" onClick={() => router.push('/plan')}>
        {expired ? 'Renew Pro' : 'Upgrade to Pro'}
      </Button>

      <p className="text-xs text-muted-3">Support is always available, on every plan.</p>
    </Card>
  );
}

export default function ChatsPage() {
  const { state } = usePlan();
  const notify = useToast();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.conversations,
  });

  // Prefer an unlocked thread so a Free user lands on Support rather than a wall.
  const selectedId =
    activeId ?? conversations?.find((item) => !item.locked)?.id ?? conversations?.[0]?.id ?? null;
  const selected = conversations?.find((item) => item.id === selectedId) ?? null;

  const { data: thread } = useQuery({
    queryKey: ['conversation', selectedId],
    queryFn: () => chatApi.conversation(selectedId as string),
    enabled: Boolean(selectedId) && !selected?.locked,
  });

  useChatSocket(selected?.locked ? null : selectedId);

  const markRead = useMutation({
    mutationFn: (id: string) => chatApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread'] });
    },
  });

  useEffect(() => {
    if (selectedId && selected && !selected.locked && selected.unreadCount > 0) {
      markRead.mutate(selectedId);
    }
    // Only re-run when the thread or its unread count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selected?.unreadCount]);

  const invalidateThread = () => {
    queryClient.invalidateQueries({ queryKey: ['conversation', selectedId] });
  };

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      editing
        ? chatApi.editMessage(selectedId as string, editing.id, content)
        : chatApi.sendMessage(selectedId as string, { content, replyToId: replyTo?.id }),
    onSuccess: () => {
      setReplyTo(null);
      setEditing(null);
      invalidateThread();
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const deleteMessage = useMutation({
    mutationFn: (message: ChatMessage) => chatApi.deleteMessage(selectedId as string, message.id),
    onSuccess: ({ purgeAfterDays }) => {
      invalidateThread();
      notify(`Deleted. Removed for good after ${purgeAfterDays} days.`);
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const react = useMutation({
    mutationFn: ({ message, emoji }: { message: ChatMessage; emoji: string }) =>
      chatApi.react(selectedId as string, message.id, emoji),
    onSuccess: invalidateThread,
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const sendVoiceNote = useMutation({
    mutationFn: async ({ blob, durationSeconds }: { blob: Blob; durationSeconds: number }) => {
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(new Error('Could not read the recording.'));
        reader.readAsDataURL(blob);
      });

      return chatApi.sendVoiceNote(selectedId as string, {
        audioBase64,
        mimeType: blob.type,
        durationSeconds,
      });
    },
    onSuccess: invalidateThread,
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (isLoading) return <PageSkeleton />;

  const expired = state === 'EXPIRED';

  return (
    <div className="mx-auto grid max-w-320 gap-3 lg:h-[calc(100vh-8rem)] lg:grid-cols-[20rem_1fr]">
      <Card className="flex max-h-72 flex-col gap-2 overflow-y-auto lg:max-h-none">
        <span className="text-[10.5px] font-bold tracking-[0.1em] text-muted-3 uppercase">Chats</span>

        {conversations?.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => setActiveId(conversation.id)}
            className={cn(
              'flex items-center gap-2.5 rounded-xl border p-2.5 text-left',
              conversation.id === selectedId
                ? 'border-violet-ink-2 bg-surface-4'
                : 'border-line-2 bg-surface-3',
            )}
          >
            <Avatar
              name={conversation.assignedAdmin?.name ?? CONVERSATION_LABELS[conversation.type]}
              src={conversation.assignedAdmin?.avatarUrl}
              size={38}
              online={!conversation.locked}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5 truncate text-sm font-bold">
                {CONVERSATION_LABELS[conversation.type]}
                {conversation.locked ? <Lock size={12} className="text-muted-3" /> : null}
              </span>
              <span className="truncate text-xs text-muted">
                {conversation.locked
                  ? 'Included with Pro'
                  : (conversation.lastMessage?.content ?? 'No messages yet')}
              </span>
            </span>
            {conversation.unreadCount ? (
              <span className="flex size-5 flex-none items-center justify-center rounded-full bg-pink-ink text-[11px] font-extrabold text-on-accent">
                {conversation.unreadCount}
              </span>
            ) : null}
          </button>
        ))}

        <p className="mt-auto rounded-xl border border-dashed border-line-dash p-3 text-xs text-muted">
          Coach replies arrive live. Suggested changes reach your calendar only when you accept them.
        </p>
      </Card>

      {!selected || selected.locked ? (
        <LockedPanel expired={expired} />
      ) : (
        <Card className="flex min-h-125 flex-col gap-0 overflow-hidden p-0">
          <header className="flex items-center gap-2.5 border-b border-line px-4 py-3">
            <Avatar
              name={selected.assignedAdmin?.name ?? CONVERSATION_LABELS[selected.type]}
              src={selected.assignedAdmin?.avatarUrl}
              size={38}
              online
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold">
                {selected.assignedAdmin?.name ?? CONVERSATION_LABELS[selected.type]}
              </span>
              <span className="text-xs font-semibold text-green-ink">
                {CONVERSATION_LABELS[selected.type]}
              </span>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {thread?.messages
              .filter((message) => !message.deletedAt)
              .map((message) =>
                message.recommendation ? (
                  <RecommendationCard
                    key={message.id}
                    recommendation={message.recommendation}
                    conversationId={selected.id}
                  />
                ) : message.feedbackForm ? (
                  <FeedbackFormCard key={message.id} form={message.feedbackForm} />
                ) : (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    readOnly={expired}
                    onReply={setReplyTo}
                    onEdit={setEditing}
                    onDelete={(target) => deleteMessage.mutate(target)}
                    onReact={(target, emoji) => react.mutate({ message: target, emoji })}
                  />
                ),
              )}
          </div>

          {expired ? (
            <div className="flex items-center gap-2.5 border-t border-line px-4 py-4 text-sm font-semibold text-amber-ink">
              <Lock size={16} />
              Read-only while your plan is expired.
            </div>
          ) : (
            <>
              {replyTo || editing ? (
                <div className="flex items-center gap-2 border-t border-line bg-surface-3 px-4 py-2 text-xs">
                  <span className="font-bold text-violet-ink">
                    {editing ? 'Editing' : `Replying to ${replyTo?.senderName ?? 'message'}`}
                  </span>
                  <span className="truncate text-muted">
                    {(editing ?? replyTo)?.content}
                  </span>
                  <button
                    type="button"
                    aria-label="Cancel"
                    onClick={() => {
                      setReplyTo(null);
                      setEditing(null);
                    }}
                    className="ml-auto text-muted-3"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : null}

              <ChatComposer
                key={editing?.id ?? 'new'}
                initialValue={editing?.content ?? ''}
                placeholder={`Message ${selected.assignedAdmin?.name?.split(' ')[0] ?? CONVERSATION_LABELS[selected.type]}…`}
                voiceNotesEnabled={selected.type !== 'SUPPORT'}
                disabled={sendMessage.isPending}
                onSend={(content) => sendMessage.mutate(content)}
                onSendVoiceNote={(blob, durationSeconds) =>
                  sendVoiceNote.mutate({ blob, durationSeconds })
                }
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}
