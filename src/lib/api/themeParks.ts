import axios from 'axios';
import { cache } from 'react';
import type {
    Destination,
    Park,
    Attraction,
    LiveData,
    ScheduleData,
    ShowtimeData,
    VirtualQueueData,
    LightningLaneData,
    HistoricalWaitTimeData
} from '@/types/api';

/**
 * ThemeParks.wiki API client
 *
 * This module provides functions to interact with the ThemeParks.wiki API,
 * with TypeScript typings for safe data handling and caching for performance.
 */

const BASE_URL = 'https://api.themeparks.wiki/v1';

// Create an axios instance with default configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Fetch all Disney destinations (resorts)
 *
 * Cached using React's cache function to improve performance
 * and reduce unnecessary API calls
 */
export const getDisneyDestinations = cache(async (): Promise<Destination[]> => {
    try {
        const response = await apiClient.get<Destination[]>('/destinations');
        // Filter for Disney destinations only
        return response.data.filter(
            (destination: Destination) => destination.slug.includes('disney')
        );
    } catch (error) {
        console.error('Error fetching Disney destinations:', error);
        throw new Error('Failed to fetch Disney destinations');
    }
});

/**
 * Fetch a specific destination by ID
 */
export const getDestination = cache(async (destinationId: string): Promise<Destination> => {
    try {
        const response = await apiClient.get<Destination>(`/destination/${destinationId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching destination ${destinationId}:`, error);
        throw new Error(`Failed to fetch destination ${destinationId}`);
    }
});

/**
 * Fetch all parks for Walt Disney World Resort
 */
export const getWaltDisneyWorldParks = cache(async (): Promise<Park[]> => {
    try {
        // Assuming 'waltdisneyworldresort' is the slug for WDW
        const response = await apiClient.get<Park[]>('/destination/waltdisneyworldresort/parks');
        return response.data;
    } catch (error) {
        console.error('Error fetching Walt Disney World parks:', error);
        throw new Error('Failed to fetch Walt Disney World parks');
    }
});

/**
 * Fetch a specific park by ID
 */
export const getPark = cache(async (parkId: string): Promise<Park> => {
    try {
        const response = await apiClient.get<Park>(`/park/${parkId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching park ${parkId}:`, error);
        throw new Error(`Failed to fetch park ${parkId}`);
    }
});

/**
 * Fetch all attractions for a specific park
 */
export const getParkAttractions = cache(async (parkId: string): Promise<Attraction[]> => {
    try {
        const response = await apiClient.get<Attraction[]>(`/park/${parkId}/attractions`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching attractions for park ${parkId}:`, error);
        throw new Error(`Failed to fetch attractions for park ${parkId}`);
    }
});

/**
 * Fetch live data (wait times, statuses) for all attractions in a park
 */
export const getParkLiveData = async (parkId: string): Promise<LiveData> => {
    try {
        const response = await apiClient.get<LiveData>(`/park/${parkId}/live`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching live data for park ${parkId}:`, error);
        throw new Error(`Failed to fetch live data for park ${parkId}`);
    }
};

/**
 * Fetch schedule data for a park (operating hours)
 */
export const getParkSchedule = cache(async (parkId: string, startDate?: string, endDate?: string): Promise<ScheduleData> => {
    try {
        let url = `/park/${parkId}/schedule`;

        // Add date range if provided
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await apiClient.get<ScheduleData>(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching schedule for park ${parkId}:`, error);
        throw new Error(`Failed to fetch schedule for park ${parkId}`);
    }
});

/**
 * Fetch showtimes for a park
 */
export const getParkShowtimes = cache(async (parkId: string, date?: string): Promise<ShowtimeData> => {
    try {
        let url = `/park/${parkId}/showtimes`;

        // Add date if provided
        if (date) {
            url += `?date=${date}`;
        }

        const response = await apiClient.get<ShowtimeData>(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching showtimes for park ${parkId}:`, error);
        throw new Error(`Failed to fetch showtimes for park ${parkId}`);
    }
});

/**
 * Fetch virtual queue data for Walt Disney World
 */
export const getVirtualQueueData = async (): Promise<VirtualQueueData> => {
    try {
        const response = await apiClient.get<VirtualQueueData>('/destination/waltdisneyworldresort/virtualqueues');
        return response.data;
    } catch (error) {
        console.error('Error fetching virtual queue data:', error);
        throw new Error('Failed to fetch virtual queue data');
    }
};

/**
 * Fetch Lightning Lane / Genie+ data for Walt Disney World
 */
export const getLightningLaneData = async (): Promise<LightningLaneData> => {
    try {
        const response = await apiClient.get<LightningLaneData>('/destination/waltdisneyworldresort/genie');
        return response.data;
    } catch (error) {
        console.error('Error fetching Lightning Lane data:', error);
        throw new Error('Failed to fetch Lightning Lane data');
    }
};

/**
 * Fetch historical wait time data for an attraction
 */
export const getAttractionHistoricalData = cache(async (attractionId: string, startDate: string, endDate: string): Promise<HistoricalWaitTimeData[]> => {
    try {
        const response = await apiClient.get<HistoricalWaitTimeData[]>(`/attraction/${attractionId}/waittime?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching historical data for attraction ${attractionId}:`, error);
        throw new Error(`Failed to fetch historical data for attraction ${attractionId}`);
    }
});

// Assign the object to a variable before exporting
const themeParksApi = {
    getDisneyDestinations,
    getDestination,
    getWaltDisneyWorldParks,
    getPark,
    getParkAttractions,
    getParkLiveData,
    getParkSchedule,
    getParkShowtimes,
    getVirtualQueueData,
    getLightningLaneData,
    getAttractionHistoricalData,
};

// Exports all functions for use throughout the application
export default themeParksApi;