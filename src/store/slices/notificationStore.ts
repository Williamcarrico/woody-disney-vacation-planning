import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
  category: 'system' | 'geofence' | 'collaboration' | 'trip' | 'alert';
  metadata?: Record<string, any>;
}

export interface NotificationState {
  // Notifications
  notifications: Map<string, Notification>;
  
  // Toast notifications (temporary)
  toasts: Notification[];
  
  // Settings
  enabled: boolean;
  playSound: boolean;
  showInApp: boolean;
  showBrowserNotifications: boolean;
  
  // Categories
  enabledCategories: Set<string>;
  
  // Badge count
  unreadCount: number;
}

export interface NotificationActions {
  // Notification management
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: (category?: string) => void;
  
  // Toast management
  showToast: (toast: Omit<Notification, 'id' | 'timestamp' | 'read' | 'persistent'>) => void;
  removeToast: (id: string) => void;
  
  // Settings
  setEnabled: (enabled: boolean) => void;
  updateSettings: (settings: Partial<Pick<NotificationState, 'playSound' | 'showInApp' | 'showBrowserNotifications'>>) => void;
  toggleCategory: (category: string) => void;
  
  // Browser notifications
  requestPermission: () => Promise<void>;
  checkPermission: () => NotificationPermission;
  
  // Utility
  reset: () => void;
}

const initialState: NotificationState = {
  notifications: new Map(),
  toasts: [],
  enabled: true,
  playSound: false,
  showInApp: true,
  showBrowserNotifications: false,
  enabledCategories: new Set(['system', 'geofence', 'collaboration', 'trip', 'alert']),
  unreadCount: 0,
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // Notification management
      addNotification: (notification) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        };

        set((state) => {
          state.notifications.set(id, fullNotification);
          state.unreadCount++;
        });

        // Show browser notification if enabled
        const { showBrowserNotifications, enabledCategories } = get();
        if (
          showBrowserNotifications &&
          enabledCategories.has(notification.category) &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          const browserNotif = new Notification(notification.title, {
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: id,
          });

          browserNotif.onclick = () => {
            window.focus();
            notification.actionCallback?.();
            browserNotif.close();
          };
        }

        // Play sound if enabled
        if (get().playSound && get().enabledCategories.has(notification.category)) {
          try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(console.error);
          } catch (error) {
            console.error('Failed to play notification sound:', error);
          }
        }

        return id;
      },

      removeNotification: (id) =>
        set((state) => {
          const notification = state.notifications.get(id);
          if (notification) {
            state.notifications.delete(id);
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.get(id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach(notification => {
            notification.read = true;
          });
          state.unreadCount = 0;
        }),

      clearNotifications: (category) =>
        set((state) => {
          if (category) {
            // Clear by category
            const toDelete: string[] = [];
            state.notifications.forEach((notif, id) => {
              if (notif.category === category) {
                toDelete.push(id);
                if (!notif.read) {
                  state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
              }
            });
            toDelete.forEach(id => state.notifications.delete(id));
          } else {
            // Clear all
            state.notifications.clear();
            state.unreadCount = 0;
          }
        }),

      // Toast management
      showToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullToast: Notification = {
          ...toast,
          id,
          timestamp: new Date(),
          read: true,
          persistent: false,
        };

        set((state) => {
          state.toasts.push(fullToast);
          // Keep only last 5 toasts
          if (state.toasts.length > 5) {
            state.toasts = state.toasts.slice(-5);
          }
        });

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter(t => t.id !== id);
        }),

      // Settings
      setEnabled: (enabled) =>
        set((state) => {
          state.enabled = enabled;
        }),

      updateSettings: (settings) =>
        set((state) => {
          Object.assign(state, settings);
        }),

      toggleCategory: (category) =>
        set((state) => {
          if (state.enabledCategories.has(category)) {
            state.enabledCategories.delete(category);
          } else {
            state.enabledCategories.add(category);
          }
        }),

      // Browser notifications
      requestPermission: async () => {
        if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            set((state) => {
              state.showBrowserNotifications = true;
            });
          }
        }
      },

      checkPermission: () => {
        if ('Notification' in window) {
          return Notification.permission;
        }
        return 'denied';
      },

      // Utility
      reset: () => set(initialState),
    })),
    {
      name: 'NotificationStore',
    }
  )
);

// Selectors
export const notificationSelectors = {
  unreadNotifications: (state: NotificationState) =>
    Array.from(state.notifications.values()).filter(n => !n.read),
  
  notificationsByCategory: (category: string) => (state: NotificationState) =>
    Array.from(state.notifications.values()).filter(n => n.category === category),
  
  recentNotifications: (limit = 10) => (state: NotificationState) =>
    Array.from(state.notifications.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit),
  
  hasUnreadInCategory: (category: string) => (state: NotificationState) =>
    Array.from(state.notifications.values()).some(
      n => n.category === category && !n.read
    ),
  
  isCategoryEnabled: (category: string) => (state: NotificationState) =>
    state.enabled && state.enabledCategories.has(category),
};