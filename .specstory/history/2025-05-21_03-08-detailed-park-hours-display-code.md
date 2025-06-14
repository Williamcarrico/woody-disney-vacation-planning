<!-- Generated by SpecStory -->

# Detailed Park Hours Display Code (2025-05-20 22:08:19)

_**User**_

Your task is to create an extremely detailed, sophisticated and comperhensive components/parks/ParkHoursDisplay file code. 

---

_**Assistant**_



---

```diff
- 
+ "use client"
+ 
+ import { useState, useEffect } from "react"
+ import { format, parseISO, isToday, isTomorrow, isFuture, addDays } from "date-fns"
+ import { Badge } from "@/components/ui/badge"
+ import { Button } from "@/components/ui/button"
+ import { Card, CardContent } from "@/components/ui/card"
+ import { ScrollArea } from "@/components/ui/scroll-area"
+ import { Skeleton } from "@/components/ui/skeleton"
+ import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
+ import {
+   Tooltip,
+   TooltipContent,
+   TooltipProvider,
+   TooltipTrigger,
+ } from "@/components/ui/tooltip"
+ import {
+   Clock,
+   Calendar,
+   Info,
+   Sun,
+   Moon,
+   Sparkles,
+   ArrowRight,
+   Check,
+   Activity
+ } from "lucide-react"
+ 
+ // Types
+ interface ParkHours {
+   parkId: string
+   parkName: string
+   date: string
+   openingTime: string
+   closingTime: string
+   isSpecialEvent: boolean
+   specialEventName?: string
+   specialEventTime?: string
+   earlyEntry?: {
+     isAvailable: boolean
+     startTime: string
+   }
+   extendedEvening?: {
+     isAvailable: boolean
+     endTime: string
+   }
+ }
+ 
+ interface ParkHoursDisplayProps {
+   /** Show a more compact version of the component */
+   compact?: boolean
+   /** Show hours for a specific date (defaults to today) */
+   date?: Date
+   /** Number of days to show when not in compact mode */
+   daysToShow?: number
+   /** Filter to show a specific park ID */
+   parkId?: string
+   /** ClassName for styling */
+   className?: string
+ }
+ 
+ // Mock data - In a real implementation, this would come from an API
+ const MOCK_PARK_HOURS: ParkHours[] = [
+   {
+     parkId: "mk",
+     parkName: "Magic Kingdom",
+     date: new Date().toISOString(),
+     openingTime: "09:00",
+     closingTime: "21:00",
+     isSpecialEvent: false,
+     earlyEntry: {
+       isAvailable: true,
+       startTime: "08:30"
+     }
+   },
+   {
+     parkId: "ep",
+     parkName: "EPCOT",
+     date: new Date().toISOString(),
+     openingTime: "10:00",
+     closingTime: "21:00",
+     isSpecialEvent: true,
+     specialEventName: "Harmonious",
+     specialEventTime: "21:00",
+     earlyEntry: {
+       isAvailable: true,
+       startTime: "09:30"
+     }
+   },
+   {
+     parkId: "hs",
+     parkName: "Hollywood Studios",
+     date: new Date().toISOString(),
+     openingTime: "09:00",
+     closingTime: "20:00",
+     isSpecialEvent: false,
+     extendedEvening: {
+       isAvailable: true,
+       endTime: "22:00"
+     }
+   },
+   {
+     parkId: "ak",
+     parkName: "Animal Kingdom",
+     date: new Date().toISOString(),
+     openingTime: "08:00",
+     closingTime: "19:00",
+     isSpecialEvent: false,
+     earlyEntry: {
+       isAvailable: true,
+       startTime: "07:30"
+     }
+   },
+ ]
+ 
+ // Park icons/images mapping
+ const PARK_ICONS: Record<string, string> = {
+   mk: "/images/parks/magic-kingdom-icon.png",
+   ep: "/images/parks/epcot-icon.png",
+   hs: "/images/parks/hollywood-studios-icon.png",
+   ak: "/images/parks/animal-kingdom-icon.png"
+ }
+ 
+ // Helper function to format time with AM/PM
+ function formatTime(time: string): string {
+   const [hours, minutes] = time.split(":")
+   const hour = parseInt(hours)
+   const ampm = hour >= 12 ? "PM" : "AM"
+   const formattedHour = hour % 12 || 12
+   return `${formattedHour}:${minutes} ${ampm}`
+ }
+ 
+ // Helper function to format the date label
+ function formatDateLabel(date: Date): string {
+   if (isToday(date)) return "Today"
+   if (isTomorrow(date)) return "Tomorrow"
+   return format(date, "EEE, MMM d")
+ }
+ 
+ export default function ParkHoursDisplay({
+   compact = false,
+   date = new Date(),
+   daysToShow = 5,
+   parkId,
+   className,
+ }: ParkHoursDisplayProps) {
+   const [loading, setLoading] = useState(true)
+   const [selectedDate, setSelectedDate] = useState(date)
+   const [parkHours, setParkHours] = useState<ParkHours[]>([])
+   const [activeTab, setActiveTab] = useState("all")
+ 
+   // In a real implementation, this would fetch data from an API
+   useEffect(() => {
+     const fetchParkHours = async () => {
+       setLoading(true)
+       try {
+         // Simulate API call
+         await new Promise(resolve => setTimeout(resolve, 800))
+ 
+         // Generate mock data for the next few days
+         const mockData: ParkHours[] = []
+ 
+         for (let i = 0; i < daysToShow; i++) {
+           const currentDate = addDays(new Date(), i)
+ 
+           MOCK_PARK_HOURS.forEach(park => {
+             mockData.push({
+               ...park,
+               date: currentDate.toISOString(),
+               // Add some variety to hours for different dates
+               openingTime: i % 2 === 0 ? park.openingTime : `0${parseInt(park.openingTime.split(':')[0]) + 1}:00`,
+               closingTime: i % 3 === 0 ? park.closingTime : `${parseInt(park.closingTime.split(':')[0]) + 1}:00`,
+               isSpecialEvent: i % 2 === 0 && park.isSpecialEvent,
+             })
+           })
+         }
+ 
+         setParkHours(mockData)
+       } catch (error) {
+         console.error("Failed to fetch park hours:", error)
+       } finally {
+         setLoading(false)
+       }
+     }
+ 
+     fetchParkHours()
+   }, [daysToShow])
+ 
+   // Filter hours based on selected date and parkId
+   const filteredHours = parkHours.filter(hours => {
+     const hoursDate = parseISO(hours.date)
+     const dateMatch = isToday(hoursDate) && isToday(selectedDate) ||
+                      format(hoursDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
+ 
+     if (parkId) {
+       return dateMatch && hours.parkId === parkId
+     }
+ 
+     return dateMatch
+   })
+ 
+   // Filter hours based on the active tab
+   const tabFilteredHours = activeTab === "all"
+     ? filteredHours
+     : filteredHours.filter(hours => hours.parkId === activeTab)
+ 
+   if (loading) {
+     return compact ? <CompactSkeleton /> : <FullSkeleton daysToShow={daysToShow} />
+   }
+ 
+   return compact ? (
+     <div className={className}>
+       <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
+         {filteredHours.map((hours) => (
+           <CompactParkHoursCard key={hours.parkId} hours={hours} />
+         ))}
+       </div>
+     </div>
+   ) : (
+     <div className={className}>
+       <div className="flex flex-col space-y-4">
+         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
+           <div className="flex items-center space-x-2">
+             <Calendar className="h-4 w-4 text-muted-foreground" />
+             <h3 className="text-lg font-medium">
+               Park Hours for {formatDateLabel(selectedDate)}
+             </h3>
+           </div>
+ 
+           <div className="flex space-x-2 w-full sm:w-auto">
+             <TooltipProvider>
+               <Tooltip>
+                 <TooltipTrigger asChild>
+                   <Button
+                     variant="outline"
+                     size="sm"
+                     onClick={() => setSelectedDate(new Date())}
+                     disabled={isToday(selectedDate)}
+                   >
+                     Today
+                   </Button>
+                 </TooltipTrigger>
+                 <TooltipContent>
+                   <p>View today&apos;s park hours</p>
+                 </TooltipContent>
+               </Tooltip>
+             </TooltipProvider>
+ 
+             <TooltipProvider>
+               <Tooltip>
+                 <TooltipTrigger asChild>
+                   <Button
+                     variant="outline"
+                     size="sm"
+                     onClick={() => setSelectedDate(addDays(new Date(), 1))}
+                     disabled={isTomorrow(selectedDate)}
+                   >
+                     Tomorrow
+                   </Button>
+                 </TooltipTrigger>
+                 <TooltipContent>
+                   <p>View tomorrow&apos;s park hours</p>
+                 </TooltipContent>
+               </Tooltip>
+             </TooltipProvider>
+ 
+             <TooltipProvider>
+               <Tooltip>
+                 <TooltipTrigger asChild>
+                   <Button
+                     variant="outline"
+                     size="sm"
+                     onClick={() => {
+                       if (isFuture(selectedDate) && !isToday(selectedDate)) {
+                         setSelectedDate(addDays(selectedDate, 1))
+                       } else {
+                         setSelectedDate(addDays(new Date(), 2))
+                       }
+                     }}
+                   >
+                     Next Day
+                   </Button>
+                 </TooltipTrigger>
+                 <TooltipContent>
+                   <p>View the next day&apos;s park hours</p>
+                 </TooltipContent>
+               </Tooltip>
+             </TooltipProvider>
+           </div>
+         </div>
+ 
+         <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
+           <TabsList className="mb-4 w-full grid grid-cols-5">
+             <TabsTrigger value="all">All Parks</TabsTrigger>
+             <TabsTrigger value="mk">Magic Kingdom</TabsTrigger>
+             <TabsTrigger value="ep">EPCOT</TabsTrigger>
+             <TabsTrigger value="hs">Hollywood Studios</TabsTrigger>
+             <TabsTrigger value="ak">Animal Kingdom</TabsTrigger>
+           </TabsList>
+ 
+           <TabsContent value={activeTab} className="m-0">
+             <ScrollArea className="max-h-[500px]">
+               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
+                 {tabFilteredHours.length > 0 ? (
+                   tabFilteredHours.map((hours) => (
+                     <DetailedParkHoursCard key={hours.parkId} hours={hours} />
+                   ))
+                 ) : (
+                   <div className="col-span-2 p-4 text-center text-muted-foreground">
+                     No hours available for this park on the selected date.
+                   </div>
+                 )}
+               </div>
+             </ScrollArea>
+           </TabsContent>
+         </Tabs>
+ 
+         <div className="flex items-center justify-between pt-2">
+           <div className="flex flex-wrap gap-2">
+             <div className="flex items-center text-xs text-muted-foreground">
+               <Sun className="h-3 w-3 mr-1" />
+               <span>Regular Hours</span>
+             </div>
+             <div className="flex items-center text-xs text-muted-foreground">
+               <Sparkles className="h-3 w-3 mr-1" />
+               <span>Special Event</span>
+             </div>
+             <div className="flex items-center text-xs text-muted-foreground">
+               <Moon className="h-3 w-3 mr-1" />
+               <span>Extended Hours</span>
+             </div>
+           </div>
+ 
+           <TooltipProvider>
+             <Tooltip>
+               <TooltipTrigger asChild>
+                 <Button variant="ghost" size="icon" className="rounded-full">
+                   <Info className="h-4 w-4" />
+                   <span className="sr-only">Information</span>
+                 </Button>
+               </TooltipTrigger>
+               <TooltipContent side="left">
+                 <p className="max-w-xs text-xs">
+                   Park hours are subject to change. Early entry is available for Disney resort guests.
+                   Extended evening hours are for deluxe resort guests only.
+                 </p>
+               </TooltipContent>
+             </Tooltip>
+           </TooltipProvider>
+         </div>
+       </div>
+     </div>
+   )
+ }
+ 
+ // Compact park hours card for dashboard display
+ function CompactParkHoursCard({ hours }: { hours: ParkHours }) {
+   const { parkId, parkName, openingTime, closingTime, isSpecialEvent, specialEventName } = hours
+ 
+   return (
+     <Card className="overflow-hidden">
+       <CardContent className="p-3">
+         <div className="flex items-center space-x-2 mb-2">
+           <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
+             <img
+               src={PARK_ICONS[parkId] || '/images/parks/generic-park-icon.png'}
+               alt={parkName}
+               className="h-5 w-5 object-contain"
+             />
+           </div>
+           <div className="text-sm font-medium truncate">{parkName}</div>
+         </div>
+ 
+         <div className="flex items-center space-x-1">
+           <Clock className="h-3 w-3 text-muted-foreground" />
+           <span className="text-xs">
+             {formatTime(openingTime)} - {formatTime(closingTime)}
+           </span>
+         </div>
+ 
+         {isSpecialEvent && specialEventName && (
+           <div className="mt-1">
+             <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5">
+               <Sparkles className="h-2 w-2 mr-1" />
+               {specialEventName}
+             </Badge>
+           </div>
+         )}
+       </CardContent>
+     </Card>
+   )
+ }
+ 
+ // Detailed park hours card with all information
+ function DetailedParkHoursCard({ hours }: { hours: ParkHours }) {
+   const {
+     parkId,
+     parkName,
+     openingTime,
+     closingTime,
+     isSpecialEvent,
+     specialEventName,
+     specialEventTime,
+     earlyEntry,
+     extendedEvening
+   } = hours
+ 
+   return (
+     <Card>
+       <CardContent className="p-4">
+         <div className="flex justify-between items-start mb-3">
+           <div className="flex items-center">
+             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
+               <img
+                 src={PARK_ICONS[parkId] || '/images/parks/generic-park-icon.png'}
+                 alt={parkName}
+                 className="h-8 w-8 object-contain"
+               />
+             </div>
+             <div>
+               <h4 className="font-medium">{parkName}</h4>
+               <div className="flex items-center text-sm text-muted-foreground">
+                 <Clock className="h-3 w-3 mr-1" />
+                 <span>
+                   {formatTime(openingTime)} - {formatTime(closingTime)}
+                 </span>
+               </div>
+             </div>
+           </div>
+ 
+           {isSpecialEvent && (
+             <Badge className="bg-primary/10 text-primary border-primary/20">
+               <Sparkles className="h-3 w-3 mr-1" />
+               Special Event
+             </Badge>
+           )}
+         </div>
+ 
+         <div className="space-y-2 text-sm">
+           {earlyEntry?.isAvailable && (
+             <div className="flex items-center justify-between pb-1 border-b border-dashed border-muted">
+               <div className="flex items-center">
+                 <Sun className="h-3 w-3 mr-2 text-amber-500" />
+                 <span>Early Entry</span>
+               </div>
+               <div className="flex items-center">
+                 <span>{formatTime(earlyEntry.startTime)}</span>
+                 <ArrowRight className="h-3 w-3 mx-1" />
+                 <span>{formatTime(openingTime)}</span>
+               </div>
+             </div>
+           )}
+ 
+           <div className="flex items-center justify-between pb-1 border-b border-dashed border-muted">
+             <div className="flex items-center">
+               <Sun className="h-3 w-3 mr-2 text-amber-500" />
+               <span>Regular Hours</span>
+             </div>
+             <div className="flex items-center">
+               <span>{formatTime(openingTime)}</span>
+               <ArrowRight className="h-3 w-3 mx-1" />
+               <span>{formatTime(closingTime)}</span>
+             </div>
+           </div>
+ 
+           {extendedEvening?.isAvailable && (
+             <div className="flex items-center justify-between pb-1 border-b border-dashed border-muted">
+               <div className="flex items-center">
+                 <Moon className="h-3 w-3 mr-2 text-indigo-400" />
+                 <span>Extended Evening</span>
+               </div>
+               <div className="flex items-center">
+                 <span>{formatTime(closingTime)}</span>
+                 <ArrowRight className="h-3 w-3 mx-1" />
+                 <span>{formatTime(extendedEvening.endTime)}</span>
+               </div>
+             </div>
+           )}
+ 
+           {isSpecialEvent && specialEventName && specialEventTime && (
+             <div className="flex items-center justify-between pb-1 border-b border-dashed border-muted">
+               <div className="flex items-center">
+                 <Sparkles className="h-3 w-3 mr-2 text-purple-400" />
+                 <span>{specialEventName}</span>
+               </div>
+               <div>
+                 <span>{formatTime(specialEventTime)}</span>
+               </div>
+             </div>
+           )}
+         </div>
+ 
+         <div className="mt-3 pt-2 flex flex-wrap gap-2">
+           <TooltipProvider>
+             <Tooltip>
+               <TooltipTrigger asChild>
+                 <Badge variant="outline" className="text-xs bg-green-50">
+                   <Check className="h-3 w-3 mr-1 text-green-500" />
+                   Dining Available
+                 </Badge>
+               </TooltipTrigger>
+               <TooltipContent>
+                 <p className="text-xs">Dining reservations available for this date</p>
+               </TooltipContent>
+             </Tooltip>
+           </TooltipProvider>
+ 
+           <TooltipProvider>
+             <Tooltip>
+               <TooltipTrigger asChild>
+                 <Badge variant="outline" className="text-xs bg-blue-50">
+                   <Activity className="h-3 w-3 mr-1 text-blue-500" />
+                   Low Crowds
+                 </Badge>
+               </TooltipTrigger>
+               <TooltipContent>
+                 <p className="text-xs">Predicted crowd levels are lower than average</p>
+               </TooltipContent>
+             </Tooltip>
+           </TooltipProvider>
+         </div>
+       </CardContent>
+     </Card>
+   )
+ }
+ 
+ // Skeleton loaders
+ function CompactSkeleton() {
+   return (
+     <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
+       {[...Array(4)].map((_, i) => (
+         <Card key={i} className="overflow-hidden">
+           <CardContent className="p-3">
+             <div className="flex items-center space-x-2 mb-2">
+               <Skeleton className="h-6 w-6 rounded-full" />
+               <Skeleton className="h-4 w-24" />
+             </div>
+             <Skeleton className="h-3 w-full" />
+             <div className="mt-1">
+               <Skeleton className="h-4 w-16" />
+             </div>
+           </CardContent>
+         </Card>
+       ))}
+     </div>
+   )
+ }
+ 
+ function FullSkeleton({ daysToShow }: { daysToShow: number }) {
+   return (
+     <div className="space-y-4">
+       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
+         <Skeleton className="h-6 w-48" />
+         <div className="flex space-x-2 w-full sm:w-auto">
+           <Skeleton className="h-9 w-20" />
+           <Skeleton className="h-9 w-20" />
+           <Skeleton className="h-9 w-20" />
+         </div>
+       </div>
+ 
+       <Skeleton className="h-10 w-full" />
+ 
+       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
+         {[...Array(4)].map((_, i) => (
+           <Card key={i}>
+             <CardContent className="p-4">
+               <div className="flex justify-between items-start mb-3">
+                 <div className="flex items-center">
+                   <Skeleton className="h-10 w-10 rounded-full mr-3" />
+                   <div>
+                     <Skeleton className="h-5 w-32 mb-1" />
+                     <Skeleton className="h-4 w-24" />
+                   </div>
+                 </div>
+                 <Skeleton className="h-6 w-24" />
+               </div>
+ 
+               <div className="space-y-2">
+                 <Skeleton className="h-4 w-full" />
+                 <Skeleton className="h-4 w-full" />
+                 <Skeleton className="h-4 w-full" />
+               </div>
+ 
+               <div className="mt-3 pt-2 flex gap-2">
+                 <Skeleton className="h-6 w-28" />
+                 <Skeleton className="h-6 w-28" />
+               </div>
+             </CardContent>
+           </Card>
+         ))}
+       </div>
+     </div>
+   )
+ }
```

---

I've created a comprehensive ParkHoursDisplay component that shows operating hours for Disney parks. This component includes:

1. Both compact and detailed display modes
2. Mock data with realistic park information
3. Date selection with today/tomorrow/next day navigation
4. Park filtering via tabs
5. Special events and extended hours display
6. Proper loading states with skeletons
7. Responsive design for various screen sizes

The component has these key features:

- **Compact mode** for dashboard integration showing basic park hours
- **Full view** with detailed information about:
  - Regular operating hours
  - Early entry for resort guests
  - Extended evening hours
  - Special events like fireworks
- **Date selection** to view hours for different days
- **Park filtering** to focus on specific parks
- **Tooltips** providing additional context
- **Responsive design** that adapts to different screen sizes
- **Loading skeletons** for a smooth user experience

The component uses mock data but is structured to easily integrate with a real API endpoint. It handles different operating schedules, early entry options for resort guests, extended evening hours for deluxe resort guests, and special events.

---

