/**
 * Example API route that demonstrates the standard API response format
 *
 * @group API Routes
 * @category Examples
 */

import { NextRequest } from "next/server"
import { z } from "zod"
import { errorResponse, successResponse } from "@/lib/api/response"

/**
 * Data schema for the example API request
 */
export const ExampleRequestSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    age: z.number().int().positive().optional(),
})

/**
 * Type definition for the example API request
 */
export type ExampleRequest = z.infer<typeof ExampleRequestSchema>

/**
 * Type definition for the example API response data
 */
export interface ExampleResponseData {
    message: string
    timestamp: string
    requestData: ExampleRequest
}

/**
 * GET handler for example API route
 *
 * @example
 * ```ts
 * // Example fetch request
 * const response = await fetch('/api/example?name=John&email=john@example.com')
 * const data = await response.json()
 * ```
 *
 * @param request - The incoming request object
 * @returns Response with standard format
 */
export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams
        const name = searchParams.get("name")
        const email = searchParams.get("email")
        const age = searchParams.get("age") ? parseInt(searchParams.get("age") as string) : undefined

        // Validate request data
        const result = ExampleRequestSchema.safeParse({
            name,
            email,
            age,
        })

        if (!result.success) {
            return errorResponse(
                "Invalid request parameters",
                "VALIDATION_ERROR",
                400
            )
        }

        // Process the validated data
        const responseData: ExampleResponseData = {
            message: `Hello, ${result.data.name}!`,
            timestamp: new Date().toISOString(),
            requestData: result.data,
        }

        // Return success response
        return successResponse(responseData)
    } catch (error) {
        console.error("Error in example API route:", error)
        return errorResponse(
            "An unexpected error occurred",
            "INTERNAL_SERVER_ERROR",
            500
        )
    }
}

/**
 * POST handler for example API route
 *
 * @example
 * ```ts
 * // Example fetch request
 * const response = await fetch('/api/example', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     name: 'Jane',
 *     email: 'jane@example.com',
 *     age: 30
 *   }),
 * })
 * const data = await response.json()
 * ```
 *
 * @param request - The incoming request object
 * @returns Response with standard format
 */
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json()

        // Validate request data
        const result = ExampleRequestSchema.safeParse(body)

        if (!result.success) {
            return errorResponse(
                "Invalid request body",
                "VALIDATION_ERROR",
                400
            )
        }

        // Process the validated data
        const responseData: ExampleResponseData = {
            message: `Hello, ${result.data.name}!`,
            timestamp: new Date().toISOString(),
            requestData: result.data,
        }

        // Return success response
        return successResponse(responseData, 201)
    } catch (error) {
        console.error("Error in example API route:", error)
        return errorResponse(
            "An unexpected error occurred",
            "INTERNAL_SERVER_ERROR",
            500
        )
    }
}