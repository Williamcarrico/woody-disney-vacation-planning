/**
 * Strict type definitions for better type safety
 */

// Eliminate any types with strict alternatives
export type StrictRecord<K extends string | number | symbol, V> = Record<K, V>

export interface StrictApiResponse<TData = unknown> {
    success: boolean
    data?: TData
    error?: {
        message: string
        code: string
        details?: StrictRecord<string, unknown>
    }
}

export interface StrictEventHandler<TEvent = Event> {
    (event: TEvent): void | Promise<void>
}

export interface StrictComponentProps {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

// Socket.io event types
export interface SocketEventMap {
    connect: () => void
    disconnect: (reason: string) => void
    error: (error: Error) => void
    message: (data: MessageEventData) => void
    'user:join': (data: UserJoinData) => void
    'user:leave': (data: UserLeaveData) => void
    'location:update': (data: LocationUpdateData) => void
    'wait-time:update': (data: WaitTimeUpdateData) => void
}

export interface MessageEventData {
    id: string
    vacationId: string
    senderId: string
    senderName: string
    content: string
    type: 'text' | 'image' | 'location' | 'system'
    timestamp: string
}

export interface UserJoinData {
    userId: string
    userName: string
    vacationId: string
    timestamp: string
}

export interface UserLeaveData {
    userId: string
    userName: string
    vacationId: string
    timestamp: string
}

export interface LocationUpdateData {
    userId: string
    userName: string
    location: {
        latitude: number
        longitude: number
        accuracy?: number
        timestamp: string
    }
    vacationId: string
}

export interface WaitTimeUpdateData {
    attractionId: string
    parkId: string
    waitTime: number
    status: 'open' | 'closed' | 'temporarily-closed'
    timestamp: string
}

// Form handling types
export interface StrictFormData {
    [key: string]: string | number | boolean | Date | File | null | undefined
}

export interface StrictFormErrors {
    [key: string]: string[]
}

export interface StrictFormValidation {
    isValid: boolean
    errors: StrictFormErrors
    touched: StrictRecord<string, boolean>
}

// Database query types
export interface StrictQueryFilters {
    [key: string]: string | number | boolean | string[] | number[] | null | undefined
}

export interface StrictQueryOptions {
    limit?: number
    offset?: number
    orderBy?: string
    sortDirection?: 'asc' | 'desc'
    include?: string[]
    exclude?: string[]
}

export interface StrictPaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

// API endpoint types
export interface StrictGetParams {
    [key: string]: string | string[] | undefined
}

export interface StrictPostBody {
    [key: string]: unknown
}

export interface StrictPutBody {
    [key: string]: unknown
}

export interface StrictPatchBody {
    [key: string]: unknown
}

// Authentication types
export interface StrictAuthUser {
    id: string
    email: string
    displayName: string | null
    photoURL: string | null
    emailVerified: boolean
    phoneNumber: string | null
    disabled: boolean
    metadata: {
        creationTime: string
        lastSignInTime: string | null
    }
    customClaims: StrictRecord<string, unknown>
    providerData: Array<{
        uid: string
        email: string | null
        displayName: string | null
        photoURL: string | null
        providerId: string
    }>
}

export interface StrictAuthSession {
    user: StrictAuthUser
    token: string
    expiresAt: string
    refreshToken?: string
}

// Geolocation types
export interface StrictGeolocationPosition {
    coords: {
        latitude: number
        longitude: number
        altitude: number | null
        accuracy: number
        altitudeAccuracy: number | null
        heading: number | null
        speed: number | null
    }
    timestamp: number
}

export interface StrictGeolocationError {
    code: 1 | 2 | 3 // PERMISSION_DENIED | POSITION_UNAVAILABLE | TIMEOUT
    message: string
}

// File upload types
export interface StrictFileUpload {
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'error'
    error?: string
    url?: string
    metadata?: {
        size: number
        type: string
        lastModified: number
        name: string
    }
}

// Animation and UI types
export interface StrictMotionProps {
    initial?: StrictRecord<string, unknown>
    animate?: StrictRecord<string, unknown>
    exit?: StrictRecord<string, unknown>
    transition?: StrictRecord<string, unknown>
    variants?: StrictRecord<string, StrictRecord<string, unknown>>
    whileHover?: StrictRecord<string, unknown>
    whileTap?: StrictRecord<string, unknown>
    whileInView?: StrictRecord<string, unknown>
}

// Theme types
export interface StrictThemeColors {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    destructive: string
    destructiveForeground: string
    warning: string
    warningForeground: string
    success: string
    successForeground: string
}

export interface StrictThemeConfig {
    colors: StrictThemeColors
    fontFamily: StrictRecord<string, string[]>
    fontSize: StrictRecord<string, [string, { lineHeight: string; letterSpacing?: string }]>
    spacing: StrictRecord<string, string>
    borderRadius: StrictRecord<string, string>
    boxShadow: StrictRecord<string, string>
}

// Analytics types
export interface StrictAnalyticsEvent {
    name: string
    parameters: StrictRecord<string, string | number | boolean>
    timestamp: number
    userId?: string
    sessionId?: string
}

export interface StrictAnalyticsConfig {
    trackingId: string
    enableLogging: boolean
    enableDebug: boolean
    autoPageTracking: boolean
    cookieConsent: boolean
}

// Error handling types
export interface StrictError {
    name: string
    message: string
    code?: string
    stack?: string
    cause?: unknown
    timestamp: number
    context?: StrictRecord<string, unknown>
}

export interface StrictErrorBoundaryState {
    hasError: boolean
    error: StrictError | null
    errorInfo: {
        componentStack: string
    } | null
}

// Cache types
export interface StrictCacheEntry<T> {
    data: T
    timestamp: number
    expiresAt: number
    key: string
    size?: number
    accessCount: number
    lastAccessed: number
}

export interface StrictCacheConfig {
    maxSize: number
    maxAge: number
    maxItems: number
    enableCompression: boolean
    enablePersistence: boolean
}

// Notification types
export interface StrictNotification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    duration?: number
    action?: {
        label: string
        handler: () => void
    }
    icon?: string
    timestamp: number
    read: boolean
}

