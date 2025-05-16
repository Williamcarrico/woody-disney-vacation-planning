import { AnnualEvent, EpcotFestival, HolidayEvent, RunDisneyEvent } from '@/types/events';

export const annualEvents: (AnnualEvent | EpcotFestival | HolidayEvent | RunDisneyEvent)[] = [
    {
        id: 'mickeys-not-so-scary-halloween-party',
        entityType: 'EVENT',
        name: "Mickey's Not-So-Scary Halloween Party",
        shortName: "Not-So-Scary Halloween",
        description: "Mickey's Not-So-Scary Halloween Party is a special ticketed event held on select nights throughout August, September, and October at Magic Kingdom. The party features exclusive Halloween-themed entertainment, including the 'Mickey's Boo-to-You Halloween Parade,' 'Disney's Not-So-Spooky Spectacular' fireworks, and the 'Hocus Pocus Villain Spelltacular' stage show. Guests of all ages can trick-or-treat throughout the park, meet rare Disney characters, and enjoy select attractions with reduced wait times.",
        category: 'HOLIDAY',
        holidayType: 'HALLOWEEN',
        location: 'MAGIC_KINGDOM',
        yearStart: 1995,
        isActive: true,
        currentYearStartDate: '2025-08-15',
        currentYearEndDate: '2025-10-31',
        ticketRequired: true,
        price: 109,
        url: 'https://disneyworld.disney.go.com/events-tours/magic-kingdom/mickeys-not-so-scary-halloween-party/',
        specialEntertainment: [
            "Mickey's Boo-to-You Halloween Parade",
            "Disney's Not-So-Spooky Spectacular",
            "Hocus Pocus Villain Spelltacular",
            "Trick-or-Treating"
        ],
        images: [
            {
                url: '/images/events/mickeys-not-so-scary-halloween-party.jpg',
                alt: "Mickey's Not-So-Scary Halloween Party",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'mickeys-very-merry-christmas-party',
        entityType: 'EVENT',
        name: "Mickey's Very Merry Christmas Party",
        shortName: "Very Merry Christmas",
        description: "Mickey's Very Merry Christmas Party is a special ticketed event held on select nights throughout November and December at Magic Kingdom. The party features exclusive holiday entertainment, including 'Mickey's Once Upon a Christmastime Parade,' 'Minnie's Wonderful Christmastime Fireworks,' and 'A Frozen Holiday Wish' castle lighting ceremony. Guests can enjoy complimentary cookies and hot cocoa, special holiday character meet-and-greets, and experience a magical snowfall on Main Street, U.S.A.",
        category: 'HOLIDAY',
        holidayType: 'CHRISTMAS',
        location: 'MAGIC_KINGDOM',
        yearStart: 1983,
        isActive: true,
        currentYearStartDate: '2025-11-08',
        currentYearEndDate: '2025-12-22',
        ticketRequired: true,
        price: 109,
        url: 'https://disneyworld.disney.go.com/events-tours/magic-kingdom/mickeys-very-merry-christmas-party/',
        specialEntertainment: [
            "Mickey's Once Upon a Christmastime Parade",
            "Minnie's Wonderful Christmastime Fireworks",
            "A Frozen Holiday Wish",
            "Mickey's Most Merriest Celebration"
        ],
        images: [
            {
                url: '/images/events/mickeys-very-merry-christmas-party.jpg',
                alt: "Mickey's Very Merry Christmas Party",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'epcot-food-and-wine-festival',
        entityType: 'EVENT',
        name: "EPCOT International Food & Wine Festival",
        shortName: "Food & Wine Festival",
        description: "The EPCOT International Food & Wine Festival is an annual festival held at EPCOT from late summer through fall. The festival celebrates international cuisine with over 30 global marketplaces offering tapas-sized portions of regional specialties. Visitors can enjoy culinary demonstrations, beverage seminars, and the Eat to the Beat concert series featuring popular artists. The festival also offers special dining packages, tasting events, and a scavenger hunt for families.",
        category: 'FESTIVAL',
        location: 'EPCOT',
        yearStart: 1995,
        isActive: true,
        currentYearStartDate: '2025-08-28',
        currentYearEndDate: '2025-11-22',
        ticketRequired: false,
        url: 'https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-food-and-wine-festival/',
        concertSeries: 'Eat to the Beat Concert Series',
        marketplaces: 35,
        features: [
            "Global Marketplaces",
            "Eat to the Beat Concert Series",
            "Culinary Demonstrations",
            "Beverage Seminars",
            "Remy's Ratatouille Hide & Squeak Scavenger Hunt"
        ],
        images: [
            {
                url: '/images/events/epcot-food-and-wine-festival.jpg',
                alt: "EPCOT International Food & Wine Festival",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'epcot-flower-and-garden-festival',
        entityType: 'EVENT',
        name: "EPCOT International Flower & Garden Festival",
        shortName: "Flower & Garden Festival",
        description: "The EPCOT International Flower & Garden Festival is a spring festival showcasing stunning gardens, topiaries, and outdoor kitchens. The festival features over 100 Disney character topiaries, themed gardens, and educational exhibits about horticulture and sustainable gardening. Visitors can enjoy the Garden Rocks concert series, outdoor kitchens offering seasonal food and beverages, and special guided tours. Family-friendly activities include Spike's Pollen-Nation Exploration scavenger hunt and butterfly garden experiences.",
        category: 'FESTIVAL',
        location: 'EPCOT',
        yearStart: 1994,
        isActive: true,
        currentYearStartDate: '2025-03-05',
        currentYearEndDate: '2025-06-02',
        ticketRequired: false,
        url: 'https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-flower-and-garden-festival/',
        concertSeries: 'Garden Rocks Concert Series',
        marketplaces: 18,
        features: [
            "Disney Character Topiaries",
            "Garden Rocks Concert Series",
            "Outdoor Kitchens",
            "Garden Tours",
            "Spike's Pollen-Nation Exploration"
        ],
        images: [
            {
                url: '/images/events/epcot-flower-and-garden-festival.jpg',
                alt: "EPCOT International Flower & Garden Festival",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'epcot-festival-of-the-arts',
        entityType: 'EVENT',
        name: "EPCOT International Festival of the Arts",
        shortName: "Festival of the Arts",
        description: "The EPCOT International Festival of the Arts celebrates the visual, culinary, and performing arts. This winter festival features art exhibitions, interactive activities, food studios offering artistic culinary creations, and the Disney on Broadway Concert Series. Visitors can watch artists in action, participate in hands-on workshops, experience unique photo opportunities, and purchase limited-edition artwork. The festival combines Disney's creative excellence with global artistic traditions for a culturally rich experience.",
        category: 'FESTIVAL',
        location: 'EPCOT',
        yearStart: 2018,
        isActive: true,
        currentYearStartDate: '2025-01-17',
        currentYearEndDate: '2025-02-24',
        ticketRequired: false,
        url: 'https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-festival-of-the-arts/',
        concertSeries: 'Disney on Broadway Concert Series',
        marketplaces: 15,
        features: [
            "Visual Arts Exhibits",
            "Disney on Broadway Concert Series",
            "Food Studios",
            "Artist Demonstrations",
            "Artful Photo Opportunities"
        ],
        images: [
            {
                url: '/images/events/epcot-festival-of-the-arts.jpg',
                alt: "EPCOT International Festival of the Arts",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'epcot-festival-of-the-holidays',
        entityType: 'EVENT',
        name: "EPCOT International Festival of the Holidays",
        shortName: "Festival of the Holidays",
        description: "The EPCOT International Festival of the Holidays celebrates seasonal traditions from around the world. The festival features Holiday Kitchens offering seasonal cuisine, storytellers sharing holiday traditions from their countries, and the Candlelight Processional - a retelling of the Christmas story with a celebrity narrator, choir, and orchestra. Visitors can enjoy festive decorations, special holiday entertainment, and seasonal merchandise in a celebration that represents diverse cultural holiday traditions.",
        category: 'FESTIVAL',
        location: 'EPCOT',
        yearStart: 1996,
        isActive: true,
        currentYearStartDate: '2025-11-28',
        currentYearEndDate: '2025-12-30',
        ticketRequired: false,
        url: 'https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-festival-of-the-holidays/',
        features: [
            "Holiday Kitchens",
            "Candlelight Processional",
            "Holiday Storytellers",
            "JOYFUL! A Celebration of the Season",
            "Holiday Cookie Stroll"
        ],
        images: [
            {
                url: '/images/events/epcot-festival-of-the-holidays.jpg',
                alt: "EPCOT International Festival of the Holidays",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'candlelight-processional',
        entityType: 'EVENT',
        name: "Candlelight Processional",
        description: "The Candlelight Processional is a beloved holiday tradition at EPCOT, featuring a retelling of the Christmas story by a celebrity narrator, accompanied by a 50-piece orchestra and mass choir. Performances take place three times nightly at the America Gardens Theatre during the EPCOT International Festival of the Holidays. The event combines powerful music with inspirational narration for a moving holiday experience. Special dining packages are available that include guaranteed seating for the popular show.",
        category: 'HOLIDAY',
        holidayType: 'CHRISTMAS',
        location: 'EPCOT',
        yearStart: 1971,
        isActive: true,
        currentYearStartDate: '2025-11-28',
        currentYearEndDate: '2025-12-30',
        ticketRequired: false,
        url: 'https://disneyworld.disney.go.com/entertainment/epcot/candlelight-processional/',
        specialEntertainment: [
            "Celebrity Narrators",
            "50-Piece Orchestra",
            "Mass Choir Performance"
        ],
        images: [
            {
                url: '/images/events/candlelight-processional.jpg',
                alt: "Candlelight Processional at EPCOT",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'rundisney-marathon-weekend',
        entityType: 'EVENT',
        name: "runDisney Walt Disney World Marathon Weekend",
        shortName: "Marathon Weekend",
        description: "The runDisney Walt Disney World Marathon Weekend is the flagship running event at Walt Disney World Resort, held each January. The weekend features multiple race distances including a 5K, 10K, half marathon, and full marathon, as well as challenges for participants who complete multiple races. Runners experience the magic of running through Disney theme parks, encountering Disney characters along the routes, and earning unique Disney-themed medals. The event includes a Health & Fitness Expo featuring the latest in running technology and merchandise.",
        category: 'MARATHON',
        location: 'MULTIPLE',
        yearStart: 1994,
        isActive: true,
        currentYearStartDate: '2025-01-08',
        currentYearEndDate: '2025-01-12',
        ticketRequired: true,
        price: 125,
        url: 'https://www.rundisney.com/events/disneyworld/disneyworld-marathon-weekend/',
        raceTypes: ["5K", "10K", "Half Marathon", "Marathon", "Dopey Challenge", "Goofy's Race and a Half Challenge"],
        coursePath: ["Magic Kingdom", "EPCOT", "Disney's Hollywood Studios", "Disney's Animal Kingdom", "ESPN Wide World of Sports"],
        registrationDate: '2024-04-16',
        images: [
            {
                url: '/images/events/rundisney-marathon-weekend.jpg',
                alt: "runDisney Walt Disney World Marathon Weekend",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'h2o-glow-nights',
        entityType: 'EVENT',
        name: "H2O Glow Nights",
        description: "H2O Glow Nights is a special after-hours event at Disney's Typhoon Lagoon Water Park held on select summer nights. This evening event features a vibrant beach party atmosphere with glowing decorations, special lighting effects, and DJ entertainment. Guests can enjoy the water park's attractions with reduced wait times, dance parties, exclusive food and beverage offerings, and character meet and greets. The event offers a unique nighttime water park experience with a limited number of tickets sold to ensure shorter lines.",
        category: 'AFTER_HOURS',
        location: 'TYPHOON_LAGOON',
        yearStart: 2018,
        isActive: true,
        currentYearStartDate: '2025-05-23',
        currentYearEndDate: '2025-09-13',
        ticketRequired: true,
        price: 65,
        url: 'https://disneyworld.disney.go.com/events-tours/typhoon-lagoon/disney-h2o-glow-nights/',
        images: [
            {
                url: '/images/events/h2o-glow-nights.jpg',
                alt: "H2O Glow Nights at Disney's Typhoon Lagoon",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'disney-after-hours',
        entityType: 'EVENT',
        name: "Disney After Hours",
        description: "Disney After Hours events offer exclusive nighttime access to select Walt Disney World theme parks with dramatically reduced crowds. These special ticketed events allow guests to experience popular attractions with minimal wait times, meet favorite Disney characters, and enjoy complimentary select snacks and beverages. The events typically run for three hours after regular park closing, though guests can enter the park earlier. Disney After Hours is available on select nights at Magic Kingdom, Disney's Hollywood Studios, and Disney's Animal Kingdom.",
        category: 'AFTER_HOURS',
        location: 'MULTIPLE',
        yearStart: 2016,
        isActive: true,
        currentYearStartDate: '2025-01-08',
        currentYearEndDate: '2025-09-08',
        ticketRequired: true,
        price: 129,
        url: 'https://disneyworld.disney.go.com/events-tours/magic-kingdom/disney-after-hours/',
        images: [
            {
                url: '/images/events/disney-after-hours.jpg',
                alt: "Disney After Hours",
                width: 1200,
                height: 800
            }
        ]
    },
    {
        id: 'disney-parks-christmas-day-parade',
        entityType: 'EVENT',
        name: "Disney Parks Christmas Day Parade",
        description: "The Disney Parks Christmas Day Parade is an annual television special that showcases holiday celebrations at Disney parks. The program features parade footage, celebrity performances, and Disney character appearances filmed at Walt Disney World and Disneyland Resort. The broadcast includes behind-the-scenes looks at holiday decorations, festive entertainment, and seasonal traditions at the Disney parks. While recording happens weeks before Christmas, the special airs on ABC on Christmas Day, bringing Disney magic to viewers nationwide.",
        category: 'SPECIAL',
        location: 'MULTIPLE',
        yearStart: 1983,
        isActive: true,
        currentYearStartDate: '2025-12-25',
        currentYearEndDate: '2025-12-25',
        ticketRequired: false,
        url: 'https://disneyparks.disney.go.com/',
        images: [
            {
                url: '/images/events/disney-parks-christmas-day-parade.jpg',
                alt: "Disney Parks Christmas Day Parade",
                width: 1200,
                height: 800
            }
        ]
    }
];

// Helper functions to filter events by type
export function getHolidayEvents(): HolidayEvent[] {
    return annualEvents.filter(event => event.category === 'HOLIDAY') as HolidayEvent[];
}

export function getEpcotFestivals(): EpcotFestival[] {
    return annualEvents.filter(event => event.category === 'FESTIVAL' && event.location === 'EPCOT') as EpcotFestival[];
}

export function getRunDisneyEvents(): RunDisneyEvent[] {
    return annualEvents.filter(event => event.category === 'MARATHON') as RunDisneyEvent[];
}

export function getAfterHoursEvents(): AnnualEvent[] {
    return annualEvents.filter(event => event.category === 'AFTER_HOURS');
}

export function getCurrentEvents(): AnnualEvent[] {
    const now = new Date();
    return annualEvents.filter(event => {
        if (!event.currentYearStartDate || !event.currentYearEndDate) return false;

        const startDate = new Date(event.currentYearStartDate);
        const endDate = new Date(event.currentYearEndDate);

        return startDate <= now && now <= endDate;
    });
}

export function getUpcomingEvents(limit: number = 3): AnnualEvent[] {
    const now = new Date();
    return annualEvents
        .filter(event => {
            if (!event.currentYearStartDate) return false;
            const startDate = new Date(event.currentYearStartDate);
            return startDate > now;
        })
        .sort((a, b) => {
            const aDate = new Date(a.currentYearStartDate!);
            const bDate = new Date(b.currentYearStartDate!);
            return aDate.getTime() - bDate.getTime();
        })
        .slice(0, limit);
}