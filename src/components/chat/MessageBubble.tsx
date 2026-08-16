'use client';

import { CornerUpLeft, Pencil, SmilePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { VoiceNoteBubble } from '@/components/chat/VoiceNoteBubble';
import { QUICK_REACTIONS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  readOnly: boolean;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
}

export function MessageBubble({
  message,
  readOnly,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: MessageBubbleProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const outgoing = message.senderType === 'USER';

  return (
    <div className={cn('group flex flex-col gap-1', outgoing ? 'items-end' : 'items-start')}>
      {message.replyTo ? (
        <div
          className="max-w-[80%] rounded-lg border-l-2 px-2.5 py-1.5 text-xs"
          style={{ borderColor: 'var(--violet-ink-2)', background: 'var(--surface-3)' }}
        >
          <span className="font-bold text-violet-ink">
            {message.replyTo.senderName ?? 'Message'}
          </span>
          <p className={cn('truncate', message.replyTo.deleted ? 'text-muted-3 italic' : 'text-muted')}>
            {message.replyTo.deleted ? 'This message was deleted' : message.replyTo.content}
          </p>
        </div>
      ) : null}

      {message.attachment ? (
        <VoiceNoteBubble note={message.attachment} outgoing={outgoing} />
      ) : (
        <div
          className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={{
            background: outgoing ? 'var(--accent)' : 'var(--bubble)',
            color: outgoing ? 'var(--on-accent)' : 'var(--bubble-ink)',
          }}
        >
          {message.content}
        </div>
      )}

      {message.reactions.length ? (
        <div className="flex flex-wrap gap-1">
          {message.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              type="button"
              disabled={readOnly}
              onClick={() => onReact(message, reaction.emoji)}
              className="rounded-full border px-2 py-0.5 text-xs"
              style={{
                borderColor: reaction.reactedByMe ? 'var(--violet-ink-2)' : 'var(--line-2)',
                background: 'var(--surface-3)',
              }}
            >
              {reaction.emoji} {reaction.count}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-3">
          {formatDate(message.createdAt, 'HH:mm')}
          {message.editCount > 0 ? ' · edited' : ''}
        </span>

        {readOnly ? null : (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onReply(message)}
              aria-label="Reply"
              className="text-muted-3 hover:text-text-2"
            >
              <CornerUpLeft size={13} />
            </button>

            <button
              type="button"
              onClick={() => setPickerOpen(!pickerOpen)}
              aria-label="React"
              className="text-muted-3 hover:text-text-2"
            >
              <SmilePlus size={13} />
            </button>

            {outgoing ? (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(message)}
                  aria-label="Edit"
                  className="text-muted-3 hover:text-text-2"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(message)}
                  aria-label="Delete"
                  className="text-muted-3 hover:text-red-ink"
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>

      {pickerOpen ? (
        <div className="flex gap-1 rounded-full border border-line-2 bg-surface-2 px-2 py-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(message, emoji);
                setPickerOpen(false);
              }}
              className="text-base"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
