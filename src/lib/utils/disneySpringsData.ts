import {
    DisneySpringLocation,
    LocationCategory,
    LocationArea,
    ShoppingSubcategory,
    DiningSubcategory,
    ShoppingLocation,
    DiningLocation,
    EntertainmentLocation,
    PriceRange
} from "@/types/disneysprings"

// Shopping Locations
export const shoppingLocations: ShoppingLocation[] = [
    {
        id: "world-of-disney",
        name: "World of Disney",
        description: "The ultimate Disney merchandise destination featuring the largest collection of Disney toys, souvenirs, accessories, collectibles and more.",
        category: LocationCategory.Shopping,
        subcategory: ShoppingSubcategory.ToysAndPlush,
        area: LocationArea.Marketplace,
        tags: ["Disney merchandise", "Souvenirs", "Toys", "Apparel"],
        imageUrl: "/images/disney-springs/world-of-disney.jpg",
        hours: "10:00 AM - 11:00 PM",
        featuredItems: ["Mickey Mouse plush toys", "Disney Princess merchandise", "Exclusive Disney Springs collections"],
    },
    {
        id: "uniqlo",
        name: "UNIQLO",
        description: "Japanese retailer offering high-quality casual wear, innovative fabrics, and affordable basics for everyone.",
        category: LocationCategory.Shopping,
        subcategory: ShoppingSubcategory.ApparelAndAccessories,
        area: LocationArea.TownCenter,
        tags: ["Apparel", "Fashion", "T-shirts", "Casual wear"],
        imageUrl: "/images/disney-springs/uniqlo.jpg",
        hours: "10:00 AM - 11:00 PM",
        featuredItems: ["Disney-themed T-shirts", "AIRism technology clothing", "UltraLight Down jackets"],
    },
    {
        id: "the-lego-store",
        name: "The LEGO Store",
        description: "An immersive LEGO shopping experience with impressive LEGO sculptures, build stations, and the largest selection of LEGO sets.",
        category: LocationCategory.Shopping,
        subcategory: ShoppingSubcategory.ToysAndPlush,
        area: LocationArea.Marketplace,
        tags: ["LEGO", "Building sets", "Toys", "Family-friendly"],
        imageUrl: "/images/disney-springs/lego-store.jpg",
        hours: "10:00 AM - 11:00 PM",
        featuredItems: ["Disney Castle LEGO set", "Star Wars collections", "Pick-a-Brick wall"],
    },
    {
        id: "sephora",
        name: "Sephora",
        description: "Beauty retailer offering cosmetics, skincare, fragrance, and personal care products from a variety of brands.",
        category: LocationCategory.Shopping,
        subcategory: ShoppingSubcategory.HealthAndBeauty,
        area: LocationArea.TownCenter,
        tags: ["Beauty", "Cosmetics", "Skincare", "Fragrance"],
        imageUrl: "/images/disney-springs/sephora.jpg",
        hours: "10:00 AM - 11:00 PM",
    },
    {
        id: "anthropologie",
        name: "Anthropologie",
        description: "Unique, eclectic retail destination offering women's clothing, accessories, home décor, and gifts.",
        category: LocationCategory.Shopping,
        subcategory: ShoppingSubcategory.ApparelAndAccessories,
        area: LocationArea.TownCenter,
        tags: ["Women's fashion", "Home décor", "Bohemian style", "Gifts"],
        imageUrl: "/images/disney-springs/anthropologie.jpg",
        hours: "10:00 AM - 11:00 PM",
    },
]

