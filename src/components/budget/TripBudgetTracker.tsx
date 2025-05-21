"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
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
    Edit,
    Trash2,
    AlertCircle,
    Loader2,
    CheckCircle,
    MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    readonly id: string;
    readonly categoryId: BudgetCategoryType;
    readonly name: string;
    readonly amount: number;
    readonly date?: Date;
    readonly isPaid: boolean;
    readonly notes?: string;
}

export interface BudgetCategory {
    readonly id: BudgetCategoryType;
    readonly name: string;
    readonly plannedAmount: number;
    readonly icon: React.ComponentType<{ className?: string }>;
    readonly color: string;
}

export interface Budget {
    readonly id: string;
    readonly vacationId: string;
    readonly totalBudget: number;
    readonly categories: BudgetCategory[];
    readonly expenses: BudgetItem[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
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
const getCategoryDataAttributes = (color: string) => {
    return {
        style: {
            "--category-color": color,
            "--category-color-bg": `${color}20`
        } as React.CSSProperties
    };
};

const getProgressDataAttributes = (percent: number) => {
    return {
        style: {
            "--progress-percent": `${percent}%`
        } as React.CSSProperties
    };
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

// Type for budget statistics
interface BudgetStats {
    readonly totalBudget: number;
    readonly totalPlanned: number;
    readonly totalSpent: number;
    readonly totalPaid: number;
    readonly totalUnpaid: number;
    readonly remainingBudget: number;
    readonly budgetProgress: number;
    readonly categorySummary: Array<BudgetCategorySummary>;
}

interface BudgetCategorySummary extends BudgetCategory {
    readonly actual: number;
    readonly paid: number;
    readonly unpaid: number;
    readonly progress: number;
    readonly remaining: number;
    readonly overBudget: boolean;
}

// Chart data types
interface PieChartData {
    readonly name: string;
    readonly value: number;
    readonly color: string;
}

interface BarChartData {
    readonly name: string;
    readonly planned: number;
    readonly actual: number;
}

// Props for the budget tracker component
interface TripBudgetTrackerProps {
    readonly vacationId: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly showSummary?: boolean;
    readonly onUpdate?: (budget: Budget) => void;
}

// Extract components for tabs
const LoadingState = () => (
    <div className="flex justify-center py-8">
        <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading budget data...</p>
        </div>
    </div>
);

const ErrorState = () => (
    <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
            There was an error loading your budget data. Please try again later.
        </AlertDescription>
    </Alert>
);

// Extract no budget state component
const NoBudgetState = ({ onSetBudget }: { readonly onSetBudget: () => void }) => (
    <div className="text-center py-8">
        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Budget Set</h3>
        <p className="text-sm text-muted-foreground mb-4">
            Start by setting a total budget for your Disney vacation
        </p>
        <Button onClick={onSetBudget}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Set Budget
        </Button>
    </div>
);

// Extract budget card components
const BudgetSummaryCard = ({
    budget,
    budgetStats,
    formatCurrency
}: {
    readonly budget: Budget | null;
    readonly budgetStats: BudgetStats | null;
    readonly formatCurrency: (value: number) => string;
}) => {
    if (!budget || !budgetStats || budgetStats.totalBudget === 0) {
        return null;
    }

    // Apply progress bar class based on budget status
    const progressBarClass = getProgressBarClass(budgetStats.remainingBudget, budgetStats.budgetProgress);

    return (
        <Card className={cn(
            "bg-secondary/20",
            budgetStats.remainingBudget < 0 && "border-red-300 bg-red-50"
        )}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Budget</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "text-2xl font-bold",
                    budgetStats.remainingBudget < 0 && "text-destructive"
                )}>
                    {formatCurrency(budgetStats.remainingBudget)}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                    <span>{budgetStats.budgetProgress}% of budget used</span>
                    {budgetStats.remainingBudget < 0 && (
                        <Badge variant="destructive" className="text-[10px]">Over Budget</Badge>
                    )}
                </div>
            </CardContent>
            {/* Use progress bar class with data attributes */}
            <div className="h-1 w-full bg-secondary">
                <div
                    className={cn("h-full transition-all w-progress-bar", progressBarClass)}
                    {...getProgressDataAttributes(budgetStats.budgetProgress)}
                />
            </div>
        </Card>
    );
};

// Extract helper function for determining progress bar class
const getProgressBarClass = (remainingBudget: number, budgetProgress: number): string => {
    if (remainingBudget < 0) {
        return "bg-destructive";
    }

    if (budgetProgress > 80) {
        return "bg-amber-500";
    }

    return "bg-primary";
};

// Extract budget chart components
const BudgetPieChart = ({
    chartData,
    formatCurrency
}: {
    readonly chartData: PieChartData[];
    readonly formatCurrency: (value: number) => string;
}) => {
    if (chartData.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No expenses added yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <RechartsTooltip
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

const BudgetBarChart = ({
    chartData,
    formatCurrency
}: {
    readonly chartData: BarChartData[];
    readonly formatCurrency: (value: number) => string;
}) => {
    if (chartData.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No budget data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
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
    );
};

// Extract expense list item component
const ExpenseListItem = ({
    expense,
    category,
    onEdit,
    onTogglePaid,
    onDelete,
    formatCurrency
}: {
    readonly expense: BudgetItem;
    readonly category: BudgetCategory;
    readonly onEdit: (expense: BudgetItem) => void;
    readonly onTogglePaid: (id: string) => void;
    readonly onDelete: (id: string) => void;
    readonly formatCurrency: (value: number) => string;
}) => {
    const Icon = getCategoryIcon(expense.categoryId);

    return (
        <div
            className="border rounded-lg p-3 flex items-center justify-between hover:bg-secondary/10 transition-colors"
        >
            <div className="flex items-center">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3 category-bg category-text"
                    {...getCategoryDataAttributes(category.color)}
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
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onTogglePaid(expense.id)}>
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
                            onClick={() => onDelete(expense.id)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// Fix the sort operation to avoid modifying the original array
const getSortedExpenses = (expenses: BudgetItem[]): BudgetItem[] => {
    return [...expenses].sort((a, b) => {
        // Sort by date and then by name
        if (a.date && b.date) {
            return b.date.getTime() - a.date.getTime();
        } else if (a.date) {
            return -1;
        } else if (b.date) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    });
};

// Mock function to fetch budget data (would be replaced with actual API call)
async function fetchBudgetData(vacationId: string): Promise<Budget | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Log or use vacationId to prevent unused parameter warning
    console.log(`Fetching budget data for vacation: ${vacationId}`);

    // For demonstration, return null (to trigger budget creation) or a mock budget
    return null;
}

// Extract budget form handling into a custom hook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useBudgetForm(budget: Budget | null, updateBudgetMutation: any) {
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

    // Handle budget form submission
    const onBudgetSubmit = (data: z.infer<typeof budgetFormSchema>) => {
        updateBudgetMutation.mutate(data);
    };

    return { budgetForm, onBudgetSubmit };
}

// Extract expense form handling into a custom hook
function useExpenseForm(
    editingExpense: BudgetItem | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addExpenseMutation: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateExpenseMutation: any,
    setAddExpenseOpen: (open: boolean) => void
) {
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
    }, [editingExpense, expenseForm, setAddExpenseOpen]);

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

    return { expenseForm, onExpenseSubmit };
}

// Extract expense filtering logic into a custom hook
function useExpenseFilters(budget: Budget | null) {
    const [categoryFilter, setCategoryFilter] = useState<BudgetCategoryType | 'all'>('all');
    const [showPaid, setShowPaid] = useState(true);

    // Filter expenses based on category and paid status
    const filteredExpenses = useMemo<BudgetItem[]>(() => {
        if (!budget) return [];

        // Use getSortedExpenses to avoid modifying the original array
        return getSortedExpenses(budget.expenses?.filter(expense => {
            if (categoryFilter !== 'all' && expense.categoryId !== categoryFilter) {
                return false;
            }

            if (!showPaid && expense.isPaid) {
                return false;
            }

            return true;
        }) || []);
    }, [budget, categoryFilter, showPaid]);

    return {
        categoryFilter,
        setCategoryFilter,
        showPaid,
        setShowPaid,
        filteredExpenses
    };
}

// Extract budget mutation logic into a custom hook
function useBudgetMutations(
    budget: Budget | null,
    vacationId: string,
    queryClient: ReturnType<typeof useQueryClient>,
    setEditBudgetOpen: (open: boolean) => void,
    setAddExpenseOpen: (open: boolean) => void,
    setEditingExpense: (expense: BudgetItem | null) => void,
    onUpdate?: (budget: Budget) => void
) {
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

    return {
        createBudgetMutation,
        updateBudgetMutation,
        addExpenseMutation,
        updateExpenseMutation,
        deleteExpenseMutation,
        togglePaidStatusMutation
    };
}

// Extract budget stats calculation
function calculateBudgetStats(budget: Budget | null): BudgetStats | null {
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
    const categorySummary = budget.categories?.map((category: BudgetCategory) => {
        const categoryExpenses = budget.expenses?.filter((expense: BudgetItem) => expense.categoryId === category.id) || [];
        const categoryTotal = categoryExpenses.reduce((sum: number, expense: BudgetItem) => sum + expense.amount, 0);
        const categoryPaid = categoryExpenses
            .filter((expense: BudgetItem) => expense.isPaid)
            .reduce((sum: number, expense: BudgetItem) => sum + expense.amount, 0);
        let categoryProgress = 0;
        if (category.plannedAmount > 0) {
            categoryProgress = Math.min(Math.round((categoryTotal / category.plannedAmount) * 100), 100);
        } else if (categoryTotal > 0) {
            categoryProgress = 100;
        }

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
        categorySummary
    };
}

// Extract chart data generation
function generateChartData(budgetStats: BudgetStats | null) {
    if (!budgetStats) return { pieChartData: [], barChartData: [] };

    const pieChartData = budgetStats.categorySummary
        .filter(category => category.actual > 0)
        .map(category => ({
            name: category.name,
            value: category.actual,
            color: category.color
        }));

    const barChartData = budgetStats.categorySummary
        .filter(category => category.plannedAmount > 0 || category.actual > 0)
        .map(category => ({
            name: category.name,
            planned: category.plannedAmount,
            actual: category.actual
        }));

    return { pieChartData, barChartData };
}

// Full implementation of the budget tracker
// Create interfaces to group related parameters
interface BudgetTrackerDataProps {
    budget: Budget | null;
    budgetStats: BudgetStats | null;
    formatCurrency: (value: number) => string;
    startDate: Date;
    endDate: Date;
    vacationId: string;
    filteredExpenses: BudgetItem[];
}

interface BudgetTrackerUIStateProps {
    editBudgetOpen: boolean;
    setEditBudgetOpen: (open: boolean) => void;
    addExpenseOpen: boolean;
    setAddExpenseOpen: (open: boolean) => void;
    categoryFilter: BudgetCategoryType | 'all';
    setCategoryFilter: (filter: BudgetCategoryType | 'all') => void;
    showPaid: boolean;
    setShowPaid: (show: boolean) => void;
    editingExpense: BudgetItem | null;
    setEditingExpense: (expense: BudgetItem | null) => void;
}

interface BudgetTrackerFormsProps {
    expenseForm: ReturnType<typeof useForm<z.infer<typeof expenseFormSchema>>>;
    budgetForm: ReturnType<typeof useForm<z.infer<typeof budgetFormSchema>>>;
    onBudgetSubmit: (data: z.infer<typeof budgetFormSchema>) => void;
    onExpenseSubmit: (data: z.infer<typeof expenseFormSchema>) => void;
}

interface BudgetTrackerMutationsProps {
    togglePaidStatusMutation: { mutate: (id: string) => void };
    deleteExpenseMutation: { mutate: (id: string) => void };
}

interface BudgetTrackerChartProps {
    pieChartData: PieChartData[];
    barChartData: BarChartData[];
}

function renderFullBudgetTracker(
    data: BudgetTrackerDataProps,
    uiState: BudgetTrackerUIStateProps,
    forms: BudgetTrackerFormsProps,
    mutations: BudgetTrackerMutationsProps,
    charts: BudgetTrackerChartProps
) {
    // Destructure for easier access
    const { budget, budgetStats, formatCurrency, filteredExpenses } = data;
    const { setEditingExpense } = uiState;
    const { pieChartData, barChartData } = charts;
    const { togglePaidStatusMutation, deleteExpenseMutation } = mutations;

    // Simplified implementation to use the components
    return (
        <div className="space-y-4">
            <BudgetSummaryCard
                budget={budget}
                budgetStats={budgetStats}
                formatCurrency={formatCurrency}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <BudgetPieChart
                        chartData={pieChartData}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <BudgetBarChart
                        chartData={barChartData}
                        formatCurrency={formatCurrency}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {budget && filteredExpenses.map(expense => {
                            const category = budget.categories.find(c => c.id === expense.categoryId) || budget.categories[0];
                            return (
                                <ExpenseListItem
                                    key={expense.id}
                                    expense={expense}
                                    category={category}
                                    onEdit={setEditingExpense}
                                    onTogglePaid={id => togglePaidStatusMutation.mutate(id)}
                                    onDelete={id => deleteExpenseMutation.mutate(id)}
                                    formatCurrency={formatCurrency}
                                />
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function TripBudgetTracker({
    vacationId,
    startDate,
    endDate,
    showSummary = false,
    onUpdate
}: TripBudgetTrackerProps) {
    // State management
    const [addExpenseOpen, setAddExpenseOpen] = useState(false);
    const [editBudgetOpen, setEditBudgetOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<BudgetItem | null>(null);

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

    // Use our extracted mutations hook
    const {
        createBudgetMutation,
        updateBudgetMutation,
        addExpenseMutation,
        updateExpenseMutation,
        deleteExpenseMutation,
        togglePaidStatusMutation
    } = useBudgetMutations(
        budget || null,
        vacationId,
        queryClient,
        setEditBudgetOpen,
        setAddExpenseOpen,
        setEditingExpense,
        onUpdate
    );

    // Use custom hooks for forms and filters
    const { budgetForm, onBudgetSubmit } = useBudgetForm(budget || null, updateBudgetMutation);
    const { expenseForm, onExpenseSubmit } = useExpenseForm(editingExpense, addExpenseMutation, updateExpenseMutation, setAddExpenseOpen);
    const { categoryFilter, setCategoryFilter, showPaid, setShowPaid, filteredExpenses } = useExpenseFilters(budget || null);

    // Calculate budget statistics using extracted function
    const budgetStats = useMemo(() => calculateBudgetStats(budget || null), [budget]);

    // Generate chart data using extracted function
    const { pieChartData, barChartData } = useMemo(() => generateChartData(budgetStats), [budgetStats]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    if (isLoading) {
        return <LoadingState />;
    }

    if (isError) {
        return <ErrorState />;
    }

    // If we want to show just a summary card
    if (showSummary) {
        return renderSummaryView(budget === undefined ? null : budget, budgetStats, formatCurrency, vacationId, setEditBudgetOpen);
    }

    return renderFullBudgetTracker(
        { budget: budget || null, budgetStats, formatCurrency, startDate, endDate, vacationId, filteredExpenses },
        { editBudgetOpen, setEditBudgetOpen, addExpenseOpen, setAddExpenseOpen, categoryFilter, setCategoryFilter, showPaid, setShowPaid, editingExpense, setEditingExpense },
        { expenseForm, budgetForm, onExpenseSubmit, onBudgetSubmit },
        { togglePaidStatusMutation, deleteExpenseMutation },
        { pieChartData, barChartData }
    );
}

// Extracted function to render the summary view
function renderSummaryView(
    budget: Budget | null,
    budgetStats: BudgetStats | null,
    formatCurrency: (value: number) => string,
    vacationId: string,
    setEditBudgetOpen: (open: boolean) => void
) {
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
                    <NoBudgetState onSetBudget={() => setEditBudgetOpen(true)} />
                ) : (
                    <>
                        <BudgetSummaryCard
                            budget={budget}
                            budgetStats={budgetStats}
                            formatCurrency={formatCurrency}
                        />
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
                    </>
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