import { Schedule, OperatingSchedule, ShowSchedule } from '@/types/attraction';

/**
 * Type guard to check if a schedule is an operating schedule
 */
export function isOperatingSchedule(schedule: Schedule): schedule is OperatingSchedule {
  return 'openingTime' in schedule && 'closingTime' in schedule && 
         typeof schedule.openingTime === 'string' && typeof schedule.closingTime === 'string';
}

/**
 * Type guard to check if a schedule is a show schedule
 */
export function isShowSchedule(schedule: Schedule): schedule is ShowSchedule {
  return 'performanceTimes' in schedule && Array.isArray(schedule.performanceTimes) && 
         schedule.performanceTimes.length > 0;
}

/**
 * Creates an operating schedule
 */
export function createOperatingSchedule(
  openingTime: string,
  closingTime: string,
  performanceTimes?: string[]
): OperatingSchedule {
  return {
    openingTime,
    closingTime,
    ...(performanceTimes && { performanceTimes }),
  };
}

/**
 * Creates a show schedule
 */
export function createShowSchedule(
  performanceTimes: string[],
  openingTime?: string,
  closingTime?: string
): ShowSchedule {
  return {
    performanceTimes,
    ...(openingTime && { openingTime }),
    ...(closingTime && { closingTime }),
  };
}

/**
 * Validates a schedule object
 */
export function validateSchedule(schedule: unknown): schedule is Schedule {
  if (!schedule || typeof schedule !== 'object') {
    return false;
  }

  const s = schedule as Record<string, unknown>;

  // Check if it's an operating schedule
  if (typeof s['openingTime'] === 'string' && typeof s['closingTime'] === 'string') {
    return true;
  }

  // Check if it's a show schedule
  if (Array.isArray(s['performanceTimes']) && (s['performanceTimes'] as unknown[]).length > 0) {
    return (s['performanceTimes'] as unknown[]).every(time => typeof time === 'string');
  }

  return false;
}

/**
 * Gets display text for a schedule
 */
export function getScheduleDisplayText(schedule: Schedule): string {
  if (isOperatingSchedule(schedule)) {
    return `${schedule.openingTime} - ${schedule.closingTime}`;
  }

  if (isShowSchedule(schedule)) {
    return `Shows: ${schedule.performanceTimes.join(', ')}`;
  }

  return 'Schedule not available';
}