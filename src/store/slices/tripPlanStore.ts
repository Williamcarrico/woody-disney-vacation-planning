import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { TripPlanItem } from '@/lib/websocket/enhanced-websocket-service';

export interface TripDay {
  id: string;
  date: Date;
  parkId?: string;
  items: TripPlanItem[];
}

export interface TripPlanState {
  // Trip information
  tripId: string | null;
  tripName: string;
  startDate: Date | null;
  endDate: Date | null;
  
  // Trip days and items
  days: Map<string, TripDay>;
  currentDayId: string | null;
  
  // Collaboration
  isCollaborative: boolean;
  collaborators: Set<string>;
  
  // UI state
  selectedItemId: string | null;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  
  // Preferences
  defaultItemDuration: number; // minutes
  showTransitTime: boolean;
  autoSchedule: boolean;
}

export interface TripPlanActions {
  // Trip management
  createTrip: (name: string, startDate: Date, endDate: Date) => void;
  updateTrip: (updates: Partial<Pick<TripPlanState, 'tripName' | 'startDate' | 'endDate'>>) => void;
  loadTrip: (tripId: string) => Promise<void>;
  saveTrip: () => Promise<void>;
  
  // Day management
  addDay: (date: Date, parkId?: string) => string;
  updateDay: (dayId: string, updates: Partial<TripDay>) => void;
  removeDay: (dayId: string) => void;
  setCurrentDay: (dayId: string | null) => void;
  
  // Item management
  addItem: (dayId: string, item: Omit<TripPlanItem, 'id' | 'addedAt'>) => void;
  updateItem: (dayId: string, itemId: string, updates: Partial<TripPlanItem>) => void;
  removeItem: (dayId: string, itemId: string) => void;
  moveItem: (fromDayId: string, toDayId: string, itemId: string, newIndex: number) => void;
  
  // Voting
  voteOnItem: (dayId: string, itemId: string, userId: string, vote: boolean) => void;
  
  // Collaboration
  setCollaborative: (enabled: boolean) => void;
  addCollaborator: (userId: string) => void;
  removeCollaborator: (userId: string) => void;
  
  // UI state
  selectItem: (itemId: string | null) => void;
  setEditMode: (enabled: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Preferences
  updatePreferences: (prefs: Partial<Pick<TripPlanState, 'defaultItemDuration' | 'showTransitTime' | 'autoSchedule'>>) => void;
  
  // Utility
  optimizeSchedule: (dayId: string) => void;
  reset: () => void;
}

const initialState: TripPlanState = {
  tripId: null,
  tripName: '',
  startDate: null,
  endDate: null,
  days: new Map(),
  currentDayId: null,
  isCollaborative: false,
  collaborators: new Set(),
  selectedItemId: null,
  isEditMode: false,
  hasUnsavedChanges: false,
  defaultItemDuration: 60,
  showTransitTime: true,
  autoSchedule: false,
};

export const useTripPlanStore = create<TripPlanState & TripPlanActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        ...initialState,

