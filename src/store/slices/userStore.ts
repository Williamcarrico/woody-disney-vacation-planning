import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    locationSharing: boolean;
    language: string;
  };
}

export interface UserState {
  // State
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Computed values (using selectors)
  hasCompletedOnboarding: boolean;
}

export interface UserActions {
  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchUser: (userId: string) => Promise<void>;
  saveUserPreferences: () => Promise<void>;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        ...initialState,

        // Actions
        setUser: (user) =>
          set((state) => {
            state.currentUser = user;
            state.isAuthenticated = true;
            state.error = null;
          }),

        updateUser: (updates) =>
          set((state) => {
            if (state.currentUser) {
              Object.assign(state.currentUser, updates);
            }
          }),

        updatePreferences: (preferences) =>
          set((state) => {
            if (state.currentUser) {
              Object.assign(state.currentUser.preferences, preferences);
            }
          }),

        logout: () =>
          set((state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.error = null;
          }),

        setLoading: (isLoading) =>
          set((state) => {
            state.isLoading = isLoading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
            state.isLoading = false;
          }),

        // Async actions
        fetchUser: async (userId) => {
          get().setLoading(true);
          try {
            // Simulate API call
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            const user = await response.json();
            get().setUser(user);
          } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            get().setLoading(false);
          }
        },

        saveUserPreferences: async () => {
          const { currentUser } = get();
          if (!currentUser) return;

          try {
            const response = await fetch(`/api/users/${currentUser.id}/preferences`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(currentUser.preferences),
            });
            if (!response.ok) throw new Error('Failed to save preferences');
          } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Unknown error');
          }
        },
      })),
      {
        name: 'user-store',
        partialize: (state) => ({
          currentUser: state.currentUser,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'UserStore',
    }
  )
);

// Selectors (for derived state)
export const userSelectors = {
  isLoggedIn: (state: UserState) => state.isAuthenticated && !!state.currentUser,
  userName: (state: UserState) => state.currentUser?.name || 'Guest',
  userAvatar: (state: UserState) => state.currentUser?.avatar || undefined,
  isDarkMode: (state: UserState) => state.currentUser?.preferences.theme === 'dark',
};