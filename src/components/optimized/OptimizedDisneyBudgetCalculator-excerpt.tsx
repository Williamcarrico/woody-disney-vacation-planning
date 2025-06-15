"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
    Users, MapPin, UtensilsCrossed, Plane, Gift, Star, Shield, 
    DollarSign, Settings, CheckCircle, Sparkles, Info, Target, CreditCard, Zap 
} from "lucide-react";
import { withSelectiveMemo } from '@/lib/performance/optimization-utils';

// Types remain the same
interface TripDetails {
    numAdults: number;
    numChildren: number;
    numSeniors: number;
    numInfants: number;
    numNights: number;
    numParkDays: number;
    visitDate: string;
    groupType: GroupType;
    budgetLevel: BudgetLevel;
    isFirstVisit: boolean;
}

type GroupType = 'family' | 'couple' | 'friends' | 'solo' | 'extended-family';
type BudgetLevel = 'budget' | 'moderate' | 'deluxe' | 'luxury';
type SeasonType = 'value' | 'regular' | 'peak';
type TicketType = 'base' | 'parkHopper' | 'parkHopperPlus';

// Memoized input component
const NumberInput = memo<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    icon?: React.ReactNode;
    colorClass?: string;
}>(
    function NumberInput({ label, value, onChange, min = 0, max, icon, colorClass = "blue" }) {
        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(parseInt(e.target.value) || 0);
        }, [onChange]);

        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                {icon ? (
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="number"
                            min={min}
                            max={max}
                            value={value}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-${colorClass}-500 focus:border-transparent transition-all`}
                            aria-label={label}
                        />
                    </div>
                ) : (
                    <input
                        type="number"
                        min={min}
                        max={max}
                        value={value}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-${colorClass}-500 focus:border-transparent transition-all`}
                        aria-label={label}
                    />
                )}
            </div>
        );
    }
);

