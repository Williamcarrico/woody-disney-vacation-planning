"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PieChart as PieChartIcon,
    DollarSign,
    CreditCard,
    PlusCircle,
    MinusCircle,
    Ticket,
    Hotel,
    Utensils,
    ShoppingBag,
    Car,
    Sparkles,
    PiggyBank,
    Plus,
    Edit,
    Trash2,
    AlertCircle,
    Loader2,
    CheckCircle,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

// Define budget category types
export type BudgetCategoryType =
    | 'tickets'
    | 'accommodation'
    | 'dining'
    | 'merchandise'
    | 'transportation'
    | 'events'
    | 'other';

// Define expense interfaces
export interface BudgetItem {
    id: string;
    categoryId: BudgetCategoryType;
    name: string;
    amount: number;
    date?: Date;
    isPaid: boolean;
    notes?: string;
}

export interface BudgetCategory {
    id: BudgetCategoryType;
    name: string;
    plannedAmount: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export interface Budget {
    id: string;
    vacationId: string;
    totalBudget: number;
    categories: BudgetCategory[];
    expenses: BudgetItem[];
    createdAt: Date;
    updatedAt: Date;
}

// Get category icon component
const getCategoryIcon = (categoryId: BudgetCategoryType) => {
    switch (categoryId) {
        case 'tickets': return Ticket;
        case 'accommodation': return Hotel;
        case 'dining': return Utensils;
        case 'merchandise': return ShoppingBag;
        case 'transportation': return Car;
        case 'events': return Sparkles;
        case 'other': return CreditCard;
        default: return CreditCard;
    }
};

// Get category style props
const getCategoryStyleProps = (color: string): React.CSSProperties => {
    return {
        "--category-color-bg": `${color}20`,
        "--category-color": color
    } as React.CSSProperties;
};

// Get progress width style props
const getProgressWidthStyle = (percent: number): React.CSSProperties => {
    return {
        "--progress-percent": `${percent}%`
    } as React.CSSProperties;
};

// Budget form schema
const budgetFormSchema = z.object({
    totalBudget: z.number().min(1, "Budget must be greater than zero"),
    categories: z.array(
        z.object({
            id: z.string(),
            plannedAmount: z.number().min(0, "Amount must be positive")
        })
    )
});

// Expense form schema
const expenseFormSchema = z.object({
    name: z.string().min(2, "Expense name is required"),
    amount: z.number().min(0.01, "Amount must be greater than zero"),
    categoryId: z.string(),
    date: z.date().optional(),
    isPaid: z.boolean(),
    notes: z.string().optional()
});

// Props for the budget tracker component
interface TripBudgetTrackerProps {
    vacationId: string;
    startDate: Date;
    endDate: Date;
    showSummary?: boolean;
    onUpdate?: (budget: Budget) => void;
}

export default function TripBudgetTracker({
    vacationId,
    startDate,
    endDate,
    showSummary = false,
    onUpdate
}: TripBudgetTrackerProps) {
    const [, setActiveTab] = useState('overview');
    const [addExpenseOpen, setAddExpenseOpen] = useState(false);
    const [editBudgetOpen, setEditBudgetOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<BudgetItem | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<BudgetCategoryType | 'all'>('all');
    const [showPaid, setShowPaid] = useState(true);

    const queryClient = useQueryClient();

    // Define default categories
    const defaultCategories: BudgetCategory[] = [
        {
            id: 'tickets',
            name: 'Park Tickets',
            plannedAmount: 0,
            icon: Ticket,
            color: '#10b981' // green-500
        },
        {
            id: 'accommodation',
            name: 'Hotels & Resorts',
            plannedAmount: 0,
            icon: Hotel,
            color: '#3b82f6' // blue-500
        },
        {
            id: 'dining',
            name: 'Dining & Food',
            plannedAmount: 0,
            icon: Utensils,
            color: '#f59e0b' // amber-500
        },
        {
            id: 'merchandise',
            name: 'Souvenirs & Merchandise',
            plannedAmount: 0,
            icon: ShoppingBag,
            color: '#8b5cf6' // violet-500
        },
        {
            id: 'transportation',
            name: 'Transportation',
            plannedAmount: 0,
            icon: Car,
            color: '#ef4444' // red-500
        },
        {
            id: 'events',
            name: 'Special Events',
            plannedAmount: 0,
            icon: Sparkles,
            color: '#ec4899' // pink-500
        },
        {
            id: 'other',
            name: 'Other Expenses',
            plannedAmount: 0,
            icon: CreditCard,
            color: '#6b7280' // gray-500
        }
    ];

    // Query to fetch budget data
    const {
        data: budget,
        isLoading,
        isError
    } = useQuery({
        queryKey: ['budget', vacationId],
        queryFn: async () => {
            const result = await fetchBudgetData(vacationId);

            // Instead of using onSuccess, handle the create logic here
            if (!result) {
                // Create a new budget if none exists
                const newBudget = await createBudgetMutation.mutateAsync({
                    vacationId,
                    totalBudget: 0,
                    categories: defaultCategories
                });
                return newBudget;
            }

            return result;
        }
    });

    // Mutation to create a new budget
    const createBudgetMutation = useMutation({
        mutationFn: async (data: { vacationId: string, totalBudget: number, categories: BudgetCategory[] }) => {
            // In a real app, this would send to an API
            const newBudget: Budget = {
                id: `budget-${Date.now()}`,
                vacationId: data.vacationId,
                totalBudget: data.totalBudget,
                categories: data.categories,
                expenses: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return Promise.resolve(newBudget);
        },
        onSuccess: (newBudget) => {
            queryClient.setQueryData(['budget', vacationId], newBudget);
            if (onUpdate) onUpdate(newBudget);
        }
    });

    // Mutation to update the budget
    const updateBudgetMutation = useMutation({
        mutationFn: (data: { totalBudget: number, categories: { id: string, plannedAmount: number }[] }) => {
            if (!budget) return Promise.reject(new Error('No budget exists'));

            // In a real app, this would send to an API
            const updatedBudget: Budget = {
                id: budget.id || '',
                vacationId: budget.vacationId || '',
                totalBudget: data.totalBudget,
                categories: budget.categories?.map(category => {
                    const updated = data.categories.find(c => c.id === category.id);
                    return updated
                        ? { ...category, plannedAmount: updated.plannedAmount }
                        : category;
                }) || [],
                expenses: budget.expenses || [],
                createdAt: budget.createdAt || new Date(),
                updatedAt: new Date()
            };
            return Promise.resolve(updatedBudget);
        },
        onSuccess: (updatedBudget) => {
            queryClient.setQueryData(['budget', vacationId], updatedBudget);
            if (onUpdate) onUpdate(updatedBudget);
            setEditBudgetOpen(false);
        }
    });

    // Mutation to add a new expense
    const addExpenseMutation = useMutation({
        mutationFn: (data: Omit<BudgetItem, 'id'>) => {
            if (!budget) return Promise.reject(new Error('No budget exists'));

            // In a real app, this would send to an API
            const newExpense: BudgetItem = {
                id: `expense-${Date.now()}`,
                ...data
            };

            const updatedBudget: Budget = {
                id: budget.id || '',
                vacationId: budget.vacationId || '',
                totalBudget: budget.totalBudget || 0,
                categories: budget.categories || [],
                expenses: [...(budget.expenses || []), newExpense],
                createdAt: budget.createdAt || new Date(),
                updatedAt: new Date()
            };

            return Promise.resolve(updatedBudget);
        },
        onSuccess: (updatedBudget) => {
            queryClient.setQueryData(['budget', vacationId], updatedBudget);
            if (onUpdate) onUpdate(updatedBudget);
            setAddExpenseOpen(false);
        }
    });

    // Mutation to update an expense
    const updateExpenseMutation = useMutation({
        mutationFn: (data: BudgetItem) => {
            if (!budget) return Promise.reject(new Error('No budget exists'));

            // In a real app, this would send to an API
            const updatedBudget: Budget = {
                ...budget,
                expenses: budget.expenses.map(expense =>
                    expense.id === data.id ? data : expense
                ),
                updatedAt: new Date()
            };

            return Promise.resolve(updatedBudget);
        },
        onSuccess: (updatedBudget) => {
            queryClient.setQueryData(['budget', vacationId], updatedBudget);
            if (onUpdate) onUpdate(updatedBudget);
            setEditingExpense(null);
            setAddExpenseOpen(false);
        }
    });

    // Mutation to delete an expense
    const deleteExpenseMutation = useMutation({
        mutationFn: (expenseId: string) => {
            if (!budget) return Promise.reject(new Error('No budget exists'));

            // In a real app, this would send to an API
            const updatedBudget: Budget = {
                ...budget,
                expenses: budget.expenses.filter(expense => expense.id !== expenseId),
                updatedAt: new Date()
            };

            return Promise.resolve(updatedBudget);
        },
        onSuccess: (updatedBudget) => {
            queryClient.setQueryData(['budget', vacationId], updatedBudget);
            if (onUpdate) onUpdate(updatedBudget);
        }
    });

    // Mutation to toggle the paid status of an expense
    const togglePaidStatusMutation = useMutation({
        mutationFn: (expenseId: string) => {
            if (!budget) return Promise.reject(new Error('No budget exists'));

            // In a real app, this would send to an API
            const updatedBudget: Budget = {
                ...budget,
                expenses: budget.expenses.map(expense =>
                    expense.id === expenseId
                        ? { ...expense, isPaid: !expense.isPaid }
                        : expense
                ),
                updatedAt: new Date()
            };

            return Promise.resolve(updatedBudget);
        },
        onSuccess: (updatedBudget) => {
            queryClient.setQueryData(['budget', vacationId], updatedBudget);
            if (onUpdate) onUpdate(updatedBudget);
        }
    });

    // Forms
    const budgetForm = useForm<z.infer<typeof budgetFormSchema>>({
        resolver: zodResolver(budgetFormSchema),
        defaultValues: {
            totalBudget: budget?.totalBudget || 0,
            categories: budget?.categories.map(category => ({
                id: category.id,
                plannedAmount: category.plannedAmount
            })) || []
        }
    });

    const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            name: '',
            amount: 0,
            categoryId: 'other',
            date: new Date(),
            isPaid: false,
            notes: ''
        }
    });

