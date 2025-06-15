import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ChatMessage, LocationShareMessage, PresenceUpdate } from '@/lib/websocket/enhanced-websocket-service';

export interface CollaborationState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
  
  // Room management
  currentRoomId: string | null;
  roomType: 'location_sharing' | 'trip_planning' | 'group_chat' | null;
  roomMembers: Map<string, PresenceUpdate>;
  
  // Messaging
  messages: Map<string, ChatMessage[]>; // roomId -> messages
  typingUsers: Map<string, Set<string>>; // roomId -> userIds
  unreadCounts: Map<string, number>; // roomId -> count
  
  // Location sharing
  memberLocations: Map<string, LocationShareMessage>;
  isShareingLocation: boolean;
  locationUpdateInterval: number; // milliseconds
  
  // Preferences
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoReconnect: boolean;
}

export interface CollaborationActions {
  // Connection management
  connect: (roomId: string, roomType: CollaborationState['roomType']) => void;
  disconnect: () => void;
  setConnectionStatus: (isConnected: boolean, error?: string) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  
  // Room management
  joinRoom: (roomId: string, roomType: CollaborationState['roomType']) => void;
  leaveRoom: () => void;
  updateRoomMember: (userId: string, presence: PresenceUpdate) => void;
  removeRoomMember: (userId: string) => void;
  
  // Messaging
  addMessage: (roomId: string, message: ChatMessage) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  setTypingUser: (roomId: string, userId: string, isTyping: boolean) => void;
  markRoomAsRead: (roomId: string) => void;
  incrementUnreadCount: (roomId: string) => void;
  
  // Location sharing
  updateMemberLocation: (userId: string, location: LocationShareMessage) => void;
  removeMemberLocation: (userId: string) => void;
  setLocationSharing: (enabled: boolean) => void;
  setLocationUpdateInterval: (interval: number) => void;
  
  // Preferences
  updatePreferences: (prefs: Partial<Pick<CollaborationState, 'notificationsEnabled' | 'soundEnabled' | 'autoReconnect'>>) => void;
  
  // Utility
  clearRoom: (roomId: string) => void;
  reset: () => void;
}

const initialState: CollaborationState = {
  isConnected: false,
  connectionError: null,
  reconnectAttempts: 0,
  currentRoomId: null,
  roomType: null,
  roomMembers: new Map(),
  messages: new Map(),
  typingUsers: new Map(),
  unreadCounts: new Map(),
  memberLocations: new Map(),
  isShareingLocation: false,
  locationUpdateInterval: 5000,
  notificationsEnabled: true,
  soundEnabled: false,
  autoReconnect: true,
};

