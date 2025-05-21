# Disney Vacation Planning Architecture

This document provides a comprehensive overview of the Disney Vacation Planning application architecture, detailing key components, data flow, and system interactions.

## System Architecture Overview

The application is built as a modern web application using Next.js 15, leveraging both server and client components for optimal performance and user experience.

```mermaid
graph TD
    User[User Browser]
    NextApp[Next.js Application]
    ServerComp[Server Components]
    ClientComp[Client Components]
    FirebaseAuth[Firebase Authentication]
    FirebaseDB[Firebase Database]
    ThirdParty[Third-Party APIs]

    User <--> NextApp
    NextApp --> ServerComp
    NextApp --> ClientComp
    ServerComp --> FirebaseDB
    ClientComp --> FirebaseDB
    NextApp <--> FirebaseAuth
    NextApp <--> ThirdParty

    subgraph "Server Side"
        ServerComp
        NextApp
    end

    subgraph "Client Side"
        ClientComp
        User
    end

    subgraph "External Services"
        FirebaseAuth
        FirebaseDB
        ThirdParty
    end
```

## Core Components

### Frontend Architecture

The frontend architecture follows the Next.js App Router pattern, with a mix of server and client components.

```mermaid
graph TD
    AppRouter[App Router]
    ServerComponents[Server Components]
    ClientComponents[Client Components]
    SharedComponents[Shared UI Components]
    Hooks[Custom Hooks]
    Utils[Utility Functions]

    AppRouter --> Pages[Pages]
    Pages --> ServerComponents
    Pages --> ClientComponents
    ServerComponents --> SharedComponents
    ClientComponents --> SharedComponents
    ClientComponents --> Hooks
    ServerComponents --> Utils
    ClientComponents --> Utils

    subgraph "Component Layer"
        ServerComponents
        ClientComponents
        SharedComponents
    end

    subgraph "Logic Layer"
        Hooks
        Utils
    end
```

### Data Flow Architecture

Data flows through the application in the following manner:

```mermaid
sequenceDiagram
    participant User
    participant ClientComponent
    participant ServerComponent
    participant NextAPI
    participant External as External APIs
    participant Database

    User->>ClientComponent: Interaction
    ClientComponent->>ServerComponent: Server Action
    ServerComponent->>NextAPI: Data Request
    NextAPI->>External: External API Call
    External->>NextAPI: API Response
    NextAPI->>Database: Persist Data
    Database->>NextAPI: Data Response
    NextAPI->>ServerComponent: Process Data
    ServerComponent->>ClientComponent: Update UI
    ClientComponent->>User: Render Result
```

## Key Modules

### Authentication Module

Handles user authentication and authorization using Firebase Authentication.

```mermaid
flowchart TD
    Login[Login Page]
    SignUp[Sign Up Page]
    FirebaseAuth[Firebase Authentication]
    Session[Session Management]
    UserContext[User Context]

    Login -->|Credentials| FirebaseAuth
    SignUp -->|New User| FirebaseAuth
    FirebaseAuth -->|Token| Session
    Session -->|User Data| UserContext
    UserContext -->|Auth State| Login
    UserContext -->|Auth State| Dashboard[Dashboard]
```

### Optimizer Module

The core planning engine that generates optimized park itineraries.

```mermaid
flowchart TD
    UserPrefs[User Preferences]
    HistoricalData[Historical Wait Time Data]
    ParkData[Park Layout & Attractions]
    OptEngine[Optimization Engine]
    Itinerary[Generated Itinerary]

    UserPrefs -->|Inputs| OptEngine
    HistoricalData -->|Reference Data| OptEngine
    ParkData -->|Constraints| OptEngine
    UserSchedule[User Schedule] -->|Fixed Times| OptEngine
    OptEngine -->|Output| Itinerary
    Itinerary -->|Save| UserData[User Data]
```

### Maps & Navigation Module

Provides interactive park maps and navigation guidance.

```mermaid
flowchart TD
    MapData[Map Base Data]
    AttractionData[Attraction Locations]
    GoogleMaps[Google Maps API]
    UserLocation[User Location]

    MapData --> MapComponent[Map Component]
    AttractionData --> MapComponent
    GoogleMaps --> MapComponent
    UserLocation -->|Real-time| MapComponent
    MapComponent --> NavDirections[Navigation Directions]
    MapComponent --> WaitTimes[Wait Time Overlay]
```

