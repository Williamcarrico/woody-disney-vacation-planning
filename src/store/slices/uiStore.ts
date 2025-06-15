import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Modal {
  id: string;
  type: 'info' | 'warning' | 'error' | 'confirm' | 'custom';
  title: string;
  message?: string;
  component?: React.ComponentType<any>;
  props?: any;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  }>;
}

export interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  sidebarWidth: number;
  
  // Modals
  modals: Modal[];
  
  // Loading states
  loadingStates: Map<string, boolean>;
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Layout
  isMobile: boolean;
  viewportHeight: number;
  viewportWidth: number;
  
  // Navigation
  activeView: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Preferences
  density: 'compact' | 'normal' | 'comfortable';
  animationsEnabled: boolean;
  reducedMotion: boolean;
  
  // Tooltips and tours
  showTooltips: boolean;
  activeTour: string | null;
  completedTours: Set<string>;
}

export interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  
  // Modals
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading states
  setLoading: (key: string, loading: boolean) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Layout
  updateViewport: (width: number, height: number) => void;
  setMobile: (isMobile: boolean) => void;
  
  // Navigation
  setActiveView: (view: string) => void;
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;
  
  // Preferences
  setDensity: (density: UIState['density']) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  
  // Tooltips and tours
  setShowTooltips: (show: boolean) => void;
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  
  // Utility
  reset: () => void;
}

const initialState: UIState = {
  isSidebarOpen: true,
  sidebarWidth: 240,
  modals: [],
  loadingStates: new Map(),
  globalLoading: false,
  loadingMessage: null,
  isMobile: false,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  activeView: 'dashboard',
  breadcrumbs: [],
  density: 'normal',
  animationsEnabled: true,
  reducedMotion: false,
  showTooltips: true,
  activeTour: null,
  completedTours: new Set(),
};

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // Sidebar
      toggleSidebar: () =>
        set((state) => {
          state.isSidebarOpen = !state.isSidebarOpen;
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.isSidebarOpen = open;
        }),

      setSidebarWidth: (width) =>
        set((state) => {
          state.sidebarWidth = Math.max(200, Math.min(400, width));
        }),

      // Modals
      openModal: (modal) => {
        const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => {
          state.modals.push({ ...modal, id });
        });
        return id;
      },

      closeModal: (id) =>
        set((state) => {
          state.modals = state.modals.filter(m => m.id !== id);
        }),

      closeAllModals: () =>
        set((state) => {
          state.modals = [];
        }),

      // Loading states
      setLoading: (key, loading) =>
        set((state) => {
          if (loading) {
            state.loadingStates.set(key, true);
          } else {
            state.loadingStates.delete(key);
          }
        }),

      setGlobalLoading: (loading, message) =>
        set((state) => {
          state.globalLoading = loading;
          state.loadingMessage = message || null;
        }),

      // Layout
      updateViewport: (width, height) =>
        set((state) => {
          state.viewportWidth = width;
          state.viewportHeight = height;
          state.isMobile = width < 768;
          
          // Auto-close sidebar on mobile
          if (width < 768 && state.isSidebarOpen) {
            state.isSidebarOpen = false;
          }
        }),

      setMobile: (isMobile) =>
        set((state) => {
          state.isMobile = isMobile;
        }),

      // Navigation
      setActiveView: (view) =>
        set((state) => {
          state.activeView = view;
        }),

      setBreadcrumbs: (breadcrumbs) =>
        set((state) => {
          state.breadcrumbs = breadcrumbs;
        }),

      // Preferences
      setDensity: (density) =>
        set((state) => {
          state.density = density;
        }),

      setAnimationsEnabled: (enabled) =>
        set((state) => {
          state.animationsEnabled = enabled;
        }),

      setReducedMotion: (reduced) =>
        set((state) => {
          state.reducedMotion = reduced;
          if (reduced) {
            state.animationsEnabled = false;
          }
        }),

      // Tooltips and tours
      setShowTooltips: (show) =>
        set((state) => {
          state.showTooltips = show;
        }),

      startTour: (tourId) =>
        set((state) => {
          state.activeTour = tourId;
        }),

      completeTour: (tourId) =>
        set((state) => {
          state.completedTours.add(tourId);
          if (state.activeTour === tourId) {
            state.activeTour = null;
          }
        }),

      // Utility
      reset: () => set(initialState),
    })),
    {
      name: 'UIStore',
    }
  )
);

// Selectors
export const uiSelectors = {
  isAnyModalOpen: (state: UIState) => state.modals.length > 0,
  
  isAnyLoading: (state: UIState) => 
    state.globalLoading || state.loadingStates.size > 0,
  
  activeLoadingKeys: (state: UIState) =>
    Array.from(state.loadingStates.keys()),
  
  shouldShowSidebar: (state: UIState) =>
    state.isSidebarOpen && !state.isMobile,
  
  effectiveDensity: (state: UIState) => {
    if (state.isMobile) return 'comfortable';
    return state.density;
  },
  
  hasPendingTours: (state: UIState) => {
    const allTours = ['welcome', 'map', 'planning', 'collaboration'];
    return allTours.some(tour => !state.completedTours.has(tour));
  },
};

// Setup viewport listener
if (typeof window !== 'undefined') {
  const handleResize = () => {
    useUIStore.getState().updateViewport(window.innerWidth, window.innerHeight);
  };

  window.addEventListener('resize', handleResize);
  
  // Check for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  useUIStore.getState().setReducedMotion(mediaQuery.matches);
  
  mediaQuery.addEventListener('change', (e) => {
    useUIStore.getState().setReducedMotion(e.matches);
  });
}