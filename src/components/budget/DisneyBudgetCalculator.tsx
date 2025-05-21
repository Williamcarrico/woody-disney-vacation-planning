"use client"; // Required for Next.js App Router components with client-side interactivity

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Define interfaces for our state and props
interface SummaryCosts {
    tripDetailsCost: number;
    ticketCostTotal: number;
    accommodationCostTotal: number;
    transportationCostTotal: number;
    foodCostTotal: number;
    extrasCostTotal: number;
    subtotalCost: number;
    contingencyAmount: number;
    grandTotalCost: number;
    perPersonCost: number;
}

interface TripDetails {
    numAdults: number;
    numChildren: number;
    numNights: number;
    numParkDays: number;
}

interface TicketOptions {
    ticketType: string;
    avgTicketPriceAdult: number;
    avgTicketPriceChild: number;
    parkHopperCost: number;
    parkHopperPlusCost: number;
    geniePlus: number;
    individualLightningLanes: number;
}

interface AccommodationOptions {
    resortType: string;
    nightlyRate: number;
    resortParkingFee: number;
}

interface TransportationOptions {
    flightCost: number;
    airportTransport: number;
    rentalCarCost: number;
    gasTollsParking: number;
}

interface FoodOptions {
    foodEstimatePerPersonDay: number;
    characterDiningBudget: number;
    groceriesSnacks: number;
}

interface ExtrasOptions {
    souvenirBudget: number;
    memoryMakerCost: number;
    specialEventsCost: number;
}

const initialSummaryCosts: SummaryCosts = {
    tripDetailsCost: 0,
    ticketCostTotal: 0,
    accommodationCostTotal: 0,
    transportationCostTotal: 0,
    foodCostTotal: 0,
    extrasCostTotal: 0,
    subtotalCost: 0,
    contingencyAmount: 0,
    grandTotalCost: 0,
    perPersonCost: 0,
};

// Estimated nightly rates for resort categories
const resortNightlyRates: Record<string, number> = {
    value: 225,
    moderate: 350,
    deluxe: 700,
    deluxeVilla: 900,
    offSite: 150,
    custom: 0,
};

