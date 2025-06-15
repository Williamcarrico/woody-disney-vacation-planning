/**
 * Type guard utilities for runtime type checking
 */

// Basic type guards
export const isString = (value: unknown): value is string => 
    typeof value === 'string'

export const isNumber = (value: unknown): value is number => 
    typeof value === 'number' && !isNaN(value)

export const isBoolean = (value: unknown): value is boolean => 
    typeof value === 'boolean'

export const isObject = (value: unknown): value is Record<string, unknown> => 
    typeof value === 'object' && value !== null && !Array.isArray(value)

export const isArray = <T>(value: unknown): value is T[] => 
    Array.isArray(value)

export const isNull = (value: unknown): value is null => 
    value === null

export const isUndefined = (value: unknown): value is undefined => 
    value === undefined

export const isNullish = (value: unknown): value is null | undefined => 
    value == null

export const isFunction = (value: unknown): value is Function => 
    typeof value === 'function'

export const isDate = (value: unknown): value is Date => 
    value instanceof Date

export const isError = (value: unknown): value is Error => 
    value instanceof Error

export const isPromise = (value: unknown): value is Promise<unknown> => 
    value instanceof Promise

// Advanced type guards
export const hasProperty = <K extends string>(
    obj: unknown,
    key: K
): obj is Record<K, unknown> => 
    isObject(obj) && key in obj

export const hasProperties = <K extends string>(
    obj: unknown,
    keys: K[]
): obj is Record<K, unknown> => 
    isObject(obj) && keys.every(key => key in obj)

export const isArrayOf = <T>(
    value: unknown,
    guard: (item: unknown) => item is T
): value is T[] => 
    isArray(value) && value.every(guard)

export const isObjectWith = <T extends Record<string, unknown>>(
    value: unknown,
    shape: { [K in keyof T]: (val: unknown) => val is T[K] }
): value is T => {
    if (!isObject(value)) return false
    
    return Object.entries(shape).every(([key, guard]) => 
        key in value && guard((value as Record<string, unknown>)[key])
    )
}

// Disney-specific type guards
export const isDisneyParkId = (value: unknown): value is 'magic-kingdom' | 'epcot' | 'hollywood-studios' | 'animal-kingdom' =>
    isString(value) && ['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom'].includes(value)

export const isCoordinates = (value: unknown): value is { latitude: number; longitude: number } =>
    isObjectWith(value, {
        latitude: isNumber,
        longitude: isNumber
    })

export const isWaitTimeData = (value: unknown): value is {
    attractionId: string
    waitTime: number
    timestamp: string
} =>
    isObjectWith(value, {
        attractionId: isString,
        waitTime: isNumber,
        timestamp: isString
    })

export const isMessageData = (value: unknown): value is {
    id: string
    content: string
    senderId: string
    timestamp: string
} =>
    isObjectWith(value, {
        id: isString,
        content: isString,
        senderId: isString,
        timestamp: isString
    })

export const isUserJoinData = (value: unknown): value is {
    userId: string
    userName: string
    vacationId: string
} =>
    isObjectWith(value, {
        userId: isString,
        userName: isString,
        vacationId: isString
    })

export const isLocationData = (value: unknown): value is {
    latitude: number
    longitude: number
    accuracy?: number
} =>
    isObjectWith(value, {
        latitude: isNumber,
        longitude: isNumber
    }) && (
        !hasProperty(value, 'accuracy') || 
        isNumber(value['accuracy'])
    )

// Form validation type guards
export const isValidEmail = (value: unknown): value is string => {
    if (!isString(value)) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
}

export const isValidPhoneNumber = (value: unknown): value is string => {
    if (!isString(value)) return false
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(value)
}

export const isValidURL = (value: unknown): value is string => {
    if (!isString(value)) return false
    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}

export const isValidDate = (value: unknown): value is string => {
    if (!isString(value)) return false
    const date = new Date(value)
    return !isNaN(date.getTime())
}

export const isValidUUID = (value: unknown): value is string => {
    if (!isString(value)) return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
}

// API response type guards
export const isApiResponse = <T>(
    value: unknown,
    dataGuard?: (data: unknown) => data is T
): value is { success: boolean; data?: T; error?: { message: string; code: string } } => {
    if (!isObject(value)) return false
    if (!hasProperty(value, 'success') || !isBoolean(value['success'])) return false
    
    if (hasProperty(value, 'data') && dataGuard && !dataGuard(value['data'])) return false
    
    if (hasProperty(value, 'error')) {
        const error = value['error']
        if (!isObject(error)) return false
        if (!hasProperty(error, 'message') || !isString(error['message'])) return false
        if (!hasProperty(error, 'code') || !isString(error['code'])) return false
    }
    
    return true
}