export const useCollaborationStore = create<CollaborationState & CollaborationActions>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => ({
        // Initial state
        ...initialState,

        // Connection management
        connect: (roomId, roomType) =>
          set((state) => {
            state.currentRoomId = roomId;
            state.roomType = roomType;
            state.connectionError = null;
          }),

        disconnect: () =>
          set((state) => {
            state.isConnected = false;
            state.currentRoomId = null;
            state.roomType = null;
            state.roomMembers.clear();
            state.typingUsers.clear();
            state.memberLocations.clear();
          }),

        setConnectionStatus: (isConnected, error) =>
          set((state) => {
            state.isConnected = isConnected;
            state.connectionError = error || null;
          }),

        incrementReconnectAttempts: () =>
          set((state) => {
            state.reconnectAttempts++;
          }),

        resetReconnectAttempts: () =>
          set((state) => {
            state.reconnectAttempts = 0;
          }),

        // Room management
        joinRoom: (roomId, roomType) =>
          set((state) => {
            state.currentRoomId = roomId;
            state.roomType = roomType;
            // Initialize room data if not exists
            if (!state.messages.has(roomId)) {
              state.messages.set(roomId, []);
            }
            if (!state.typingUsers.has(roomId)) {
              state.typingUsers.set(roomId, new Set());
            }
            if (!state.unreadCounts.has(roomId)) {
              state.unreadCounts.set(roomId, 0);
            }
          }),

        leaveRoom: () =>
          set((state) => {
            state.currentRoomId = null;
            state.roomType = null;
            state.roomMembers.clear();
          }),

        updateRoomMember: (userId, presence) =>
          set((state) => {
            state.roomMembers.set(userId, presence);
          }),

        removeRoomMember: (userId) =>
          set((state) => {
            state.roomMembers.delete(userId);
            state.memberLocations.delete(userId);
            // Remove from typing users in all rooms
            state.typingUsers.forEach(users => users.delete(userId));
          }),

        // Messaging
        addMessage: (roomId, message) =>
          set((state) => {
            const messages = state.messages.get(roomId) || [];
            messages.push(message);
            state.messages.set(roomId, messages);
            
            // Increment unread count if not current room
            if (roomId !== state.currentRoomId) {
              const currentCount = state.unreadCounts.get(roomId) || 0;
              state.unreadCounts.set(roomId, currentCount + 1);
            }
          }),

        updateMessage: (roomId, messageId, updates) =>
          set((state) => {
            const messages = state.messages.get(roomId);
            if (messages) {
              const messageIndex = messages.findIndex(m => m.id === messageId);
              if (messageIndex !== -1) {
                Object.assign(messages[messageIndex], updates);
              }
            }
          }),

        deleteMessage: (roomId, messageId) =>
          set((state) => {
            const messages = state.messages.get(roomId);
            if (messages) {
              const filtered = messages.filter(m => m.id !== messageId);
              state.messages.set(roomId, filtered);
            }
          }),

        setTypingUser: (roomId, userId, isTyping) =>
          set((state) => {
            const typingUsers = state.typingUsers.get(roomId) || new Set();
            if (isTyping) {
              typingUsers.add(userId);
            } else {
              typingUsers.delete(userId);
            }
            state.typingUsers.set(roomId, typingUsers);
          }),

        markRoomAsRead: (roomId) =>
          set((state) => {
            state.unreadCounts.set(roomId, 0);
          }),

        incrementUnreadCount: (roomId) =>
          set((state) => {
            const current = state.unreadCounts.get(roomId) || 0;
            state.unreadCounts.set(roomId, current + 1);
          }),

        // Location sharing
        updateMemberLocation: (userId, location) =>
          set((state) => {
            state.memberLocations.set(userId, location);
          }),

        removeMemberLocation: (userId) =>
          set((state) => {
            state.memberLocations.delete(userId);
          }),

        setLocationSharing: (enabled) =>
          set((state) => {
            state.isShareingLocation = enabled;
          }),

        setLocationUpdateInterval: (interval) =>
          set((state) => {
            state.locationUpdateInterval = Math.max(1000, interval); // Minimum 1 second
          }),

        // Preferences
        updatePreferences: (prefs) =>
          set((state) => {
            Object.assign(state, prefs);
          }),

        // Utility
        clearRoom: (roomId) =>
          set((state) => {
            state.messages.delete(roomId);
            state.typingUsers.delete(roomId);
            state.unreadCounts.delete(roomId);
          }),

        reset: () => set(initialState),
      })),
      {
        name: 'CollaborationStore',
      }
    )
  )
);

// Selectors
export const collaborationSelectors = {
  currentRoomMessages: (state: CollaborationState) =>
    state.currentRoomId ? state.messages.get(state.currentRoomId) || [] : [],
  
  currentRoomTypingUsers: (state: CollaborationState) =>
    state.currentRoomId ? Array.from(state.typingUsers.get(state.currentRoomId) || []) : [],
  
  currentRoomUnreadCount: (state: CollaborationState) =>
    state.currentRoomId ? state.unreadCounts.get(state.currentRoomId) || 0 : 0,
  
  totalUnreadCount: (state: CollaborationState) =>
    Array.from(state.unreadCounts.values()).reduce((sum, count) => sum + count, 0),
  
  onlineMembers: (state: CollaborationState) =>
    Array.from(state.roomMembers.values()).filter(
      member => member.status === 'online' || member.status === 'active'
    ),
  
  memberLocationsList: (state: CollaborationState) =>
    Array.from(state.memberLocations.values()),
  
  isInRoom: (state: CollaborationState) =>
    state.isConnected && state.currentRoomId !== null,
};

// Auto-reconnect logic
if (typeof window !== 'undefined') {
  useCollaborationStore.subscribe(
    (state) => ({ isConnected: state.isConnected, autoReconnect: state.autoReconnect }),
    ({ isConnected, autoReconnect }) => {
      if (!isConnected && autoReconnect) {
        const { reconnectAttempts, incrementReconnectAttempts } = useCollaborationStore.getState();
        
        if (reconnectAttempts < 5) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          
          setTimeout(() => {
            // Attempt to reconnect
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts + 1})`);
            incrementReconnectAttempts();
            // Trigger reconnection logic here
          }, delay);
        }
      }
    }
  );
}