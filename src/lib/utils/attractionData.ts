import { Attraction, AttractionType, Park, RideCategory, TransferType, WheelchairAccessibility } from "@/types/attraction";

export const attractions: Attraction[] = [
    {
        id: "advanced-training-lab",
        name: "Advanced Training Lab",
        park: Park.Epcot,
        description: "Step into this interactive play area themed around the concept of space training. Young space cadets can engage in digital games, climb through a play structure, and enjoy futuristic activities that challenge their skills and imagination.",
        imageUrl: "/images/attractions/advanced-training-lab.jpg",
        attractionType: [AttractionType.Interactive],
        rideCategory: [RideCategory.Indoor],
        tags: ["All Ages", "Any Height", "Indoor", "Interactive"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.Full,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.None
        },
        schedule: {
            openingTime: "12:00 PM",
            closingTime: "6:00 PM"
        }
    },
    {
        id: "aerophile-balloon-flight",
        name: "Aerophile – The World Leader in Balloon Flight",
        park: Park.DisneySpringsMall,
        description: "Soar high above Disney Springs in the world's largest tethered helium balloon. This breathtaking aerial adventure takes you up to 400 feet in the air, offering spectacular 360-degree views spanning up to 10 miles on clear days. The giant balloon's basket can accommodate up to 29 passengers plus a pilot for this unforgettable 8-minute flight.",
        imageUrl: "/images/attractions/aerophile-balloon.jpg",
        shortDescription: "The world's largest tethered helium balloon flying above Disney Springs at Walt Disney World Resort",
        attractionType: [AttractionType.Ride, AttractionType.Tour],
        rideCategory: [RideCategory.Slow],
        tags: ["All Ages", "Any Height", "Must Transfer to Wheelchair"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Standard
        },
        schedule: {
            openingTime: "9:30 AM",
            closingTime: "11:30 PM"
        },
        duration: 8
    },
    {
        id: "affection-section",
        name: "Affection Section",
        park: Park.AnimalKingdom,
        description: "Experience hands-on encounters with friendly domestic animals in this delightful petting zoo. Children and adults alike can brush, pet and interact with a variety of docile animals including goats, sheep, and other domesticated creatures. Animal care specialists are available to answer questions and ensure proper animal handling.",
        imageUrl: "/images/attractions/affection-section.jpg",
        shortDescription: "A girl hugs a goat at Affection Section petting zoo",
        attractionType: [AttractionType.AnimalExperience, AttractionType.Interactive],
        tags: ["All Ages", "Any Height", "Interactive", "Must Transfer to Wheelchair"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.TransferRequired,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Standard
        },
        schedule: {
            openingTime: "9:30 AM",
            closingTime: "5:00 PM"
        }
    },
    {
        id: "african-birds",
        name: "African Birds - Disney Animals",
        park: Park.AnimalKingdom,
        description: "Explore the vibrant avian world of Africa through stunning habitats featuring diverse bird species native to the continent. Observe colorful hornbills, majestic storks, and other fascinating birds as they display natural behaviors in meticulously designed environments that replicate their native ecosystems.",
        imageUrl: "/images/attractions/african-birds.jpg",
        shortDescription: "A bird resting near a nest on a tree",
        attractionType: [AttractionType.AnimalExperience, AttractionType.Exhibit],
        tags: ["All Ages", "Animal Encounters", "Any Height", "May Remain in Wheelchair/ECV"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.Full,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: false,
            hasClosedCaptioning: false,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.None
        }
    },
    {
        id: "alien-swirling-saucers",
        name: "Alien Swirling Saucers",
        park: Park.HollywoodStudios,
        description: "Join the famous little green aliens from Disney and Pixar's Toy Story for a spin through space! This family-friendly attraction puts you in toy rocket ships that are pulled around by the aliens in their flying saucers. Whip around in a colorful playset that Andy won at Pizza Planet as the adorable aliens try to escape the clutches of \"The Claw.\"",
        imageUrl: "/images/attractions/alien-swirling-saucers.jpg",
        shortDescription: "A woman and 2 kids stand in front of Alien Swirling Saucers",
        attractionType: [AttractionType.Ride],
        rideCategory: [RideCategory.Spinning],
        heightRequirement: {
            min: 32,
            unit: "in",
            minHeight: "32 inches"
        },
        tags: ["32\" (82cm) or taller", "All Ages", "Must Transfer from Wheelchair/ECV", "Pixar Pals"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.MustTransfer,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: true,
            hasClosedCaptioning: true,
            hasAudioDescription: true,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Standard
        },
        schedule: {
            openingTime: "9:00 AM",
            closingTime: "9:00 PM"
        },
        duration: 2
    },
    {
        id: "buzz-lightyear-space-ranger-spin",
        name: "Buzz Lightyear's Space Ranger Spin",
        park: Park.MagicKingdom,
        description: "Join Space Ranger Buzz Lightyear on an interactive galactic mission to defeat the Evil Emperor Zurg! Board your XP-37 star cruiser and voyage deep into the Gamma Quadrant, where you'll fire your laser cannon at targets to score points and save the universe from Zurg's evil robot army. Your mission: help Buzz stop Zurg from stealing the batteries from toys so he can power a new weapon of destruction.",
        imageUrl: "/images/attractions/buzz-lightyear.jpg",
        attractionType: [AttractionType.Ride, AttractionType.Interactive],
        rideCategory: [RideCategory.Slow, RideCategory.Spinning, RideCategory.Dark, RideCategory.Indoor],
        tags: ["All Ages", "Any Height", "Indoor", "Interactive"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.Full,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: true,
            hasClosedCaptioning: true,
            hasAudioDescription: true,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Standard
        },
        schedule: {
            openingTime: "9:00 AM",
            closingTime: "10:00 PM"
        },
        duration: 4
    },
    {
        id: "flight-of-passage",
        name: "Avatar Flight of Passage",
        park: Park.AnimalKingdom,
        description: "Soar on the back of a mountain banshee during an exhilarating, 3D ride above the moon of Pandora. This breathtaking journey through the vast world of Avatar places you in a merged state with your own avatar, allowing you to experience first-hand the thrill of flying across Pandora's extraordinary landscape. Feel the banshee breathe beneath you as you're dropped into a world of stunning beauty and epic adventure.",
        imageUrl: "/images/attractions/flight-of-passage.jpg",
        shortDescription: "A boy flies through the sky with Na'vi and Mountain Banshees through the skies over Pandora",
        attractionType: [AttractionType.Ride],
        rideCategory: [RideCategory.Thrill, RideCategory.Indoor],
        heightRequirement: {
            min: 44,
            unit: "in",
            minHeight: "44 inches"
        },
        tags: ["44\" (113cm) or taller", "Avatar", "Indoor", "Kids"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.MustTransfer,
            serviceAnimalsAllowed: false,
            hasAssistiveListening: true,
            hasClosedCaptioning: true,
            hasAudioDescription: true,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.Standard
        },
        schedule: {
            openingTime: "8:00 AM",
            closingTime: "7:00 PM"
        },
        duration: 4.5,
        isFastPassAvailable: true
    },
    {
        id: "beauty-and-the-beast-live",
        name: "Beauty and the Beast – Live on Stage",
        park: Park.HollywoodStudios,
        description: "Experience the timeless tale of Beauty and the Beast in this Broadway-quality stage show. With ornate costumes, elaborate sets and memorable songs from the animated classic, this theatrical retelling brings to life the enchanting story of Belle and the Beast. Watch as castle inhabitants Lumiere, Cogsworth, Mrs. Potts and Chip help their master rediscover the meaning of love in this 30-minute spectacular.",
        imageUrl: "/images/attractions/beauty-and-beast-live.jpg",
        shortDescription: "The Beast dances with Belle on stage while Lumiere, Cogsworth, Mrs. Potts and Chip look on in glee",
        attractionType: [AttractionType.Show, AttractionType.Entertainment],
        rideCategory: [RideCategory.Indoor],
        tags: ["All Ages", "Classic Characters", "Disney Princesses"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.Full,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: true,
            hasClosedCaptioning: true,
            hasAudioDescription: false,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.None
        },
        schedule: {
            performanceTimes: ["11:00 AM", "1:00 PM", "2:00 PM", "4:00 PM", "5:00 PM"]
        },
        duration: 30
    },
    {
        id: "navi-river-journey",
        name: "Na'vi River Journey",
        park: Park.AnimalKingdom,
        description: "Embark on a mystical river journey deep into a bioluminescent rainforest in search of the Na'vi Shaman of Songs. Board a reed boat and drift downstream as the full beauty of Pandora reveals itself. Observe exotic glowing plants and amazing creatures on the shores. This gentle, family-friendly boat ride culminates in an encounter with the remarkable Shaman of Songs, who sends positive energy into the forest through her enchanting music.",
        imageUrl: "/images/attractions/navi-river-journey.jpg",
        shortDescription: "Five Guests on a boat traveling through the Navi River Journey attraction",
        attractionType: [AttractionType.Ride],
        rideCategory: [RideCategory.Slow, RideCategory.Dark, RideCategory.Indoor],
        tags: ["All Ages", "Any Height", "Avatar", "Indoor"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.Full,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: false,
            hasClosedCaptioning: true,
            hasAudioDescription: true,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.None
        },
        schedule: {
            openingTime: "8:00 AM",
            closingTime: "7:00 PM"
        },
        duration: 4.5,
        isFastPassAvailable: true
    },
    {
        id: "kilimanjaro-safaris",
        name: "Kilimanjaro Safaris",
        park: Park.AnimalKingdom,
        description: "Explore the Harambe Wildlife Reserve, home to 34 species living in 110 acres of picturesque open plains, shady forest landscapes and rocky wetlands. Your rugged safari vehicle takes you through the lush African savanna where you may spot black rhinos, giraffes, lions, elephants, zebras and more. Each expedition is unique, as the animals are free to roam about the savanna as they would in their natural habitats.",
        imageUrl: "/images/attractions/kilimanjaro-safaris.jpg",
        attractionType: [AttractionType.Ride, AttractionType.AnimalExperience, AttractionType.Tour],
        rideCategory: [RideCategory.Slow, RideCategory.Outdoor],
        tags: ["All Ages", "Animal Encounters", "Any Height", "Classics"],
        accessibilityInfo: {
            wheelchairAccessible: WheelchairAccessibility.Full,
            serviceAnimalsAllowed: true,
            hasAssistiveListening: true,
            hasClosedCaptioning: true,
            hasAudioDescription: true,
            hasReflectiveCaption: false,
            mustTransfer: TransferType.None
        },
        schedule: {
            openingTime: "8:00 AM",
            closingTime: "7:00 PM"
        },
        duration: 18,
        isFastPassAvailable: true
    }
];