    // Update budget form when budget data changes
    useEffect(() => {
        if (budget) {
            budgetForm.reset({
                totalBudget: budget.totalBudget,
                categories: budget.categories.map(category => ({
                    id: category.id,
                    plannedAmount: category.plannedAmount
                }))
            });
        }
    }, [budget, budgetForm]);

    // Update expense form when editing an expense
    useEffect(() => {
        if (editingExpense) {
            expenseForm.reset({
                name: editingExpense.name,
                amount: editingExpense.amount,
                categoryId: editingExpense.categoryId,
                date: editingExpense.date || new Date(),
                isPaid: editingExpense.isPaid,
                notes: editingExpense.notes || ''
            });
            setAddExpenseOpen(true);
        } else {
            expenseForm.reset({
                name: '',
                amount: 0,
                categoryId: 'other',
                date: new Date(),
                isPaid: false,
                notes: ''
            });
        }
    }, [editingExpense, expenseForm]);

    // Handle budget form submission
    const onBudgetSubmit = (data: z.infer<typeof budgetFormSchema>) => {
        updateBudgetMutation.mutate(data);
    };

    // Handle expense form submission
    const onExpenseSubmit = (data: z.infer<typeof expenseFormSchema>) => {
        if (editingExpense) {
            updateExpenseMutation.mutate({
                ...data,
                id: editingExpense.id
            } as BudgetItem);
        } else {
            addExpenseMutation.mutate(data as Omit<BudgetItem, 'id'>);
        }
    };

