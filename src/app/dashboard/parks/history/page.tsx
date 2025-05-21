import React from 'react'
import DisneyWorldTimeline from '@/components/parks/DisneyWorldTimeline'

export const metadata = {
    title: 'Walt Disney World History | Comprehensive Resort Overview',
    description: 'Explore the detailed operational history of Walt Disney World Resort, including hotel statistics, dining, attractions, transportation systems, financial metrics, and staffing information.',
}

export default function DisneyWorldHistoryPage() {
    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-6 text-center">Walt Disney World Resort History</h1>
            <p className="text-lg mb-8 text-muted-foreground">
                Since opening in 1971, Walt Disney World has grown to become the most visited vacation resort in the world.
                This comprehensive overview details the operational history and statistics of this magnificent destination.
            </p>

            <section id="timeline" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Historical Timeline</h2>
                <DisneyWorldTimeline />
            </section>

            <section id="resort-hotels" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Resort Hotel Statistics</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Resort Hotels & Rooms</h3>
                        <p>
                            Walt Disney World operates 36 on-site resorts across <span className="font-medium">Value</span>, <span className="font-medium">Moderate</span>, and <span className="font-medium">Deluxe</span> tiers,
                            as well as Disney Vacation Club (DVC) villa properties. The resort offers over <span className="font-medium">30,000 hotel rooms</span> on property,
                            plus around <span className="font-medium">3,300 DVC villa units</span> (timeshare suites).
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Disney&apos;s Pop Century Resort (Value tier, opened 2003): <span className="font-medium">2,880 rooms</span></li>
                            <li>Disney&apos;s Caribbean Beach Resort (Moderate tier, opened 1988): <span className="font-medium">2,112 rooms</span></li>
                            <li>Disney&apos;s Grand Floridian Resort & Spa (Deluxe tier, opened 1988): <span className="font-medium">867 rooms</span></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Opening Timeline</h3>
                        <p>
                            The resort hotels opened in phases over several decades:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><span className="font-medium">1971</span>: Disney&apos;s Contemporary Resort and Polynesian Village Resort</li>
                            <li><span className="font-medium">1988</span>: Disney&apos;s Caribbean Beach Resort and Grand Floridian Resort</li>
                            <li><span className="font-medium">1990s</span>: All-Star Resorts</li>
                            <li><span className="font-medium">2001</span>: Disney&apos;s Animal Kingdom Lodge</li>
                            <li><span className="font-medium">2003</span>: Disney&apos;s Pop Century Resort</li>
                            <li><span className="font-medium">2012</span>: Disney&apos;s Art of Animation Resort</li>
                            <li><span className="font-medium">2019</span>: Disney&apos;s Riviera Resort</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Resort Categories & Features</h3>
                        <div className="grid md:grid-cols-3 gap-4 mt-3">
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Value Resorts</h4>
                                <p>Budget-friendly lodging with food courts, typically 1,500–2,800 rooms each. Examples: Pop Century, Art of Animation, All-Star Resorts.</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Moderate Resorts</h4>
                                <p>Mid-range amenities with 1,000–2,000 rooms each. Examples: Port Orleans, Coronado Springs, Caribbean Beach.</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Deluxe Resorts</h4>
                                <p>Luxury accommodations with 400–900 rooms each, prime locations, fine dining, and extensive recreation. Many include Deluxe Villas for DVC members.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Occupancy Rates</h3>
                        <p>
                            Walt Disney World hotels historically enjoy very high occupancy, averaging well above 80% annually.
                            In early 2019, Disney reported Florida hotel occupancy at <span className="font-medium">94%</span> during a fiscal quarter.
                            Even during the 2020 COVID-19 shutdown when occupancy dropped to zero, the hotels quickly rebounded to high occupancy by 2021-2022.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Notable Trends</h3>
                        <p>
                            Disney has expanded hotel capacity from just 2 resorts in 1971 to 36 resorts today. The company partners with
                            <span className="font-medium"> official non-Disney hotels</span> on property (like Walt Disney World Swan & Dolphin with
                            ~2,267 rooms combined) to increase capacity.
                        </p>
                        <p className="mt-2">
                            With over 30,000 rooms, Walt Disney World is one of the largest single-site hotel complexes in the world, consistently
                            leading the industry in occupancy rates.
                        </p>
                    </div>
                </div>
            </section>

            <section id="dining" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Dining and Restaurant Data</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Total Dining Venues</h3>
                        <p>
                            Walt Disney World features over <span className="font-medium">300 dining venues</span> resort-wide, including approximately
                            <span className="font-medium"> 200 quick-service</span> locations and <span className="font-medium">100+ table-service</span> restaurants.
                            Disney Springs alone hosts <span className="font-medium">68 restaurants</span> as of 2023.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Location Breakdown</h3>
                        <div className="grid md:grid-cols-3 gap-4 mt-3">
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Theme Parks</h4>
                                <p>
                                    Magic Kingdom: ~30 dining locations<br />
                                    EPCOT: World Showcase restaurants and festival food booths<br />
                                    Hollywood Studios: Themed dining experiences<br />
                                    Animal Kingdom: Unique cultural cuisine
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Resort Hotels</h4>
                                <p>
                                    Value resorts: Large food courts<br />
                                    Moderate resorts: Food courts plus table-service<br />
                                    Deluxe resorts: Multiple dining venues including signature restaurants
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Disney Springs</h4>
                                <p>
                                    68 dining venues including celebrity chef restaurants, themed eateries, upscale dining, and various bars and quick-service spots.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Quick-Service vs Table-Service</h3>
                        <div className="flex gap-4 mt-3">
                            <div className="flex-1 border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Quick-Service (~200)</h4>
                                <p>
                                    Counter-service eateries where guests order at a counter, including park staples like Cosmic Ray&apos;s Starlight Café and resort food courts.
                                </p>
                            </div>
                            <div className="flex-1 border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Table-Service (100+)</h4>
                                <p>
                                    Sit-down establishments including buffets, character dining, signature restaurants, and family-style eateries.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Popular & Iconic Restaurants</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><span className="font-medium">Cinderella&apos;s Royal Table</span> (Magic Kingdom): Character dining inside Cinderella Castle</li>
                            <li><span className="font-medium">Be Our Guest</span> (Magic Kingdom): Beauty and the Beast-themed restaurant</li>
                            <li><span className="font-medium">Le Cellier</span> (EPCOT): Steakhouse in Canada pavilion</li>
                            <li><span className="font-medium">Oga&apos;s Cantina</span> (Hollywood Studios): Immersive Star Wars themed bar</li>
                            <li><span className="font-medium">&apos;Ohana</span> (Polynesian Resort): Hawaiian family-style feast</li>
                            <li><span className="font-medium">Chef Mickey&apos;s</span> (Contemporary Resort): Character buffet with Mickey and friends</li>
                            <li><span className="font-medium">Chef Art Smith&apos;s Homecomin&apos;</span> (Disney Springs): Southern comfort food</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Dining Capacity and Trends</h3>
                        <p>
                            With over 400 dining venues in total, WDW can serve an immense number of guests daily. Major quick-service spots like Cosmic Ray&apos;s
                            have ~550 seats and serve thousands of meals per day.
                        </p>
                        <p className="mt-2">
                            Recent trends include plant-based menu options at all locations, mobile ordering for most quick-service restaurants, and expanded
                            fine dining options like Victoria & Albert&apos;s (AAA Five-Diamond rated).
                        </p>
                    </div>
                </div>
            </section>

            <section id="attractions" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Ride and Attraction Data</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Attraction Count</h3>
                        <p>
                            Walt Disney World&apos;s four theme parks collectively feature <span className="font-medium">54 rides</span> as of 2025, along with dozens
                            of other attractions and shows.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Magic Kingdom</h4>
                                <p className="text-2xl font-semibold">20+</p>
                                <p className="text-xs">Major Rides</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">EPCOT</h4>
                                <p className="text-2xl font-semibold">~10</p>
                                <p className="text-xs">Major Rides</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Hollywood Studios</h4>
                                <p className="text-2xl font-semibold">~9</p>
                                <p className="text-xs">Major Rides</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Animal Kingdom</h4>
                                <p className="text-2xl font-semibold">~8</p>
                                <p className="text-xs">Major Rides</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Opening & Closure Dates</h3>
                        <p>
                            Many <span className="font-medium">opening-day rides</span> from 1971 still operate today, including Haunted Mansion and It&apos;s a Small World.
                            Notable retired attractions include:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>20,000 Leagues Under the Sea (1971–1994)</li>
                            <li>Mr. Toad&apos;s Wild Ride (1971–1998)</li>
                            <li>Horizons at EPCOT (1983–1999)</li>
                            <li>World of Motion at EPCOT (1982–1996)</li>
                            <li>Maelstrom in Norway (1988–2014)</li>
                            <li>Great Movie Ride (1989–2017)</li>
                            <li>Splash Mountain (1992–2023), being reimagined as Tiana&apos;s Bayou Adventure</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Types of Rides</h3>
                        <div className="grid md:grid-cols-3 gap-4 mt-3">
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Dark Rides</h4>
                                <p>Indoor rides with detailed scenes and animatronics (Pirates of the Caribbean, Haunted Mansion, Peter Pan&apos;s Flight)</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Thrill Rides</h4>
                                <p>Roller coasters (Space Mountain, Expedition Everest), drop rides (Tower of Terror), and simulators (Star Tours)</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Water Rides</h4>
                                <p>Log flumes and rapids rides (Splash Mountain, Kali River Rapids)</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Trackless Rides</h4>
                                <p>Modern attractions with free-roaming vehicles (Remy&apos;s Ratatouille Adventure, Rise of the Resistance)</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Shows & Entertainment</h4>
                                <p>Stage shows, 3D movies, and nighttime spectaculars</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Transportation & Interactive</h4>
                                <p>Railroad, PeopleMover, walkthrough experiences, and shooting galleries</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Ride Capacity & Throughput</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse mt-2">
                                <thead>
                                    <tr className="bg-accent">
                                        <th className="border p-2 text-left">Attraction</th>
                                        <th className="border p-2 text-left">Estimated Capacity</th>
                                        <th className="border p-2 text-left">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr className="bg-card">
                                        <td className="border p-2">Pirates of the Caribbean</td>
                                        <td className="border p-2">2,600 riders/hour</td>
                                        <td className="border p-2">Continuous loading boat ride</td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2">Haunted Mansion</td>
                                        <td className="border p-2">2,000+ riders/hour</td>
                                        <td className="border p-2">Omnimover system</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="border p-2">Carousel of Progress</td>
                                        <td className="border p-2">3,600 guests/hour</td>
                                        <td className="border p-2">Rotating theater with 240 guests every 5 minutes</td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2">Peter Pan&apos;s Flight</td>
                                        <td className="border p-2">800 guests/hour</td>
                                        <td className="border p-2">Low capacity, consistently long wait times</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="border p-2">TRON Lightcycle/Run</td>
                                        <td className="border p-2">1,680 riders/hour</td>
                                        <td className="border p-2">Newer high-capacity coaster</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Guest Flow and Wait Times</h3>
                        <p>
                            With <span className="font-medium">50,000+ visitors in a single park per day</span> on peak days, attraction lineup is engineered to distribute crowds.
                            &quot;People-eater&quot; attractions like Pirates, Haunted Mansion, and &quot;it&apos;s a small world&quot; (~2,400/hr) help absorb huge numbers of guests.
                        </p>
                        <p className="mt-2">
                            Popular rides can develop 2-3 hour waits on busy days. Disney manages this through Lightning Lane/Genie+ systems and by periodically increasing ride capacity.
                        </p>
                    </div>
                </div>
            </section>

            <section id="transportation" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Transportation Systems</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Monorail System</h3>
                        <p>
                            The iconic Disney monorail opened with the resort in 1971 and spans about <span className="font-medium">13.6 miles</span> of track, linking Magic Kingdom,
                            Epcot, and surrounding areas.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><span className="font-medium">Three monorail lines</span>: Resort Loop, Express Loop, and Epcot Line</li>
                            <li>Fleet of <span className="font-medium">12 Mark VI monorail trains</span> (6 cars per train) in service since 1990-91</li>
                            <li>Each train is ~203 feet long and carries up to <span className="font-medium">364–365 passengers</span></li>
                            <li>Transports about <span className="font-medium">150,000 guests</span> daily</li>
                            <li>Runs on 600-volt DC electric power with top speed around 40 mph</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Buses (Disney Transport)</h3>
                        <p>
                            Disney Transport operates a massive fleet of <span className="font-medium">490 buses</span>, the third largest fleet in Florida.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Primarily 40-foot Gillig low-floor buses with capacity of around 62 passengers</li>
                            <li>Routes connect every resort hotel to all theme parks, Disney Springs, and water parks</li>
                            <li>Service begins ~45 minutes before park opening and runs until ~1 hour after closing</li>
                            <li>Frequencies average every 20 minutes per route</li>
                            <li>Fleet is 64% larger than Orlando&apos;s municipal Lynx bus system</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Boats and Ferries</h3>
                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Magic Kingdom Ferries</h4>
                                <p>
                                    Three large double-decker ferry boats cross the Seven Seas Lagoon between the TTC and Magic Kingdom, each carrying about
                                    <span className="font-medium"> 600 guests</span> plus crew.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Resort Launches & Cruisers</h4>
                                <p>
                                    <span className="font-medium">6 small motor launches</span> (30-40 guests) and <span className="font-medium">4 larger motor cruisers</span> (120 guests)
                                    operating on colored flag routes connecting Magic Kingdom area resorts.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Friendship Boats</h4>
                                <p>
                                    <span className="font-medium">8 Friendship boats</span> (100 passengers each) shuttle guests between EPCOT&apos;s International Gateway,
                                    surrounding resorts, and Disney&apos;s Hollywood Studios.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Disney Springs Water Taxis</h4>
                                <p>
                                    <span className="font-medium">15 water taxis</span> (40 passengers each) connect Disney Springs to Port Orleans, Old Key West,
                                    and Saratoga Springs resorts via the Sassagoula River.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Disney Skyliner (Gondola System)</h3>
                        <p>
                            Opened in fall 2019, the Disney Skyliner is an aerial gondola system connecting two theme parks and multiple resorts.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Nearly <span className="font-medium">300 gondola cabins</span>, each holding up to <span className="font-medium">10 guests</span></li>
                            <li>Connects Caribbean Beach Resort (hub) to Hollywood Studios, EPCOT, and Pop Century/Art of Animation Resorts</li>
                            <li>Gondolas travel at ~11 mph with short transit times (5-12 minutes between destinations)</li>
                            <li>Theoretical capacity of <span className="font-medium">4,500 guests per hour</span> per direction</li>
                            <li>About half the cabins are wrapped with Disney character art</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Other Transportation</h3>
                        <p>
                            Additional transportation options include parking lot trams, Minnie Van service (Disney-operated Lyft vehicles),
                            and extensive behind-the-scenes maintenance and service vehicles.
                        </p>
                    </div>
                </div>
            </section>

            <section id="financial-metrics" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Financial Metrics</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Overall Revenues</h3>
                        <p>
                            Walt Disney World is the most financially significant theme park complex globally. Disney&apos;s Parks, Experiences and Products segment
                            achieved record revenues of <span className="font-medium">$32.5 billion in fiscal 2023</span>, a 16% increase from FY2022.
                        </p>
                        <p className="mt-2">
                            In 2019, Walt Disney World&apos;s four parks drew approximately <span className="font-medium">58.7 million visitors</span>. One analysis
                            estimates Disney World generates roughly <span className="font-medium">$35 million per day</span> in revenue during normal operation.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Per-Guest Spending</h3>
                        <p>
                            Disney tracks per capita guest spend, which has been rising steadily. In 2019, Disney reported that
                            <span className="font-medium"> per guest spending was up 7%</span> over the prior year.
                        </p>
                        <p className="mt-2">
                            Estimates suggest an average guest might spend <span className="font-medium">$150–$200 per day</span> in the parks.
                            A family of four could easily spend <span className="font-medium">$800+ in one day</span>.
                        </p>
                        <div className="mt-3">
                            <h4 className="font-bold">Ticket Price Evolution</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse mt-2">
                                    <thead>
                                        <tr className="bg-accent">
                                            <th className="border p-2 text-left">Year</th>
                                            <th className="border p-2 text-left">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr className="bg-card">
                                            <td className="border p-2">1971</td>
                                            <td className="border p-2">$3.50 (plus ride ticket books)</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-2">1985</td>
                                            <td className="border p-2">~$21</td>
                                        </tr>
                                        <tr className="bg-card">
                                            <td className="border p-2">2005</td>
                                            <td className="border p-2">~$59</td>
                                        </tr>
                                        <tr>
                                            <td className="border p-2">2024</td>
                                            <td className="border p-2">$109 to $189 (date-based)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Revenue Streams</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Park Admissions</h4>
                                <p className="text-xl font-semibold">30-40%</p>
                                <p className="text-xs">of Revenue</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Food & Beverage</h4>
                                <p className="text-xl font-semibold">15-20%</p>
                                <p className="text-xs">of Revenue</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Merchandise</h4>
                                <p className="text-xl font-semibold">15-20%</p>
                                <p className="text-xs">of Revenue</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <h4 className="font-bold">Hotels & Other</h4>
                                <p className="text-xl font-semibold">25-30%</p>
                                <p className="text-xs">of Revenue</p>
                            </div>
                        </div>
                        <p className="mt-3">
                            Hotel revenue from 30,000 Disney-owned rooms at ~$300/night average and 90% occupancy generates approximately
                            <span className="font-medium"> $8+ million per night</span>, or around $3 billion annually.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Operating Costs & Profits</h3>
                        <p>
                            During the COVID-19 closure, Disney reportedly lost <span className="font-medium">$20–$30 million per day</span> in lost revenue.
                            In normal times, Disney Parks segment had <span className="font-medium">~$7.9B operating profit on $32.5B revenue in FY2023</span>,
                            about 24% margin.
                        </p>
                        <p className="mt-2">
                            Walt Disney World&apos;s profit in a single day is estimated at $5-6 million or more after expenses.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Merchandise and Food Highlights</h3>
                        <p>
                            With tens of millions of guests annually, merchandise sales at WDW likely exceed $1.5 billion. The resort sells an estimated
                            <span className="font-medium"> 3.3 million Mickey-shaped ice cream bars</span> each year at ~$6 each.
                        </p>
                        <p className="mt-2">
                            Magic Kingdom&apos;s Starbucks location is among the highest-grossing Starbucks in the U.S., and special events like EPCOT&apos;s
                            International Food & Wine Festival drive significant additional F&B spending.
                        </p>
                    </div>
                </div>
            </section>

            <section id="staffing" className="mb-12">
                <h2 className="text-3xl font-bold mb-4 border-b pb-2">Staffing Numbers</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Total Cast Members</h3>
                        <p>
                            Walt Disney World employs approximately <span className="font-medium">77,000 Cast Members</span>, making it the
                            <span className="font-medium"> largest single-site employer in the United States</span>.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Job Role Breakdown</h3>
                        <div className="grid md:grid-cols-3 gap-4 mt-3">
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Attractions & Operations</h4>
                                <p>
                                    Ride operators, greeters, park management, parade control, transportation drivers, and more. Union local 362 alone represents
                                    ~10,000 in Attractions/Custodial/Vacation Planning.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Food & Merchandise</h4>
                                <p>
                                    Quick-service and table-service restaurant staff, chefs, and retail clerks across all parks, resorts, and Disney Springs.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Entertainment & Specialized</h4>
                                <p>
                                    Character performers, dancers, singers, technicians, and specialized teams like the ~2,500 Cast Members in Costuming who manage
                                    1.8 million costume pieces.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Maintenance & Engineering</h4>
                                <p>
                                    Mechanics, ride engineers, facilities upkeep, horticulture teams, and specialized trades like the 400 locksmiths and divers.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Hospitality</h4>
                                <p>
                                    Hotel front desk, housekeeping, bell services, and reservations staff managing the 30,000+ rooms across the property.
                                </p>
                            </div>
                            <div className="border rounded-lg p-4 bg-card">
                                <h4 className="font-bold mb-2">Administrative & Support</h4>
                                <p>
                                    Finance, marketing, human resources, security (~hundreds of staff), and Guest Relations teams working behind the scenes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Unions and Labor Relations</h3>
                        <p>
                            A large portion of WDW Cast Members are unionized under the <span className="font-medium">Service Trades Council Union (STCU)</span>,
                            a coalition of six unions representing about <span className="font-medium">45,000 workers</span>.
                        </p>
                        <p className="mt-2">
                            In 2023, a new union contract was ratified to increase the starting minimum wage from $15 to
                            <span className="font-medium"> $18 per hour</span>, reaching $20 by 2026. Current cast members received significant raises between
                            $5.50 and $8.60 hourly over the contract term.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2">Employment Trends</h3>
                        <p>
                            During the COVID-19 pandemic, Disney World <span className="font-medium">furloughed 43,000 Cast Members in 2020</span> when the parks closed.
                            By 2022-2023, Disney was actively hiring again as attendance rebounded.
                        </p>
                        <p className="mt-2">
                            The <span className="font-medium">Cultural Representative Program</span> brings individuals from various countries to work in Epcot&apos;s World Showcase,
                            and the Disney College Program hosts thousands of college students for semester-long internships.
                        </p>
                        <p className="mt-2">
                            Disney values long-tenured cast members, with many having worked there for decades — some even since opening day in 1971.
                        </p>
                    </div>
                </div>
            </section>

            <div className="text-sm text-muted-foreground mt-6 pt-4 border-t">
                <p>
                    Source information: Walt Disney World operational statistics and data drawn from official reports and credible analyses, including MagicGuides,
                    TouringPlans, DisneyFoodBlog, historical accounts, Disney earnings calls, and news releases.
                </p>
            </div>
        </div>
    )
}