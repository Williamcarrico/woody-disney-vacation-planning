export type ParkId = "MK" | "EP" | "HS" | "AK" | "TL" | "BB" | "DS";

export interface Park {
    id: ParkId;
    name: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>; // For potential park icons
}

export type AttractionStatus = "Operating" | "Closed" | "Down" | "Refurbishment";
export type ThrillCategory = "Coaster" | "Dark Ride" | "Water Ride" | "Show" | "Meet & Greet" | "Spinner" | "Gentle";

export interface Attraction {
    id: string;
    name: string;
    parkId: ParkId;
    parkName: string; // Denormalized for easier display
    land?: string;
    imageUrl?: string;
    thumbnailUrl?: string; // For cards
    description: string;
    waitTime: number | null; // null if not applicable (e.g., show) or down
    status: AttractionStatus;
    geniePlus: {
        available: boolean;
        nextAvailableTime?: string; // e.g., "10:30 AM"
        isLightningLane: boolean; // True if it's an Individual Lightning Lane
    };
    riderSwitchAvailable: boolean;
    heightRequirement: string | null; // e.g., "40in (102cm)" or null
    thrillLevels: ThrillCategory[];
    tags: string[]; // e.g., "Interactive", "Slow", "Loud"
    duration?: string; // e.g., "15 minutes"
    historicalWaitTimes?: { date: string; averageWait: number }[]; // For detailed modal
    userRating?: number; // e.g., 4.5 (out of 5)
    tips?: string[];
}

export interface WaitTimeData {
    attractionId: string;
    waitTime: number;
    status: AttractionStatus;
    geniePlusAvailable?: boolean;
    nextGeniePlusTime?: string;
}

export const parksData: Record<ParkId, Park> = {
    MK: { id: "MK", name: "Magic Kingdom" },
    EP: { id: "EP", name: "Epcot" },
    HS: { id: "HS", name: "Hollywood Studios" },
    AK: { id: "AK", name: "Animal Kingdom" },
    TL: { id: "TL", name: "Typhoon Lagoon" },
    BB: { id: "BB", name: "Blizzard Beach" },
    DS: { id: "DS", name: "Disney Springs" }, // For experiences/shows if any
};