    // Calculate budget statistics
    const budgetStats = useMemo(() => {
        if (!budget) return null;

        const totalPlanned = budget.categories?.reduce((sum: number, category: BudgetCategory) => sum + category.plannedAmount, 0) || 0;
        const totalSpent = budget.expenses?.reduce((sum: number, expense: BudgetItem) => sum + expense.amount, 0) || 0;
        const totalPaid = budget.expenses
            ?.filter((expense: BudgetItem) => expense.isPaid)
            .reduce((sum: number, expense: BudgetItem) => sum + expense.amount, 0) || 0;
        const totalUnpaid = totalSpent - totalPaid;
        const remainingBudget = budget.totalBudget - totalSpent;
        const budgetProgress = budget.totalBudget > 0
            ? Math.min(Math.round((totalSpent / budget.totalBudget) * 100), 100)
            : 0;

        // Get expenses by category
        const expensesByCategory = budget.categories?.map((category: BudgetCategory) => {
            const categoryExpenses = budget.expenses?.filter((expense: BudgetItem) => expense.categoryId === category.id) || [];
            const categoryTotal = categoryExpenses.reduce((sum: number, expense: BudgetItem) => sum + expense.amount, 0);
            const categoryPaid = categoryExpenses
                .filter((expense: BudgetItem) => expense.isPaid)
                .reduce((sum: number, expense: BudgetItem) => sum + expense.amount, 0);
            const categoryProgress = category.plannedAmount > 0
                ? Math.min(Math.round((categoryTotal / category.plannedAmount) * 100), 100)
                : categoryTotal > 0 ? 100 : 0;

            return {
                ...category,
                actual: categoryTotal,
                paid: categoryPaid,
                unpaid: categoryTotal - categoryPaid,
                progress: categoryProgress,
                remaining: category.plannedAmount - categoryTotal,
                overBudget: categoryTotal > category.plannedAmount
            };
        }) || [];

        return {
            totalBudget: budget.totalBudget || 0,
            totalPlanned,
            totalSpent,
            totalPaid,
            totalUnpaid,
            remainingBudget,
            budgetProgress,
            categorySummary: expensesByCategory
        };
    }, [budget]);

