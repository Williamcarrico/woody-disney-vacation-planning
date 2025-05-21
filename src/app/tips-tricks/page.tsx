'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Search, Calendar, Utensils, Smartphone, Sparkles, Backpack, Sun, Moon,
    Clock, ChevronRight, MapPin, DollarSign, Award, Heart, Share2, Info
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Define categories and their icons
const categories = [
    { id: 'planning', name: 'Planning', icon: <Calendar size={24} /> },
    { id: 'dining', name: 'Dining', icon: <Utensils size={24} /> },
    { id: 'tech', name: 'Tech', icon: <Smartphone size={24} /> },
    { id: 'hidden', name: 'Hidden Gems', icon: <Sparkles size={24} /> },
    { id: 'kids', name: 'Kids', icon: <Sun size={24} /> },
    { id: 'packing', name: 'Packing', icon: <Backpack size={24} /> },
    { id: 'budget', name: 'Money Saving', icon: <DollarSign size={24} /> },
    { id: 'adult', name: 'Adult Fun', icon: <Moon size={24} /> },
    { id: 'seasonal', name: 'Seasonal', icon: <Clock size={24} /> },
    { id: 'transportation', name: 'Transportation', icon: <MapPin size={24} /> },
];

// Park names for easy reference
const parks = {
    MK: "Magic Kingdom",
    EP: "EPCOT",
    HS: "Hollywood Studios",
    AK: "Animal Kingdom",
    DS: "Disney Springs"
};

