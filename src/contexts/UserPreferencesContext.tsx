'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useUserStore, userSelectors } from '@/store/slices/userStore';
import { useUIStore } from '@/store/slices/uiStore';
import { useNotificationStore } from '@/store/slices/notificationStore';

interface UserPreferences {
  // Display preferences
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'normal' | 'comfortable';
  animationsEnabled: boolean;
  reducedMotion: boolean;
  
  // Notification preferences
  notifications: {
    enabled: boolean;
    sound: boolean;
    browser: boolean;
    categories: {
      system: boolean;
      geofence: boolean;
      collaboration: boolean;
      trip: boolean;
      alert: boolean;
    };
  };
  
  // Privacy preferences
  locationSharing: boolean;
  analyticsEnabled: boolean;
  
  // Accessibility
  showTooltips: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  
  // Language and locale
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
}

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  updateNestedPreference: <K extends keyof UserPreferences>(
    key: K,
    path: string[],
    value: any
  ) => void;
  resetPreferences: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  density: 'normal',
  animationsEnabled: true,
  reducedMotion: false,
  notifications: {
    enabled: true,
    sound: false,
    browser: false,
    categories: {
      system: true,
      geofence: true,
      collaboration: true,
      trip: true,
      alert: true,
    },
  },
  locationSharing: false,
  analyticsEnabled: true,
  showTooltips: true,
  fontSize: 'medium',
  highContrast: false,
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  // Get preferences from stores
  const userPrefs = useUserStore((state) => state.currentUser?.preferences);
  const updateUserPrefs = useUserStore((state) => state.updatePreferences);
  const saveUserPrefs = useUserStore((state) => state.saveUserPreferences);
  
  const uiDensity = useUIStore((state) => state.density);
  const setUIDensity = useUIStore((state) => state.setDensity);
  const animationsEnabled = useUIStore((state) => state.animationsEnabled);
  const setAnimationsEnabled = useUIStore((state) => state.setAnimationsEnabled);
  const reducedMotion = useUIStore((state) => state.reducedMotion);
  const showTooltips = useUIStore((state) => state.showTooltips);
  const setShowTooltips = useUIStore((state) => state.setShowTooltips);
  
  const notificationSettings = useNotificationStore((state) => ({
    enabled: state.enabled,
    sound: state.playSound,
    browser: state.showBrowserNotifications,
  }));
  const enabledCategories = useNotificationStore((state) => state.enabledCategories);
  const updateNotificationSettings = useNotificationStore((state) => state.updateSettings);
  const toggleCategory = useNotificationStore((state) => state.toggleCategory);

  // Merge all preferences
  const preferences: UserPreferences = useMemo(() => ({
    theme: userPrefs?.theme || defaultPreferences.theme,
    density: uiDensity,
    animationsEnabled,
    reducedMotion,
    notifications: {
      ...notificationSettings,
      categories: {
        system: enabledCategories.has('system'),
        geofence: enabledCategories.has('geofence'),
        collaboration: enabledCategories.has('collaboration'),
        trip: enabledCategories.has('trip'),
        alert: enabledCategories.has('alert'),
      },
    },
    locationSharing: userPrefs?.locationSharing || defaultPreferences.locationSharing,
    analyticsEnabled: defaultPreferences.analyticsEnabled,
    showTooltips,
    fontSize: defaultPreferences.fontSize,
    highContrast: defaultPreferences.highContrast,
    language: userPrefs?.language || defaultPreferences.language,
    dateFormat: defaultPreferences.dateFormat,
    timeFormat: defaultPreferences.timeFormat,
    timezone: defaultPreferences.timezone,
  }), [
    userPrefs,
    uiDensity,
    animationsEnabled,
    reducedMotion,
    notificationSettings,
    enabledCategories,
    showTooltips,
  ]);

  // Update preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    switch (key) {
      case 'theme':
        updateUserPrefs({ theme: value as any });
        break;
      case 'density':
        setUIDensity(value as any);
        break;
      case 'animationsEnabled':
        setAnimationsEnabled(value as boolean);
        break;
      case 'locationSharing':
        updateUserPrefs({ locationSharing: value as boolean });
        break;
      case 'showTooltips':
        setShowTooltips(value as boolean);
        break;
      case 'language':
        updateUserPrefs({ language: value as string });
        break;
      case 'notifications':
        const notifValue = value as UserPreferences['notifications'];
        updateNotificationSettings({
          playSound: notifValue.sound,
          showBrowserNotifications: notifValue.browser,
        });
        break;
    }
    
    // Save preferences
    saveUserPrefs();
  }, [
    updateUserPrefs,
    setUIDensity,
    setAnimationsEnabled,
    setShowTooltips,
    updateNotificationSettings,
    saveUserPrefs,
  ]);

  // Update nested preference
  const updateNestedPreference = useCallback((
    key: keyof UserPreferences,
    path: string[],
    value: any
  ) => {
    if (key === 'notifications' && path[0] === 'categories') {
      toggleCategory(path[1]);
    }
  }, [toggleCategory]);

  // Reset preferences
  const resetPreferences = useCallback(() => {
    updateUserPrefs({
      theme: defaultPreferences.theme,
      locationSharing: defaultPreferences.locationSharing,
      language: defaultPreferences.language,
    });
    setUIDensity(defaultPreferences.density);
    setAnimationsEnabled(defaultPreferences.animationsEnabled);
    setShowTooltips(defaultPreferences.showTooltips);
    updateNotificationSettings({
      playSound: defaultPreferences.notifications.sound,
      showBrowserNotifications: defaultPreferences.notifications.browser,
    });
  }, [
    updateUserPrefs,
    setUIDensity,
    setAnimationsEnabled,
    setShowTooltips,
    updateNotificationSettings,
  ]);

  // Export preferences
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  // Import preferences
  const importPreferences = useCallback((data: string) => {
    try {
      const imported = JSON.parse(data) as UserPreferences;
      
      // Apply imported preferences
      Object.entries(imported).forEach(([key, value]) => {
        updatePreference(key as keyof UserPreferences, value);
      });
    } catch (error) {
      console.error('Failed to import preferences:', error);
    }
  }, [updatePreference]);

  const value: UserPreferencesContextValue = {
    preferences,
    updatePreference,
    updateNestedPreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}