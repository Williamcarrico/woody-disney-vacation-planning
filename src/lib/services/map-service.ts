/**
 * Map Service
 * Handles geofencing, location sharing, and wait time data for map features
 */

import { GeofenceData, GroupMember, LocationData } from "@/components/maps/interactive-map";

interface LocationUpdateOptions {
    vacationId?: string;
    userId: string;
    userName: string;
    avatarUrl?: string;
}

/**
 * Creates a new geofence at the specified coordinates
 */
export async function createGeofence(
    name: string,
    lat: number,
    lng: number,
    radius: number,
    type: 'attraction' | 'meeting' | 'custom',
    vacationId?: string
): Promise<GeofenceData> {
    try {
        // In a real implementation, this would interact with a backend API
        // For now, we'll just generate an ID and return the geofence data
        const geofence: GeofenceData = {
            id: `geofence-${Date.now()}`,
            name,
            lat,
            lng,
            radius,
            type
        };

        // Store in localStorage for demo purposes
        const storedGeofences = getGeofences(vacationId);
        localStorage.setItem(
            getGeofencesKey(vacationId),
            JSON.stringify([...storedGeofences, geofence])
        );

        return geofence;
    } catch (error) {
        console.error("Error creating geofence:", error);
        throw new Error("Failed to create geofence");
    }
}

/**
 * Gets all geofences for the specified vacation
 */
export function getGeofences(vacationId?: string): GeofenceData[] {
    try {
        const storedGeofences = localStorage.getItem(getGeofencesKey(vacationId));
        return storedGeofences ? JSON.parse(storedGeofences) : [];
    } catch (error) {
        console.error("Error retrieving geofences:", error);
        return [];
    }
}

/**
 * Removes a geofence by ID
 */
export function removeGeofence(geofenceId: string, vacationId?: string): boolean {
    try {
        const geofences = getGeofences(vacationId);
        const updatedGeofences = geofences.filter(g => g.id !== geofenceId);
        localStorage.setItem(getGeofencesKey(vacationId), JSON.stringify(updatedGeofences));
        return true;
    } catch (error) {
        console.error("Error removing geofence:", error);
        return false;
    }
}

/**
 * Updates the user's location and shares it with the group
 */
export async function updateUserLocation(
    lat: number,
    lng: number,
    options: LocationUpdateOptions
): Promise<boolean> {
    try {
        // In a real implementation, this would update the location in a real-time database
        // For demo purposes, we'll store it in localStorage
        const { vacationId, userId, userName, avatarUrl } = options;

        const member: GroupMember = {
            id: userId,
            name: userName,
            avatar: avatarUrl,
            lat,
            lng,
            lastUpdated: new Date()
        };

        // Store the member's location
        const key = getGroupKey(vacationId);
        const storedMembers = getGroupMembers(vacationId);

        // Update or add the member
        const updatedMembers = storedMembers.filter(m => m.id !== userId);
        updatedMembers.push(member);

        localStorage.setItem(key, JSON.stringify(updatedMembers));

        return true;
    } catch (error) {
        console.error("Error updating location:", error);
        return false;
    }
}

/**
 * Gets all group members for the specified vacation
 */
export function getGroupMembers(vacationId?: string): GroupMember[] {
    try {
        const key = getGroupKey(vacationId);
        const storedMembers = localStorage.getItem(key);

        if (!storedMembers) return [];

        const members = JSON.parse(storedMembers) as GroupMember[];

        // Convert string dates back to Date objects
        return members.map(member => ({
            ...member,
            lastUpdated: new Date(member.lastUpdated)
        }));
    } catch (error) {
        console.error("Error retrieving group members:", error);
        return [];
    }
}

/**
 * Gets the current wait times for attractions
 */
export async function getAttractionWaitTimes(parkId: string): Promise<Record<string, { waitTime: number; status: string }>> {
    try {
        // In a real implementation, this would fetch from an API
        // For demo purposes, we'll mock random wait times
        const response = await fetch(`/api/attractions/${parkId}/wait-times`);

        if (!response.ok) {
            throw new Error('Failed to fetch wait times');
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching wait times:", error);

        // Return mock data for demo
        return {
            'attraction-1': { waitTime: 15, status: 'OPERATING' },
            'attraction-2': { waitTime: 45, status: 'OPERATING' },
            'attraction-3': { waitTime: 0, status: 'DOWN' },
            'attraction-4': { waitTime: 30, status: 'OPERATING' },
            'attraction-5': { waitTime: 60, status: 'OPERATING' },
        };
    }
}

/**
 * Handles geofence entry events
 */
export function handleGeofenceEntry(geofence: GeofenceData): void {
    // In a real implementation, this could:
    // 1. Log the entry event to a database
    // 2. Send a notification to the user
    // 3. Update the UI to show they're in a geofence

    // For now, just show a notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(`Entered: ${geofence.name}`, {
                body: `You have entered the ${geofence.name} area.`,
                icon: '/icons/marker-icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(`Entered: ${geofence.name}`, {
                        body: `You have entered the ${geofence.name} area.`,
                        icon: '/icons/marker-icon.png'
                    });
                }
            });
        }
    }

    console.log(`Entered geofence: ${geofence.name}`);
}

/**
 * Handles geofence exit events
 */
export function handleGeofenceExit(geofence: GeofenceData): void {
    // Similar logic to entry handling
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(`Left: ${geofence.name}`, {
                body: `You have left the ${geofence.name} area.`,
                icon: '/icons/marker-icon.png'
            });
        }
    }

    console.log(`Exited geofence: ${geofence.name}`);
}

/**
 * Handles alerts when group members are too far apart
 */
export function handleGroupSeparationAlert(memberId: string, distance: number): void {
    const member = getGroupMembers().find(m => m.id === memberId);

    if (!member) return;

    // Calculate distance in a friendly format
    const distanceText = distance < 1000
        ? `${Math.round(distance)} meters`
        : `${(distance / 1000).toFixed(1)} km`;

    // Show notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(`Group Separation Alert`, {
                body: `${member.name} is ${distanceText} away from you.`,
                icon: '/icons/marker-icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    console.log(`Group separation alert: ${member.name} is ${distanceText} away`);
}

/**
 * Gets the localStorage key for group data
 */
function getGroupKey(vacationId?: string): string {
    return vacationId
        ? `disney-group-members-${vacationId}`
        : 'disney-group-members';
}

/**
 * Gets the localStorage key for geofence data
 */
function getGeofencesKey(vacationId?: string): string {
    return vacationId
        ? `disney-geofences-${vacationId}`
        : 'disney-geofences';
}

/**
 * Calculates the distance between two coordinates in meters
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}