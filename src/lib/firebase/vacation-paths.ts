/**
 * Centralized path builders for Firestore vacation-related documents
 * Prevents typos and ensures consistency across the codebase
 */

export const vacationPaths = {
  // Main vacation document
  vacation: (vacationId: string) => `vacations/${vacationId}` as const,
  
  // Subcollections
  members: (vacationId: string) => `vacations/${vacationId}/members` as const,
  member: (vacationId: string, memberId: string) => `vacations/${vacationId}/members/${memberId}` as const,
  
  itinerary: (vacationId: string) => `vacations/${vacationId}/itinerary` as const,
  itineraryDay: (vacationId: string, dayId: string) => `vacations/${vacationId}/itinerary/${dayId}` as const,
  
  messages: (vacationId: string) => `vacations/${vacationId}/messages` as const,
  message: (vacationId: string, messageId: string) => `vacations/${vacationId}/messages/${messageId}` as const,
  
  locations: (vacationId: string) => `vacations/${vacationId}/locations` as const,
  location: (vacationId: string, userId: string) => `vacations/${vacationId}/locations/${userId}` as const,
  
  photos: (vacationId: string) => `vacations/${vacationId}/photos` as const,
  photo: (vacationId: string, photoId: string) => `vacations/${vacationId}/photos/${photoId}` as const,
  
  // Related collections
  invitations: (vacationId: string) => `vacations/${vacationId}/invitations` as const,
  invitation: (vacationId: string, invitationId: string) => `vacations/${vacationId}/invitations/${invitationId}` as const,
  
  // Activities and reservations
  activities: (vacationId: string) => `vacations/${vacationId}/activities` as const,
  activity: (vacationId: string, activityId: string) => `vacations/${vacationId}/activities/${activityId}` as const,
  
  // Budget and expenses
  budget: (vacationId: string) => `vacations/${vacationId}/budget` as const,
  expense: (vacationId: string, expenseId: string) => `vacations/${vacationId}/budget/expenses/${expenseId}` as const,
  
  // Settings and preferences
  settings: (vacationId: string) => `vacations/${vacationId}/settings` as const,
  userPreferences: (vacationId: string, userId: string) => `vacations/${vacationId}/settings/userPreferences/${userId}` as const,
} as const

// Type helper to ensure all paths are used correctly
export type VacationPath = ReturnType<typeof vacationPaths[keyof typeof vacationPaths]> 