// Define tips data structure with enhanced content
const tipsData = {
    planning: [
        {
            title: 'Rope drop strategy',
            description: `Arrive at the park 45-60 minutes before opening for "rope drop." This strategy has helped families experience popular attractions with minimal wait times. Focus on high-demand attractions first like Seven Dwarfs Mine Train at Magic Kingdom or Rise of the Resistance at Hollywood Studios.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['time-saving', 'family-friendly']
        },
        {
            title: 'Strategic ride timing',
            description: `Visit popular attractions during parades, fireworks, or major shows when most guests are watching the entertainment. You can often experience Space Mountain, Expedition Everest, or other E-ticket attractions with significantly reduced wait times during these windows.`,
            difficulty: 'intermediate',
            parks: ['MK', 'AK', 'HS'],
            tags: ['time-saving', 'strategy']
        },
        {
            title: 'Single Rider benefits',
            description: `Use Single Rider Lines when available at Test Track, Expedition Everest, Millennium Falcon: Smugglers Run, and Rock 'n' Roller Coaster. You won't sit with your group, but you'll often cut your wait time by 50-75%. Perfect for thrill-seeking families with older children.`,
            difficulty: 'beginner',
            parks: ['EP', 'HS', 'AK'],
            tags: ['time-saving', 'thrill-rides']
        },
        {
            title: 'Early Theme Park Entry',
            description: `Take advantage of Early Theme Park Entry if staying at any Disney Resort hotel. These extra 30 minutes before official opening can make a huge difference! Resort guests can enter any park 30 minutes early every day. Head directly to the most popular attractions like Frozen Ever After or Flight of Passage.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['resort-perk', 'time-saving']
        },
        {
            title: 'Extended Evening Hours',
            description: `Use Extended Evening Hours if staying at a Disney Deluxe Resort or Deluxe Villa Resort. The parks are magical with smaller crowds at night, and you'll get exclusive access to most attractions for up to two hours after regular closing. Check the schedule as these typically rotate between Magic Kingdom and EPCOT on select evenings.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP'],
            tags: ['deluxe-resort-perk', 'night-time']
        },
        {
            title: 'Genie+ and Lightning Lane strategy',
            description: `For Genie+ (paid skip-the-line service), make your first selection at 7AM for the most popular attractions like Slinky Dog Dash at Hollywood Studios or Jungle Cruise at Magic Kingdom. Then continuously make new selections throughout the day as soon as you're eligible. For individual Lightning Lane purchases, prioritize Star Wars: Rise of the Resistance or Seven Dwarfs Mine Train.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['paid-service', 'time-saving']
        },
        {
            title: 'Magic Kingdom path optimization',
            description: `Start in Adventureland and work clockwise around Magic Kingdom for the most efficient route. This "left path" strategy works because most guests naturally go right toward Tomorrowland. Hit Jungle Cruise and Pirates of the Caribbean early, then progress through Frontierland, Liberty Square, Fantasyland, and finish in Tomorrowland.`,
            difficulty: 'beginner',
            parks: ['MK'],
            tags: ['strategy', 'route-planning']
        },
        {
            title: 'Child safety measures',
            description: `Use temporary tattoos like SafetyTat with your phone number on your children. Take a photo of your kids each morning in their outfits so you have an accurate description of what they're wearing. Teach children to find Cast Members with name badges if separated, and establish a meeting point in each park.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['family', 'safety']
        },
        {
            title: 'Animal Kingdom morning strategy',
            description: `Visit Animal Kingdom's animal attractions early in the morning when animals are most active. Kilimanjaro Safaris offers the best wildlife viewing before 10AM or late afternoon when temperatures are cooler. If visiting Pandora – World of Avatar, rope drop Avatar Flight of Passage or reserve it with Individual Lightning Lane.`,
            difficulty: 'beginner',
            parks: ['AK'],
            tags: ['animals', 'morning']
        },
        {
            title: 'Use Rider Switch service',
            description: `Disney's Rider Switch service allows adults to take turns riding attractions with height requirements while the other waits with non-riding children. The waiting adult can then ride without standing in the regular line again. This works seamlessly with Lightning Lane too – the returning rider(s) use the Lightning Lane entrance.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['family', 'time-saving']
        },
        {
            title: 'Park closing advantage',
            description: `Join a ride queue just before official park closing time – you'll still get to experience the attraction even after hours. This is a great strategy for Seven Dwarfs Mine Train, Frozen Ever After, or Slinky Dog Dash. As long as you're in line before the park closes, you'll be allowed to ride.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['night-time', 'time-saving']
        },
        {
            title: 'Pre-book advance dining reservations',
            description: `Make dining reservations 60 days before your trip for popular restaurants like Cinderella's Royal Table, Be Our Guest, Space 220, and 'Ohana. Set a reminder to book at exactly 6:00AM Eastern Time when the booking window opens. For hard-to-get reservations, try booking for later in your trip when fewer people are competing for the same slots.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK', 'DS'],
            tags: ['dining', 'planning']
        },
        {
            title: 'Find lesser-known entrances',
            description: `Try Animal Kingdom's lesser-known entrance through the Rainforest Cafe gift shop or EPCOT's International Gateway entrance (accessible from the Boardwalk, Yacht & Beach Club resorts) for potentially shorter lines during peak entry times. The Transportation and Ticket Center also often has shorter security lines than the Magic Kingdom main entrance.`,
            difficulty: 'advanced',
            parks: ['MK', 'EP', 'AK'],
            tags: ['insider-tip', 'time-saving']
        },
        {
            title: 'Animation experience at AK',
            description: `Visit the Animation Experience at Conservation Station in Animal Kingdom (accessible via the Wildlife Express Train to Rafiki's Planet Watch). Learn to draw Disney characters in a fun, air-conditioned environment. Check the My Disney Experience app for show times, and arrive 15-20 minutes early to secure a spot.`,
            difficulty: 'beginner',
            parks: ['AK'],
            tags: ['art', 'educational', 'indoor']
        },
        {
            title: 'Monorail resort loop hack',
            description: `When leaving Magic Kingdom during peak times, opt for the Resort Monorail instead of the Express Monorail to the Transportation and Ticket Center. It makes additional stops but often has much shorter lines. You can also walk to the Contemporary Resort in about 10 minutes and catch the Resort Monorail there, bypassing Main Street crowds completely.`,
            difficulty: 'intermediate',
            parks: ['MK'],
            tags: ['transportation', 'time-saving']
        },
        {
            title: 'Main Street shops exit strategy',
            description: `Exit Magic Kingdom through the interconnected Main Street shops after fireworks instead of using the main central pathway. These connected stores provide a less congested route out of the park when it's most crowded. The shops stay open until all guests have exited, even after official park closing.`,
            difficulty: 'beginner',
            parks: ['MK'],
            tags: ['crowd-avoidance', 'night-time']
        },
        {
            title: 'EPCOT touring approach',
            description: `Visit EPCOT's World Showcase right at 11AM when it opens rather than starting in Future World. Most guests begin in Future World, making morning the most crowded time there. Instead, enjoy the relatively empty World Showcase pavilions in the late morning, then hit Future World attractions after 2PM when crowds have dispersed.`,
            difficulty: 'intermediate',
            parks: ['EP'],
            tags: ['strategy', 'crowd-avoidance']
        },
        {
            title: 'Virtual Queue preparation',
            description: `For attractions using virtual queues like Guardians of the Galaxy: Cosmic Rewind, have everyone in your party logged into separate My Disney Experience accounts on different devices at the same time for better chances. Join exactly at 7:00AM (from anywhere) or 1:00PM (while in the park) when new virtual queue slots are released.`,
            difficulty: 'intermediate',
            parks: ['EP', 'HS'],
            tags: ['tech', 'strategy']
        },
        {
            title: '120-day planning timeline',
            description: `Start your Disney planning approximately 120 days before your trip. Book your park reservations immediately after purchasing tickets, research which Genie+ and Individual Lightning Lane attractions are priorities for your group, and prepare your dining reservation strategy for the 60-day booking window.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['planning', 'organization']
        },
        {
            title: 'Rainy day preparation',
            description: `Have a rainy day plan ready with indoor attractions and shows. The best indoor experiences include Mickey's PhilharMagic, Carousel of Progress, It's a Small World (Magic Kingdom), Soarin', The American Adventure (EPCOT), Toy Story Mania, Star Tours, Millennium Falcon: Smugglers Run (Hollywood Studios), and Festival of the Lion King (Animal Kingdom).`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['weather', 'indoor']
        }
    ],
    dining: [
        {
            title: 'Mobile ordering strategy',
            description: `Use mobile ordering through the My Disney Experience app to save significant time at quick-service restaurants. Place your order early (1-2 hours before you plan to eat) during peak meal times, then hit "I'm here, prepare my order" when you're about 10 minutes away. Popular spots like Satu'li Canteen in Animal Kingdom and Woody's Lunch Box in Hollywood Studios often have limited pickup windows that fill quickly.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['time-saving', 'tech']
        },
        {
            title: 'Character dining efficiency',
            description: `Book Disney character dining for efficient character meet-and-greets combined with a meal. Top choices include Topolino's Terrace at Riviera Resort for Mickey and friends in artistic outfits, Garden Grill at EPCOT for Mickey in farmer attire, and Story Book Dining at Artist Point for a unique Snow White experience. Book these 60 days in advance as they fill quickly.`,
            difficulty: 'beginner',
            parks: ['EP', 'AK', 'MK'],
            tags: ['characters', 'family']
        },
        {
            title: 'Lunch vs. dinner reservations',
            description: `Make lunch reservations for popular table-service restaurants to avoid dinner crowds and often enjoy lower prices. Signature restaurants like Le Cellier in EPCOT, Sci-Fi Dine-In Theater at Hollywood Studios, and Sanaa at Animal Kingdom Lodge typically have greater availability and sometimes reduced pricing for lunch compared to dinner services.`,
            difficulty: 'beginner',
            parks: ['EP', 'HS', 'AK'],
            tags: ['money-saving', 'strategy']
        },
        {
            title: 'World Showcase culinary exploration',
            description: `Explore EPCOT's World Showcase for unique international dining and snack experiences beyond typical theme park fare. Standouts include School Bread in Norway, Ratatouille in France, Sushi in Japan, and authentic Neapolitan pizza in Italy. During festivals, prioritize the food booths for exclusive seasonal offerings and small plates perfect for sampling multiple cuisines.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['international', 'unique']
        },
        {
            title: 'Resort dining advantages',
            description: `Don't overlook Disney resort restaurants, which often provide superior dining experiences with easier reservations. Standouts include Sanaa at Animal Kingdom Lodge (window tables offer savanna views), Steakhouse 71 at Contemporary Resort, and Sebastian's Bistro at Caribbean Beach Resort. These locations are accessible via Disney transportation and provide a welcome break from park dining.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['upscale', 'crowd-avoidance']
        },
        {
            title: 'Club Cool soda sampling',
            description: `Sample free sodas from around the world at Club Cool in EPCOT's World Celebration area. Try unique flavors like Beverly from Italy (famously bitter), Smart Watermelon from China, and Country Club from Peru. It's a fun, refreshing, and free activity, especially during hot afternoons. This experience was updated and expanded during EPCOT's recent transformation.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['free', 'unique']
        },
        {
            title: 'Landry\'s Select Club benefits',
            description: `Join the Landry's Select Club if dining at Rainforest Cafe, T-Rex Cafe, or Yak and Yeti. The $25 one-time fee gets you priority seating (especially valuable during peak times), $25 welcome reward, birthday rewards, and points toward future meals. This can be particularly valuable if you can't secure advance dining reservations at these popular restaurants.`,
            difficulty: 'beginner',
            parks: ['AK', 'DS'],
            tags: ['membership', 'time-saving']
        },
        {
            title: 'Advance dining reservation backup plan',
            description: `If you can't secure desired dining reservations, use MouseDining.com or TouringPlans.com reservation finder services for alerts when openings occur. Many reservations become available 24-48 hours before the date due to cancellations. Check regularly the day before, especially in the evening, as guests finalize plans and cancel unwanted reservations to avoid the $10 per person no-show fee.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['planning', 'tech']
        },
        {
            title: 'Dole Whip locations',
            description: `The iconic Dole Whip treat is available beyond Magic Kingdom's Aloha Isle. Find it at EPCOT's Refreshment Port, Animal Kingdom's Tamu Tamu Refreshments, and Marketplace Snacks at Disney Springs, often with shorter lines. Special flavors and alcoholic versions are available at various locations - try the rum-spiked version at Pineapple Lanai at the Polynesian Resort.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'AK', 'DS'],
            tags: ['snacks', 'iconic']
        },
        {
            title: 'Dining plan value maximization',
            description: `If using the Disney Dining Plan, maximize value by selecting the most expensive menu items, as the plan covers any standard entree. Character meals and signature dining experiences offer the best value. At quick service locations, meal combos with dessert and beverage included represent better value than ordering items separately.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['money-saving', 'strategy']
        },
        {
            title: 'Table service lunch hack',
            description: `Book late lunch reservations (1:30-3:00 PM) at table service restaurants to enjoy a relaxed meal during the hottest part of the day. Restaurants are typically less crowded between traditional lunch and dinner times, service is often more attentive, and you'll appreciate the air conditioning break. This strategy works particularly well at Brown Derby in Hollywood Studios and Skipper Canteen in Magic Kingdom.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['strategy', 'time-saving']
        },
        {
            title: 'Bring water and snacks',
            description: `Disney allows guests to bring their own water bottles and snacks into the parks, which can save a family of four over $50 daily. Pack protein-rich snacks to maintain energy, collapsible water bottles to save space, and refill at water fountains or ask for free ice water at any quick-service location. Consider freezing water bottles overnight so they stay cold throughout the morning.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['money-saving', 'preparation']
        }
    ],
    tech: [
        {
            title: 'Power bank essentials',
            description: `Bring a high-capacity portable phone charger (at least 10,000mAh) for all-day app usage, photos, and videos. Your phone battery will drain quickly using the My Disney Experience app, mobile ordering, checking wait times, and taking photos. Consider bringing multiple chargers for family trips or a battery case for your phone for continuous charging.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['preparation', 'essential']
        },
        {
            title: 'MagicBand+ features',
            description: `Use MagicBand+ not only for park entry and Lightning Lane access but also for interactive experiences throughout the parks. It lights up and vibrates during nighttime spectaculars, interacts with golden statues for the 50th Anniversary celebration, and enables the Bounty Hunter game in Galaxy's Edge. Charge it nightly as the interactive features consume battery quickly.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['interactive', 'convenience']
        },
        {
            title: 'Wi-Fi connection tips',
            description: `Connect to Disney's free Wi-Fi throughout the parks, but know where signals are strongest. Wi-Fi can be spotty in queue lines and certain attraction areas. For the most reliable connections, find spots near restaurants, gift shops, and central hub areas. Consider downloading the My Disney Experience app and park maps before your trip as backup.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['free', 'connectivity']
        },
        {
            title: 'My Disney Experience planning',
            description: `Use the My Disney Experience app's "My Day" tab for personalized itinerary suggestions based on your interests and current wait times. The new AI-powered Disney Genie service within the app can adapt your plan throughout the day as conditions change, suggesting when to visit attractions based on projected wait times and your preferences.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['planning', 'personalization']
        },
        {
            title: 'Play Disney Parks app entertainment',
            description: `Download the Play Disney Parks app for interactive queue experiences, park-wide achievements, and exclusive games. It offers trivia challenges while waiting in line for Peter Pan's Flight, interactive missions in Galaxy's Edge, and a digital scavenger hunt throughout Animal Kingdom. This app is separate from My Disney Experience and designed specifically for entertainment.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['entertainment', 'queues']
        },
        {
            title: 'Disney PhotoPass strategy',
            description: `Maximize Disney PhotoPass by asking photographers for special "Magic Shots" where Disney characters and effects are digitally added to your photos. The service is included with some annual passes or can be purchased as Memory Maker for your trip. For best value, purchase Memory Maker in advance (at least 3 days before your trip) for the discounted price.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['photos', 'memories']
        },
        {
            title: 'Offline map functionality',
            description: `Download the My Disney Experience app maps for offline use before your trip. While in your hotel with good WiFi, open each park map in the app and let it fully load. This allows basic map functionality even if you experience connectivity issues in the parks. Consider also taking screenshots of your daily plans, reservations, and Lightning Lane return times as backup.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['preparation', 'offline']
        },
        {
            title: 'Virtual queue setup',
            description: `For attractions using virtual queues, set your phone's time to automatically update to ensure you're synchronized with Disney's servers. Have the My Disney Experience app open and on the virtual queue page at least 5 minutes before the distribution time (typically 7AM and 1PM). Repeatedly pull down to refresh starting about 10 seconds before the hour and join immediately when the button activates.`,
            difficulty: 'intermediate',
            parks: ['EP', 'HS'],
            tags: ['strategy', 'preparation']
        },
        {
            title: 'Mobile checkout in stores',
            description: `Use the mobile checkout feature in the My Disney Experience app at select merchandise locations throughout the parks. This lets you scan items yourself and pay through the app, bypassing register lines completely. Look for the "Shop in Store" feature within the app and the mobile checkout signs in participating stores, especially useful during busy times and holiday seasons.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK', 'DS'],
            tags: ['shopping', 'time-saving']
        }
    ],
    hidden: [
        {
            title: 'PeopleMover relaxation',
            description: `Ride the Tomorrowland Transit Authority PeopleMover for a relaxing 10-minute break with minimal wait times. This elevated tram provides a peaceful journey through Tomorrowland with unique views inside Space Mountain, TRON Lightcycle Run, and Buzz Lightyear's Space Ranger Spin. It's rarely crowded, continuously loading, and offers a breezy respite from the Florida heat.`,
            difficulty: 'beginner',
            parks: ['MK'],
            tags: ['relaxation', 'no-wait']
        },
        {
            title: 'Electrical Water Pageant viewing',
            description: `Watch the Electrical Water Pageant from the beaches of Disney's Polynesian Resort, Grand Floridian Resort, or Contemporary Resort. This charming, often overlooked nighttime show features illuminated sea creatures and patriotic displays floating across Seven Seas Lagoon. The 15-minute show runs nightly (weather permitting) between 9-10:30PM, with different viewing times at each resort.`,
            difficulty: 'intermediate',
            parks: [],
            tags: ['nighttime', 'free']
        },
        {
            title: 'Animal Kingdom trails',
            description: `Explore Animal Kingdom's walking trails for up-close animal encounters with much smaller crowds. The Gorilla Falls Exploration Trail (Africa) and Maharajah Jungle Trek (Asia) feature incredible wildlife viewing opportunities including gorillas, tigers, and exotic birds in naturalistic habitats. Visit during early morning or late afternoon when animals are most active and trails are less crowded.`,
            difficulty: 'beginner',
            parks: ['AK'],
            tags: ['animals', 'peaceful']
        },
        {
            title: 'Animation Academy',
            description: `Check out free drawing classes at the Animation Experience at Conservation Station in Animal Kingdom's Rafiki's Planet Watch (accessible via the Wildlife Express Train). Professional Disney artists teach you to draw popular Disney characters step-by-step in 25-minute sessions. Each session features a different character, and you get to keep your artwork as a unique, free souvenir.`,
            difficulty: 'beginner',
            parks: ['AK'],
            tags: ['art', 'free']
        },
        {
            title: 'Behind-the-scenes tours',
            description: `Take the Keys to the Kingdom tour for a behind-the-scenes look at Magic Kingdom, including a visit to the underground "utilidor" tunnel system. Other exceptional tours include Wild Africa Trek (Animal Kingdom), Behind the Seeds (EPCOT), and Star Wars: Galactic Starcruiser experience. These premium experiences require separate reservations and fees but provide exclusive access and insights.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'AK'],
            tags: ['educational', 'exclusive']
        },
        {
            title: 'Disney Springs exploration',
            description: `Visit Disney Springs (formerly Downtown Disney) for premium shopping, dining, and entertainment without a park ticket. Highlights include the massive World of Disney store, The BOATHOUSE restaurant with amphicar tours, Gideon's Bakehouse for legendary cookies, and free live entertainment at the Marketplace Stage. The area is especially beautiful in the evening with its waterfront ambiance and lighting.`,
            difficulty: 'beginner',
            parks: ['DS'],
            tags: ['shopping', 'dining']
        },
        {
            title: 'Resort hopping adventures',
            description: `Explore Disney's themed resorts even if you're not staying there. Visit Animal Kingdom Lodge to see African wildlife from the viewing areas, enjoy the South Pacific atmosphere at the Polynesian Village Resort, or admire the incredible gingerbread displays at Grand Floridian during the holiday season. Resort hopping is free and provides a nice break from park crowds.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['free', 'exploration']
        },
        {
            title: 'Epcot\'s garden spaces',
            description: `Discover the peaceful garden spaces throughout EPCOT, particularly in the United Kingdom (butterfly garden), Japan (zen garden), and Morocco pavilions. These serene areas offer remarkable detail, beautiful landscaping, and are rarely crowded. The Land pavilion's Behind the Seeds tour also provides a fascinating look at EPCOT's innovative agricultural techniques.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['relaxation', 'garden']
        },
        {
            title: 'Walt Disney Presents attraction',
            description: `Visit Walt Disney Presents at Hollywood Studios for an intimate museum-like experience showcasing Disney history, including original concept art, models, and personal items from Walt Disney. This walk-through attraction features a detailed timeline of Disney achievements, a theater showing a film about Walt's life, and sometimes hosts character meet-and-greets with minimal waits.`,
            difficulty: 'beginner',
            parks: ['HS'],
            tags: ['history', 'air-conditioned']
        },
        {
            title: 'Tom Sawyer Island exploration',
            description: `Explore Tom Sawyer Island at Magic Kingdom, accessible only by raft across the Rivers of America. This often-overlooked attraction offers caves, trails, and interactive elements for kids to explore, along with rocking chairs for adults to relax in shaded areas. It's a perfect midday retreat from crowds and provides a unique perspective of the park from across the water.`,
            difficulty: 'beginner',
            parks: ['MK'],
            tags: ['exploration', 'kids']
        },
        {
            title: 'Wilderness Lodge nature trail',
            description: `Walk the hidden nature trail between Disney's Wilderness Lodge and Fort Wilderness Campground. This peaceful 2.5-mile round trip path winds through pine forests along the shore of Bay Lake, offering a surprising wilderness experience within Disney property. Look for wildlife like deer and armadillos, especially in early morning or evening hours.`,
            difficulty: 'intermediate',
            parks: [],
            tags: ['nature', 'exercise']
        },
        {
            title: 'International Cast Member conversations',
            description: `Take time to chat with international Cast Members in EPCOT's World Showcase pavilions. Most are participants in cultural exchange programs from their home countries and are eager to share authentic insights about their culture, language, and customs. They can recommend lesser-known details within their pavilion and often have fascinating perspectives on American culture as well.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['cultural', 'educational']
        }
    ],
    kids: [
        {
            title: 'Character autograph strategy',
            description: `Bring an autograph book for character signatures and interaction opportunities. For easier handling by characters with large costume hands, use a large pen or marker and a book with spiral binding that lays flat. Consider creative alternatives like having characters sign a photo mat, pillowcase, or Disney hat for a more unique keepsake.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['characters', 'memories']
        },
        {
            title: 'Queue entertainment preparation',
            description: `Pack a small bag of queue entertainment items for children: small bubbles, finger puppets, I-spy games, or downloadable apps and videos (with headphones). These compact diversions can transform potentially challenging wait times into more enjoyable experiences. For younger children, bring a new small toy they haven't seen before to create excitement during longer waits.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['queues', 'preparation']
        },
        {
            title: 'Character costume benefits',
            description: `Dress children in character costumes or Disney-themed clothing for enhanced interactions with characters and Cast Members. Princess dresses, Star Wars robes, or superhero outfits often elicit special attention throughout the parks. For comfort in Florida heat, consider lightweight costume options, character-inspired everyday clothing, or Disney bounding outfits instead of full costumes.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['characters', 'interaction']
        },
        {
            title: 'Baby Care Centers',
            description: `Utilize the Baby Care Centers available in all four parks for quiet, comfortable spaces to care for infants and toddlers. These air-conditioned facilities offer private nursing rooms, changing tables, high chairs, microwaves, and a small shop selling baby essentials. Locations: near First Aid on Main Street (Magic Kingdom), near Norway (EPCOT), near the entrance (Hollywood Studios), and Gorilla Falls trail (Animal Kingdom).`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['infants', 'comfort']
        },
        {
            title: 'Midday break strategy',
            description: `Plan for midday breaks at your hotel, especially with children under 10. Leave the parks around 1-2PM when crowds and temperatures peak, then return refreshed for evening hours. If staying off-site, find quiet, air-conditioned spots like Hall of Presidents (Magic Kingdom), American Adventure (EPCOT), Walt Disney Presents (Hollywood Studios), or Conservation Station (Animal Kingdom).`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['rest', 'planning']
        },
        {
            title: 'Extra clothing essentials',
            description: `Pack extra clothes for water attractions, unexpected weather, and spills. Store them in resealable plastic bags in your park bag for easy access. Quick-dry clothing is ideal, and consider bringing a complete change of clothes when experiencing water rides like Kali River Rapids or when planning for children who may want to play in interactive fountains and splash areas.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['preparation', 'comfort']
        },
        {
            title: 'Nighttime illumination',
            description: `Bring glow sticks, light-up necklaces, or small LED toys for nighttime entertainment. They're significantly cheaper when purchased before your trip (dollar stores, online retailers) compared to in-park prices. These items help keep track of children in crowds during nighttime shows and add to the magical atmosphere of evening parades and fireworks displays.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['money-saving', 'night-time']
        },
        {
            title: 'Custom scavenger hunt',
            description: `Create a personalized scavenger hunt for children with age-appropriate challenges. For younger kids, include finding character statues, spotting cast members from different countries, or identifying iconic landmarks. For older children, incorporate hidden Mickeys, specific architectural details, or themed elements within attractions. Offer small prizes or points toward selecting the next activity.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['engagement', 'activity']
        },
        {
            title: 'First visit celebration',
            description: `Request free "First Visit" buttons from Guest Relations or your Disney Resort hotel for first-time visitors. Cast Members throughout the parks will offer special congratulations and sometimes additional magical moments. Consider scheduling a special character meal, dessert party, or Memory Maker photo package to commemorate first visits with professional photos.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['celebration', 'free']
        },
        {
            title: 'Kid-height ride planning',
            description: `Research height requirements before your trip and measure children at home to set expectations. At 40" tall, most moderate attractions become available, while 44" opens up nearly all rides except the most intense thrill attractions. Use Child Swap (Rider Switch) for attractions with height restrictions so adults can take turns riding without waiting twice.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['planning', 'preparation']
        },
        {
            title: 'Character dining prioritization',
            description: `Schedule character dining experiences strategically based on your child's favorites. For classic characters, try Chef Mickey's (Contemporary Resort), Topolino's Terrace (Riviera Resort), or Tusker House (Animal Kingdom). For princesses, choose Cinderella's Royal Table (Magic Kingdom), Akershus Royal Banquet Hall (EPCOT), or Story Book Dining at Artist Point (Wilderness Lodge).`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'AK'],
            tags: ['characters', 'dining']
        }
    ],
    packing: [
        {
            title: 'First aid essentials',
            description: `Pack a compact first aid kit with essentials like Band-Aids, pain relievers, anti-itch cream, blister treatments, antacids, and any prescription medications. Other useful additions include moleskin for blisters, electrolyte packets for hot days, and travel-sized allergy medication. Store in a small pouch or bag that's easy to access in your day pack.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['preparation', 'health']
        },
        {
            title: 'Hydration system',
            description: `Bring insulated, refillable water bottles for each family member to stay hydrated in the Florida heat. Free ice water is available at any quick-service location, and water fountains and bottle filling stations are located throughout the parks. Consider bottles with carrying straps or carabiners to attach to bags, and freeze half-filled bottles overnight to have cold water throughout the morning.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['money-saving', 'essential']
        },
        {
            title: 'Weather-adaptive clothing',
            description: `Pack for Orlando's variable weather with lightweight, moisture-wicking layers, especially during spring and fall when temperatures can vary significantly from morning to evening. Always carry pocket-sized ponchos for sudden rain showers (cheaper purchased before your trip), and consider UV-protective clothing and wide-brimmed hats rather than repeatedly applying sunscreen.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['comfort', 'preparation']
        },
        {
            title: 'Proper footwear strategy',
            description: `Choose comfortable, broken-in walking shoes with good arch support and bring at least two pairs to alternate daily. Park touring can involve 8-10 miles of walking daily. Moisture-wicking socks prevent blisters, and having a backup footwear option is crucial if your primary shoes get wet from rain or water attractions. Never bring brand new shoes to Disney without breaking them in first.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['comfort', 'essential']
        },
        {
            title: 'Park bag optimization',
            description: `Use a lightweight backpack with multiple compartments for organized storage of daily essentials. Key items to pack: sunscreen, hand sanitizer, phone charger, snacks, water bottles, ponchos, mini first aid kit, cooling towels, and any needed medications. Distribute weight evenly and keep frequently accessed items in outer pockets for convenience without removing the pack.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['organization', 'preparation']
        },
        {
            title: 'Sun protection system',
            description: `Create a comprehensive sun protection system with broad-spectrum sunscreen (minimum SPF 50), UV-protective sunglasses, wide-brimmed hats, and lightweight long-sleeved options. Set phone reminders to reapply sunscreen every 2 hours and after water rides or swimming. Mineral-based sunscreens tend to last longer in high heat and humidity than chemical formulations.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['health', 'essential']
        },
        {
            title: 'Cooling accessories',
            description: `Bring personal cooling items for Florida's intense heat: microfiber cooling towels (activate by wetting and snapping), battery-operated personal fans with water misters, and cooling neck wraps. Keep these accessible for midday heat - they're significantly less expensive when purchased before your trip compared to in-park merchandise.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['comfort', 'summer']
        },
        {
            title: 'Nighttime layers',
            description: `Pack light layers for evening temperature drops, especially during winter months (November-February) when temperatures can fall into the 50s or lower after sunset. A lightweight jacket, cardigan, or packable windbreaker takes minimal space in your day bag and provides comfort during nighttime shows and fireworks when temperatures drop and you're less physically active.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['comfort', 'winter']
        },
        {
            title: 'Portable phone protection',
            description: `Protect your smartphone with a waterproof case or pouch, especially if experiencing water attractions like Kali River Rapids or Splash Mountain. Waterproof phone pouches with lanyards cost $10-15 online versus $25+ in the parks. Consider a phone grip attachment to prevent drops during quick photo opportunities, and bring a backup charging cable.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['tech', 'protection']
        }
    ],
    budget: [
        {
            title: 'Discounted Disney gift cards',
            description: `Purchase discounted Disney gift cards through Target RedCard (5% off), wholesale clubs like Sam's Club or Costco (occasionally 4-8% off), or during special promotions at grocery stores. These cards can be used for tickets, hotels, dining, merchandise, and even to pay for package vacations, potentially saving hundreds on a weeklong trip.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK', 'DS'],
            tags: ['discount', 'planning']
        },
        {
            title: 'Off-site food delivery',
            description: `Use grocery delivery services like Instacart, Amazon Fresh, or Garden Grocer to deliver breakfast items, snacks, and drinks to your hotel. Having breakfast in your room can save $15-20 per person daily, and bringing your own snacks into the parks is permitted. Disney resorts charge a small receiving fee, but the savings far outweigh this cost for families.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['food', 'planning']
        },
        {
            title: 'Souvenir strategies',
            description: `Set souvenir budgets before your trip and consider alternatives to expensive park merchandise. Options include purchasing Disney items from discount stores before traveling, giving children a pre-loaded Disney gift card for their spending, or focusing on free souvenirs like pressed pennies (bring pre-1982 pennies and quarters). Character autographs and PhotoPass pictures also make meaningful mementos.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK', 'DS'],
            tags: ['shopping', 'family']
        },
        {
            title: 'Value resort benefits',
            description: `Consider Disney Value Resorts (All-Star Movies, Pop Century) or moderate options (Caribbean Beach, Port Orleans) rather than Deluxe properties to save significantly while still enjoying Disney transportation, Early Theme Park Entry, and the Disney resort atmosphere. Value resorts start around $150/night versus $500+ for Deluxe properties, yet still provide the key Disney benefits.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['lodging', 'planning']
        },
        {
            title: 'Strategic ticket purchasing',
            description: `Buy multi-day Disney tickets to significantly reduce the per-day cost. A 7-day ticket costs roughly 50% more than a 1-day ticket, effectively reducing your daily admission cost by over 50%. Also consider whether Park Hopper is necessary - skipping this option saves about $85 per ticket, and many guests find one park per day sufficient, especially for first visits.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['tickets', 'planning']
        },
        {
            title: 'Free entertainment options',
            description: `Take advantage of numerous free Disney experiences beyond the parks: watch Magic Kingdom fireworks from the Polynesian Resort beach, explore Disney Springs, visit Boardwalk entertainment district, take the free resort monorail loop tour, watch the Electrical Water Pageant from lakeside resorts, or explore resort lobbies and grounds with their elaborate theming and artwork.`,
            difficulty: 'beginner',
            parks: ['DS'],
            tags: ['free', 'entertainment']
        },
        {
            title: 'Refillable popcorn buckets',
            description: `Purchase a refillable popcorn bucket on your first day ($12-25 depending on style) and get $2 refills throughout your trip, compared to $5+ for single-serving popcorn. For extended stays, the specialty buckets pay for themselves after just 3-4 refills. Similarly, refillable resort mugs offer unlimited self-service beverages at resort food courts for the duration of your stay.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['food', 'reusable']
        },
        {
            title: 'Counter service dining optimization',
            description: `Save on dining by splitting large counter service meals, especially at locations known for generous portions like Flame Tree Barbecue (Animal Kingdom), Cosmic Ray's (Magic Kingdom), and Regal Eagle (EPCOT). Many quick-service locations offer substantial portions that can feed lighter eaters or serve as a meal plus a snack, particularly for families with younger children.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['dining', 'sharing']
        },
        {
            title: 'Transportation cost elimination',
            description: `Utilize Disney's complimentary transportation network rather than renting a car or using rideshare services. The system includes buses, monorails, boats, and the Disney Skyliner gondola connecting parks and resorts. If flying into Orlando International Airport, Disney Resort guests can use the Sunshine Flyer or Mears Connect shuttle services, which are significantly cheaper than private transfers or rental cars.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['transportation', 'planning']
        },
        {
            title: 'Special offer monitoring',
            description: `Monitor Disney's special offers page or use a travel agent who will automatically apply new discounts to your booking if they become available. Disney typically releases room discounts for off-peak seasons, and occasionally offers free dining promotions. Even after booking, these discounts can often be applied to existing reservations, sometimes saving 15-30% on resort stays.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['discount', 'planning']
        }
    ],
    adult: [
        {
            title: 'Trader Sam\'s Grog Grotto experience',
            description: `Visit Trader Sam's Grog Grotto at the Polynesian Resort for an immersive tiki bar experience with interactive elements and unique cocktails. Order specialty drinks like the Nautilus, Zombie, or Krakatoa Punch to trigger special effects throughout the bar. Arrive early (opens at 3PM) as this small venue fills quickly and doesn't accept reservations. The outdoor Tiki Terrace offers the same menu with live music but without the indoor special effects.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['drinks', 'themed']
        },
        {
            title: 'Disney Springs nightlife',
            description: `Explore Disney Springs' vibrant nightlife scene with venues like Jock Lindsey's Hangar Bar (Indiana Jones-themed), Wine Bar George (featuring over 140 wines by the glass), and The Edison (1920s-themed with live entertainment). The area comes alive after dark with free live music at the Marketplace Stage and Waterview Park, speciality cocktails, and a more adult-oriented atmosphere than the theme parks.`,
            difficulty: 'beginner',
            parks: ['DS'],
            tags: ['entertainment', 'dining']
        },
        {
            title: 'Premium guided experiences',
            description: `Book specialty tours for unique Disney experiences beyond standard park visits. Standouts include Wild Africa Trek at Animal Kingdom (3-hour safari experience with private meals and up-close animal encounters), Behind the Seeds at EPCOT (greenhouse and agricultural tour), and Keys to the Kingdom at Magic Kingdom (5-hour comprehensive park history tour including underground tunnels).`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'AK'],
            tags: ['exclusive', 'educational']
        },
        {
            title: 'Spa and relaxation options',
            description: `Schedule spa treatments at Grand Floridian Spa or Mandara Spa at Walt Disney World Swan for world-class relaxation. Services include massages, facials, body treatments, and couples packages. Make reservations 60+ days in advance, especially for weekend appointments. For a less expensive option, enjoy the leisure pools at Disney resorts which are typically less crowded than the feature pools.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['relaxation', 'luxury']
        },
        {
            title: 'Late-night Magic Kingdom',
            description: `Experience Magic Kingdom during Extended Evening Hours (for Deluxe Resort guests) or after-hours events when available. The park takes on a magical atmosphere with dramatically reduced crowds, minimal wait times for popular attractions, special lighting, and unique photo opportunities. You can often experience 10+ attractions in just a few hours during these special access times.`,
            difficulty: 'beginner',
            parks: ['MK'],
            tags: ['night-time', 'low-crowds']
        },
        {
            title: 'EPCOT festival exploration',
            description: `Plan adult visits around EPCOT's renowned festivals: International Food & Wine (fall), Festival of the Arts (winter), Flower & Garden (spring), and Festival of Holidays (winter). These events feature specialty food and beverage kiosks, live entertainment, culinary demonstrations, and unique merchandise. Create a self-guided tasting tour around World Showcase to sample international cuisines and beverages.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['food', 'seasonal']
        },
        {
            title: "Victoria & Albert's dining experience",
            description: `Reserve Disney's ultimate fine dining experience at Victoria & Albert's in the Grand Floridian Resort. This AAA Five Diamond restaurant offers an exquisite multi-course tasting menu with optional wine pairings in an elegant atmosphere. Book exactly 60 days in advance as reservations fill immediately. The Chef's Table experience provides an even more exclusive option with direct interaction with the culinary team.`,
            difficulty: 'advanced',
            parks: [],
            tags: ['luxury', 'dining']
        },
        {
            title: 'Monorail bar crawl',
            description: `Create your own monorail bar crawl by visiting distinctive lounges at each monorail resort. Start at Outer Rim or Steakhouse 71 Lounge (Contemporary), continue to Enchanted Rose (Grand Floridian), and finish at Tambu Lounge or Trader Sam's (Polynesian). Each venue offers unique specialty cocktails and atmospheres, connected conveniently by monorail transportation.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['drinks', 'transportation']
        },
        {
            title: 'Signature dining reservations',
            description: `Explore Disney's signature dining options like California Grill (Contemporary Resort) with fireworks views, Jiko (Animal Kingdom Lodge) featuring African-inspired cuisine, and Tiffins (Animal Kingdom) showcasing global flavors in an art-filled setting. Make reservations 60 days in advance, and consider lunch instead of dinner for better availability and sometimes lower pricing with similar menus.`,
            difficulty: 'beginner',
            parks: ['AK'],
            tags: ['dining', 'upscale']
        }
    ],
    seasonal: [
        {
            title: 'EPCOT festival planning',
            description: `Visit during EPCOT's signature festivals for unique food, entertainment, and experiences. Festival of the Arts (January-February) features culinary art, performances, and interactive exhibits. Flower & Garden (March-June) showcases stunning topiaries and garden marketplaces. Food & Wine (August-November) offers extensive international cuisine. Festival of Holidays (November-December) celebrates global traditions with special performances and seasonal treats.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['food', 'entertainment']
        },
        {
            title: "Mickey's seasonal party strategy",
            description: `Book tickets early for Mickey's Not-So-Scary Halloween Party (August-October) and Mickey's Very Merry Christmas Party (November-December) at Magic Kingdom. These separately ticketed evening events feature exclusive entertainment, reduced wait times, unique character appearances, and themed treats. Purchase tickets as soon as they're released (typically 3-6 months in advance) as popular dates sell out quickly.`,
            difficulty: 'beginner',
            parks: ['MK'],
            tags: ['special-event', 'night-time']
        },
        {
            title: 'RunDisney event participation',
            description: `Participate in runDisney race weekends for a unique way to experience the parks. Events include Walt Disney World Marathon Weekend (January), Princess Half Marathon (February), Springtime Surprise (April), and Wine & Dine Half Marathon (November). These themed races take participants through the parks with character stops and exclusive finisher medals. Registration opens approximately 7 months in advance and fills quickly.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['fitness', 'exclusive']
        },
        {
            title: 'Holiday decoration viewing',
            description: `Experience Disney's elaborate holiday decorations from mid-November through early January. Beyond the parks, visit Disney's Grand Floridian to see the life-sized gingerbread house, Beach Club for the gingerbread carousel, Contemporary Resort for the giant gingerbread display, and Animal Kingdom Lodge for authentic African-inspired decor. Resort hopping for holiday decorations requires no park ticket and can be done using Disney transportation.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['holiday', 'free']
        },
        {
            title: 'Holiday dining reservations',
            description: `Secure advance dining reservations for special holiday meals at restaurants like Liberty Tree Tavern (Magic Kingdom), Garden Grill (EPCOT), Hollywood Brown Derby (Hollywood Studios), or Tusker House (Animal Kingdom). These restaurants offer enhanced menus during Thanksgiving, Christmas, and New Year's periods. Book exactly 60 days in advance at 6:00 AM Eastern Time for these high-demand holiday dining experiences.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['holiday', 'dining']
        },
        {
            title: "New Year's Eve strategy",
            description: `For New Year's Eve at Disney World, arrive at your chosen park early (before 10:00 AM) as parks often reach capacity. Magic Kingdom and EPCOT offer the most elaborate celebrations with special fireworks, but also draw the largest crowds. Disney's Hollywood Studios provides a less crowded alternative with special entertainment and a midnight countdown. Consider viewing Magic Kingdom's fireworks from outside the park at resorts like Polynesian or Contemporary.`,
            difficulty: 'advanced',
            parks: ['MK', 'EP', 'HS'],
            tags: ['holiday', 'crowds']
        },
        {
            title: 'Flower & Garden outdoor kitchens',
            description: `Explore EPCOT's Flower & Garden Festival's Outdoor Kitchens featuring seasonal, garden-fresh cuisine and botanical-inspired beverages. Highlights include The Honey Bee-stro, Trowel & Trellis (plant-based options), and Citrus Blossom featuring Florida-inspired dishes. The festival also offers garden tours, the Garden Rocks concert series, and specialized merchandise celebrating Disney characters in topiary form.`,
            difficulty: 'beginner',
            parks: ['EP'],
            tags: ['spring', 'food']
        },
        {
            title: 'Off-season advantages',
            description: `Visit during Disney World's less crowded periods: mid-January through early February, late August through September, or weekdays in early December. These periods typically feature lower wait times, better hotel availability, potentially lower prices, and more relaxed atmosphere. While some attractions may be under refurbishment during these periods, the trade-off in reduced crowds often makes for a more enjoyable experience.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['planning', 'crowds']
        }
    ],
    transportation: [
        {
            title: 'Skyliner strategy',
            description: `Utilize the Disney Skyliner gondola system connecting EPCOT, Hollywood Studios, and resorts including Caribbean Beach, Riviera, Pop Century, and Art of Animation. This efficient transportation option offers beautiful aerial views and typically moves guests more quickly than buses. For early park arrivals, be aware the Skyliner usually begins operating 60 minutes before official park opening.`,
            difficulty: 'beginner',
            parks: ['EP', 'HS'],
            tags: ['scenic', 'efficient']
        },
        {
            title: 'Walking path alternatives',
            description: `Use lesser-known walking paths between parks and resorts to avoid transportation waits. You can walk between EPCOT and Hollywood Studios (approximately 20 minutes), from the Contemporary Resort to Magic Kingdom (10 minutes), or between EPCOT and the Boardwalk/Yacht & Beach Club resorts (5-10 minutes). These pedestrian routes are often faster than waiting for Disney transportation during peak times.`,
            difficulty: 'intermediate',
            parks: ['MK', 'EP', 'HS'],
            tags: ['exercise', 'time-saving']
        },
        {
            title: 'Boat transportation options',
            description: `Take advantage of Disney's water transportation for a scenic and relaxing journey. Boat launches connect Magic Kingdom to Grand Floridian, Polynesian, Fort Wilderness, and Wilderness Lodge. EPCOT and Hollywood Studios connect via Friendship Boats to the Boardwalk, Yacht Club, and Beach Club resorts. These water routes often offer shorter waits than buses and provide a peaceful alternative to more crowded transportation options.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS'],
            tags: ['scenic', 'relaxing']
        },
        {
            title: 'Rideshare strategic use',
            description: `Use rideshare services (Uber, Lyft) strategically when time is more valuable than money. For example, taking a rideshare for early morning reservations or when traveling between resorts (which often requires multiple transfers on Disney transportation). Be aware of designated pickup/dropoff locations at each park and resort, and allow extra time during peak periods when rideshare availability may be limited.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['time-saving', 'paid-service']
        },
        {
            title: 'Parking lot tram planning',
            description: `When driving to the parks, note where you parked using a phone photo or the location feature in the My Disney Experience app. For Magic Kingdom, remember you'll park at the Transportation and Ticket Center and take either monorail or ferry to the park entrance. Arrive 60-90 minutes before park opening during peak periods to allow time for parking, security, and transportation to the entrance.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['driving', 'organization']
        },
        {
            title: 'Transportation timing awareness',
            description: `Allow adequate time for Disney transportation—typically 60-90 minutes when traveling between parks or from resorts to parks, especially during peak times. Bus service generally begins 45 minutes before park opening and runs until 1-2 hours after park closing. For early morning reservations (before 7:30 AM), have a backup plan as transportation may be limited or unavailable that early.`,
            difficulty: 'beginner',
            parks: ['MK', 'EP', 'HS', 'AK'],
            tags: ['planning', 'time-management']
        },
        {
            title: 'Magic Kingdom exit alternatives',
            description: `After Magic Kingdom fireworks, consider alternatives to the crowded main exit and Transportation & Ticket Center. Take the resort monorail to the Contemporary and walk to your car or catch a rideshare, take a boat to Fort Wilderness or the Wilderness Lodge, or relax at one of the monorail resort lobbies until crowds dissipate. These options help avoid the massive crowds heading to the parking lot immediately after nighttime shows.`,
            difficulty: 'intermediate',
            parks: ['MK'],
            tags: ['crowd-avoidance', 'night-time']
        },
        {
            title: 'Resort airline check-in',
            description: `If staying at a Disney Resort, use the resort airline check-in service for participating airlines (when available). This convenient service allows you to check your luggage and receive boarding passes at your resort on your departure day. Luggage is transported directly to the airport, letting you enjoy your last day without carrying bags. Check with your resort front desk for availability, hours, and participating airlines.`,
            difficulty: 'beginner',
            parks: [],
            tags: ['convenience', 'departure']
        }
    ]
};