## Database Schema

The application uses Firebase for data storage with the following main collections:

```mermaid
erDiagram
    USERS ||--o{ ITINERARIES : creates
    USERS ||--o{ PREFERENCES : has
    USERS ||--o{ GROUPS : joins
    PARKS ||--o{ ATTRACTIONS : contains
    ATTRACTIONS ||--o{ WAIT-TIMES : records
    ITINERARIES ||--o{ ITINERARY-ITEMS : contains
    GROUPS ||--o{ USERS : includes

    USERS {
        string id PK
        string email
        string displayName
        timestamp createdAt
        timestamp lastLogin
    }

    PREFERENCES {
        string userId FK
        array favoriteAttractions
        boolean useGenie
        json diningSetting
    }

    PARKS {
        string id PK
        string name
        string code
        json location
        json operatingHours
    }

    ATTRACTIONS {
        string id PK
        string parkId FK
        string name
        string type
        number duration
        json location
        array tags
        json restrictions
    }

    WAIT-TIMES {
        string attractionId FK
        timestamp recordedAt
        number waitMinutes
        string status
    }

    ITINERARIES {
        string id PK
        string userId FK
        string parkId FK
        date visitDate
        timestamp createdAt
        string status
    }

    ITINERARY-ITEMS {
        string id PK
        string itineraryId FK
        string attractionId FK
        timestamp scheduledTime
        number duration
        string type
    }

    GROUPS {
        string id PK
        string name
        string ownerId FK
        timestamp createdAt
    }
```

## API Integration Architecture

The application integrates with several APIs to provide comprehensive planning capabilities:

```mermaid
graph TD
    App[Disney Vacation Planning App]

    subgraph "Internal APIs"
        Optimizer[Optimizer API]
        UserAPI[User Management API]
        ItineraryAPI[Itinerary API]
    end

    subgraph "External APIs"
        DisneyAPI[Disney Park API]
        GoogleMapsAPI[Google Maps API]
        WeatherAPI[Weather API]
    end

    App --> Optimizer
    App --> UserAPI
    App --> ItineraryAPI
    Optimizer --> DisneyAPI
    App --> GoogleMapsAPI
    Optimizer --> WeatherAPI
```

## Deployment Architecture

The application is deployed using a modern cloud infrastructure:

```mermaid
flowchart TD
    GitRepo[GitHub Repository]
    GitActions[GitHub Actions]
    Vercel[Vercel Platform]
    Firebase[Firebase Services]
    CDN[Content Delivery Network]
    Users[End Users]

    GitRepo --> GitActions
    GitActions -->|Build & Deploy| Vercel
    Vercel -->|Hosting| CDN
    Vercel -->|Backend Services| Firebase
    CDN --> Users
    Users --> Firebase
```

## Security Architecture

The application implements multiple layers of security:

```mermaid
flowchart TD
    Authentication[Authentication Layer]
    Authorization[Authorization Layer]
    DataValidation[Data Validation]
    Encryption[Data Encryption]
    RateLimiting[Rate Limiting]

    Authentication --> Authorization
    Authorization --> Application[Application Logic]
    DataValidation --> Application
    Application --> Encryption
    RateLimiting --> Application
    Application --> Database[Firebase Database]
```

## Monitoring and Logging

```mermaid
flowchart TD
    Application[Application]
    ErrorTracking[Error Tracking]
    PerformanceMonitoring[Performance Monitoring]
    UserAnalytics[User Analytics]
    Logs[Application Logs]

    Application --> ErrorTracking
    Application --> PerformanceMonitoring
    Application --> UserAnalytics
    Application --> Logs
    ErrorTracking --> AlertSystem[Alert System]
    Logs --> Dashboard[Monitoring Dashboard]
    PerformanceMonitoring --> Dashboard
    UserAnalytics --> Dashboard
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **State Management**: React Query, Zustand
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **APIs**: Next.js API Routes, Firebase Cloud Functions
- **Deployment**: Vercel, Firebase Hosting
- **Maps**: Google Maps API
- **Testing**: Jest, React Testing Library

## Future Architecture Considerations

- Microservices for specific high-load features like the optimizer
- Enhanced caching with Redis for frequently accessed data
- GraphQL API for more efficient data fetching
- Mobile application with shared business logic
- Serverless functions for better scaling