export const isPaginatedResponse = <T>(
    value: unknown,
    itemGuard: (item: unknown) => item is T
): value is {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
    }
} => {
    if (!isObject(value)) return false
    
    if (!hasProperty(value, 'data') || !isArrayOf(value['data'], itemGuard)) return false
    
    if (!hasProperty(value, 'pagination')) return false
    const pagination = value['pagination']
    
    return isObjectWith(pagination, {
        page: isNumber,
        limit: isNumber,
        total: isNumber,
        totalPages: isNumber,
        hasMore: isBoolean
    })
}

// Firebase type guards
export const isFirebaseUser = (value: unknown): value is {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    emailVerified: boolean
} =>
    isObjectWith(value, {
        uid: isString,
        emailVerified: isBoolean
    }) && (
        !hasProperty(value, 'email') || isString(value['email']) || isNull(value['email'])
    ) && (
        !hasProperty(value, 'displayName') || isString(value['displayName']) || isNull(value['displayName'])
    ) && (
        !hasProperty(value, 'photoURL') || isString(value['photoURL']) || isNull(value['photoURL'])
    )

export const isFirebaseError = (value: unknown): value is {
    code: string
    message: string
    name: string
} =>
    isObjectWith(value, {
        code: isString,
        message: isString,
        name: isString
    })

// Event type guards
export const isMouseEvent = (value: unknown): value is MouseEvent =>
    value instanceof MouseEvent

export const isKeyboardEvent = (value: unknown): value is KeyboardEvent =>
    value instanceof KeyboardEvent

export const isTouchEvent = (value: unknown): value is TouchEvent =>
    value instanceof TouchEvent

export const isInputEvent = (value: unknown): value is Event & { target: HTMLInputElement } =>
    value instanceof Event && 
    hasProperty(value, 'target') && 
    value['target'] instanceof HTMLInputElement

// Complex type guards for business logic
export const isValidItineraryItem = (value: unknown): value is {
    id: string
    name: string
    startTime: string
    duration: number
    type: 'attraction' | 'dining' | 'show' | 'break'
} =>
    isObjectWith(value, {
        id: isString,
        name: isString,
        startTime: isString,
        duration: isNumber,
        type: (val: unknown): val is 'attraction' | 'dining' | 'show' | 'break' => 
            isString(val) && ['attraction', 'dining', 'show', 'break'].includes(val)
    })

export const isValidVacation = (value: unknown): value is {
    id: string
    name: string
    startDate: string
    endDate: string
    partySize: number
} =>
    isObjectWith(value, {
        id: isString,
        name: isString,
        startDate: isString,
        endDate: isString,
        partySize: isNumber
    })

// Runtime type assertion helpers
export const assertString = (value: unknown, name = 'value'): string => {
    if (!isString(value)) {
        throw new TypeError(`Expected ${name} to be a string, got ${typeof value}`)
    }
    return value
}

export const assertNumber = (value: unknown, name = 'value'): number => {
    if (!isNumber(value)) {
        throw new TypeError(`Expected ${name} to be a number, got ${typeof value}`)
    }
    return value
}

export const assertObject = (value: unknown, name = 'value'): Record<string, unknown> => {
    if (!isObject(value)) {
        throw new TypeError(`Expected ${name} to be an object, got ${typeof value}`)
    }
    return value
}

export const assertArray = <T>(
    value: unknown,
    guard: (item: unknown) => item is T,
    name = 'value'
): T[] => {
    if (!isArrayOf(value, guard)) {
        throw new TypeError(`Expected ${name} to be an array of valid items`)
    }
    return value
}

// Safe casting utilities
export const safeCast = <T>(
    value: unknown,
    guard: (val: unknown) => val is T,
    fallback: T
): T => 
    guard(value) ? value : fallback

export const safeCastAsync = async <T>(
    promise: Promise<unknown>,
    guard: (val: unknown) => val is T,
    fallback: T
): Promise<T> => {
    try {
        const value = await promise
        return guard(value) ? value : fallback
    } catch {
        return fallback
    }
}

// Utility for exhaustive checking
export const assertNever = (value: never): never => {
    throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}