// Helper functions
const getTipsForCategory = (category: string): Array<TipType> => {
    if (!(category in tipsData)) return [];

    const categoryKey = category as keyof typeof tipsData;
    const categoryData = tipsData[categoryKey];

    // Cast the data to ensure it conforms to TipType interface
    return categoryData.map(item => {
        const difficulty = item.difficulty;
        // Use the helper to validate difficulty
        const validDifficulty = isValidDifficulty(difficulty) ? difficulty : 'beginner' as const;
        return { ...item, difficulty: validDifficulty };
    });
};

// Get parks for a tip as full names
const getFullParkNames = (parkCodes: string[]): string => {
    if (!parkCodes || parkCodes.length === 0) return "All Parks";

    return parkCodes.map(code => {
        // Check if the code is a valid key in parks
        if (code in parks) {
            const parkKey = code as keyof typeof parks;
            return parks[parkKey];
        }
        return code;
    }).join(", ");
};

// Define tip type for TypeScript
interface TipType {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    parks: string[];
    tags: string[];
}

// Helper to validate difficulty type
const isValidDifficulty = (value: string): value is 'beginner' | 'intermediate' | 'advanced' => {
    return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}

export default function TipsAndTricksPage() {
    // State for UI interaction
    const [activeCategory, setActiveCategory] = useState('planning');
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
    const [parkFilter, setParkFilter] = useState<string | null>(null);
    const [savedTips, setSavedTips] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('browse');

    // Refs for animation and scrolling
    const pageRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const categoriesRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const tipCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Load saved tips from localStorage on mount
    useEffect(() => {
        const savedTipsData = localStorage.getItem('savedDisneyTips');
        if (savedTipsData) {
            setSavedTips(JSON.parse(savedTipsData));
        }
    }, []);

    // Save to localStorage when savedTips changes
    useEffect(() => {
        localStorage.setItem('savedDisneyTips', JSON.stringify(savedTips));
    }, [savedTips]);

    // Handle saving/unsaving tips
    const toggleSaveTip = (categoryId: string, tipIndex: number) => {
        const tipId = `${categoryId}-${tipIndex}`;
        if (savedTips.includes(tipId)) {
            setSavedTips(savedTips.filter(id => id !== tipId));
        } else {
            setSavedTips([...savedTips, tipId]);
        }
    };

    // Get all saved tips data
    const getSavedTipsData = (): Array<TipType & { category: string, index: number }> => {
        return savedTips.map(tipId => {
            const [category, indexStr] = tipId.split('-');
            const index = parseInt(indexStr, 10);

            // Type guard to check if category is a valid key
            if (!(category in tipsData)) return null;

            const categoryKey = category as keyof typeof tipsData;
            const tipData = tipsData[categoryKey]?.[index];

            if (!tipData) return null;

            // Validate difficulty
            const difficulty = tipData.difficulty;
            const validDifficulty = isValidDifficulty(difficulty)
                ? difficulty
                : 'beginner' as const;

            return {
                ...tipData,
                category,
                index,
                difficulty: validDifficulty
            };
        }).filter((item): item is TipType & { category: string, index: number } => item !== null);
    };

    // Filter tips based on search query and filters
    const getFilteredTips = () => {
        let results: Array<TipType & { category: string, index: number }> = [];

        // If no search query but filters are active, apply filters to current category
        if (searchQuery.length <= 2 && (difficultyFilter || parkFilter)) {
            const categoryTips = getTipsForCategory(activeCategory);
            results = categoryTips.map((tip, index) => ({
                ...tip,
                category: activeCategory,
                index
            })).filter(tip => {
                const matchesDifficulty = !difficultyFilter || tip.difficulty === difficultyFilter;
                const matchesPark = !parkFilter || tip.parks.includes(parkFilter);
                return matchesDifficulty && matchesPark;
            });
        }
        // If search query exists (3+ chars), search across all categories
        else if (searchQuery.length > 2) {
            Object.entries(tipsData).forEach(([category, tips]) => {
                tips.forEach((tip, index) => {
                    // Use the helper to validate difficulty
                    const difficulty = tip.difficulty;
                    const validDifficulty = isValidDifficulty(difficulty)
                        ? difficulty
                        : 'beginner' as const;

                    const castTip = {
                        ...tip,
                        difficulty: validDifficulty
                    };

                    if (
                        (castTip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            castTip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            castTip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
                        (!difficultyFilter || castTip.difficulty === difficultyFilter) &&
                        (!parkFilter || castTip.parks.includes(parkFilter))
                    ) {
                        results.push({
                            ...castTip,
                            category,
                            index
                        });
                    }
                });
            });
        }

        return results;
    };

    // Get filtered tips based on current state
    const filteredTips = getFilteredTips();
    const savedTipsData = getSavedTipsData();

    // Get counts of different difficulty levels for current category
    const getDifficultyCounts = () => {
        const tips = getTipsForCategory(activeCategory);
        return {
            beginner: tips.filter(tip => tip.difficulty === 'beginner').length,
            intermediate: tips.filter(tip => tip.difficulty === 'intermediate').length,
            advanced: tips.filter(tip => tip.difficulty === 'advanced').length
        };
    };

    const difficultyCounts = getDifficultyCounts();

    // GSAP animations
    useGSAP(() => {
        if (!pageRef.current) return;

        // Initial animations
        const timeline = gsap.timeline();

        timeline.from(headerRef.current, {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        if (categoriesRef.current) {
            timeline.from(categoriesRef.current.querySelectorAll('.category-card'), {
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.5');
        }

        // Scroll animations
        gsap.from('.tip-card', {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            scrollTrigger: {
                trigger: contentRef.current,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none none'
            }
        });

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [activeCategory, activeTab]);

    return (
        <div ref={pageRef} className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            {/* Background visual elements */}
            <div className="castle-silhouette absolute opacity-5 w-full h-full bg-[url('/images/parks/castle-silhouette.png')] bg-center bg-no-repeat bg-contain pointer-events-none"></div>
            <div className="firework absolute top-1/4 left-1/4 w-32 h-32 opacity-10 pointer-events-none"></div>
            <div className="firework absolute top-1/3 right-1/3 w-40 h-40 opacity-10 pointer-events-none"></div>
            <div className="firework absolute bottom-1/4 right-1/5 w-36 h-36 opacity-10 pointer-events-none"></div>

            {/* Header section */}
            <div
                ref={headerRef}
                className="relative pt-16 pb-10 px-4 sm:px-6 lg:px-8 text-center z-10"
            >
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-5xl font-bold text-indigo-800 dark:text-indigo-200 mb-4"
                >
                    Disney World <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Tips & Tricks</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
                >
                    Expert strategies and insider knowledge to make your Disney vacation truly magical
                </motion.p>

                {/* Tabs for Browse and Saved Tips */}
                <div className="mt-8 max-w-md mx-auto">
                    <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="browse" className="text-base">
                                Browse Tips
                            </TabsTrigger>
                            <TabsTrigger value="saved" className="text-base">
                                Saved Tips {savedTips.length > 0 && `(${savedTips.length})`}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Search bar - only show in browse mode */}
                {activeTab === 'browse' && (
                    <div className="mt-4 max-w-md mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search for tips by keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Filter buttons */}
                {activeTab === 'browse' && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {/* Difficulty Filter */}
                        <div className="relative">
                            <Button
                                variant={difficultyFilter ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setDifficultyFilter(difficultyFilter ? null : 'beginner')}
                                className="flex items-center gap-1"
                            >
                                <Award size={16} />
                                {difficultyFilter ? `Difficulty: ${difficultyFilter}` : "Difficulty"}
                                {difficultyFilter && (
                                    <Badge variant="outline" className="ml-1 px-1" onClick={(e) => {
                                        e.stopPropagation();
                                        setDifficultyFilter(null);
                                    }}>×</Badge>
                                )}
                            </Button>

                            {difficultyFilter && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 z-20 min-w-[150px]"
                                >
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant={difficultyFilter === 'beginner' ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setDifficultyFilter('beginner')}
                                            className="justify-between"
                                        >
                                            Beginner <Badge variant="outline">{difficultyCounts.beginner}</Badge>
                                        </Button>
                                        <Button
                                            variant={difficultyFilter === 'intermediate' ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setDifficultyFilter('intermediate')}
                                            className="justify-between"
                                        >
                                            Intermediate <Badge variant="outline">{difficultyCounts.intermediate}</Badge>
                                        </Button>
                                        <Button
                                            variant={difficultyFilter === 'advanced' ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setDifficultyFilter('advanced')}
                                            className="justify-between"
                                        >
                                            Advanced <Badge variant="outline">{difficultyCounts.advanced}</Badge>
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Park Filter */}
                        <div className="relative">
                            <Button
                                variant={parkFilter ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setParkFilter(parkFilter ? null : 'MK')}
                                className="flex items-center gap-1"
                            >
                                <MapPin size={16} />
                                {parkFilter
                                    ? `Park: ${parkFilter in parks
                                        ? parks[parkFilter as keyof typeof parks]
                                        : parkFilter}`
                                    : "Park"}
                                {parkFilter && (
                                    <Badge variant="outline" className="ml-1 px-1" onClick={(e) => {
                                        e.stopPropagation();
                                        setParkFilter(null);
                                    }}>×</Badge>
                                )}
                            </Button>

                            {parkFilter && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 z-20 min-w-[180px]"
                                >
                                    <div className="flex flex-col gap-1">
                                        {Object.entries(parks).map(([code, name]) => (
                                            <Button
                                                key={code}
                                                variant={parkFilter === code ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setParkFilter(code)}
                                                className="justify-start"
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Clear Filters button (only show if filters are active) */}
                        {(difficultyFilter || parkFilter || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setDifficultyFilter(null);
                                    setParkFilter(null);
                                    setSearchQuery('');
                                }}
                                className="text-indigo-600 dark:text-indigo-400"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                {activeTab === 'browse' ? (
                    <motion.div
                        key="browse"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Display search results if search query or filters exist */}
                        {(searchQuery.length > 2 || (difficultyFilter || parkFilter)) && (
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                                <h2 className="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-200">
                                    {searchQuery.length > 2 ? `Search Results for "${searchQuery}"` : 'Filtered Tips'} ({filteredTips.length})
                                </h2>

                                {filteredTips.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredTips.map((tip, index) => (
                                            <motion.div
                                                key={`search-${tip.category}-${tip.index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                            >
                                                <Card
                                                    className="tip-card h-full p-5 overflow-hidden border border-indigo-100 dark:border-indigo-900 hover:shadow-lg transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col">
                                                            <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 line-clamp-2">{tip.title}</h3>
                                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                <Badge variant="outline" className="mr-2">
                                                                    {categories.find(c => c.id === tip.category)?.name}
                                                                </Badge>
                                                                <Badge variant={
                                                                    tip.difficulty === 'beginner' ? 'secondary' :
                                                                        tip.difficulty === 'intermediate' ? 'default' : 'destructive'
                                                                } className="text-xs mr-2">
                                                                    {tip.difficulty}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                            onClick={() => toggleSaveTip(tip.category, tip.index)}
                                                        >
                                                            {savedTips.includes(`${tip.category}-${tip.index}`) ? (
                                                                <Heart className="h-5 w-5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                                                            ) : (
                                                                <Heart className="h-5 w-5" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">{tip.description}</p>

                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {tip.parks?.length > 0 && (
                                                            <div className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                                                                <MapPin size={12} className="mr-1" />
                                                                {getFullParkNames(tip.parks)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap gap-1 mt-auto">
                                                        {tip.tags?.map(tag => (
                                                            <Badge
                                                                key={tag}
                                                                variant="outline"
                                                                className="text-xs bg-indigo-50 dark:bg-indigo-900/30"
                                                            >
                                                                {tag.replace(/-/g, ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                                            <Search className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No tips found</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                            We couldn&apos;t find any tips matching your criteria. Try adjusting your search terms or filters.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setDifficultyFilter(null);
                                                setParkFilter(null);
                                            }}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Categories section - only show if not searching or filtering */}
                        {searchQuery.length <= 2 && !difficultyFilter && !parkFilter && (
                            <>
                                <div
                                    ref={categoriesRef}
                                    className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">Categories</h2>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Select a category to explore tips
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {categories.map((category) => (
                                            <Card
                                                key={category.id}
                                                onClick={() => setActiveCategory(category.id)}
                                                className={`category-card cursor-pointer p-4 flex flex-col items-center justify-center text-center transition-all ${activeCategory === category.id
                                                    ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 shadow-md'
                                                    : 'hover:bg-indigo-50 dark:hover:bg-indigo-950'
                                                    }`}
                                            >
                                                <div className={`mb-2 p-2 rounded-full ${activeCategory === category.id
                                                    ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-200 dark:bg-indigo-800'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {category.icon}
                                                </div>
                                                <h3 className={`text-sm font-medium ${activeCategory === category.id
                                                    ? 'text-indigo-800 dark:text-indigo-200'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {category.name}
                                                </h3>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {getTipsForCategory(category.id).length} tips
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips content */}
                                <div
                                    ref={contentRef}
                                    className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                                            {categories.find(c => c.id === activeCategory)?.name} Tips
                                        </h2>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <span className="mr-2">{getTipsForCategory(activeCategory).length} Tips</span>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Info size={16} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className="text-xs p-1">
                                                            <div className="mb-1">Beginner: {difficultyCounts.beginner}</div>
                                                            <div className="mb-1">Intermediate: {difficultyCounts.intermediate}</div>
                                                            <div>Advanced: {difficultyCounts.advanced}</div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {getTipsForCategory(activeCategory).map((tip, index) => (
                                            <motion.div
                                                key={`${activeCategory}-tip-${index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                                ref={(el) => {
                                                    tipCardRefs.current[`${activeCategory}-${index}`] = el;
                                                }}
                                            >
                                                <Card
                                                    className={`tip-card relative h-full p-5 overflow-hidden border hover:shadow-lg transition-all ${tip.difficulty === 'beginner'
                                                        ? 'border-green-100 dark:border-green-900'
                                                        : tip.difficulty === 'intermediate'
                                                            ? 'border-yellow-100 dark:border-yellow-900'
                                                            : 'border-red-100 dark:border-red-900'
                                                        }`}
                                                >
                                                    <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full ${tip.difficulty === 'beginner'
                                                        ? 'bg-green-500'
                                                        : tip.difficulty === 'intermediate'
                                                            ? 'bg-yellow-500'
                                                            : 'bg-red-500'
                                                        }`} />

                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 pr-8">{tip.title}</h3>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                            onClick={() => toggleSaveTip(activeCategory, index)}
                                                        >
                                                            {savedTips.includes(`${activeCategory}-${index}`) ? (
                                                                <Heart className="h-5 w-5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                                                            ) : (
                                                                <Heart className="h-5 w-5" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <Badge variant={
                                                            tip.difficulty === 'beginner' ? 'secondary' :
                                                                tip.difficulty === 'intermediate' ? 'default' : 'destructive'
                                                        } className="text-xs">
                                                            {tip.difficulty}
                                                        </Badge>

                                                        {tip.parks?.length > 0 && (
                                                            <div className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                                                                <MapPin size={12} className="mr-1" />
                                                                {getFullParkNames(tip.parks)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-300 mb-4">{tip.description}</p>

                                                    <div className="flex flex-wrap gap-1 mt-auto pt-2">
                                                        {tip.tags?.map(tag => (
                                                            <Badge
                                                                key={tag}
                                                                variant="outline"
                                                                className="text-xs bg-indigo-50 dark:bg-indigo-900/30"
                                                            >
                                                                {tag.replace(/-/g, ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    <div className="absolute bottom-3 right-3">
                                                        <div className="text-indigo-500 dark:text-indigo-400">
                                                            <Sparkles size={16} className="opacity-50" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                                Saved Tips ({savedTipsData.length})
                            </h2>
                            {savedTipsData.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSavedTips([])}
                                    className="text-sm"
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>

                        {savedTipsData.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedTipsData.map((tip, index) => (
                                    <motion.div
                                        key={`saved-tip-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={`tip-card relative h-full p-5 overflow-hidden border hover:shadow-lg transition-all ${tip.difficulty === 'beginner'
                                                ? 'border-green-100 dark:border-green-900'
                                                : tip.difficulty === 'intermediate'
                                                    ? 'border-yellow-100 dark:border-yellow-900'
                                                    : 'border-red-100 dark:border-red-900'
                                                }`}
                                        >
                                            <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full ${tip.difficulty === 'beginner'
                                                ? 'bg-green-500'
                                                : tip.difficulty === 'intermediate'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                }`} />

                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">{tip.title}</h3>
                                                    <Badge variant="outline" className="mt-1">
                                                        {categories.find(c => c.id === tip.category)?.name}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-indigo-600 dark:text-indigo-400"
                                                    onClick={() => toggleSaveTip(tip.category, tip.index)}
                                                >
                                                    <Heart className="h-5 w-5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                                                </Button>
                                            </div>

                                            <div className="mb-3 flex items-center gap-2">
                                                <Badge variant={
                                                    tip.difficulty === 'beginner' ? 'secondary' :
                                                        tip.difficulty === 'intermediate' ? 'default' : 'destructive'
                                                } className="text-xs">
                                                    {tip.difficulty}
                                                </Badge>

                                                {tip.parks?.length > 0 && (
                                                    <div className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                                                        <MapPin size={12} className="mr-1" />
                                                        {getFullParkNames(tip.parks)}
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 mb-4">{tip.description}</p>

                                            <div className="flex flex-wrap gap-1 mt-auto pt-2">
                                                {tip.tags?.map(tag => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="text-xs bg-indigo-50 dark:bg-indigo-900/30"
                                                    >
                                                        {tag.replace(/-/g, ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                                    <Heart className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No saved tips yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                                    Save your favorite Disney tips by clicking the heart icon on any tip card. They&apos;ll be stored here for easy reference during your vacation planning.
                                </p>
                                <Button
                                    variant="default"
                                    className="mt-2"
                                    onClick={() => setActiveTab('browse')}
                                >
                                    Browse Tips
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Final tip and CTA */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="container mx-auto max-w-3xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -top-6 -left-6 w-12 h-12 text-indigo-600/20 dark:text-indigo-400/20">
                            <span className="text-6xl font-serif">&ldquo;</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 dark:text-indigo-200 mb-4">Final Disney Wisdom</h2>
                        <p className="text-lg text-indigo-700 dark:text-indigo-300 mb-6 italic">
                            &ldquo;Relax and enjoy the magic! Remember, the most important part of any Disney trip is creating magical memories with your loved ones.&rdquo;
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                            <Link href="/planning">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                                >
                                    Start Planning Your Trip
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <Link href="/dashboard/itinerary">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                >
                                    Create Custom Itinerary
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center mt-8">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 dark:text-indigo-400 flex gap-2 items-center text-sm"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                <Share2 size={16} />
                                Share these tips
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Background effects */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-200/30 to-transparent dark:from-indigo-800/30 dark:to-transparent" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-20" />
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-400 dark:bg-purple-600 rounded-full opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-yellow-400 dark:bg-yellow-600 rounded-full opacity-10" />
            </div>

            {/* Add custom CSS for animations in a style tag */}
            <style jsx global>{`
                .castle-silhouette {
                    z-index: 0;
                }

                .firework {
                    z-index: 0;
                    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
                    border-radius: 50%;
                    animation: firework 4s infinite;
                }

                .firework:nth-child(2) {
                    animation-delay: 1s;
                }

                .firework:nth-child(3) {
                    animation-delay: 2s;
                }

                @keyframes firework {
                    0% { transform: scale(0); opacity: 0; }
                    20% { transform: scale(1); opacity: 0.5; }
                    40% { transform: scale(1.2); opacity: 0.2; }
                    100% { transform: scale(0); opacity: 0; }
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }

                .animate-sparkle {
                    animation: sparkle 2s linear infinite;
                    background-image: linear-gradient(90deg, #f0c, #0cf, #f0c);
                    background-size: 200% 100%;
                }

                @keyframes sparkle {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>
        </div>
    );
}