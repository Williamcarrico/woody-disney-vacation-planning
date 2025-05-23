"use client"; // Required for Next.js App Router components with client-side interactivity

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    PieChart,
    Download,
    Share2,
    Save,
    Settings,
    Target,
    Clock,
    DollarSign,
    Users,
    MapPin,
    Plane,
    UtensilsCrossed,
    Gift,
    CreditCard,
    CheckCircle,
    BarChart3,
    Sparkles,
    Star,
    Shield,
    Zap
} from 'lucide-react';

// Enhanced interfaces with more detailed typing
interface TripDetails {
    numAdults: number;
    numChildren: number;
    numInfants: number;
    numSeniors: number;
    numNights: number;
    numParkDays: number;
    visitDate: string;
    groupType: 'family' | 'couple' | 'friends' | 'solo' | 'extended-family';
    isFirstVisit: boolean;
    budgetLevel: 'budget' | 'moderate' | 'deluxe' | 'luxury';
}

interface TicketOptions {
    ticketType: 'base' | 'parkHopper' | 'parkHopperPlus';
    seasonType: 'value' | 'regular' | 'peak';
    avgTicketPriceAdult: number;
    avgTicketPriceChild: number;
    avgTicketPriceSenior: number;
    parkHopperCost: number;
    parkHopperPlusCost: number;
    geniePlus: number;
    individualLightningLanes: number;
    earlyParkAccess: number;
    afterHours: number;
    magicHours: boolean;
}

interface AccommodationOptions {
    resortType: 'value' | 'moderate' | 'deluxe' | 'deluxeVilla' | 'offSite' | 'vacation-rental' | 'custom';
    roomType: 'standard' | 'preferred' | 'club-level' | 'suite' | 'villa';
    nightlyRate: number;
    resortParkingFee: number;
    resortFee: number;
    upgrades: number;
    earlyCheckin: boolean;
    lateCheckout: boolean;
    views: 'standard' | 'garden' | 'pool' | 'water' | 'theme-park';
}

interface TransportationOptions {
    flightCost: number;
    airportTransport: string;
    airportTransportCost: number;
    rentalCarCost: number;
    gasTollsParking: number;
    rideshare: number;
    hotelShuttle: boolean;
    magicalExpress: boolean;
}

interface FoodOptions {
    mealPlan: 'none' | 'quick-service' | 'disney-dining' | 'deluxe-dining' | 'deluxe-plus';
    mealPlanCost: number;
    foodEstimatePerPersonDay: number;
    characterDiningBudget: number;
    fineDiningBudget: number;
    groceriesSnacks: number;
    beveragePlan: boolean;
    beveragePlanCost: number;
    alcoholBudget: number;
    specialDietary: number;
}

interface ExtrasOptions {
    souvenirBudget: number;
    memoryMakerCost: number;
    specialEventsCost: number;
    bibbidiBobbidi: number;
    tours: number;
    spa: number;
    recreation: number;
    babysitting: number;
    laundry: number;
    tips: number;
    merchandise: number;
    photoPass: boolean;
}

interface SavingsGoal {
    targetAmount: number;
    currentSaved: number;
    monthlyContribution: number;
    targetDate: string;
    autoSave: boolean;
}

// Future feature interfaces - currently unused but planned for implementation
/*
interface PaymentPlan {
    totalCost: number;
    downPayment: number;
    monthlyPayments: number;
    finalPaymentDate: string;
    paymentMethod: 'cash' | 'credit' | 'financing';
    interestRate: number;
}

interface SummaryCosts {
    tripDetailsCost: number;
    ticketCostTotal: number;
    accommodationCostTotal: number;
    transportationCostTotal: number;
    foodCostTotal: number;
    extrasCostTotal: number;
    subtotalCost: number;
    taxes: number;
    fees: number;
    contingencyAmount: number;
    grandTotalCost: number;
    perPersonCost: number;
    perDayCost: number;
    costPerParkDay: number;
}
*/

// Enhanced data with seasonal pricing and recommendations
const seasonalMultipliers = {
    value: 0.85,
    regular: 1.0,
    peak: 1.35
} as const;

