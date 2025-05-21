# API Standards

This document outlines the standard patterns, conventions, and best practices for API routes in our application.

## Response Format

All API responses follow a standardized format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

## Response Utility Functions

To maintain consistency, use the utility functions in `src/lib/api/response.ts`:

```typescript
// For successful responses
successResponse(data, status = 200)

// For error responses
errorResponse(message, code, status = 500)
```

## HTTP Status Codes

Use appropriate HTTP status codes with your responses:

- `200 OK`: Successful request
- `201 Created`: Resource successfully created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

## Error Codes

Use consistent error codes that follow a specific pattern:

- `RESOURCE_NOT_FOUND`: When a requested resource doesn't exist
- `VALIDATION_ERROR`: When request validation fails
- `AUTHENTICATION_ERROR`: When authentication fails
- `AUTHORIZATION_ERROR`: When user is not authorized
- `RATE_LIMIT_EXCEEDED`: When rate limit is exceeded
- `INTERNAL_SERVER_ERROR`: For unexpected server errors

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- General API endpoints: 60 requests per minute per IP
- Authentication endpoints: 10 requests per minute per IP

When a rate limit is exceeded, the API will respond with:
- Status code `429 Too Many Requests`
- A `Retry-After` header indicating when to retry
- An error response with code `RATE_LIMIT_EXCEEDED`

## Error Handling

Always follow this pattern for error handling in API routes:

```typescript
export async function handler(request) {
  try {
    // Handle request
    return successResponse(data);
  } catch (error) {
    console.error('Error in API route:', error);

    // Return appropriate error response
    return errorResponse(
      'Error message',
      'ERROR_CODE',
      statusCode
    );
  }
}
```

## Example Implementation

See `src/app/api/example/route.ts` for a reference implementation of these standards.