/**
 * Static data for Disney parks information
 */

// Interface for park information
export interface ParkInfo {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    description: string;
    openingTime?: string;
    closingTime?: string;
}

// Walt Disney World parks
const wdwParks: Record<string, ParkInfo> = {
    'magic-kingdom': {
        id: 'magic-kingdom',
        name: 'Magic Kingdom',
        shortName: 'MK',
        icon: '🏰',
        description: 'The original Walt Disney World theme park featuring classic attractions and beloved characters.'
    },
    'epcot': {
        id: 'epcot',
        name: 'EPCOT',
        shortName: 'EP',
        icon: '🌐',
        description: 'A celebration of human achievement and international culture with futuristic attractions and World Showcase pavilions.'
    },
    'hollywood-studios': {
        id: 'hollywood-studios',
        name: 'Hollywood Studios',
        shortName: 'HS',
        icon: '🎬',
        description: 'A theme park dedicated to movie magic, television, music, and theater.'
    },
    'animal-kingdom': {
        id: 'animal-kingdom',
        name: 'Animal Kingdom',
        shortName: 'AK',
        icon: '🦁',
        description: 'A zoological theme park featuring attractions and experiences that celebrate animal conservation.'
    },
    'typhoon-lagoon': {
        id: 'typhoon-lagoon',
        name: 'Typhoon Lagoon',
        shortName: 'TL',
        icon: '🌊',
        description: 'A water park featuring a tropical theme and one of the world\'s largest wave pools.'
    },
    'blizzard-beach': {
        id: 'blizzard-beach',
        name: 'Blizzard Beach',
        shortName: 'BB',
        icon: '❄️',
        description: 'A water park themed as a ski resort that melted into a watery playground.'
    }
};

/**
 * Get park information by park ID
 */
export function getParkInfo(parkId: string): ParkInfo | undefined {
    return wdwParks[parkId];
}

/**
 * Get all Walt Disney World parks
 */
export function getAllWdwParks(): ParkInfo[] {
    return Object.values(wdwParks);
}

/**
 * Get park names mapped by their IDs
 */
export function getParkNameMap(): Record<string, string> {
    const parkMap: Record<string, string> = {};
    Object.values(wdwParks).forEach((park) => {
        parkMap[park.id] = park.name;
    });
    return parkMap;
}