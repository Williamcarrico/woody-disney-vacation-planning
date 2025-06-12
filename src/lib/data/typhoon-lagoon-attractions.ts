import { Attraction, AttractionType, Park, RideCategory, TransferType, WheelchairAccessibility } from "@/types/attraction";

export const typhoonLagoonAttractions: Attraction[] = [
    {
        id: "typhoon-lagoon-surf-pool",
        name: "Surf Pool",
        park: Park.TyphoonLagoon,
        description: "Experience one of the world's largest wave pools! This 2.75-acre lagoon generates waves up to 6 feet high, perfect for bodysurf or just floating with the waves. The pool operates on a cycle with wave sessions followed by calm periods for easy entry and exit.",
        imageUrl: "/images/attractions/typhoon-lagoon-surf-pool.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Water Activity", "Signature"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        }
    },
    {
        id: "castaway-creek",
        name: "Castaway Creek",
        park: Park.TyphoonLagoon,
        description: "Relax and unwind on this 2,100-foot-long lazy river that winds around the entire park. Float on a tube through tropical landscapes, caves, and misty rainforests. The gentle current carries you past lush scenery and provides a peaceful break from the more adventurous attractions.",
        imageUrl: "/images/attractions/castaway-creek.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Slow, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Relaxing", "Family"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 30
    },
    {
        id: "crush-n-gusher",
        name: "Crush 'n' Gusher",
        park: Park.TyphoonLagoon,
        description: "Ride the waves on this thrilling water coaster featuring three different slide experiences: Banana Blaster, Coconut Crusher, and Pineapple Plunger. These uphill water coasters use powerful water jets to propel riders both up and down hills, creating a unique roller coaster experience on water.",
        imageUrl: "/images/attractions/crush-n-gusher.jpg",
        attractionType: [AttractionType.WaterAttraction, AttractionType.Thrill],
        rideCategory: [RideCategory.Water, RideCategory.Thrill, RideCategory.Outdoor],
        heightRequirement: {
            min: 48,
            unit: "in",
            minHeight: "48 inches"
        },
        tags: ["48\" (122cm) or taller", "Thrill", "Water Coaster", "Popular"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.MustTransfer,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 2
    },
    {
        id: "humunga-kowabunga",
        name: "Humunga Kowabunga",
        park: Park.TyphoonLagoon,
        description: "Brave these three speed slides that send you plummeting down Mount Mayday at speeds up to 30 mph! These 214-foot-long body slides feature trap doors that suddenly drop away, sending you racing through dark enclosed tubes before splashing into the pool below.",
        imageUrl: "/images/attractions/humunga-kowabunga.jpg",
        attractionType: [AttractionType.WaterAttraction, AttractionType.Thrill],
        rideCategory: [RideCategory.Water, RideCategory.Thrill, RideCategory.Outdoor],
        heightRequirement: {
            min: 48,
            unit: "in",
            minHeight: "48 inches"
        },
        tags: ["48\" (122cm) or taller", "Thrill", "Speed Slide", "Intense"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.MustTransfer,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 1
    },
    {
        id: "gang-plank-falls",
        name: "Gang Plank Falls",
        park: Park.TyphoonLagoon,
        description: "Take the whole family on this exciting white-water raft adventure! Board a 4-person raft and navigate through 300 feet of rushing rapids, waterfalls, and caves. This attraction offers thrills for the whole family while providing a refreshing escape from the Florida heat.",
        imageUrl: "/images/attractions/gang-plank-falls.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Family, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Family", "Raft Ride"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 3
    },
    {
        id: "keelhaul-falls",
        name: "Keelhaul Falls",
        park: Park.TyphoonLagoon,
        description: "Experience the longest tube slide in the park! This winding, twisting tube slide takes you on a thrilling 400-foot journey down Mount Mayday. Float through dark and light sections while enjoying surprising twists and turns before splashing into the pool below.",
        imageUrl: "/images/attractions/keelhaul-falls.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Family, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Tube Slide", "Longest Slide"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 2
    },
    {
        id: "mayday-falls",
        name: "Mayday Falls",
        park: Park.TyphoonLagoon,
        description: "Navigate this exciting single-tube adventure that winds through caves and past waterfalls on Mount Mayday. This 460-foot-long slide offers a perfect balance of thrills and scenic beauty as you splash through tropical landscapes.",
        imageUrl: "/images/attractions/mayday-falls.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Family, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Tube Slide", "Scenic"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 2
    },
    {
        id: "storm-slides",
        name: "Storm Slides",
        park: Park.TyphoonLagoon,
        description: "Race down these three body slides - Jib Jammer, Stern Burner, and Rudder Buster - that send you speeding through winding tubes and open flumes. Each slide offers a different experience with varying degrees of thrills and excitement.",
        imageUrl: "/images/attractions/storm-slides.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Family, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Body Slide", "Racing"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 1
    },
    {
        id: "ketchakiddee-creek",
        name: "Ketchakiddee Creek",
        park: Park.TyphoonLagoon,
        description: "A tropical playground designed specifically for young children under 48 inches tall. This interactive water play area features mini-slides, fountains, squirting geysers, and a sandy-bottom wading pool. It's a safe and fun environment where little ones can splash and play.",
        imageUrl: "/images/attractions/ketchakiddee-creek.jpg",
        attractionType: [AttractionType.WaterAttraction, AttractionType.KidsArea],
        rideCategory: [RideCategory.Water, RideCategory.Kids, RideCategory.Outdoor],
        heightRequirement: {
            max: 48,
            unit: "in",
            maxHeight: "Under 48 inches"
        },
        tags: ["Under 48\" (122cm)", "Kids Only", "Play Area", "Family"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        }
    },
    {
        id: "bay-slides",
        name: "Bay Slides",
        park: Park.TyphoonLagoon,
        description: "Two beginner-friendly slides perfect for first-time sliders or those looking for a gentler water slide experience. These shorter slides are ideal for building confidence before trying the park's more thrilling attractions.",
        imageUrl: "/images/attractions/bay-slides.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Family, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Beginner Friendly", "Family"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 1
    },
    {
        id: "miss-adventure-falls",
        name: "Miss Adventure Falls",
        park: Park.TyphoonLagoon,
        description: "Join Captain Mary Oceaneer on a treasure-hunting adventure! This family raft ride takes you through the wreckage of her ship, the M.S. Salty IV, as you search for lost treasures scattered by the great storm. Experience waterfalls, geysers, and special effects on this immersive journey.",
        imageUrl: "/images/attractions/miss-adventure-falls.jpg",
        attractionType: [AttractionType.WaterAttraction],
        rideCategory: [RideCategory.Water, RideCategory.Family, RideCategory.Outdoor],
        tags: ["All Ages", "Any Height", "Family", "Themed Experience", "Newest"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Water
        },
        schedule: {
            openingTime: "10:00 AM",
            closingTime: "5:00 PM"
        },
        duration: 4
    }
];

// Helper function to get attractions by area
export function getAttractionsByArea() {
    return {
        mountMayday: typhoonLagoonAttractions.filter(attr =>
            ['humunga-kowabunga', 'gang-plank-falls', 'keelhaul-falls', 'mayday-falls', 'storm-slides'].includes(attr.id)
        ),
        surfPool: typhoonLagoonAttractions.filter(attr =>
            attr.id === 'typhoon-lagoon-surf-pool'
        ),
        hideawayBay: typhoonLagoonAttractions.filter(attr =>
            ['crush-n-gusher', 'bay-slides', 'miss-adventure-falls'].includes(attr.id)
        ),
        kidsArea: typhoonLagoonAttractions.filter(attr =>
            attr.id === 'ketchakiddee-creek'
        ),
        lazyRiver: typhoonLagoonAttractions.filter(attr =>
            attr.id === 'castaway-creek'
        )
    };
}

export default typhoonLagoonAttractions;