import { users } from './users';
import { vacations } from './vacations';
import { itineraries } from './itineraries';

export { users, vacations, itineraries };
export const db = { users, vacations, itineraries };

export * from './itineraries'
// Export other schemas as needed
// export * from './users'
// export * from './vacations'