// State management types
export interface StrictStore<T> {
    state: T
    getState: () => T
    setState: (newState: Partial<T>) => void
    subscribe: (listener: (state: T) => void) => () => void
    destroy: () => void
}

export interface StrictStoreConfig<T> {
    initialState: T
    middleware?: Array<(store: StrictStore<T>) => StrictStore<T>>
    enableDevTools?: boolean
    enablePersistence?: boolean
    persistenceKey?: string
}

// Utility type helpers
export type StrictKeys<T> = keyof T
export type StrictValues<T> = T[keyof T]
export type StrictEntry<T> = [keyof T, T[keyof T]]

export type StrictPartial<T> = {
    [P in keyof T]?: T[P]
}

export type StrictRequired<T> = {
    [P in keyof T]-?: T[P]
}

export type StrictReadonly<T> = {
    readonly [P in keyof T]: T[P]
}

export type StrictDeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? StrictDeepPartial<T[P]> : T[P]
}

export type StrictDeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? StrictDeepRequired<T[P]> : T[P]
}

export type StrictDeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? StrictDeepReadonly<T[P]> : T[P]
}

// Function types
export type StrictAsyncFunction<TParams extends unknown[] = [], TReturn = unknown> = 
    (...args: TParams) => Promise<TReturn>

export type StrictSyncFunction<TParams extends unknown[] = [], TReturn = unknown> = 
    (...args: TParams) => TReturn

export type StrictCallback<TParams extends unknown[] = [], TReturn = void> = 
    (...args: TParams) => TReturn

export type StrictEventCallback<TEvent = Event> = (event: TEvent) => void

// React component types
export type StrictFC<P = Record<string, never>> = React.FunctionComponent<P>
export type StrictComponent<P = Record<string, never>> = React.Component<P>

export interface StrictBaseProps {
    children?: React.ReactNode
    className?: string
    id?: string
    'data-testid'?: string
}

// API client types
export interface StrictApiClient {
    get<T>(url: string, params?: StrictRecord<string, unknown>): Promise<StrictApiResponse<T>>
    post<T>(url: string, data?: StrictRecord<string, unknown>): Promise<StrictApiResponse<T>>
    put<T>(url: string, data?: StrictRecord<string, unknown>): Promise<StrictApiResponse<T>>
    patch<T>(url: string, data?: StrictRecord<string, unknown>): Promise<StrictApiResponse<T>>
    delete<T>(url: string): Promise<StrictApiResponse<T>>
}

export interface StrictApiClientConfig {
    baseURL: string
    timeout: number
    headers: StrictRecord<string, string>
    retries: number
    retryDelay: number
    enableLogging: boolean
}

// Date and time types
export type StrictTimestamp = number
export type StrictISOString = string
export type StrictDateString = string // YYYY-MM-DD
export type StrictTimeString = string // HH:MM:SS

export interface StrictDateRange {
    start: StrictDateString
    end: StrictDateString
}

export interface StrictTimeRange {
    start: StrictTimeString
    end: StrictTimeString
}

// Coordinate and location types
export interface StrictCoordinates {
    latitude: number
    longitude: number
    altitude?: number
    accuracy?: number
}

export interface StrictLocation {
    coordinates: StrictCoordinates
    address?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    timezone?: string
}

// Permission types
export type StrictPermission = 
    | 'geolocation'
    | 'notifications'
    | 'camera'
    | 'microphone'
    | 'push-messaging'

export interface StrictPermissionStatus {
    permission: StrictPermission
    state: 'granted' | 'denied' | 'prompt'
    timestamp: number
}

// Export utility functions for type checking
export const isStrictRecord = (value: unknown): value is StrictRecord<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isStrictArray = <T>(value: unknown): value is T[] => {
    return Array.isArray(value)
}

export const isStrictString = (value: unknown): value is string => {
    return typeof value === 'string'
}

export const isStrictNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value)
}

export const isStrictBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean'
}

export const isStrictNull = (value: unknown): value is null => {
    return value === null
}

export const isStrictUndefined = (value: unknown): value is undefined => {
    return value === undefined
}

export const isStrictNullish = (value: unknown): value is null | undefined => {
    return value == null
}