// Memoized tab button
const TabButton = memo<{
    tab: { id: string; label: string; icon: any; color: string };
    isActive: boolean;
    onClick: () => void;
}>(
    function TabButton({ tab, isActive, onClick }) {
        return (
            <motion.button
                animate={{ scale: isActive ? 1.05 : 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    isActive
                        ? `bg-${tab.color}-500 text-white shadow-lg`
                        : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
            >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
            </motion.button>
        );
    }
);

// Main component excerpt with optimizations
export const OptimizedDisneyBudgetCalculator = withSelectiveMemo(
    function OptimizedDisneyBudgetCalculator() {
        // State remains the same
        const [tripDetails, setTripDetails] = useState<TripDetails>({
            numAdults: 2,
            numChildren: 0,
            numSeniors: 0,
            numInfants: 0,
            numNights: 5,
            numParkDays: 4,
            visitDate: '',
            groupType: 'family',
            budgetLevel: 'moderate',
            isFirstVisit: false,
        });

        const [activeTab, setActiveTab] = useState('trip-details');
        const [viewMode, setViewMode] = useState<'calculator' | 'summary' | 'recommendations'>('calculator');

        // Memoized callbacks for trip details
        const updateNumAdults = useCallback((value: number) => {
            setTripDetails(prev => ({ ...prev, numAdults: value }));
        }, []);

        const updateNumChildren = useCallback((value: number) => {
            setTripDetails(prev => ({ ...prev, numChildren: value }));
        }, []);

        const updateNumSeniors = useCallback((value: number) => {
            setTripDetails(prev => ({ ...prev, numSeniors: value }));
        }, []);

        const updateNumInfants = useCallback((value: number) => {
            setTripDetails(prev => ({ ...prev, numInfants: value }));
        }, []);

        const updateNumNights = useCallback((value: number) => {
            setTripDetails(prev => ({ ...prev, numNights: value }));
        }, []);

        const updateNumParkDays = useCallback((value: number) => {
            setTripDetails(prev => ({ ...prev, numParkDays: value }));
        }, []);

        const updateVisitDate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setTripDetails(prev => ({ ...prev, visitDate: e.target.value }));
        }, []);

        const updateGroupType = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value as GroupType;
            setTripDetails(prev => ({ ...prev, groupType: value }));
        }, []);

        const updateBudgetLevel = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value as BudgetLevel;
            setTripDetails(prev => ({ ...prev, budgetLevel: value }));
        }, []);

        const toggleFirstVisit = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setTripDetails(prev => ({ ...prev, isFirstVisit: e.target.checked }));
        }, []);

        // Tab click handlers
        const handleTabClick = useCallback((tabId: string) => {
            setActiveTab(tabId);
        }, []);

        // Memoized tabs data
        const tabs = useMemo(() => [
            { id: 'trip-details', label: 'Trip Details', icon: Users, color: 'blue' },
            { id: 'tickets', label: 'Tickets', icon: Star, color: 'purple' },
            { id: 'accommodation', label: 'Accommodation', icon: MapPin, color: 'green' },
            { id: 'transportation', label: 'Transportation', icon: Plane, color: 'orange' },
            { id: 'food', label: 'Food & Dining', icon: UtensilsCrossed, color: 'red' },
            { id: 'extras', label: 'Extras', icon: Gift, color: 'pink' },
        ], []);

        return (
            <div className="space-y-8">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <TabButton
                            key={tab.id}
                            tab={tab}
                            isActive={activeTab === tab.id}
                            onClick={() => handleTabClick(tab.id)}
                        />
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'trip-details' && (
                        <motion.div
                            key="trip-details"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Basic Trip Information */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Trip Information</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <NumberInput
                                        label="Adults"
                                        value={tripDetails.numAdults}
                                        onChange={updateNumAdults}
                                        min={0}
                                    />
                                    <NumberInput
                                        label="Children (3-9)"
                                        value={tripDetails.numChildren}
                                        onChange={updateNumChildren}
                                        min={0}
                                    />
                                    <NumberInput
                                        label="Seniors (65+)"
                                        value={tripDetails.numSeniors}
                                        onChange={updateNumSeniors}
                                        min={0}
                                    />
                                    <NumberInput
                                        label="Infants (0-2)"
                                        value={tripDetails.numInfants}
                                        onChange={updateNumInfants}
                                        min={0}
                                    />
                                    <NumberInput
                                        label="Nights"
                                        value={tripDetails.numNights}
                                        onChange={updateNumNights}
                                        min={1}
                                    />
                                    <NumberInput
                                        label="Park Days"
                                        value={tripDetails.numParkDays}
                                        onChange={updateNumParkDays}
                                        min={0}
                                        max={tripDetails.numNights + 2}
                                    />
                                </div>
                            </div>

                            {/* Trip Preferences */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <Settings className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Preferences</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                                        <input
                                            type="date"
                                            value={tripDetails.visitDate}
                                            onChange={updateVisitDate}
                                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                            aria-label="Visit date"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
                                        <select
                                            value={tripDetails.groupType}
                                            onChange={updateGroupType}
                                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                            aria-label="Select group type"
                                        >
                                            <option value="family">Family with Kids</option>
                                            <option value="couple">Couple</option>
                                            <option value="friends">Friends Group</option>
                                            <option value="solo">Solo Travel</option>
                                            <option value="extended-family">Extended Family</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Budget Level</label>
                                        <select
                                            value={tripDetails.budgetLevel}
                                            onChange={updateBudgetLevel}
                                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                            aria-label="Select budget level"
                                        >
                                            <option value="budget">Budget-Conscious</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="deluxe">Deluxe</option>
                                            <option value="luxury">Luxury</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="firstVisit"
                                            checked={tripDetails.isFirstVisit}
                                            onChange={toggleFirstVisit}
                                            className="w-5 h-5 text-purple-500 bg-white/50 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <label htmlFor="firstVisit" className="text-sm font-medium text-gray-700">
                                            First Visit to Disney World
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    },
    ['viewMode'] // Only re-render when viewMode changes
);

/*
 * This is an excerpt showing the optimization pattern for the DisneyBudgetCalculator.
 * Key optimizations applied:
 * 
 * 1. useCallback for all event handlers
 * 2. Memoized child components (NumberInput, TabButton)
 * 3. Individual update functions instead of inline arrow functions
 * 4. useMemo for static data (tabs array)
 * 5. withSelectiveMemo HOC for the main component
 * 
 * The same pattern should be applied to:
 * - Ticket options handlers
 * - Accommodation options handlers
 * - Transportation options handlers
 * - Food options handlers
 * - Extras options handlers
 * - Savings goal handlers
 * 
 * Additional optimizations to consider:
 * - Use useReducer instead of multiple useState calls
 * - Extract static data to constants file
 * - Split into smaller components
 * - Use React.lazy for tab content components
 */