function DisneyBudgetCalculator() {
    // Group related state values into objects
    const [tripDetails, setTripDetails] = useState<TripDetails>({
        numAdults: 2,
        numChildren: 0,
        numNights: 5,
        numParkDays: 4
    });

    const [ticketOptions, setTicketOptions] = useState<TicketOptions>({
        ticketType: 'base',
        avgTicketPriceAdult: 150,
        avgTicketPriceChild: 140,
        parkHopperCost: 70,
        parkHopperPlusCost: 90,
        geniePlus: 25,
        individualLightningLanes: 0
    });

    const [accommodationOptions, setAccommodationOptions] = useState<AccommodationOptions>({
        resortType: 'value',
        nightlyRate: resortNightlyRates.value,
        resortParkingFee: 0
    });

    const [transportationOptions, setTransportationOptions] = useState<TransportationOptions>({
        flightCost: 0,
        airportTransport: 0,
        rentalCarCost: 0,
        gasTollsParking: 0
    });

    const [foodOptions, setFoodOptions] = useState<FoodOptions>({
        foodEstimatePerPersonDay: 75,
        characterDiningBudget: 0,
        groceriesSnacks: 0
    });

    const [extrasOptions, setExtrasOptions] = useState<ExtrasOptions>({
        souvenirBudget: 200,
        memoryMakerCost: 0,
        specialEventsCost: 0
    });

    const [contingencyPercent, setContingencyPercent] = useState<number>(10);
    const [summary, setSummary] = useState<SummaryCosts>(initialSummaryCosts);

    // Handle resort type change and update nightly rate
    useEffect(() => {
        if (accommodationOptions.resortType !== 'custom') {
            setAccommodationOptions(prev => ({
                ...prev,
                nightlyRate: resortNightlyRates[accommodationOptions.resortType] || 0
            }));
        }
    }, [accommodationOptions.resortType]);

    // Calculate ticket costs with useMemo
    const ticketCosts = useMemo(() => {
        const { numAdults, numChildren, numParkDays } = tripDetails;
        const {
            ticketType, avgTicketPriceAdult, avgTicketPriceChild,
            parkHopperCost, parkHopperPlusCost, geniePlus, individualLightningLanes
        } = ticketOptions;

        const totalPeople = numAdults + numChildren;
        const baseTicketCost = (numAdults * avgTicketPriceAdult * numParkDays) +
            (numChildren * avgTicketPriceChild * numParkDays);

        let ticketAddonCost = 0;
        if (ticketType === 'parkHopper') {
            ticketAddonCost = totalPeople * parkHopperCost;
        } else if (ticketType === 'parkHopperPlus') {
            ticketAddonCost = totalPeople * parkHopperPlusCost;
        }

        const totalTicketCost = baseTicketCost + ticketAddonCost;
        const totalGeniePlusCost = totalPeople * geniePlus * numParkDays;
        const finalTicketCost = totalTicketCost + totalGeniePlusCost + individualLightningLanes;

        return finalTicketCost;
    }, [tripDetails, ticketOptions]);

    // Calculate accommodation costs with useMemo
    const accommodationCosts = useMemo(() => {
        const { nightlyRate, resortParkingFee } = accommodationOptions;
        const { numNights } = tripDetails;
        return (nightlyRate * numNights) + resortParkingFee;
    }, [accommodationOptions, tripDetails]);

    // Calculate transportation costs with useMemo
    const transportationCosts = useMemo(() => {
        const { flightCost, airportTransport, rentalCarCost, gasTollsParking } = transportationOptions;
        return flightCost + airportTransport + rentalCarCost + gasTollsParking;
    }, [transportationOptions]);

    // Calculate food costs with useMemo
    const foodCosts = useMemo(() => {
        const { foodEstimatePerPersonDay, characterDiningBudget, groceriesSnacks } = foodOptions;
        const { numAdults, numChildren, numNights } = tripDetails;

        const totalPeople = numAdults + numChildren;
        const foodDays = numNights + 1;
        const dailyFoodTotal = totalPeople * foodEstimatePerPersonDay;
        return (dailyFoodTotal * foodDays) + characterDiningBudget + groceriesSnacks;
    }, [foodOptions, tripDetails]);

    // Calculate extras costs with useMemo
    const extrasCosts = useMemo(() => {
        const { souvenirBudget, memoryMakerCost, specialEventsCost } = extrasOptions;
        return souvenirBudget + memoryMakerCost + specialEventsCost;
    }, [extrasOptions]);

    // Calculate total costs with useMemo
    const totalCosts = useMemo(() => {
        const subtotal = ticketCosts + accommodationCosts + transportationCosts + foodCosts + extrasCosts;
        const contingencyAmount = subtotal * (contingencyPercent / 100);
        const grandTotal = subtotal + contingencyAmount;
        const totalPeople = tripDetails.numAdults + tripDetails.numChildren;
        const perPersonTotal = totalPeople > 0 ? grandTotal / totalPeople : 0;

        return {
            tripDetailsCost: 0,
            ticketCostTotal: ticketCosts,
            accommodationCostTotal: accommodationCosts,
            transportationCostTotal: transportationCosts,
            foodCostTotal: foodCosts,
            extrasCostTotal: extrasCosts,
            subtotalCost: subtotal,
            contingencyAmount: contingencyAmount,
            grandTotalCost: grandTotal,
            perPersonCost: perPersonTotal,
        };
    }, [
        ticketCosts,
        accommodationCosts,
        transportationCosts,
        foodCosts,
        extrasCosts,
        contingencyPercent,
        tripDetails.numAdults,
        tripDetails.numChildren
    ]);

    // Update summary when calculations change
    useEffect(() => {
        setSummary(totalCosts);
    }, [totalCosts]);

    // Optimized handlers for state updates
    const updateTripDetails = useCallback((field: keyof TripDetails, value: number) => {
        setTripDetails(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateTicketOptions = useCallback((field: keyof TicketOptions, value: string | number) => {
        setTicketOptions(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateAccommodationOptions = useCallback((field: keyof AccommodationOptions, value: string | number) => {
        setAccommodationOptions(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateTransportationOptions = useCallback((field: keyof TransportationOptions, value: number) => {
        setTransportationOptions(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateFoodOptions = useCallback((field: keyof FoodOptions, value: number) => {
        setFoodOptions(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const updateExtrasOptions = useCallback((field: keyof ExtrasOptions, value: number) => {
        setExtrasOptions(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format percentage for display
    const formatPercent = (percent: number) => {
        return `${percent}%`;
    };

    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Trip Details Section */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Trip Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="numAdults" className="block text-sm font-medium text-gray-700 mb-1">Number of Adults</label>
                            <input
                                id="numAdults"
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={tripDetails.numAdults}
                                onChange={(e) => updateTripDetails('numAdults', parseInt(e.target.value) || 0)}
                                aria-label="Number of Adults"
                            />
                        </div>
                        <div>
                            <label htmlFor="numChildren" className="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                            <input
                                id="numChildren"
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={tripDetails.numChildren}
                                onChange={(e) => updateTripDetails('numChildren', parseInt(e.target.value) || 0)}
                                aria-label="Number of Children"
                            />
                        </div>
                        <div>
                            <label htmlFor="numNights" className="block text-sm font-medium text-gray-700 mb-1">Number of Nights</label>
                            <input
                                id="numNights"
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={tripDetails.numNights}
                                onChange={(e) => updateTripDetails('numNights', parseInt(e.target.value) || 0)}
                                aria-label="Number of Nights"
                            />
                        </div>
                        <div>
                            <label htmlFor="numParkDays" className="block text-sm font-medium text-gray-700 mb-1">Number of Park Days</label>
                            <input
                                id="numParkDays"
                                type="number"
                                min="0"
                                max={tripDetails.numNights + 2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={tripDetails.numParkDays}
                                onChange={(e) => updateTripDetails('numParkDays', parseInt(e.target.value) || 0)}
                                aria-label="Number of Park Days"
                            />
                        </div>
                    </div>
                </div>

                {/* Tickets Section */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Tickets</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ticketType" className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                            <select
                                id="ticketType"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={ticketOptions.ticketType}
                                onChange={(e) => updateTicketOptions('ticketType', e.target.value)}
                                aria-label="Ticket Type"
                            >
                                <option value="base">Base Ticket (1 park per day)</option>
                                <option value="parkHopper">Park Hopper</option>
                                <option value="parkHopperPlus">Park Hopper Plus</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="ticketPriceAdult" className="block text-sm font-medium text-gray-700 mb-1">Adult Ticket Price (per day)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="ticketPriceAdult"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={ticketOptions.avgTicketPriceAdult}
                                    onChange={(e) => updateTicketOptions('avgTicketPriceAdult', parseInt(e.target.value) || 0)}
                                    aria-label="Adult Ticket Price per day"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="ticketPriceChild" className="block text-sm font-medium text-gray-700 mb-1">Child Ticket Price (per day)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="ticketPriceChild"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={ticketOptions.avgTicketPriceChild}
                                    onChange={(e) => updateTicketOptions('avgTicketPriceChild', parseInt(e.target.value) || 0)}
                                    aria-label="Child Ticket Price per day"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="geniePlus" className="block text-sm font-medium text-gray-700 mb-1">Genie+ Cost (per person per day)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="geniePlus"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={ticketOptions.geniePlus}
                                    onChange={(e) => updateTicketOptions('geniePlus', parseInt(e.target.value) || 0)}
                                    aria-label="Genie Plus Cost per person per day"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="lightningLanes" className="block text-sm font-medium text-gray-700 mb-1">Individual Lightning Lanes (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="lightningLanes"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={ticketOptions.individualLightningLanes}
                                    onChange={(e) => updateTicketOptions('individualLightningLanes', parseInt(e.target.value) || 0)}
                                    aria-label="Individual Lightning Lanes total cost"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accommodation Section */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Accommodation</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="resortType" className="block text-sm font-medium text-gray-700 mb-1">Resort Type</label>
                            <select
                                id="resortType"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={accommodationOptions.resortType}
                                onChange={(e) => updateAccommodationOptions('resortType', e.target.value)}
                                aria-label="Resort Type"
                            >
                                <option value="value">Value Resort (~$225/night)</option>
                                <option value="moderate">Moderate Resort (~$350/night)</option>
                                <option value="deluxe">Deluxe Resort (~$700/night)</option>
                                <option value="deluxeVilla">Deluxe Villa (~$900/night)</option>
                                <option value="offSite">Off-Site Hotel (~$150/night)</option>
                                <option value="custom">Custom Rate</option>
                            </select>
                        </div>
                        {accommodationOptions.resortType === 'custom' && (
                            <div>
                                <label htmlFor="nightlyRate" className="block text-sm font-medium text-gray-700 mb-1">Nightly Rate</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                    <input
                                        id="nightlyRate"
                                        type="number"
                                        min="0"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={accommodationOptions.nightlyRate}
                                        onChange={(e) => updateAccommodationOptions('nightlyRate', parseInt(e.target.value) || 0)}
                                        aria-label="Nightly Rate"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="resortParkingFee" className="block text-sm font-medium text-gray-700 mb-1">Resort Parking Fee (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="resortParkingFee"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={accommodationOptions.resortParkingFee}
                                    onChange={(e) => updateAccommodationOptions('resortParkingFee', parseInt(e.target.value) || 0)}
                                    aria-label="Resort Parking Fee total"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Transportation Section */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Transportation</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="flightCost" className="block text-sm font-medium text-gray-700 mb-1">Flight Costs (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="flightCost"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={transportationOptions.flightCost}
                                    onChange={(e) => updateTransportationOptions('flightCost', parseInt(e.target.value) || 0)}
                                    aria-label="Flight Costs total"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="airportTransport" className="block text-sm font-medium text-gray-700 mb-1">Airport Transportation (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="airportTransport"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={transportationOptions.airportTransport}
                                    onChange={(e) => updateTransportationOptions('airportTransport', parseInt(e.target.value) || 0)}
                                    aria-label="Airport Transportation total"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="rentalCarCost" className="block text-sm font-medium text-gray-700 mb-1">Rental Car (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="rentalCarCost"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={transportationOptions.rentalCarCost}
                                    onChange={(e) => updateTransportationOptions('rentalCarCost', parseInt(e.target.value) || 0)}
                                    aria-label="Rental Car total"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="gasTollsParking" className="block text-sm font-medium text-gray-700 mb-1">Gas, Tolls & Parking (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="gasTollsParking"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={transportationOptions.gasTollsParking}
                                    onChange={(e) => updateTransportationOptions('gasTollsParking', parseInt(e.target.value) || 0)}
                                    aria-label="Gas, Tolls and Parking total"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Food Section */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Food & Dining</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="foodEstimatePerPersonDay" className="block text-sm font-medium text-gray-700 mb-1">Food Budget (per person per day)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="foodEstimatePerPersonDay"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={foodOptions.foodEstimatePerPersonDay}
                                    onChange={(e) => updateFoodOptions('foodEstimatePerPersonDay', parseInt(e.target.value) || 0)}
                                    aria-label="Food Budget per person per day"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="characterDiningBudget" className="block text-sm font-medium text-gray-700 mb-1">Character Dining (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="characterDiningBudget"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={foodOptions.characterDiningBudget}
                                    onChange={(e) => updateFoodOptions('characterDiningBudget', parseInt(e.target.value) || 0)}
                                    aria-label="Character Dining total"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="groceriesSnacks" className="block text-sm font-medium text-gray-700 mb-1">Groceries & Snacks (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="groceriesSnacks"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={foodOptions.groceriesSnacks}
                                    onChange={(e) => updateFoodOptions('groceriesSnacks', parseInt(e.target.value) || 0)}
                                    aria-label="Groceries and Snacks total"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extras Section */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Extras</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="souvenirBudget" className="block text-sm font-medium text-gray-700 mb-1">Souvenir Budget (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="souvenirBudget"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={extrasOptions.souvenirBudget}
                                    onChange={(e) => updateExtrasOptions('souvenirBudget', parseInt(e.target.value) || 0)}
                                    aria-label="Souvenir Budget total"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="memoryMakerCost" className="block text-sm font-medium text-gray-700 mb-1">Memory Maker Photo Package</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="memoryMakerCost"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={extrasOptions.memoryMakerCost}
                                    onChange={(e) => updateExtrasOptions('memoryMakerCost', parseInt(e.target.value) || 0)}
                                    aria-label="Memory Maker Photo Package cost"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="specialEventsCost" className="block text-sm font-medium text-gray-700 mb-1">Special Events (total)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                                <input
                                    id="specialEventsCost"
                                    type="number"
                                    min="0"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={extrasOptions.specialEventsCost}
                                    onChange={(e) => updateExtrasOptions('specialEventsCost', parseInt(e.target.value) || 0)}
                                    aria-label="Special Events total cost"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="contingencyPercent" className="block text-sm font-medium text-gray-700 mb-1">Contingency (%)</label>
                            <div className="relative">
                                <input
                                    id="contingencyPercent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={contingencyPercent}
                                    onChange={(e) => setContingencyPercent(parseInt(e.target.value) || 0)}
                                    aria-label="Contingency Percentage"
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
                <h2 className="text-2xl font-bold mb-6 text-center">Budget Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Trip Details</h3>
                        <ul className="space-y-1">
                            <li className="flex justify-between">
                                <span>Adults:</span>
                                <span>{tripDetails.numAdults}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Children:</span>
                                <span>{tripDetails.numChildren}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Total People:</span>
                                <span>{tripDetails.numAdults + tripDetails.numChildren}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Nights:</span>
                                <span>{tripDetails.numNights}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Park Days:</span>
                                <span>{tripDetails.numParkDays}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Costs Breakdown</h3>
                        <ul className="space-y-1">
                            <li className="flex justify-between">
                                <span>Tickets:</span>
                                <span>{formatCurrency(summary.ticketCostTotal)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Accommodation:</span>
                                <span>{formatCurrency(summary.accommodationCostTotal)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Transportation:</span>
                                <span>{formatCurrency(summary.transportationCostTotal)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Food & Dining:</span>
                                <span>{formatCurrency(summary.foodCostTotal)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Extras:</span>
                                <span>{formatCurrency(summary.extrasCostTotal)}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Totals</h3>
                        <ul className="space-y-1">
                            <li className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(summary.subtotalCost)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Contingency ({formatPercent(contingencyPercent)}):</span>
                                <span>{formatCurrency(summary.contingencyAmount)}</span>
                            </li>
                            <li className="flex justify-between font-bold text-xl mt-2 pt-2 border-t border-white">
                                <span>GRAND TOTAL:</span>
                                <span>{formatCurrency(summary.grandTotalCost)}</span>
                            </li>
                            <li className="flex justify-between font-semibold mt-2">
                                <span>Cost Per Person:</span>
                                <span>{formatCurrency(summary.perPersonCost)}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-gray-600">
                <p className="text-sm">
                    This calculator provides estimates based on your inputs. Actual costs may vary based on season, promotions, and personal choices.
                </p>
            </div>
        </div>
    );
}

export default DisneyBudgetCalculator;