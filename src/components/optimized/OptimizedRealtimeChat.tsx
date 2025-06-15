'use client';

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCollaborationStore, collaborationSelectors } from '@/store/slices/collaborationStore';
import { useUserStore } from '@/store/slices/userStore';
import { useDebounce } from '@/hooks/common';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/websocket/enhanced-websocket-service';

interface OptimizedRealtimeChatProps {
  roomId: string;
  className?: string;
  height?: string | number;
}

// Memoized message component
const ChatMessageItem = memo<{
  message: ChatMessage;
  isOwnMessage: boolean;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}>(
  function ChatMessageItem({ message, isOwnMessage, onEdit, onDelete }) {
    const formatTimestamp = useCallback((timestamp: string) => {
      const date = new Date(timestamp);
      
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    }, []);

    const handleEdit = useCallback(() => {
      const newContent = prompt('Edit message:', message.content);
      if (newContent && newContent !== message.content) {
        onEdit?.(message.id, newContent);
      }
    }, [message.id, message.content, onEdit]);

    const handleDelete = useCallback(() => {
      if (confirm('Delete this message?')) {
        onDelete?.(message.id);
      }
    }, [message.id, onDelete]);

    return (
      <div
        className={cn(
          'mb-4 flex',
          isOwnMessage ? 'justify-end' : 'justify-start'
        )}
      >
        <div className={cn(
          'max-w-[70%] space-y-1',
          isOwnMessage && 'text-right'
        )}>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">{message.userName}</span>
            <span>{formatTimestamp(message.timestamp)}</span>
            {message.edited && <span className="italic">(edited)</span>}
          </div>
          
          <div className={cn(
            'rounded-lg px-3 py-2 inline-block',
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          )}>
            {message.content}
          </div>
          
          {isOwnMessage && onEdit && onDelete && (
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={handleEdit}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimization
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.edited === nextProps.message.edited &&
      prevProps.isOwnMessage === nextProps.isOwnMessage
    );
  }
);

// Memoized typing indicator
const TypingIndicator = memo<{ users: string[] }>(
  function TypingIndicator({ users }) {
    if (users.length === 0) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <div className="flex gap-1">
          <span className="animate-pulse">●</span>
          <span className="animate-pulse" style={{ animationDelay: '200ms' }}>●</span>
          <span className="animate-pulse" style={{ animationDelay: '400ms' }}>●</span>
        </div>
        <span>
          {users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing
        </span>
      </div>
    );
  }
);

// Memoized message input
const MessageInput = memo<{
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}>(
  function MessageInput({ onSend, onTyping }) {
    const [message, setMessage] = React.useState('');
    const debouncedMessage = useDebounce(message, 300);
    const wasTypingRef = useRef(false);

    // Handle typing status
    useEffect(() => {
      const isTyping = debouncedMessage.length > 0;
      if (isTyping !== wasTypingRef.current) {
        onTyping(isTyping);
        wasTypingRef.current = isTyping;
      }
    }, [debouncedMessage, onTyping]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim()) {
        onSend(message.trim());
        setMessage('');
      }
    }, [message, onSend]);

    return (
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    );
  }
);

// Main chat component
export const OptimizedRealtimeChat = memo<OptimizedRealtimeChatProps>(
  function OptimizedRealtimeChat({ roomId, className, height = 500 }) {
    const currentUser = useUserStore((state) => state.currentUser);
    const userId = currentUser?.id || 'anonymous';
    
    // Use selectors for better performance
    const messages = useCollaborationStore(collaborationSelectors.currentRoomMessages);
    const typingUsers = useCollaborationStore(collaborationSelectors.currentRoomTypingUsers);
    const isConnected = useCollaborationStore((state) => state.isConnected);
    
    // Actions
    const { addMessage, updateMessage, deleteMessage, setTypingUser } = useCollaborationStore();
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages.length]);

    // Memoized callbacks
    const handleSendMessage = useCallback((content: string) => {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        groupId: roomId,
        userId,
        userName: currentUser?.name || 'Anonymous',
        userAvatar: currentUser?.avatar,
        content,
        type: 'text',
        timestamp: new Date().toISOString(),
        edited: false,
      };
      
      addMessage(roomId, message);
    }, [roomId, userId, currentUser, addMessage]);

    const handleTyping = useCallback((isTyping: boolean) => {
      setTypingUser(roomId, userId, isTyping);
    }, [roomId, userId, setTypingUser]);

    const handleEditMessage = useCallback((messageId: string, newContent: string) => {
      updateMessage(roomId, messageId, {
        content: newContent,
        edited: true,
        editedAt: new Date().toISOString(),
      });
    }, [roomId, updateMessage]);

    const handleDeleteMessage = useCallback((messageId: string) => {
      deleteMessage(roomId, messageId);
    }, [roomId, deleteMessage]);

    // Group messages by date
    const groupedMessages = useMemo(() => {
      const groups: Record<string, ChatMessage[]> = {};
      
      messages.forEach((message) => {
        const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      });
      
      return groups;
    }, [messages]);

    // Filter out current user from typing users
    const otherTypingUsers = useMemo(
      () => typingUsers.filter(id => id !== userId),
      [typingUsers, userId]
    );

    const containerStyle = useMemo(
      () => ({
        height: typeof height === 'number' ? `${height}px` : height,
      }),
      [height]
    );

    if (!isConnected) {
      return (
        <div className={cn('flex items-center justify-center', className)} style={containerStyle}>
          <p className="text-gray-500">Connecting to chat...</p>
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col bg-white rounded-lg shadow', className)} style={containerStyle}>
        {/* Messages area */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-500 px-2">
                  {isToday(new Date(date))
                    ? 'Today'
                    : isYesterday(new Date(date))
                    ? 'Yesterday'
                    : format(new Date(date), 'MMM d, yyyy')}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={message.userId === userId}
                  onEdit={message.userId === userId ? handleEditMessage : undefined}
                  onDelete={message.userId === userId ? handleDeleteMessage : undefined}
                />
              ))}
            </div>
          ))}
          
          {/* Typing indicator */}
          <TypingIndicator users={otherTypingUsers} />
        </div>
        
        {/* Input area */}
        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </div>
    );
  }
);