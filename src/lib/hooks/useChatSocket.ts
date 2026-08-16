'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { tokenStore } from '@/lib/api/client';
import { SOCKET_URL } from '@/lib/constants';
import type { ChatMessage } from '@/lib/types';

/**
 * Messages are sent over REST and received over Socket.IO. The sender's own
 * message therefore arrives once, from the socket — the POST response is only
 * used to confirm delivery, never appended directly.
 */
export function useChatSocket(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = tokenStore.access();
    if (!conversationId || !token) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.emit('conversation:join', { conversationId });

    socket.on('message:new', (message: ChatMessage) => {
      queryClient.setQueryData<{ messages: ChatMessage[] } | undefined>(
        ['conversation', conversationId],
        (current) =>
          current && !current.messages.some((existing) => existing.id === message.id)
            ? { ...current, messages: [...current.messages, message] }
            : current,
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      socket.emit('conversation:leave', { conversationId });
      socket.disconnect();
    };
  }, [conversationId, queryClient]);
}