const resortRates = {
    value: { base: 180, range: [150, 220] },
    moderate: { base: 320, range: [280, 380] },
    deluxe: { base: 650, range: [550, 800] },
    deluxeVilla: { base: 850, range: [700, 1200] },
    offSite: { base: 120, range: [80, 180] },
    'vacation-rental': { base: 200, range: [150, 350] },
    custom: { base: 0, range: [0, 0] }
} as const;

const mealPlanPrices = {
    'quick-service': { adult: 57, child: 23 },
    'disney-dining': { adult: 78, child: 30 },
    'deluxe-dining': { adult: 94, child: 40 },
    'deluxe-plus': { adult: 119, child: 55 }
} as const;

// Define valid option arrays for type checking
const VALID_VIEW_MODES = ['calculator', 'summary', 'charts', 'timeline'] as const;
const VALID_GROUP_TYPES = ['family', 'couple', 'friends', 'solo', 'extended-family'] as const;
const VALID_BUDGET_LEVELS = ['budget', 'moderate', 'deluxe', 'luxury'] as const;
const VALID_SEASON_TYPES = ['value', 'regular', 'peak'] as const;
const VALID_TICKET_TYPES = ['base', 'parkHopper', 'parkHopperPlus'] as const;
const VALID_RESORT_TYPES = ['value', 'moderate', 'deluxe', 'deluxeVilla', 'offSite', 'vacation-rental', 'custom'] as const;
const VALID_ROOM_TYPES = ['standard', 'preferred', 'club-level', 'suite', 'villa'] as const;
const VALID_VIEW_TYPES = ['standard', 'garden', 'pool', 'water', 'theme-park'] as const;

// Recommendation engine
const getRecommendations = (tripDetails: TripDetails, totalCost: number) => {
    const recommendations = [];
    const perPersonCost = totalCost / (tripDetails.numAdults + tripDetails.numChildren);

    if (perPersonCost > 2000) {
        recommendations.push({
            type: 'cost-saving',
            title: 'Consider Off-Peak Travel',
            description: 'Visiting during value season could save you up to 25% on tickets and accommodation.',
            impact: 'High',
            savings: Math.round(totalCost * 0.25)
        });
    }

    if (tripDetails.numParkDays < tripDetails.numNights - 1) {
        recommendations.push({
            type: 'optimization',
            title: 'Rest Day Opportunity',
            description: 'Consider adding resort pool days or Disney Springs visits on non-park days.',
            impact: 'Medium',
            savings: 0
        });
    }

    if (tripDetails.isFirstVisit) {
        recommendations.push({
            type: 'experience',
            title: 'First Visit Essentials',
            description: 'Consider Genie+ and Memory Maker for a stress-free first experience.',
            impact: 'High',
            savings: 0
        });
    }

    return recommendations;
};

