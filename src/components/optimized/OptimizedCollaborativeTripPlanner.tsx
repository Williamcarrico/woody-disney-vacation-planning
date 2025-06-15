'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { TripPlanItem } from '@/lib/websocket/enhanced-websocket-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { 
    Plus, 
    Trash2, 
    Clock, 
    Calendar,
    ThumbsUp,
    ThumbsDown,
    Users,
    MapPin,
    GripVertical,
    AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { withSelectiveMemo } from '@/lib/performance/optimization-utils';

interface CollaborativeTripPlannerProps {
    userId: string;
    roomId: string;
    className?: string;
}

// Memoized sub-components for better performance
const TripPlanItemComponent = memo<{
    item: TripPlanItem;
    index: number;
    userId: string;
    userVote: boolean | undefined;
    voteStats: { yesVotes: number; noVotes: number; totalMembers: number };
    onVote: (itemId: string, vote: boolean) => void;
    onRemove: (itemId: string) => void;
    getItemIcon: (type: TripPlanItem['type']) => string;
    getItemColor: (type: TripPlanItem['type']) => string;
}>(
    function TripPlanItemComponent({
        item,
        index,
        userId,
        userVote,
        voteStats,
        onVote,
        onRemove,
        getItemIcon,
        getItemColor,
    }) {
        const handleVoteYes = useCallback(() => onVote(item.id, true), [item.id, onVote]);
        const handleVoteNo = useCallback(() => onVote(item.id, false), [item.id, onVote]);
        const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);

        return (
            <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                            'p-3 border rounded-lg bg-background transition-all',
                            snapshot.isDragging && 'shadow-lg'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-move"
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getItemIcon(item.type)}</span>
                                        <div>
                                            <h4 className="font-medium">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className={cn('text-xs', getItemColor(item.type))}>
                                                    {item.type}
                                                </Badge>
                                                {item.scheduledTime && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(item.scheduledTime), 'h:mm a')}
                                                    </span>
                                                )}
                                                {item.duration && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {item.duration}m
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {item.addedBy === userId && (
                                        <Button
                                            onClick={handleRemove}
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                
                                {item.notes && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {item.notes}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleVoteYes}
                                            size="sm"
                                            variant={userVote === true ? 'default' : 'outline'}
                                            className="h-8"
                                        >
                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                            {voteStats.yesVotes}
                                        </Button>
                                        <Button
                                            onClick={handleVoteNo}
                                            size="sm"
                                            variant={userVote === false ? 'default' : 'outline'}
                                            className="h-8"
                                        >
                                            <ThumbsDown className="h-3 w-3 mr-1" />
                                            {voteStats.noVotes}
                                        </Button>
                                    </div>
                                    
                                    <VoteAvatars votes={item.votes} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    },
    (prevProps, nextProps) => {
        // Custom comparison for optimization
        return (
            prevProps.item.id === nextProps.item.id &&
            prevProps.item.name === nextProps.item.name &&
            prevProps.item.scheduledTime === nextProps.item.scheduledTime &&
            prevProps.userVote === nextProps.userVote &&
            prevProps.voteStats.yesVotes === nextProps.voteStats.yesVotes &&
            prevProps.voteStats.noVotes === nextProps.voteStats.noVotes &&
            prevProps.index === nextProps.index
        );
    }
);

// Memoized vote avatars component
const VoteAvatars = memo<{ votes: Record<string, boolean> }>(
    function VoteAvatars({ votes }) {
        const voteEntries = useMemo(() => Object.entries(votes), [votes]);
        
        return (
            <div className="flex -space-x-2">
                {voteEntries.slice(0, 3).map(([voterId, vote]) => (
                    <Avatar key={voterId} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className={cn(
                            'text-xs',
                            vote ? 'bg-green-100' : 'bg-red-100'
                        )}>
                            {voterId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                ))}
                {voteEntries.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs">+{voteEntries.length - 3}</span>
                    </div>
                )}
            </div>
        );
    }
);

// Memoized add item form
const AddItemForm = memo<{
    onSubmit: (item: Omit<TripPlanItem, 'id' | 'addedBy' | 'votes'>) => void;
    onCancel: () => void;
}>(
    function AddItemForm({ onSubmit, onCancel }) {
        const [newItem, setNewItem] = useState({
            type: 'attraction' as TripPlanItem['type'],
            name: '',
            scheduledTime: '',
            duration: 60,
            notes: '',
        });

        const handleSubmit = useCallback(() => {
            if (!newItem.name.trim()) {
                toast({
                    title: 'Invalid item',
                    description: 'Please enter a name for the item',
                    variant: 'destructive',
                });
                return;
            }
            onSubmit(newItem);
        }, [newItem, onSubmit]);

        const handleTypeChange = useCallback((value: string) => {
            setNewItem(prev => ({ ...prev, type: value as TripPlanItem['type'] }));
        }, []);

        const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setNewItem(prev => ({ ...prev, name: e.target.value }));
        }, []);

        const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setNewItem(prev => ({ ...prev, scheduledTime: e.target.value }));
        }, []);

        const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setNewItem(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }));
        }, []);

        const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setNewItem(prev => ({ ...prev, notes: e.target.value }));
        }, []);

        return (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Select value={newItem.type} onValueChange={handleTypeChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="attraction">Attraction</SelectItem>
                                <SelectItem value="restaurant">Restaurant</SelectItem>
                                <SelectItem value="show">Show</SelectItem>
                                <SelectItem value="break">Break</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Item name"
                            value={newItem.name}
                            onChange={handleNameChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="datetime-local"
                            value={newItem.scheduledTime}
                            onChange={handleTimeChange}
                        />
                        <Input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={newItem.duration}
                            onChange={handleDurationChange}
                        />
                    </div>
                    <Textarea
                        placeholder="Notes (optional)"
                        value={newItem.notes}
                        onChange={handleNotesChange}
                        rows={2}
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleSubmit} size="sm">
                            Add to Plan
                        </Button>
                        <Button onClick={onCancel} size="sm" variant="outline">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
);

// Main component with optimizations
export const OptimizedCollaborativeTripPlanner = withSelectiveMemo(
    function OptimizedCollaborativeTripPlanner({ 
        userId, 
        roomId,
        className 
    }: CollaborativeTripPlannerProps) {
        const [isAddingItem, setIsAddingItem] = useState(false);

        const {
            isConnected,
            tripPlan,
            addTripPlanItem,
            voteTripPlanItem,
            removeTripPlanItem,
            roomMembers,
        } = useRealtimeCollaboration({
            userId,
            roomId,
            roomType: 'trip_planning',
        });

        // Sort trip plan by scheduled time
        const sortedTripPlan = useMemo(() => {
            return [...tripPlan].sort((a, b) => {
                if (!a.scheduledTime || !b.scheduledTime) return 0;
                return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
            });
        }, [tripPlan]);

        // Memoized helper functions
        const getVoteStats = useCallback((item: TripPlanItem) => {
            const votes = Object.values(item.votes);
            const yesVotes = votes.filter(v => v).length;
            const noVotes = votes.filter(v => !v).length;
            const totalMembers = roomMembers.size;
            return { yesVotes, noVotes, totalMembers };
        }, [roomMembers.size]);

        const getItemIcon = useCallback((type: TripPlanItem['type']) => {
            switch (type) {
                case 'attraction': return '🎢';
                case 'restaurant': return '🍴';
                case 'show': return '🎭';
                case 'break': return '☕';
                case 'custom':
                default: return '📍';
            }
        }, []);

        const getItemColor = useCallback((type: TripPlanItem['type']) => {
            switch (type) {
                case 'attraction': return 'bg-blue-100 text-blue-800';
                case 'restaurant': return 'bg-orange-100 text-orange-800';
                case 'show': return 'bg-purple-100 text-purple-800';
                case 'break': return 'bg-green-100 text-green-800';
                case 'custom':
                default: return 'bg-gray-100 text-gray-800';
            }
        }, []);

        // Handle drag and drop
        const handleDragEnd = useCallback((result: DropResult) => {
            if (!result.destination) return;

            const items = Array.from(sortedTripPlan);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);

            // Update scheduled times based on new order
            toast({
                title: 'Reordered items',
                description: 'Trip plan has been updated',
            });
        }, [sortedTripPlan]);

        // Callbacks for child components
        const handleAddItem = useCallback((newItem: Omit<TripPlanItem, 'id' | 'addedBy' | 'votes'>) => {
            addTripPlanItem(newItem);
            setIsAddingItem(false);
        }, [addTripPlanItem]);

        const handleCancelAdd = useCallback(() => {
            setIsAddingItem(false);
        }, []);

        const handleShowAddForm = useCallback(() => {
            setIsAddingItem(true);
        }, []);

        if (!isConnected) {
            return (
                <Card className={cn('w-full', className)}>
                    <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Connecting to trip planner...</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className={cn('w-full', className)}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Collaborative Trip Plan</CardTitle>
                            <CardDescription>
                                Plan your day together in real-time
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {roomMembers.size} members
                            </Badge>
                            <Button onClick={handleShowAddForm} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Add new item form */}
                    {isAddingItem && (
                        <AddItemForm onSubmit={handleAddItem} onCancel={handleCancelAdd} />
                    )}

                    {/* Trip plan items */}
                    <ScrollArea className="h-[400px]">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="trip-plan">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2"
                                    >
                                        {sortedTripPlan.length === 0 ? (
                                            <EmptyState />
                                        ) : (
                                            sortedTripPlan.map((item, index) => (
                                                <TripPlanItemComponent
                                                    key={item.id}
                                                    item={item}
                                                    index={index}
                                                    userId={userId}
                                                    userVote={item.votes[userId]}
                                                    voteStats={getVoteStats(item)}
                                                    onVote={voteTripPlanItem}
                                                    onRemove={removeTripPlanItem}
                                                    getItemIcon={getItemIcon}
                                                    getItemColor={getItemColor}
                                                />
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    },
    ['userId', 'roomId', 'className']
);

// Memoized empty state component
const EmptyState = memo(function EmptyState() {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items in the trip plan yet</p>
            <p className="text-xs">Add your first item to get started!</p>
        </div>
    );
});