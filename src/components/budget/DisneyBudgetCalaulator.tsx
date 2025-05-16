// components/DisneyBudgetCalculator.tsx
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

    // Helper for number inputs - using generic type parameter
    const handleNumberChange = useCallback(<T extends object>(setter: (field: keyof T, value: number) => void, field: keyof T) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setter(field, value === '' ? 0 : parseFloat(value));
        }, []);

    // Helper for integer inputs - using generic type parameter
    const handleIntChange = useCallback(<T extends object>(setter: (field: keyof T, value: number) => void, field: keyof T) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setter(field, value === '' ? 0 : parseInt(value, 10));
        }, []);

    // Helper for select inputs - using generic type parameter
    const handleSelectChange = useCallback(<T extends object>(setter: (field: keyof T, value: string) => void, field: keyof T) =>
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setter(field, e.target.value);
        }, []);

    return (
        <div className="calculator-container max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-xl my-8 font-inter">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-800">Walt Disney World&reg; Vacation Budget Calculator</h1>

            {/* Trip Details Section */}
            <section id="tripDetails" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">1. Trip Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="numAdults" className="block font-medium mb-1 text-gray-700">Number of Adults (10+)</label>
                        <input type="number" id="numAdults" value={tripDetails.numAdults} onChange={handleIntChange(updateTripDetails, 'numAdults')} min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="numChildren" className="block font-medium mb-1 text-gray-700">Number of Children (3-9)</label>
                        <input type="number" id="numChildren" value={tripDetails.numChildren} onChange={handleIntChange(updateTripDetails, 'numChildren')} min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="numNights" className="block font-medium mb-1 text-gray-700">Length of Stay (Nights)</label>
                        <input type="number" id="numNights" value={tripDetails.numNights} onChange={handleIntChange(updateTripDetails, 'numNights')} min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="numParkDays" className="block font-medium mb-1 text-gray-700">Number of Park Days</label>
                        <input type="number" id="numParkDays" value={tripDetails.numParkDays} onChange={handleIntChange(updateTripDetails, 'numParkDays')} min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
                    </div>
                </div>
            </section>

            {/* Park Tickets Section */}
            <section id="parkTickets" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">2. Park Tickets</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="ticketType" className="block font-medium mb-1 text-gray-700">Ticket Type</label>
                        <select id="ticketType" value={ticketOptions.ticketType} onChange={handleSelectChange(updateTicketOptions, 'ticketType')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow">
                            <option value="base">Base Ticket (1 Park Per Day)</option>
                            <option value="parkHopper">Park Hopper</option>
                            <option value="parkHopperPlus">Park Hopper Plus</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="avgTicketPriceAdult" className="block font-medium mb-1 text-gray-700">Avg. Daily Adult Ticket Price ($)</label>
                        <input type="number" id="avgTicketPriceAdult" value={ticketOptions.avgTicketPriceAdult} onChange={handleNumberChange(updateTicketOptions, 'avgTicketPriceAdult')} min="50" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 150" />
                        <p className="text-xs text-gray-500 mt-1">Estimate per adult, per day. Prices vary by date.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="avgTicketPriceChild" className="block font-medium mb-1 text-gray-700">Avg. Daily Child Ticket Price ($)</label>
                        <input type="number" id="avgTicketPriceChild" value={ticketOptions.avgTicketPriceChild} onChange={handleNumberChange(updateTicketOptions, 'avgTicketPriceChild')} min="50" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 140" />
                        <p className="text-xs text-gray-500 mt-1">Estimate per child (3-9), per day.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="parkHopperCost" className="block font-medium mb-1 text-gray-700">Park Hopper Add-on (per ticket, total)</label>
                        <input type="number" id="parkHopperCost" value={ticketOptions.parkHopperCost} onChange={handleNumberChange(updateTicketOptions, 'parkHopperCost')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 70" />
                        <p className="text-xs text-gray-500 mt-1">Total add-on cost for Park Hopper for the entire ticket length.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="parkHopperPlusCost" className="block font-medium mb-1 text-gray-700">Park Hopper Plus Add-on (per ticket, total)</label>
                        <input type="number" id="parkHopperPlusCost" value={ticketOptions.parkHopperPlusCost} onChange={handleNumberChange(updateTicketOptions, 'parkHopperPlusCost')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 90" />
                        <p className="text-xs text-gray-500 mt-1">Total add-on cost for Park Hopper Plus for the entire ticket length.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="geniePlus" className="block font-medium mb-1 text-gray-700">Genie+ Per Person Per Day ($)</label>
                        <input type="number" id="geniePlus" value={ticketOptions.geniePlus} onChange={handleNumberChange(updateTicketOptions, 'geniePlus')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 25" />
                        <p className="text-xs text-gray-500 mt-1">Avg. cost if you plan to use Genie+.</p>
                    </div>
                    <div className="input-group">
                        <label htmlFor="individualLightningLanes" className="block font-medium mb-1 text-gray-700">Total Estimated ILL Cost ($ for whole trip)</label>
                        <input type="number" id="individualLightningLanes" value={ticketOptions.individualLightningLanes} onChange={handleNumberChange(updateTicketOptions, 'individualLightningLanes')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 100" />
                        <p className="text-xs text-gray-500 mt-1">Total budget for all Individual Lightning Lanes.</p>
                    </div>
                </div>
            </section>

            {/* Accommodation Section */}
            <section id="accommodation" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">3. Accommodation</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="resortType" className="block font-medium mb-1 text-gray-700">Resort Category / Type</label>
                        <select id="resortType" value={accommodationOptions.resortType} onChange={handleSelectChange(updateAccommodationOptions, 'resortType')} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow">
                            <option value="value">Value Resort (e.g., All-Star Movies)</option>
                            <option value="moderate">Moderate Resort (e.g., Caribbean Beach)</option>
                            <option value="deluxe">Deluxe Resort (e.g., Polynesian)</option>
                            <option value="deluxeVilla">Deluxe Villa (e.g., Bay Lake Tower)</option>
                            <option value="offSite">Off-site Hotel / Rental</option>
                            <option value="custom">Custom Nightly Rate</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="nightlyRate" className="block font-medium mb-1 text-gray-700">Average Nightly Rate ($)</label>
                        <input type="number" id="nightlyRate" value={accommodationOptions.nightlyRate} onChange={handleNumberChange(updateAccommodationOptions, 'nightlyRate')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="Auto-fills or enter custom" disabled={accommodationOptions.resortType !== 'custom'} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="resortParkingFee" className="block font-medium mb-1 text-gray-700">Resort Parking (Total for stay, $)</label>
                        <input type="number" id="resortParkingFee" value={accommodationOptions.resortParkingFee} onChange={handleNumberChange(updateAccommodationOptions, 'resortParkingFee')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 100" />
                        <p className="text-xs text-gray-500 mt-1">Many Disney resorts have parking fees.</p>
                    </div>
                </div>
            </section>

            {/* Transportation Section */}
            <section id="transportation" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">4. Transportation</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="flightCost" className="block font-medium mb-1 text-gray-700">Flights (Total, Round-trip $)</label>
                        <input type="number" id="flightCost" value={transportationOptions.flightCost} onChange={handleNumberChange(updateTransportationOptions, 'flightCost')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 800" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="airportTransport" className="block font-medium mb-1 text-gray-700">Airport Transportation (Total, Round-trip $)</label>
                        <input type="number" id="airportTransport" value={transportationOptions.airportTransport} onChange={handleNumberChange(updateTransportationOptions, 'airportTransport')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 150" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="rentalCarCost" className="block font-medium mb-1 text-gray-700">Rental Car (Total, excl. gas/parking $)</label>
                        <input type="number" id="rentalCarCost" value={transportationOptions.rentalCarCost} onChange={handleNumberChange(updateTransportationOptions, 'rentalCarCost')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 300" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="gasTollsParking" className="block font-medium mb-1 text-gray-700">Gas, Tolls & Theme Park Parking (Total $)</label>
                        <input type="number" id="gasTollsParking" value={transportationOptions.gasTollsParking} onChange={handleNumberChange(updateTransportationOptions, 'gasTollsParking')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 100" />
                        <p className="text-xs text-gray-500 mt-1">Theme park parking is ~$30/day if not staying at a Disney resort with free park parking.</p>
                    </div>
                </div>
            </section>

            {/* Food & Dining Section */}
            <section id="foodDining" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">5. Food & Dining</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="foodEstimatePerPersonDay" className="block font-medium mb-1 text-gray-700">Daily Food Estimate Per Person ($)</label>
                        <input type="number" id="foodEstimatePerPersonDay" value={foodOptions.foodEstimatePerPersonDay} onChange={handleNumberChange(updateFoodOptions, 'foodEstimatePerPersonDay')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 75" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="characterDiningBudget" className="block font-medium mb-1 text-gray-700">Character Dining / Signature Meals (Total extra $)</label>
                        <input type="number" id="characterDiningBudget" value={foodOptions.characterDiningBudget} onChange={handleNumberChange(updateFoodOptions, 'characterDiningBudget')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 300" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="groceriesSnacks" className="block font-medium mb-1 text-gray-700">Groceries & Snacks (Total $)</label>
                        <input type="number" id="groceriesSnacks" value={foodOptions.groceriesSnacks} onChange={handleNumberChange(updateFoodOptions, 'groceriesSnacks')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 100" />
                    </div>
                </div>
            </section>

            {/* Souvenirs & Extras Section */}
            <section id="souvenirsExtras" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">6. Souvenirs & Extras</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="souvenirBudget" className="block font-medium mb-1 text-gray-700">Souvenir Budget (Total $)</label>
                        <input type="number" id="souvenirBudget" value={extrasOptions.souvenirBudget} onChange={handleNumberChange(updateExtrasOptions, 'souvenirBudget')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 200" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="memoryMakerCost" className="block font-medium mb-1 text-gray-700">Memory Maker / PhotoPass ($)</label>
                        <input type="number" id="memoryMakerCost" value={extrasOptions.memoryMakerCost} onChange={handleNumberChange(updateExtrasOptions, 'memoryMakerCost')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 199" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="specialEventsCost" className="block font-medium mb-1 text-gray-700">Special Events/Tours (Total $)</label>
                        <input type="number" id="specialEventsCost" value={extrasOptions.specialEventsCost} onChange={handleNumberChange(updateExtrasOptions, 'specialEventsCost')} min="0" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., After Hours" />
                    </div>
                </div>
            </section>

            {/* Contingency Fund Section */}
            <section id="contingency" className="mb-8">
                <h2 className="section-title text-xl font-semibold text-blue-700 mb-6 pb-2 border-b-2 border-blue-500">7. Contingency Fund</h2>
                <div className="input-group">
                    <label htmlFor="contingencyPercent" className="block font-medium mb-1 text-gray-700">Contingency Percentage (%)</label>
                    <input type="number" id="contingencyPercent" value={contingencyPercent} onChange={(e) => setContingencyPercent(e.target.value === '' ? 0 : parseFloat(e.target.value))} min="0" max="100" step="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" placeholder="e.g., 10" />
                    <p className="text-xs text-gray-500 mt-1">Recommended for unexpected expenses.</p>
                </div>
            </section>

            {/* Summary Section */}
            <section className="summary-section bg-blue-50 p-6 rounded-xl">
                <h2 className="summary-title text-2xl font-bold text-blue-800 mb-6 text-center">Budget Summary</h2>
                <div id="summaryOutput" className="space-y-2">
                    <div className="summary-item flex justify-between text-gray-700"><span className="font-semibold text-blue-700">Park Tickets Cost:</span> <span className="font-bold text-blue-600">${summary.ticketCostTotal.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-gray-700"><span className="font-semibold text-blue-700">Accommodation Cost:</span> <span className="font-bold text-blue-600">${summary.accommodationCostTotal.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-gray-700"><span className="font-semibold text-blue-700">Transportation Cost:</span> <span className="font-bold text-blue-600">${summary.transportationCostTotal.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-gray-700"><span className="font-semibold text-blue-700">Food & Dining Cost:</span> <span className="font-bold text-blue-600">${summary.foodCostTotal.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-gray-700"><span className="font-semibold text-blue-700">Souvenirs & Extras Cost:</span> <span className="font-bold text-blue-600">${summary.extrasCostTotal.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-gray-700 pt-2 border-t border-blue-200"><span className="font-semibold text-blue-700">Subtotal:</span> <span className="font-bold text-blue-600">${summary.subtotalCost.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-gray-700"><span className="font-semibold text-blue-700">Contingency Fund:</span> <span className="font-bold text-blue-600">${summary.contingencyAmount.toFixed(2)}</span></div>
                    <hr className="my-3 border-blue-300" />
                    <div className="summary-item grand-total flex justify-between text-xl text-blue-800 font-bold pt-2 border-t-2 border-blue-500"><span>GRAND TOTAL:</span> <span>${summary.grandTotalCost.toFixed(2)}</span></div>
                    <div className="summary-item flex justify-between text-lg text-blue-700 mt-1"><span className="font-semibold">Per Person Total:</span> <span className="font-bold">${summary.perPersonCost.toFixed(2)}</span></div>
                </div>
                <p className="disclaimer text-xs text-gray-600 mt-6 text-center">All prices are estimates. Please check official Walt Disney World sources for current pricing. This calculator is for planning purposes only.</p>
            </section>
        </div>
    );
}

export default React.memo(DisneyBudgetCalculator);