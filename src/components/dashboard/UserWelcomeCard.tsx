"use client";

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Plus } from 'lucide-react';
import { Vacation } from '@/lib/firebase/vacations';

interface UserWelcomeCardProps {
    userName: string;
    upcomingVacation?: Vacation;
}

const UserWelcomeCard = memo(function UserWelcomeCard({
    userName,
    upcomingVacation,
}: Readonly<UserWelcomeCardProps>) {
    const [greeting, setGreeting] = useState('Hello');
    const [currentTime, setCurrentTime] = useState<string>('--:--');
    const [isClient, setIsClient] = useState(false);

    // Update greeting based on time of day
    useEffect(() => {
        // Set client flag
        setIsClient(true);

        const updateGreeting = () => {
            const hour = new Date().getHours();
            let newGreeting = '';

            if (hour < 12) {
                newGreeting = 'Good morning';
            } else if (hour < 18) {
                newGreeting = 'Good afternoon';
            } else {
                newGreeting = 'Good evening';
            }

            setGreeting(newGreeting);
        };

        // Update current time
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };

        // Initial update
        updateGreeting();
        updateTime();

        // Update time every minute
        const timeInterval = setInterval(updateTime, 60000);

        // Update greeting every hour
        const greetingInterval = setInterval(updateGreeting, 3600000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(greetingInterval);
        };
    }, []);

    // Memoized vacation calculations
    const vacationInfo = useMemo(() => {
        if (!upcomingVacation) return null;
        
        const startDate = upcomingVacation.startDate.toDate();
        const endDate = upcomingVacation.endDate.toDate();
        const daysUntil = differenceInDays(startDate, new Date());
        
        return {
            dateRange: `${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`,
            daysUntil
        };
    }, [upcomingVacation]);

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none shadow-md">
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-bold">{greeting}, {userName}!</CardTitle>
                        <CardDescription className="text-base mt-1">
                            Welcome to your Disney Vacation Planner dashboard. {isClient ? currentTime : '--:--'}
                        </CardDescription>
                    </div>

                    {!upcomingVacation && (
                        <Button size="sm" className="w-full md:w-auto" asChild>
                            <Link href="/vacations/new">
                                <Plus className="h-4 w-4 mr-2" />
                                Plan New Vacation
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {upcomingVacation ? (
                    <div className="bg-white/70 rounded-lg p-4 mt-2">
                        <div className="flex items-start">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Your Disney World vacation is coming up!</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {vacationInfo?.dateRange}
                                    {' · '}
                                    {vacationInfo?.daysUntil} days to go!
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button size="sm" asChild>
                                <Link href={`/vacations/${upcomingVacation.id}`}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Vacation
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/planning/itinerary?vacationId=${upcomingVacation.id}`}>
                                    Plan Itinerary
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/group/chat?vacationId=${upcomingVacation.id}`}>
                                    Group Chat
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/70 rounded-lg p-4 mt-2">
                        <div className="text-center py-4">
                            <h3 className="font-medium mb-2">No upcoming vacations</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Start planning your magical Disney World vacation today!
                            </p>
                            <Button asChild>
                                <Link href="/vacations/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Plan New Vacation
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
})

export { UserWelcomeCard }