import { Timestamp } from "firebase/firestore";

export interface Vacation {
    id: string;
    name: string;
    startDate: Timestamp;
    endDate: Timestamp;
    destination: string;
    userId: string;
    groupId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    imageUrl?: string;
    notes?: string;
    status: 'planning' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}