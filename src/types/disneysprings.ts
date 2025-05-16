export interface DisneySpringLocation {
    id: string;
    name: string;
    description: string;
    category: LocationCategory;
    area: LocationArea;
    tags: string[];
    imageUrl: string;
    websiteUrl?: string;
    priceRange?: PriceRange;
    hours?: string;
    phoneNumber?: string;
    featuredItems?: string[];
    isNew?: boolean;
    isComingSoon?: boolean;
}

export enum LocationCategory {
    Shopping = "Shopping",
    Dining = "Dining",
    Entertainment = "Entertainment",
    Experience = "Experience"
}

export enum LocationArea {
    Marketplace = "Marketplace",
    TheLanding = "The Landing",
    TownCenter = "Town Center",
    WestSide = "West Side"
}

export enum ShoppingSubcategory {
    ApparelAndAccessories = "Apparel & Accessories",
    ToysAndPlush = "Toys & Plush",
    ArtAndCollectibles = "Art & Collectibles",
    HealthAndBeauty = "Health & Beauty",
    GiftsAndHousewares = "Gifts & Housewares",
    CartsAndKiosks = "Carts & Kiosks",
    Shoes = "Shoes",
    Food = "Food"
}

export enum DiningSubcategory {
    TableService = "Table Service",
    QuickService = "Quick Service",
    SpecialtyFoodAndBeverage = "Specialty Food & Beverage",
    BarsAndLounges = "Bars & Lounges",
    Dinner = "Dinner",
    LateNightDining = "Late-Night Dining",
    CartsAndKiosks = "Carts & Kiosks",
    DiningEvents = "Dining Events"
}

export enum PriceRange {
    Low = "$",
    Medium = "$$",
    High = "$$$",
    VeryHigh = "$$$$"
}

export interface ShoppingLocation extends DisneySpringLocation {
    category: LocationCategory.Shopping;
    subcategory: ShoppingSubcategory;
}

export interface DiningLocation extends DisneySpringLocation {
    category: LocationCategory.Dining;
    subcategory: DiningSubcategory;
    cuisine?: string[];
    requiresReservation?: boolean;
    diningPlans?: string[];
    menu?: MenuHighlight[];
}

export interface EntertainmentLocation extends DisneySpringLocation {
    category: LocationCategory.Entertainment;
    ageRecommendation?: string;
    duration?: string;
    ticketRequired?: boolean;
}

export interface MenuHighlight {
    name: string;
    description: string;
    price?: number;
    imageUrl?: string;
}