// Dining Locations
export const diningLocations: DiningLocation[] = [
    {
        id: "the-boathouse",
        name: "The BOATHOUSE",
        description: "Upscale, waterfront dining featuring steaks, chops, fresh seafood and a raw bar in a nautical setting.",
        category: LocationCategory.Dining,
        subcategory: DiningSubcategory.TableService,
        area: LocationArea.TheLanding,
        tags: ["Waterfront dining", "Seafood", "Steaks", "Amphicar tours"],
        imageUrl: "/images/disney-springs/boathouse.jpg",
        priceRange: PriceRange.High,
        cuisine: ["Seafood", "American", "Steakhouse"],
        requiresReservation: true,
        hours: "11:00 AM - 11:00 PM",
        phoneNumber: "(407) 939-2628",
        menu: [
            {
                name: "Filet Mignon",
                description: "8oz center-cut filet with choice of two sides",
                price: 49,
            },
            {
                name: "Lobster Roll",
                description: "Maine lobster with drawn butter on a New England roll",
                price: 34,
            },
        ],
    },
    {
        id: "chef-art-smith-homecomin",
        name: "Chef Art Smith's Homecomin'",
        description: "Farm-to-table Southern cuisine featuring locally sourced ingredients and Chef Art Smith's famous fried chicken.",
        category: LocationCategory.Dining,
        subcategory: DiningSubcategory.TableService,
        area: LocationArea.TheLanding,
        tags: ["Southern cuisine", "Fried chicken", "Comfort food", "Farm-to-table"],
        imageUrl: "/images/disney-springs/homecomin.jpg",
        priceRange: PriceRange.Medium,
        cuisine: ["Southern", "American", "Comfort Food"],
        requiresReservation: true,
        hours: "11:00 AM - 11:00 PM",
        phoneNumber: "(407) 560-0100",
        menu: [
            {
                name: "Art's Famous Fried Chicken",
                description: "Buttermilk-brined for 24 hours and double-battered, with mashed potatoes and a cheddar drop biscuit",
                price: 32,
            },
            {
                name: "Hummingbird Cake",
                description: "Pineapple-banana cake with cream cheese frosting",
                price: 12,
            },
        ],
    },
    {
        id: "gideons-bakehouse",
        name: "Gideon's Bakehouse",
        description: "Artisanal bakery known for nearly half-pound cookies and decadent cake slices in a Victorian-inspired setting.",
        category: LocationCategory.Dining,
        subcategory: DiningSubcategory.SpecialtyFoodAndBeverage,
        area: LocationArea.TheLanding,
        tags: ["Cookies", "Desserts", "Bakery", "Coffee"],
        imageUrl: "/images/disney-springs/gideons.jpg",
        priceRange: PriceRange.Low,
        cuisine: ["Bakery", "Desserts"],
        hours: "10:00 AM - 10:00 PM",
        menu: [
            {
                name: "Original Chocolate Chip Cookie",
                description: "Nearly half-pound cookie loaded with chocolate chips",
                price: 6,
            },
            {
                name: "Peanut Butter Cold Brew",
                description: "Cold brew coffee infused with peanut butter flavor",
                price: 6.5,
            },
        ],
        isNew: true,
    },
    {
        id: "wine-bar-george",
        name: "Wine Bar George",
        description: "The only Master Sommelier-led wine bar in Florida offering more than 140 wines by the glass and bottle.",
        category: LocationCategory.Dining,
        subcategory: DiningSubcategory.BarsAndLounges,
        area: LocationArea.TheLanding,
        tags: ["Wine", "Small plates", "Charcuterie", "Upscale casual"],
        imageUrl: "/images/disney-springs/wine-bar-george.jpg",
        priceRange: PriceRange.Medium,
        cuisine: ["Wine Bar", "American", "Small Plates"],
        requiresReservation: true,
        hours: "11:00 AM - 12:00 AM",
        phoneNumber: "(407) 490-1800",
    },
    {
        id: "d-luxe-burger",
        name: "D-Luxe Burger",
        description: "Gourmet burgers, hand-cut fries, and artisanal milkshakes in a ranch-inspired setting.",
        category: LocationCategory.Dining,
        subcategory: DiningSubcategory.QuickService,
        area: LocationArea.TownCenter,
        tags: ["Burgers", "Fries", "Milkshakes", "Quick service"],
        imageUrl: "/images/disney-springs/d-luxe-burger.jpg",
        priceRange: PriceRange.Low,
        cuisine: ["American", "Burgers"],
        hours: "10:30 AM - 11:00 PM",
    },
]

// Entertainment and Experiences
export const entertainmentLocations: EntertainmentLocation[] = [
    {
        id: "drawn-to-life",
        name: "Drawn to Life Presented by Cirque du Soleil & Disney",
        description: "A creative collaboration between Cirque du Soleil, Walt Disney Animation Studios, and Walt Disney Imagineering bringing animation to life through acrobatic performances.",
        category: LocationCategory.Entertainment,
        area: LocationArea.WestSide,
        tags: ["Cirque du Soleil", "Live show", "Performance", "Acrobatics"],
        imageUrl: "/images/disney-springs/cirque-du-soleil.jpg",
        ticketRequired: true,
        duration: "90 minutes",
        ageRecommendation: "All ages",
        hours: "Shows at 5:30 PM and 8:30 PM, Tuesday-Saturday",
        phoneNumber: "(407) 939-7600",
    },
    {
        id: "aerophile-balloon-flight",
        name: "Aerophile – The World Leader in Balloon Flight",
        description: "Soar to heights of 400 feet in the world's largest tethered helium balloon for breathtaking 360-degree views of Walt Disney World Resort.",
        category: LocationCategory.Entertainment,
        area: LocationArea.WestSide,
        tags: ["Aerial views", "Balloon ride", "Photo opportunity", "Unique experience"],
        imageUrl: "/images/disney-springs/aerophile.jpg",
        ticketRequired: true,
        duration: "8-10 minutes",
        ageRecommendation: "All ages",
        hours: "8:30 AM - 12:00 AM (Weather permitting)",
        phoneNumber: "(407) 939-7900",
    },
    {
        id: "splitsville-luxury-lanes",
        name: "Splitsville Luxury Lanes",
        description: "A bowling and entertainment complex offering a unique atmosphere with 30 lanes across two floors, plus billiards, live music, and full-service dining.",
        category: LocationCategory.Entertainment,
        area: LocationArea.WestSide,
        tags: ["Bowling", "Family entertainment", "Dining", "Games"],
        imageUrl: "/images/disney-springs/splitsville.jpg",
        hours: "11:00 AM - 1:00 AM",
        phoneNumber: "(407) 938-7467",
    },
    {
        id: "amphicar-tours",
        name: "Vintage Amphicar Tours",
        description: "Experience a captain-guided tour aboard a rare Amphicar that drives on land and cruises through water.",
        category: LocationCategory.Entertainment,
        area: LocationArea.TheLanding,
        tags: ["Water tour", "Vintage cars", "Unique experience", "Photo opportunity"],
        imageUrl: "/images/disney-springs/amphicar.jpg",
        ticketRequired: true,
        duration: "20 minutes",
        hours: "10:00 AM - 10:00 PM (Weather permitting)",
        phoneNumber: "(407) 939-2628",
    },
    {
        id: "marketplace-carousel",
        name: "Marketplace Carousel",
        description: "A classic carousel offering a nostalgic ride experience for children and families.",
        category: LocationCategory.Entertainment,
        area: LocationArea.Marketplace,
        tags: ["Family attraction", "Kids", "Classic ride"],
        imageUrl: "/images/disney-springs/carousel.jpg",
        ticketRequired: true,
        duration: "5 minutes",
        ageRecommendation: "All ages",
        hours: "10:00 AM - 11:00 PM",
    },
]

// Combined Locations
export const disneySpringsLocations: DisneySpringLocation[] = [
    ...shoppingLocations,
    ...diningLocations,
    ...entertainmentLocations,
]