        // Trip management
        createTrip: (name, startDate, endDate) =>
          set((state) => {
            state.tripId = `trip_${Date.now()}`;
            state.tripName = name;
            state.startDate = startDate;
            state.endDate = endDate;
            state.days.clear();
            
            // Create days for the trip
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dayId = `day_${currentDate.toISOString().split('T')[0]}`;
              state.days.set(dayId, {
                id: dayId,
                date: new Date(currentDate),
                items: [],
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }),

        updateTrip: (updates) =>
          set((state) => {
            Object.assign(state, updates);
            state.hasUnsavedChanges = true;
          }),

        loadTrip: async (tripId) => {
          // Simulate API call
          try {
            const response = await fetch(`/api/trips/${tripId}`);
            if (!response.ok) throw new Error('Failed to load trip');
            const tripData = await response.json();
            
            set((state) => {
              state.tripId = tripData.id;
              state.tripName = tripData.name;
              state.startDate = new Date(tripData.startDate);
              state.endDate = new Date(tripData.endDate);
              // Convert days array to Map
              state.days = new Map(
                tripData.days.map((day: TripDay) => [day.id, day])
              );
              state.hasUnsavedChanges = false;
            });
          } catch (error) {
            console.error('Failed to load trip:', error);
          }
        },

        saveTrip: async () => {
          const state = get();
          if (!state.tripId || !state.hasUnsavedChanges) return;
          
          try {
            const tripData = {
              id: state.tripId,
              name: state.tripName,
              startDate: state.startDate,
              endDate: state.endDate,
              days: Array.from(state.days.values()),
            };
            
            const response = await fetch(`/api/trips/${state.tripId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tripData),
            });
            
            if (!response.ok) throw new Error('Failed to save trip');
            
            set((state) => {
              state.hasUnsavedChanges = false;
            });
          } catch (error) {
            console.error('Failed to save trip:', error);
          }
        },

        // Day management
        addDay: (date, parkId) => {
          const dayId = `day_${date.toISOString().split('T')[0]}`;
          set((state) => {
            state.days.set(dayId, {
              id: dayId,
              date,
              parkId,
              items: [],
            });
            state.hasUnsavedChanges = true;
          });
          return dayId;
        },

        updateDay: (dayId, updates) =>
          set((state) => {
            const day = state.days.get(dayId);
            if (day) {
              Object.assign(day, updates);
              state.hasUnsavedChanges = true;
            }
          }),

        removeDay: (dayId) =>
          set((state) => {
            state.days.delete(dayId);
            if (state.currentDayId === dayId) {
              state.currentDayId = null;
            }
            state.hasUnsavedChanges = true;
          }),

        setCurrentDay: (dayId) =>
          set((state) => {
            state.currentDayId = dayId;
          }),

        // Item management
        addItem: (dayId, item) =>
          set((state) => {
            const day = state.days.get(dayId);
            if (day) {
              const newItem: TripPlanItem = {
                ...item,
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                addedAt: new Date().toISOString(),
                votes: {},
              };
              day.items.push(newItem);
              state.hasUnsavedChanges = true;
            }
          }),

        updateItem: (dayId, itemId, updates) =>
          set((state) => {
            const day = state.days.get(dayId);
            if (day) {
              const item = day.items.find(i => i.id === itemId);
              if (item) {
                Object.assign(item, updates);
                state.hasUnsavedChanges = true;
              }
            }
          }),

        removeItem: (dayId, itemId) =>
          set((state) => {
            const day = state.days.get(dayId);
            if (day) {
              day.items = day.items.filter(i => i.id !== itemId);
              if (state.selectedItemId === itemId) {
                state.selectedItemId = null;
              }
              state.hasUnsavedChanges = true;
            }
          }),

        moveItem: (fromDayId, toDayId, itemId, newIndex) =>
          set((state) => {
            const fromDay = state.days.get(fromDayId);
            const toDay = state.days.get(toDayId);
            
            if (fromDay && toDay) {
              const itemIndex = fromDay.items.findIndex(i => i.id === itemId);
              if (itemIndex !== -1) {
                const [item] = fromDay.items.splice(itemIndex, 1);
                toDay.items.splice(newIndex, 0, item);
                state.hasUnsavedChanges = true;
              }
            }
          }),

        // Voting
        voteOnItem: (dayId, itemId, userId, vote) =>
          set((state) => {
            const day = state.days.get(dayId);
            if (day) {
              const item = day.items.find(i => i.id === itemId);
              if (item) {
                item.votes[userId] = vote;
                state.hasUnsavedChanges = true;
              }
            }
          }),

        // Collaboration
        setCollaborative: (enabled) =>
          set((state) => {
            state.isCollaborative = enabled;
          }),

        addCollaborator: (userId) =>
          set((state) => {
            state.collaborators.add(userId);
          }),

        removeCollaborator: (userId) =>
          set((state) => {
            state.collaborators.delete(userId);
          }),

        // UI state
        selectItem: (itemId) =>
          set((state) => {
            state.selectedItemId = itemId;
          }),

        setEditMode: (enabled) =>
          set((state) => {
            state.isEditMode = enabled;
          }),

        setHasUnsavedChanges: (hasChanges) =>
          set((state) => {
            state.hasUnsavedChanges = hasChanges;
          }),

        // Preferences
        updatePreferences: (prefs) =>
          set((state) => {
            Object.assign(state, prefs);
          }),

        // Utility
        optimizeSchedule: (dayId) =>
          set((state) => {
            const day = state.days.get(dayId);
            if (day && day.items.length > 1) {
              // Simple optimization: sort by scheduled time
              day.items.sort((a, b) => {
                if (!a.scheduledTime || !b.scheduledTime) return 0;
                return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
              });
              state.hasUnsavedChanges = true;
            }
          }),

        reset: () => set(initialState),
      })),
      {
        name: 'trip-plan-store',
        partialize: (state) => ({
          tripId: state.tripId,
          tripName: state.tripName,
          startDate: state.startDate,
          endDate: state.endDate,
          days: Array.from(state.days.entries()),
          defaultItemDuration: state.defaultItemDuration,
          showTransitTime: state.showTransitTime,
          autoSchedule: state.autoSchedule,
        }),
      }
    ),
    {
      name: 'TripPlanStore',
    }
  )
);

// Selectors
export const tripPlanSelectors = {
  currentDay: (state: TripPlanState) =>
    state.currentDayId ? state.days.get(state.currentDayId) : null,
  
  selectedItem: (state: TripPlanState) => {
    if (!state.selectedItemId) return null;
    
    for (const day of state.days.values()) {
      const item = day.items.find(i => i.id === state.selectedItemId);
      if (item) return { item, dayId: day.id };
    }
    return null;
  },
  
  tripDuration: (state: TripPlanState) => {
    if (!state.startDate || !state.endDate) return 0;
    const diffTime = Math.abs(state.endDate.getTime() - state.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  },
  
  totalItems: (state: TripPlanState) =>
    Array.from(state.days.values()).reduce((sum, day) => sum + day.items.length, 0),
  
  itemsByType: (state: TripPlanState) => {
    const byType: Record<string, TripPlanItem[]> = {};
    
    for (const day of state.days.values()) {
      for (const item of day.items) {
        if (!byType[item.type]) {
          byType[item.type] = [];
        }
        byType[item.type].push(item);
      }
    }
    
    return byType;
  },
};