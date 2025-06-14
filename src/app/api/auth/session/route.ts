import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, revokeSessionCookie, rotateSessionToken } from '@/lib/firebase/auth-session-server'
import { withErrorHandler, createValidationError, APIError } from '@/lib/api/error-handler'
import { successResponse } from '@/lib/api/response'
import { z } from 'zod'

// Validation schemas
const CreateSessionSchema = z.object({
    idToken: z.string().min(1, 'ID token is required'),
    rememberMe: z.boolean().optional().default(false)
})

// Create a session (after successful login)
export const POST = withErrorHandler(async (request: NextRequest) => {
    console.log('Session API route called')
    
    let requestBody
    try {
        requestBody = await request.json()
    } catch (error) {
        throw createValidationError('Invalid JSON in request body')
    }

    const validatedData = CreateSessionSchema.parse(requestBody)
    const { idToken, rememberMe } = validatedData

    console.log('Creating session cookie with Firebase Admin')
    const result = await createSessionCookie(idToken, rememberMe)

    if ('error' in result) {
        console.error('Error from createSessionCookie:', result.error)
        throw new APIError(result.error, 'AUTHENTICATION_FAILED', 401)
    }

    console.log('Session created successfully')
    return successResponse({ success: true })
})

const RotateTokenSchema = z.object({
    uid: z.string().min(1, 'User ID is required'),
    rememberMe: z.boolean().optional().default(false)
})

// Rotate a session token (for enhanced security)
export const PATCH = withErrorHandler(async (request: NextRequest) => {
    let requestBody
    try {
        requestBody = await request.json()
    } catch (error) {
        throw createValidationError('Invalid JSON in request body')
    }

    const validatedRotateData = RotateTokenSchema.parse(requestBody)
    const { uid, rememberMe } = validatedRotateData

    const result = await rotateSessionToken(uid, rememberMe)

    if ('error' in result) {
        throw new APIError(result.error, 'TOKEN_ROTATION_FAILED', 500)
    }

    return successResponse({
        success: true,
        customToken: result.customToken
    })
})

const DeleteSessionSchema = z.object({
    uid: z.string().min(1, 'User ID is required')
})

// End a session (logout)
export const DELETE = withErrorHandler(async (request: NextRequest) => {
    let requestBody
    try {
        requestBody = await request.json()
    } catch (error) {
        throw createValidationError('Invalid JSON in request body')
    }

    const validatedDeleteData = DeleteSessionSchema.parse(requestBody)
    const { uid } = validatedDeleteData

    const result = await revokeSessionCookie(uid)

    if ('error' in result) {
        throw new APIError(result.error, 'SESSION_REVOCATION_FAILED', 500)
    }

    return successResponse({ success: true })
})