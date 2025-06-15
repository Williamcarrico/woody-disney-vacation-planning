import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { 
  ApiResponseHandler, 
  ApiErrorCode,
  isApiSuccessResponse,
  isApiErrorResponse,
  withApiHandler
} from '@/lib/api/response-handler'

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

describe('ApiResponseHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('success', () => {
    it('returns success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = ApiResponseHandler.success(data)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
      
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.metadata.requestId).toBe('test-uuid-1234')
      expect(body.metadata.version).toBe('1.0.0')
    })

    it('includes cached flag in metadata', () => {
      const response = ApiResponseHandler.success({}, { cached: true })
      const body = JSON.parse(response.body as any)
      
      expect(body.metadata.cached).toBe(true)
    })

    it('adds custom headers', () => {
      const headers = { 'X-Custom-Header': 'test' }
      const response = ApiResponseHandler.success({}, { headers })
      
      expect(response.headers.get('X-Custom-Header')).toBe('test')
    })
  })

  describe('error', () => {
    it('returns error response with correct status', () => {
      const response = ApiResponseHandler.error(
        ApiErrorCode.BAD_REQUEST,
        'Invalid input'
      )

      expect(response.status).toBe(400)
      
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe(ApiErrorCode.BAD_REQUEST)
      expect(body.error.message).toBe('Invalid input')
    })

    it('includes error details and suggestion', () => {
      const response = ApiResponseHandler.error(
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        {
          details: { field: 'email', reason: 'invalid format' },
          suggestion: 'Please provide a valid email',
        }
      )

      const body = JSON.parse(response.body as any)
      expect(body.error.details).toEqual({ field: 'email', reason: 'invalid format' })
      expect(body.error.suggestion).toBe('Please provide a valid email')
    })

    it('maps error codes to correct HTTP status', () => {
      const testCases = [
        { code: ApiErrorCode.UNAUTHORIZED, expectedStatus: 401 },
        { code: ApiErrorCode.FORBIDDEN, expectedStatus: 403 },
        { code: ApiErrorCode.NOT_FOUND, expectedStatus: 404 },
        { code: ApiErrorCode.INTERNAL_ERROR, expectedStatus: 500 },
        { code: ApiErrorCode.SERVICE_UNAVAILABLE, expectedStatus: 503 },
      ]

      testCases.forEach(({ code, expectedStatus }) => {
        const response = ApiResponseHandler.error(code, 'Test error')
        expect(response.status).toBe(expectedStatus)
      })
    })
  })

  describe('handleError', () => {
    it('handles Zod validation errors', () => {
      const zodError = new ZodError([
        {
          path: ['email'],
          message: 'Invalid email',
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ])

      const response = ApiResponseHandler.handleError(zodError)
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(422)
      expect(body.error.code).toBe(ApiErrorCode.VALIDATION_ERROR)
      expect(body.error.message).toBe('Invalid request data')
      expect(body.error.details).toHaveLength(1)
    })

    it('handles Firebase errors', () => {
      const firebaseError = { code: 'permission-denied', message: 'Access denied' }
      const response = ApiResponseHandler.handleError(firebaseError)
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(403)
      expect(body.error.code).toBe(ApiErrorCode.FORBIDDEN)
    })

    it('handles standard errors', () => {
      const error = new Error('Something went wrong')
      const response = ApiResponseHandler.handleError(error)
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(500)
      expect(body.error.code).toBe(ApiErrorCode.INTERNAL_ERROR)
    })

    it('includes context in error handling', () => {
      const error = { code: 'not-found' }
      const context = { operation: 'getUser', resource: 'User' }
      
      const response = ApiResponseHandler.handleError(error, context)
      const body = JSON.parse(response.body as any)

      expect(body.error.message).toBe('User not found')
    })
  })

  describe('helper methods', () => {
    it('notFound returns 404 response', () => {
      const response = ApiResponseHandler.notFound('User')
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(404)
      expect(body.error.message).toBe('User not found')
    })

    it('unauthorized returns 401 response', () => {
      const response = ApiResponseHandler.unauthorized()
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(401)
      expect(body.error.message).toBe('Authentication required')
    })

    it('forbidden returns 403 response', () => {
      const response = ApiResponseHandler.forbidden('Admin access only')
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(403)
      expect(body.error.message).toBe('Admin access only')
    })

    it('badRequest returns 400 response with details', () => {
      const details = { field: 'age', error: 'Must be positive' }
      const response = ApiResponseHandler.badRequest('Invalid age', details)
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(400)
      expect(body.error.details).toEqual(details)
    })

    it('rateLimitExceeded returns 429 with retry header', () => {
      const response = ApiResponseHandler.rateLimitExceeded(60)
      const body = JSON.parse(response.body as any)

      expect(response.status).toBe(429)
      expect(response.headers.get('Retry-After')).toBe('60')
      expect(body.error.suggestion).toContain('60 seconds')
    })
  })
})

describe('Type guards', () => {
  it('isApiSuccessResponse correctly identifies success', () => {
    const success = { success: true, data: {}, metadata: {} as any }
    const error = { success: false, error: {} as any, metadata: {} as any }

    expect(isApiSuccessResponse(success)).toBe(true)
    expect(isApiSuccessResponse(error)).toBe(false)
  })

  it('isApiErrorResponse correctly identifies errors', () => {
    const success = { success: true, data: {}, metadata: {} as any }
    const error = { success: false, error: {} as any, metadata: {} as any }

    expect(isApiErrorResponse(success)).toBe(false)
    expect(isApiErrorResponse(error)).toBe(true)
  })
})

describe('withApiHandler', () => {
  it('wraps handler and returns success on no error', async () => {
    const mockData = { result: 'success' }
    const handler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true, data: mockData })
    )

    const wrapped = withApiHandler(handler)
    const request = new Request('http://localhost/api/test')
    
    const response = await wrapped(request)
    
    expect(handler).toHaveBeenCalledWith(request, undefined)
    expect(response).toBeDefined()
  })

  it('catches errors and returns error response', async () => {
    const error = new Error('Handler failed')
    const handler = jest.fn().mockRejectedValue(error)

    const wrapped = withApiHandler(handler)
    const request = new Request('http://localhost/api/test')
    
    const response = await wrapped(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe(ApiErrorCode.INTERNAL_ERROR)
  })
})