    // Filter expenses based on category and paid status
    const filteredExpenses = useMemo<BudgetItem[]>(() => {
        if (!budget) return [];

        return budget.expenses?.filter(expense => {
            if (categoryFilter !== 'all' && expense.categoryId !== categoryFilter) {
                return false;
            }

            if (!showPaid && expense.isPaid) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            // Sort by date and then by name
            if (a.date && b.date) {
                return b.date.getTime() - a.date.getTime();
            } else if (a.date) {
                return -1;
            } else if (b.date) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        }) || [];
    }, [budget, categoryFilter, showPaid]);

    // Generate chart data
    const pieChartData = useMemo(() => {
        if (!budgetStats) return [];

        return budgetStats.categorySummary
            .filter(category => category.actual > 0)
            .map(category => ({
                name: category.name,
                value: category.actual,
                color: category.color
            }));
    }, [budgetStats]);

    const barChartData = useMemo(() => {
        if (!budgetStats) return [];

        return budgetStats.categorySummary
            .filter(category => category.plannedAmount > 0 || category.actual > 0)
            .map(category => ({
                name: category.name,
                planned: category.plannedAmount,
                actual: category.actual
            }));
    }, [budgetStats]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Mock function to fetch budget data (would be replaced with actual API call)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function fetchBudgetData(vacationId: string): Promise<Budget | null> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // For demonstration, return null (to trigger budget creation) or a mock budget
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Loading budget data...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    There was an error loading your budget data. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    // If we want to show just a summary card
    if (showSummary) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                        <span>Vacation Budget</span>
                        {budgetStats && (
                            <Badge variant={budgetStats.remainingBudget < 0 ? "destructive" : "outline"}>
                                {formatCurrency(budgetStats.totalSpent)} of {formatCurrency(budgetStats.totalBudget)}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!budgetStats || budgetStats.totalBudget === 0 ? (
                        <div className="text-center py-2">
                            <p className="text-sm text-muted-foreground">No budget set yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setEditBudgetOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Set Budget
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span>Budget Progress</span>
                                <span>{budgetStats.budgetProgress}%</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full",
                                        budgetStats.remainingBudget < 0
                                            ? "bg-destructive"
                                            : budgetStats.budgetProgress > 80
                                                ? "bg-amber-500"
                                                : "bg-primary"
                                    )}
                                    style={{ width: `${budgetStats.budgetProgress}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="text-xs">
                                    <div className="text-muted-foreground">Spent</div>
                                    <div className="font-medium">{formatCurrency(budgetStats.totalSpent)}</div>
                                </div>
                                <div className="text-xs text-right">
                                    <div className="text-muted-foreground">Remaining</div>
                                    <div className={cn(
                                        "font-medium",
                                        budgetStats.remainingBudget < 0 ? "text-destructive" : ""
                                    )}>
                                        {formatCurrency(budgetStats.remainingBudget)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pt-0">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                        <a href={`/budget?vacationId=${vacationId}`}>
                            Manage Budget
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Trip Budget Tracker</CardTitle>
                            <CardDescription>
                                Plan and manage your Disney vacation expenses
                            </CardDescription>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditBudgetOpen(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Budget
                            </Button>
                            <Button size="sm" onClick={() => setAddExpenseOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-3 m-0 rounded-none">
                            <TabsTrigger value="overview">
                                <PieChartIcon className="h-4 w-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="categories">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Categories
                            </TabsTrigger>
                            <TabsTrigger value="expenses">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Expenses
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="p-4 pt-6">
                            {!budget || budget.totalBudget === 0 ? (
                                <div className="text-center py-8">
                                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Budget Set</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Start by setting a total budget for your Disney vacation
                                    </p>
                                    <Button onClick={() => setEditBudgetOpen(true)}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Set Budget
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Budget Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="bg-secondary/20">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {formatCurrency(budgetStats?.totalBudget || 0)}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    For {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-secondary/20">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {formatCurrency(budgetStats?.totalSpent || 0)}
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>Paid: {formatCurrency(budgetStats?.totalPaid || 0)}</span>
                                                    <span>Unpaid: {formatCurrency(budgetStats?.totalUnpaid || 0)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className={cn(
                                            "bg-secondary/20",
                                            budgetStats && budgetStats.remainingBudget < 0 && "border-red-300 bg-red-50"
                                        )}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Budget</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className={cn(
                                                    "text-2xl font-bold",
                                                    budgetStats && budgetStats.remainingBudget < 0 && "text-destructive"
                                                )}>
                                                    {formatCurrency(budgetStats?.remainingBudget || 0)}
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                                    <span>{budgetStats?.budgetProgress || 0}% of budget used</span>
                                                    {budgetStats && budgetStats.remainingBudget < 0 && (
                                                        <Badge variant="destructive" className="text-[10px]">Over Budget</Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Budget Progress */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Budget Progress</h3>
                                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all w-progress-bar",
                                                    budgetStats && budgetStats.remainingBudget < 0
                                                        ? "bg-destructive"
                                                        : budgetStats && budgetStats.budgetProgress > 80
                                                            ? "bg-amber-500"
                                                            : "bg-primary"
                                                )}
                                                style={getProgressWidthStyle(budgetStats?.budgetProgress || 0)}
                                            />
                                        </div>
                                    </div>

                                    {/* Charts */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Spending by Category Pie Chart */}
                                        <div className="h-72">
                                            <h3 className="text-sm font-medium mb-3">Spending by Category</h3>
                                            {pieChartData.length === 0 ? (
                                                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                                    No expenses added yet
                                                </div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={pieChartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            nameKey="name"
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            labelLine={false}
                                                        >
                                                            {pieChartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip
                                                            formatter={(value: number) => [formatCurrency(value), 'Amount']}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>

                                        {/* Planned vs. Actual Bar Chart */}
                                        <div className="h-72">
                                            <h3 className="text-sm font-medium mb-3">Planned vs. Actual</h3>
                                            {barChartData.length === 0 ? (
                                                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                                    No budget data available
                                                </div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={barChartData}
                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis
                                                            dataKey="name"
                                                            tick={{ fontSize: 12 }}
                                                            tickLine={false}
                                                            tickFormatter={(value) => value.split(' ')[0]}
                                                        />
                                                        <YAxis
                                                            tickFormatter={(value) => `$${value}`}
                                                            tick={{ fontSize: 12 }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <RechartsTooltip
                                                            formatter={(value: number) => [formatCurrency(value), 'Amount']}
                                                        />
                                                        <Legend />
                                                        <Bar dataKey="planned" name="Planned" fill="#3b82f6" />
                                                        <Bar dataKey="actual" name="Actual" fill="#f59e0b" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Expenses */}
                                    {budget.expenses.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-medium">Recent Expenses</h3>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0"
                                                    onClick={() => setActiveTab('expenses')}
                                                >
                                                    View All
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {budget.expenses
                                                    .sort((a, b) => b.date && a.date ? b.date.getTime() - a.date.getTime() : 0)
                                                    .slice(0, 3)
                                                    .map(expense => {
                                                        const category = budget.categories.find(c => c.id === expense.categoryId);
                                                        if (!category) return null;

                                                        const Icon = getCategoryIcon(expense.categoryId as BudgetCategoryType);

                                                        return (
                                                            <div
                                                                key={expense.id}
                                                                className="flex items-center justify-between p-2 rounded-md bg-secondary/20"
                                                            >
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3 category-bg category-text"
                                                                        style={getCategoryStyleProps(category.color)}
                                                                    >
                                                                        <Icon className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-sm">{expense.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {category.name} • {expense.date ? format(expense.date, 'MMM d') : 'No date'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={cn(
                                                                    "text-sm font-medium",
                                                                    expense.isPaid ? "" : "text-amber-600"
                                                                )}>
                                                                    {formatCurrency(expense.amount)}
                                                                    {!expense.isPaid && (
                                                                        <span className="text-xs ml-1 text-amber-600">(Unpaid)</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Budget Tips */}
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <PiggyBank className="h-4 w-4 text-blue-500" />
                                        <AlertTitle className="text-blue-700">Budget Tips</AlertTitle>
                                        <AlertDescription className="text-blue-600">
                                            <ul className="list-disc pl-5 text-sm">
                                                <li>Consider purchasing Disney Dining Plans for predictable food costs</li>
                                                <li>Set a souvenir budget for each family member before your trip</li>
                                                <li>Look for special package deals that include hotel, tickets, and dining</li>
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </TabsContent>

                        {/* Categories Tab */}
                        <TabsContent value="categories" className="p-4 pt-6">
                            {!budget || budget.totalBudget === 0 ? (
                                <div className="text-center py-8">
                                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Budget Categories</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Set up your budget to allocate amounts to categories
                                    </p>
                                    <Button onClick={() => setEditBudgetOpen(true)}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Set Budget
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Allocation Progress */}
                                    {budgetStats && (
                                        <div>
                                            <div className="flex justify-between items-center mb-1 text-sm">
                                                <span className="font-medium">Budget Allocation</span>
                                                <span className="text-muted-foreground">
                                                    {formatCurrency(budgetStats.totalPlanned)} of {formatCurrency(budgetStats.totalBudget)}
                                                    {' '}
                                                    ({Math.round((budgetStats.totalPlanned / budgetStats.totalBudget) * 100)}%)
                                                </span>
                                            </div>

                                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-primary h-full rounded-full w-progress-bar"
                                                    style={getProgressWidthStyle(Math.min(Math.round((budgetStats.totalPlanned / budgetStats.totalBudget) * 100), 100))}
                                                />
                                            </div>

                                            {budgetStats.totalPlanned !== budgetStats.totalBudget && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    {budgetStats.totalPlanned < budgetStats.totalBudget
                                                        ? `${formatCurrency(budgetStats.totalBudget - budgetStats.totalPlanned)} not allocated to categories`
                                                        : `${formatCurrency(budgetStats.totalPlanned - budgetStats.totalBudget)} over-allocated`
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Category List */}
                                    <div className="space-y-3">
                                        {budgetStats?.categorySummary.map((category) => {
                                            const Icon = getCategoryIcon(category.id as BudgetCategoryType);

                                            return (
                                                <div key={category.id} className="border rounded-lg overflow-hidden">
                                                    <div className="p-3 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 category-bg category-text"
                                                                style={getCategoryStyleProps(category.color)}
                                                            >
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{category.name}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {formatCurrency(category.plannedAmount)} budgeted
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="font-medium">
                                                                {formatCurrency(category.actual)}
                                                                {category.overBudget && category.plannedAmount > 0 && (
                                                                    <Badge variant="destructive" className="ml-2">Over Budget</Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {category.plannedAmount > 0
                                                                    ? `${category.progress}% of budget used`
                                                                    : 'No budget set'
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {category.plannedAmount > 0 && (
                                                        <div
                                                            className={cn(
                                                                "h-1 w-full",
                                                                category.overBudget ? "bg-red-100" : "bg-secondary"
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "h-full transition-all w-progress-bar",
                                                                    category.overBudget ? "bg-destructive" : "bg-primary"
                                                                )}
                                                                style={getProgressWidthStyle(category.progress)}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Expense Breakdown */}
                                                    <Accordion type="single" collapsible>
                                                        <AccordionItem value="details" className="border-0">
                                                            <AccordionTrigger className="py-2 px-3 text-sm">
                                                                Expense Details
                                                            </AccordionTrigger>
                                                            <AccordionContent className="px-3 pb-3">
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="bg-secondary/20 p-2 rounded">
                                                                            <div className="text-xs text-muted-foreground">Spent</div>
                                                                            <div className="font-medium">{formatCurrency(category.actual)}</div>
                                                                        </div>
                                                                        <div className="bg-secondary/20 p-2 rounded">
                                                                            <div className="text-xs text-muted-foreground">Remaining</div>
                                                                            <div className={cn(
                                                                                "font-medium",
                                                                                category.remaining < 0 ? "text-destructive" : ""
                                                                            )}>
                                                                                {formatCurrency(category.remaining)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="bg-secondary/20 p-2 rounded">
                                                                            <div className="text-xs text-muted-foreground">Paid</div>
                                                                            <div className="font-medium">{formatCurrency(category.paid)}</div>
                                                                        </div>
                                                                        <div className="bg-secondary/20 p-2 rounded">
                                                                            <div className="text-xs text-muted-foreground">Unpaid</div>
                                                                            <div className="font-medium">{formatCurrency(category.unpaid)}</div>
                                                                        </div>
                                                                    </div>

                                                                    {budget.expenses.filter(e => e.categoryId === category.id).length > 0 ? (
                                                                        <div className="pt-2">
                                                                            <div className="text-xs text-muted-foreground mb-2">Recent Expenses</div>
                                                                            <div className="space-y-1">
                                                                                {budget.expenses
                                                                                    .filter(e => e.categoryId === category.id)
                                                                                    .sort((a, b) => b.date && a.date ? b.date.getTime() - a.date.getTime() : 0)
                                                                                    .slice(0, 3)
                                                                                    .map(expense => (
                                                                                        <div
                                                                                            key={expense.id}
                                                                                            className="flex justify-between items-center p-1.5 rounded text-xs bg-secondary/10"
                                                                                        >
                                                                                            <div className="flex items-center">
                                                                                                <div className={expense.isPaid ? "text-green-500" : "text-amber-500"}>
                                                                                                    {expense.isPaid ? (
                                                                                                        <CheckCircle className="h-3 w-3 mr-1.5" />
                                                                                                    ) : (
                                                                                                        <Clock className="h-3 w-3 mr-1.5" />
                                                                                                    )}
                                                                                                </div>
                                                                                                <span className="truncate max-w-[120px]">{expense.name}</span>
                                                                                            </div>
                                                                                            <span>{formatCurrency(expense.amount)}</span>
                                                                                        </div>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-xs text-muted-foreground pt-2">
                                                                            No expenses in this category
                                                                        </div>
                                                                    )}

                                                                    <div className="pt-1">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="w-full"
                                                                            onClick={() => {
                                                                                expenseForm.setValue('categoryId', category.id);
                                                                                setAddExpenseOpen(true);
                                                                            }}
                                                                        >
                                                                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                                            Add Expense
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Expenses Tab */}
                        <TabsContent value="expenses" className="p-4 pt-6">
                            <div className="space-y-4">
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={categoryFilter}
                                            onValueChange={(value: BudgetCategoryType | 'all') => setCategoryFilter(value)}
                                        >
                                            <SelectTrigger className="w-full sm:w-[180px]">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {budget?.categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="show-paid"
                                                checked={showPaid}
                                                onCheckedChange={setShowPaid}
                                            />
                                            <Label htmlFor="show-paid" className="text-sm">Show Paid</Label>
                                        </div>
                                    </div>

                                    <Button variant="outline" size="sm" onClick={() => setAddExpenseOpen(true)}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Expense
                                    </Button>
                                </div>

                                {/* Expense List */}
                                {filteredExpenses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No Expenses Found</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {budget?.expenses.length === 0
                                                ? "Start adding expenses to track your spending"
                                                : "Try changing your filters to see expenses"
                                            }
                                        </p>
                                        <Button onClick={() => setAddExpenseOpen(true)}>
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Add Expense
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredExpenses.map(expense => {
                                            const category = budget?.categories.find(c => c.id === expense.categoryId);
                                            if (!category) return null;

                                            const Icon = getCategoryIcon(expense.categoryId as BudgetCategoryType);

                                            return (
                                                <div
                                                    key={expense.id}
                                                    className="border rounded-lg p-3 flex items-center justify-between hover:bg-secondary/10 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3 category-bg category-text"
                                                            style={getCategoryStyleProps(category.color)}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{expense.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {category.name} • {expense.date ? format(expense.date, 'MMM d, yyyy') : 'No date'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <div className="font-medium">{formatCurrency(expense.amount)}</div>
                                                            <div className="flex items-center justify-end text-xs">
                                                                {expense.isPaid ? (
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                        Paid
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                                        Unpaid
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setEditingExpense(expense)}
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => togglePaidStatusMutation.mutate(expense.id)}
                                                                >
                                                                    {expense.isPaid ? (
                                                                        <>
                                                                            <MinusCircle className="h-4 w-4 mr-2" />
                                                                            Mark as Unpaid
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Mark as Paid
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => deleteExpenseMutation.mutate(expense.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Edit Budget Dialog */}
            <Dialog open={editBudgetOpen} onOpenChange={setEditBudgetOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Budget</DialogTitle>
                        <DialogDescription>
                            Set your total budget and allocate amounts to categories
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...budgetForm}>
                        <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-6">
                            <FormField
                                control={budgetForm.control}
                                name="totalBudget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Budget</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                    $
                                                </span>
                                                <Input
                                                    placeholder="0.00"
                                                    type="number"
                                                    className="pl-7"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Your total budget for the entire trip
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Category Allocation</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Remaining: {formatCurrency((budgetForm.watch('totalBudget') || 0) - (budgetForm.watch('categories') || []).reduce((sum, cat) => sum + (cat.plannedAmount || 0), 0))}
                                    </p>
                                </div>

                                <div className="border rounded-md overflow-hidden">
                                    {budget?.categories.map((category, index) => (
                                        <FormField
                                            key={category.id}
                                            control={budgetForm.control}
                                            name={`categories.${index}.plannedAmount`}
                                            render={({ field }) => (
                                                <FormItem className={cn(
                                                    "flex items-center py-3 px-4",
                                                    index !== budget.categories.length - 1 && "border-b"
                                                )}>
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3 category-bg category-text"
                                                        style={getCategoryStyleProps(category.color)}
                                                    >
                                                        {React.createElement(category.icon, { className: "h-4 w-4" })}
                                                    </div>
                                                    <div className="flex-1 mr-4">
                                                        <label
                                                            htmlFor={`category-${category.id}`}
                                                            className="block text-sm font-medium"
                                                        >
                                                            {category.name}
                                                        </label>
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative w-24">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                                $
                                                            </span>
                                                            <Input
                                                                id={`category-${category.id}`}
                                                                placeholder="0.00"
                                                                type="number"
                                                                className="pl-7"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Expense Dialog */}
            <Dialog open={addExpenseOpen} onOpenChange={(open) => {
                setAddExpenseOpen(open);
                if (!open) setEditingExpense(null);
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                        <DialogDescription>
                            {editingExpense
                                ? 'Update the details of this expense'
                                : 'Add a new expense to your trip budget'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...expenseForm}>
                        <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                            <FormField
                                control={expenseForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expense Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter expense name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={expenseForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                        $
                                                    </span>
                                                    <Input
                                                        placeholder="0.00"
                                                        type="number"
                                                        step="0.01"
                                                        className="pl-7"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={expenseForm.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {budget?.categories.map(category => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="w-4 h-4 rounded-full mr-2 category-bg"
                                                                    style={getCategoryStyleProps(category.color)}
                                                                />
                                                                {category.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={expenseForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => {
                                                        const date = e.target.value ? new Date(e.target.value) : null;
                                                        if (date) field.onChange(date);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={expenseForm.control}
                                    name="isPaid"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3 mt-7">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Payment Status</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={expenseForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <textarea
                                                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Add any additional notes"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Additional details about this expense
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => {
                                    setAddExpenseOpen(false);
                                    setEditingExpense(null);
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}