function DisneyBudgetCalculator() {
    // Enhanced state management
    const [activeTab, setActiveTab] = useState('trip-details');
    const [viewMode, setViewMode] = useState<'calculator' | 'summary' | 'charts' | 'timeline'>('calculator');
    const [comparisonMode, setComparisonMode] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(true);

    const [tripDetails, setTripDetails] = useState<TripDetails>({
        numAdults: 2,
        numChildren: 0,
        numInfants: 0,
        numSeniors: 0,
        numNights: 5,
        numParkDays: 4,
        visitDate: '',
        groupType: 'couple',
        isFirstVisit: true,
        budgetLevel: 'moderate'
    });

    const [ticketOptions, setTicketOptions] = useState<TicketOptions>({
        ticketType: 'base',
        seasonType: 'regular',
        avgTicketPriceAdult: 130,
        avgTicketPriceChild: 120,
        avgTicketPriceSenior: 125,
        parkHopperCost: 65,
        parkHopperPlusCost: 85,
        geniePlus: 22,
        individualLightningLanes: 0,
        earlyParkAccess: 0,
        afterHours: 0,
        magicHours: true
    });

    const [accommodationOptions, setAccommodationOptions] = useState<AccommodationOptions>({
        resortType: 'moderate',
        roomType: 'standard',
        nightlyRate: resortRates.moderate.base,
        resortParkingFee: 0,
        resortFee: 0,
        upgrades: 0,
        earlyCheckin: false,
        lateCheckout: false,
        views: 'standard'
    });

    // Memoize static options to prevent recreation on every render
    const transportationOptions = useMemo<TransportationOptions>(() => ({
        flightCost: 0,
        airportTransport: 'rental-car',
        airportTransportCost: 0,
        rentalCarCost: 0,
        gasTollsParking: 0,
        rideshare: 0,
        hotelShuttle: false,
        magicalExpress: false
    }), []);

    const foodOptions = useMemo<FoodOptions>(() => ({
        mealPlan: 'none',
        mealPlanCost: 0,
        foodEstimatePerPersonDay: 65,
        characterDiningBudget: 0,
        fineDiningBudget: 0,
        groceriesSnacks: 0,
        beveragePlan: false,
        beveragePlanCost: 0,
        alcoholBudget: 0,
        specialDietary: 0
    }), []);

    const extrasOptions = useMemo<ExtrasOptions>(() => ({
        souvenirBudget: 200,
        memoryMakerCost: 0,
        specialEventsCost: 0,
        bibbidiBobbidi: 0,
        tours: 0,
        spa: 0,
        recreation: 0,
        babysitting: 0,
        laundry: 0,
        tips: 0,
        merchandise: 0,
        photoPass: false
    }), []);

    const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>({
        targetAmount: 5000,
        currentSaved: 0,
        monthlyContribution: 200,
        targetDate: '',
        autoSave: false
    });

    const [contingencyPercent] = useState(15);
    const [taxRate] = useState(6.5);
    const [currency] = useState('USD');

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        hover: { scale: 1.02, transition: { duration: 0.2 } }
    };

    const tabVariants = {
        inactive: { scale: 0.95, opacity: 0.7 },
        active: { scale: 1, opacity: 1 }
    };

    // Improved type checking functions with better error handling
    const isValidViewMode = (value: string): value is typeof viewMode => {
        return VALID_VIEW_MODES.includes(value as typeof VALID_VIEW_MODES[number]);
    };

    const isValidGroupType = (value: string): value is TripDetails['groupType'] => {
        return VALID_GROUP_TYPES.includes(value as typeof VALID_GROUP_TYPES[number]);
    };

    const isValidBudgetLevel = (value: string): value is TripDetails['budgetLevel'] => {
        return VALID_BUDGET_LEVELS.includes(value as typeof VALID_BUDGET_LEVELS[number]);
    };

    const isValidSeasonType = (value: string): value is TicketOptions['seasonType'] => {
        return VALID_SEASON_TYPES.includes(value as typeof VALID_SEASON_TYPES[number]);
    };

    const isValidTicketType = (value: string): value is TicketOptions['ticketType'] => {
        return VALID_TICKET_TYPES.includes(value as typeof VALID_TICKET_TYPES[number]);
    };

    const isValidResortType = (value: string): value is AccommodationOptions['resortType'] => {
        return VALID_RESORT_TYPES.includes(value as typeof VALID_RESORT_TYPES[number]);
    };

    const isValidRoomType = (value: string): value is AccommodationOptions['roomType'] => {
        return VALID_ROOM_TYPES.includes(value as typeof VALID_ROOM_TYPES[number]);
    };

    const isValidViewType = (value: string): value is AccommodationOptions['views'] => {
        return VALID_VIEW_TYPES.includes(value as typeof VALID_VIEW_TYPES[number]);
    };

    // Enhanced calculations with more sophisticated logic
    const calculations = useMemo(() => {
        const totalPeople = tripDetails.numAdults + tripDetails.numChildren + tripDetails.numSeniors;
        const seasonMultiplier = seasonalMultipliers[ticketOptions.seasonType];

        // Ticket calculations with age-based pricing
        const baseTicketCostAdult = tripDetails.numAdults * ticketOptions.avgTicketPriceAdult * tripDetails.numParkDays * seasonMultiplier;
        const baseTicketCostChild = tripDetails.numChildren * ticketOptions.avgTicketPriceChild * tripDetails.numParkDays * seasonMultiplier;
        const baseTicketCostSenior = tripDetails.numSeniors * ticketOptions.avgTicketPriceSenior * tripDetails.numParkDays * seasonMultiplier;
        const baseTicketCost = baseTicketCostAdult + baseTicketCostChild + baseTicketCostSenior;

        let ticketAddonCost = 0;
        if (ticketOptions.ticketType === 'parkHopper') {
            ticketAddonCost = totalPeople * ticketOptions.parkHopperCost;
        } else if (ticketOptions.ticketType === 'parkHopperPlus') {
            ticketAddonCost = totalPeople * ticketOptions.parkHopperPlusCost;
        }

        const geniePlusCost = totalPeople * ticketOptions.geniePlus * tripDetails.numParkDays;
        const specialAccessCost = ticketOptions.earlyParkAccess + ticketOptions.afterHours;
        const ticketCostTotal = baseTicketCost + ticketAddonCost + geniePlusCost + ticketOptions.individualLightningLanes + specialAccessCost;

        // Accommodation calculations with room type adjustments
        const roomMultiplier = accommodationOptions.roomType === 'suite' ? 2.5 :
            accommodationOptions.roomType === 'club-level' ? 1.8 :
                accommodationOptions.roomType === 'preferred' ? 1.2 : 1.0;

        const viewMultiplier = accommodationOptions.views === 'theme-park' ? 1.4 :
            accommodationOptions.views === 'water' ? 1.3 :
                accommodationOptions.views === 'pool' ? 1.1 :
                    accommodationOptions.views === 'garden' ? 1.05 : 1.0;

        const baseNightlyRate = accommodationOptions.nightlyRate * roomMultiplier * viewMultiplier * seasonMultiplier;
        const accommodationCostTotal = (baseNightlyRate * tripDetails.numNights) +
            accommodationOptions.resortParkingFee +
            accommodationOptions.resortFee +
            accommodationOptions.upgrades;

        // Transportation calculations
        const transportationCostTotal = transportationOptions.flightCost +
            transportationOptions.airportTransportCost +
            transportationOptions.rentalCarCost +
            transportationOptions.gasTollsParking +
            transportationOptions.rideshare;

        // Food calculations with meal plans
        let mealPlanTotal = 0;
        if (foodOptions.mealPlan !== 'none' && mealPlanPrices[foodOptions.mealPlan]) {
            const adultMealPlan = tripDetails.numAdults * mealPlanPrices[foodOptions.mealPlan].adult * tripDetails.numNights;
            const childMealPlan = tripDetails.numChildren * mealPlanPrices[foodOptions.mealPlan].child * tripDetails.numNights;
            mealPlanTotal = adultMealPlan + childMealPlan;
        }

        const outOfPocketFoodCost = totalPeople * foodOptions.foodEstimatePerPersonDay * (tripDetails.numNights + 1);
        const beverageCost = foodOptions.beveragePlan ? totalPeople * foodOptions.beveragePlanCost : 0;

        const foodCostTotal = mealPlanTotal + outOfPocketFoodCost +
            foodOptions.characterDiningBudget +
            foodOptions.fineDiningBudget +
            foodOptions.groceriesSnacks +
            beverageCost +
            foodOptions.alcoholBudget +
            foodOptions.specialDietary;

        // Extras calculations
        const extrasCostTotal = extrasOptions.souvenirBudget +
            extrasOptions.memoryMakerCost +
            extrasOptions.specialEventsCost +
            extrasOptions.bibbidiBobbidi +
            extrasOptions.tours +
            extrasOptions.spa +
            extrasOptions.recreation +
            extrasOptions.babysitting +
            extrasOptions.laundry +
            extrasOptions.tips +
            extrasOptions.merchandise;

        // Subtotal and final calculations
        const subtotalCost = ticketCostTotal + accommodationCostTotal + transportationCostTotal + foodCostTotal + extrasCostTotal;
        const taxes = subtotalCost * (taxRate / 100);
        const fees = subtotalCost * 0.02; // 2% processing fees
        const contingencyAmount = (subtotalCost + taxes + fees) * (contingencyPercent / 100);
        const grandTotalCost = subtotalCost + taxes + fees + contingencyAmount;
        const perPersonCost = totalPeople > 0 ? grandTotalCost / totalPeople : 0;
        const perDayCost = tripDetails.numNights > 0 ? grandTotalCost / tripDetails.numNights : 0;
        const costPerParkDay = tripDetails.numParkDays > 0 ? grandTotalCost / tripDetails.numParkDays : 0;

        return {
            tripDetailsCost: 0,
            ticketCostTotal,
            accommodationCostTotal,
            transportationCostTotal,
            foodCostTotal,
            extrasCostTotal,
            subtotalCost,
            taxes,
            fees,
            contingencyAmount,
            grandTotalCost,
            perPersonCost,
            perDayCost,
            costPerParkDay
        };
    }, [tripDetails, ticketOptions, accommodationOptions, transportationOptions, foodOptions, extrasOptions, contingencyPercent, taxRate]);

    // Update savings goal target when cost changes
    useEffect(() => {
        setSavingsGoal(prev => ({
            ...prev,
            targetAmount: Math.round(calculations.grandTotalCost)
        }));
    }, [calculations.grandTotalCost]);

    // Calculate months to save
    const monthsToSave = useMemo(() => {
        if (savingsGoal.monthlyContribution <= 0) return 0;
        const remainingAmount = savingsGoal.targetAmount - savingsGoal.currentSaved;
        return Math.ceil(remainingAmount / savingsGoal.monthlyContribution);
    }, [savingsGoal]);

    // Get intelligent recommendations
    const recommendations = useMemo(() => {
        return getRecommendations(tripDetails, calculations.grandTotalCost);
    }, [tripDetails, calculations.grandTotalCost]);

    // Format currency
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }, [currency]);

    // Helper to calculate progress percentage
    const calculateProgressPercent = useCallback((value: number, total: number) => {
        if (total === 0) return 0;
        return Math.min((value / total) * 100, 100);
    }, []);

    // Progress Bar Component to avoid inline styles
    const ProgressBar = ({ progress, colorClass, height = 'h-2', useGradient = false }: {
        progress: number;
        colorClass: string;
        height?: string;
        useGradient?: boolean;
    }) => {
        const progressClampedPercent = Math.min(Math.max(progress, 0), 100);

        return (
            <div className={`w-full bg-gray-200 rounded-full ${height} mt-3`}>
                <div
                    className={`${useGradient ? 'bg-gradient-to-r from-green-400 to-green-600' : colorClass} ${height} rounded-full transition-all duration-500`}
                    style={{ width: `${progressClampedPercent}%` }}
                />
            </div>
        );
    };

    // Tab configuration
    const tabs = [
        { id: 'trip-details', label: 'Trip Details', icon: Users, color: 'blue' },
        { id: 'tickets', label: 'Tickets', icon: Star, color: 'purple' },
        { id: 'accommodation', label: 'Hotels', icon: MapPin, color: 'green' },
        { id: 'transportation', label: 'Travel', icon: Plane, color: 'orange' },
        { id: 'food', label: 'Dining', icon: UtensilsCrossed, color: 'red' },
        { id: 'extras', label: 'Extras', icon: Gift, color: 'pink' }
    ];

    // View mode buttons
    const viewModes = [
        { id: 'calculator', label: 'Calculator', icon: Calculator },
        { id: 'summary', label: 'Summary', icon: BarChart3 },
        { id: 'charts', label: 'Charts', icon: PieChart },
        { id: 'timeline', label: 'Timeline', icon: Clock }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center mb-8">
                <div className="flex space-x-2">
                    {viewModes.map((mode) => (
                        <motion.button
                            key={mode.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (isValidViewMode(mode.id)) {
                                    setViewMode(mode.id);
                                }
                            }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${viewMode === mode.id
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-white/70 text-gray-700 hover:bg-white/90'
                                }`}
                        >
                            <mode.icon className="w-4 h-4" />
                            <span>{mode.label}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="flex space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all"
                        onClick={() => setComparisonMode(!comparisonMode)}
                    >
                        <BarChart3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all"
                    >
                        <Save className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all"
                    >
                        <Share2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/70 rounded-lg hover:bg-white/90 transition-all"
                    >
                        <Download className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {viewMode === 'calculator' && (
                    <motion.div
                        key="calculator"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    variants={tabVariants}
                                    animate={activeTab === tab.id ? 'active' : 'inactive'}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${activeTab === tab.id
                                        ? `bg-${tab.color}-500 text-white shadow-lg`
                                        : 'bg-white/70 text-gray-700 hover:bg-white/90'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'trip-details' && (
                                <motion.div
                                    key="trip-details"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
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
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={tripDetails.numAdults}
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, numAdults: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                    aria-label="Number of adults"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Children (3-9)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={tripDetails.numChildren}
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, numChildren: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                    aria-label="Number of children"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Seniors (65+)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={tripDetails.numSeniors}
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, numSeniors: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                    aria-label="Number of seniors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Infants (0-2)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={tripDetails.numInfants}
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, numInfants: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                    aria-label="Number of infants"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Nights</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={tripDetails.numNights}
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, numNights: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                    aria-label="Number of nights"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Park Days</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={tripDetails.numNights + 2}
                                                    value={tripDetails.numParkDays}
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, numParkDays: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                    aria-label="Number of park days"
                                                />
                                            </div>
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
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, visitDate: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                                    aria-label="Visit date"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
                                                <select
                                                    value={tripDetails.groupType}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidGroupType(value)) {
                                                            setTripDetails(prev => ({ ...prev, groupType: value }));
                                                        }
                                                    }}
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
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidBudgetLevel(value)) {
                                                            setTripDetails(prev => ({ ...prev, budgetLevel: value }));
                                                        }
                                                    }}
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
                                                    onChange={(e) => setTripDetails(prev => ({ ...prev, isFirstVisit: e.target.checked }))}
                                                    className="w-5 h-5 text-purple-500 bg-white/50 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <label htmlFor="firstVisit" className="text-sm font-medium text-gray-700">First Visit to Disney World</label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'tickets' && (
                                <motion.div
                                    key="tickets"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                                >
                                    {/* Ticket Types */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                                                <Star className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800">Ticket Options</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Season Type</label>
                                                <select
                                                    value={ticketOptions.seasonType}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidSeasonType(value)) {
                                                            setTicketOptions(prev => ({ ...prev, seasonType: value }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                                    aria-label="Select season type"
                                                >
                                                    <option value="value">Value Season (-15%)</option>
                                                    <option value="regular">Regular Season</option>
                                                    <option value="peak">Peak Season (+35%)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
                                                <select
                                                    value={ticketOptions.ticketType}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidTicketType(value)) {
                                                            setTicketOptions(prev => ({ ...prev, ticketType: value }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                                    aria-label="Select ticket type"
                                                >
                                                    <option value="base">Base Ticket (1 park per day)</option>
                                                    <option value="parkHopper">Park Hopper (+{formatCurrency(ticketOptions.parkHopperCost)}/person)</option>
                                                    <option value="parkHopperPlus">Park Hopper Plus (+{formatCurrency(ticketOptions.parkHopperPlusCost)}/person)</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Adult Price/Day</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={ticketOptions.avgTicketPriceAdult}
                                                            onChange={(e) => setTicketOptions(prev => ({ ...prev, avgTicketPriceAdult: parseInt(e.target.value) || 0 }))}
                                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                                            aria-label="Adult ticket price per day"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Child Price/Day</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={ticketOptions.avgTicketPriceChild}
                                                            onChange={(e) => setTicketOptions(prev => ({ ...prev, avgTicketPriceChild: parseInt(e.target.value) || 0 }))}
                                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-purple-500 focus:border-transparent transition-all"
                                                            aria-label="Child ticket price per day"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add-ons */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800">Add-ons & Upgrades</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Genie+ (per person/day)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={ticketOptions.geniePlus}
                                                        onChange={(e) => setTicketOptions(prev => ({ ...prev, geniePlus: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-transparent transition-all"
                                                        aria-label="Genie Plus cost per person per day"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Individual Lightning Lanes (total)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={ticketOptions.individualLightningLanes}
                                                        onChange={(e) => setTicketOptions(prev => ({ ...prev, individualLightningLanes: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-transparent transition-all"
                                                        aria-label="Individual Lightning Lanes total cost"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Early Park Access (total)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={ticketOptions.earlyParkAccess}
                                                        onChange={(e) => setTicketOptions(prev => ({ ...prev, earlyParkAccess: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-transparent transition-all"
                                                        aria-label="Early park access total cost"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">After Hours Events (total)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={ticketOptions.afterHours}
                                                        onChange={(e) => setTicketOptions(prev => ({ ...prev, afterHours: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-transparent transition-all"
                                                        aria-label="After hours events total cost"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Add similar sections for accommodation, transportation, food, and extras */}
                            {/* I'll continue with the accommodation section for now */}

                            {activeTab === 'accommodation' && (
                                <motion.div
                                    key="accommodation"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                                >
                                    {/* Resort Selection */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800">Resort & Room</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Resort Category</label>
                                                <select
                                                    value={accommodationOptions.resortType}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidResortType(value)) {
                                                            setAccommodationOptions(prev => ({
                                                                ...prev,
                                                                resortType: value,
                                                                nightlyRate: value !== 'custom' && value in resortRates ? resortRates[value].base : 0
                                                            }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                                    aria-label="Select resort category"
                                                >
                                                    <option value="value">Value Resort ({formatCurrency(resortRates.value.base)}/night)</option>
                                                    <option value="moderate">Moderate Resort ({formatCurrency(resortRates.moderate.base)}/night)</option>
                                                    <option value="deluxe">Deluxe Resort ({formatCurrency(resortRates.deluxe.base)}/night)</option>
                                                    <option value="deluxeVilla">Deluxe Villa ({formatCurrency(resortRates.deluxeVilla.base)}/night)</option>
                                                    <option value="offSite">Off-Site Hotel ({formatCurrency(resortRates.offSite.base)}/night)</option>
                                                    <option value="vacation-rental">Vacation Rental ({formatCurrency(resortRates['vacation-rental'].base)}/night)</option>
                                                    <option value="custom">Custom Rate</option>
                                                </select>
                                            </div>

                                            {accommodationOptions.resortType === 'custom' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Nightly Rate</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={accommodationOptions.nightlyRate}
                                                            onChange={(e) => setAccommodationOptions(prev => ({ ...prev, nightlyRate: parseInt(e.target.value) || 0 }))}
                                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                                            aria-label="Custom nightly rate"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                                                <select
                                                    value={accommodationOptions.roomType}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidRoomType(value)) {
                                                            setAccommodationOptions(prev => ({ ...prev, roomType: value }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                                    aria-label="Select room type"
                                                >
                                                    <option value="standard">Standard Room</option>
                                                    <option value="preferred">Preferred Room (+20%)</option>
                                                    <option value="club-level">Club Level (+80%)</option>
                                                    <option value="suite">Suite (+150%)</option>
                                                    <option value="villa">Villa</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
                                                <select
                                                    value={accommodationOptions.views}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (isValidViewType(value)) {
                                                            setAccommodationOptions(prev => ({ ...prev, views: value }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                                    aria-label="Select view type"
                                                >
                                                    <option value="standard">Standard View</option>
                                                    <option value="garden">Garden View (+5%)</option>
                                                    <option value="pool">Pool View (+10%)</option>
                                                    <option value="water">Water View (+30%)</option>
                                                    <option value="theme-park">Theme Park View (+40%)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Fees */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800">Additional Costs</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Resort Parking (total stay)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={accommodationOptions.resortParkingFee}
                                                        onChange={(e) => setAccommodationOptions(prev => ({ ...prev, resortParkingFee: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                        aria-label="Resort parking fee total"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Resort Fees (total stay)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={accommodationOptions.resortFee}
                                                        onChange={(e) => setAccommodationOptions(prev => ({ ...prev, resortFee: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                        aria-label="Resort fees total"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Room Upgrades</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={accommodationOptions.upgrades}
                                                        onChange={(e) => setAccommodationOptions(prev => ({ ...prev, upgrades: parseInt(e.target.value) || 0 }))}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all"
                                                        aria-label="Room upgrades cost"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        id="earlyCheckin"
                                                        checked={accommodationOptions.earlyCheckin}
                                                        onChange={(e) => setAccommodationOptions(prev => ({ ...prev, earlyCheckin: e.target.checked }))}
                                                        className="w-5 h-5 text-blue-500 bg-white/50 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="earlyCheckin" className="text-sm font-medium text-gray-700">Early Check-in (if available)</label>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        id="lateCheckout"
                                                        checked={accommodationOptions.lateCheckout}
                                                        onChange={(e) => setAccommodationOptions(prev => ({ ...prev, lateCheckout: e.target.checked }))}
                                                        className="w-5 h-5 text-blue-500 bg-white/50 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="lateCheckout" className="text-sm font-medium text-gray-700">Late Check-out (if available)</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick Summary Card */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold">Trip Summary</h3>
                                <Target className="w-8 h-8" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{tripDetails.numAdults + tripDetails.numChildren + tripDetails.numSeniors}</div>
                                    <div className="text-sm opacity-80">Travelers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{tripDetails.numNights}</div>
                                    <div className="text-sm opacity-80">Nights</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{tripDetails.numParkDays}</div>
                                    <div className="text-sm opacity-80">Park Days</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{formatCurrency(calculations.perPersonCost)}</div>
                                    <div className="text-sm opacity-80">Per Person</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{formatCurrency(calculations.grandTotalCost)}</div>
                                    <div className="text-sm opacity-80">Grand Total</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Summary View */}
                {viewMode === 'summary' && (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Detailed Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: 'Tickets', amount: calculations.ticketCostTotal, icon: Star, color: 'purple' },
                                { title: 'Accommodation', amount: calculations.accommodationCostTotal, icon: MapPin, color: 'green' },
                                { title: 'Transportation', amount: calculations.transportationCostTotal, icon: Plane, color: 'orange' },
                                { title: 'Food & Dining', amount: calculations.foodCostTotal, icon: UtensilsCrossed, color: 'red' },
                                { title: 'Extras & Activities', amount: calculations.extrasCostTotal, icon: Gift, color: 'pink' },
                                { title: 'Taxes & Fees', amount: calculations.taxes + calculations.fees, icon: Shield, color: 'gray' }
                            ].map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                    whileHover="hover"
                                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-${item.color}-500 rounded-xl flex items-center justify-center`}>
                                            <item.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-800">{formatCurrency(item.amount)}</div>
                                            <div className={`text-sm text-${item.color}-600`}>
                                                {((item.amount / calculations.subtotalCost) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                                    <ProgressBar progress={calculateProgressPercent(item.amount, calculations.subtotalCost)} colorClass={`bg-${item.color}-500`} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Savings Goals */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Savings Goal Tracker</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={savingsGoal.targetAmount}
                                            onChange={(e) => setSavingsGoal(prev => ({ ...prev, targetAmount: parseInt(e.target.value) || 0 }))}
                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                            aria-label="Target savings amount"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Saved</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={savingsGoal.currentSaved}
                                            onChange={(e) => setSavingsGoal(prev => ({ ...prev, currentSaved: parseInt(e.target.value) || 0 }))}
                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                            aria-label="Current saved amount"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={savingsGoal.monthlyContribution}
                                            onChange={(e) => setSavingsGoal(prev => ({ ...prev, monthlyContribution: parseInt(e.target.value) || 0 }))}
                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-transparent transition-all"
                                            aria-label="Monthly contribution amount"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm text-gray-600">
                                        {formatCurrency(savingsGoal.currentSaved)} / {formatCurrency(savingsGoal.targetAmount)}
                                    </span>
                                </div>
                                <ProgressBar
                                    progress={calculateProgressPercent(savingsGoal.currentSaved, savingsGoal.targetAmount)}
                                    colorClass=""
                                    height="h-3"
                                    useGradient={true}
                                />
                                <div className="mt-3 text-center">
                                    <span className="text-lg font-semibold text-gray-800">
                                        {monthsToSave} months to reach your goal
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Smart Recommendations */}
                        {showRecommendations && recommendations.length > 0 && (
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Smart Recommendations</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowRecommendations(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {recommendations.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-4 rounded-xl border-l-4 ${rec.type === 'cost-saving' ? 'border-green-500 bg-green-50' :
                                                rec.type === 'optimization' ? 'border-blue-500 bg-blue-50' :
                                                    'border-purple-500 bg-purple-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                                                    <div className="flex items-center space-x-4">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${rec.impact === 'High' ? 'bg-red-100 text-red-800' :
                                                            rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                            {rec.impact} Impact
                                                        </span>
                                                        {rec.savings > 0 && (
                                                            <span className="text-sm font-medium text-green-600">
                                                                Save {formatCurrency(rec.savings)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {rec.type === 'cost-saving' && (
                                                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default DisneyBudgetCalculator;