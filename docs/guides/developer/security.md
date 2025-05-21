# API Security Guide

This guide documents the security measures implemented in the Disney Vacation Planning application and provides best practices for maintaining and extending secure API functionality.

## Implemented Security Measures

### API Security

1. **CORS Configuration**
   - Custom CORS middleware that validates origins
   - Proper preflight request handling
   - Strict access control headers

2. **CSRF Protection**
   - Token-based CSRF protection for all POST/PUT/DELETE requests
   - Tokens generated and validated via the `middleware/cors.ts` utilities

3. **Request Validation**
   - All API requests are validated against Zod schemas
   - Input sanitization to prevent injection attacks
   - Standard error responses for validation failures

### Security Headers

1. **HTTP Security Headers**
   - Content-Security-Policy (CSP) to prevent XSS attacks
   - Strict-Transport-Security to enforce HTTPS
   - X-Frame-Options to prevent clickjacking
   - X-Content-Type-Options to prevent MIME type sniffing
   - X-XSS-Protection to enable browser XSS filters
   - Referrer-Policy to control HTTP referrer information

2. **Cache Control Headers**
   - Proper cache control for both static and dynamic content
   - Edge caching configuration for performance optimization

### Performance & Edge Optimization

1. **API Edge Functions**
   - API routes deployed as edge functions for global low-latency
   - Standard error handling and response formatting
   - Configurable caching strategies

2. **CDN Integration**
   - Static assets served via CDN
   - Image optimization with automatic format conversion
   - Size-appropriate responsive images

## Development Best Practices

### Creating New API Endpoints

When creating new API endpoints, follow these guidelines:

1. **Use standard response format**
   ```typescript
   import { successResponse, errorResponse } from '@/lib/api/response'

   // Success response
   return successResponse(data, 200)

   // Error response
   return errorResponse(message, errorCode, statusCode)
   ```

2. **Always validate and sanitize input**
   ```typescript
   import { validateQuery, validateBody } from '@/lib/api/validation'
   import { z } from 'zod'

   // Define schema
   const RequestSchema = z.object({ /* schema definition */ })

   // Validate query or body
   const validation = await validateQuery(request, RequestSchema)
   if (!validation.success) {
     return validation.error
   }
   ```

3. **Use edge functions for better performance**
   ```typescript
   import { withEdge } from '../config'

   // Define handler
   async function handler(request: NextRequest) {
     // Handler implementation
   }

   // Export with edge function wrapper
   export const GET = withEdge(handler, {
     cacheTtl: 60,
     edgeCaching: true
   })
   ```

### Security Testing

Before deploying changes:

1. **Verify CORS configuration** - Test cross-origin requests
2. **Test CSRF protection** - Ensure forms require valid tokens
3. **Check validation** - Test with invalid inputs
4. **Validate headers** - Use security scanning tools to verify headers

## Security Headers Reference

```typescript
// Security headers in next.config.ts
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline'..."
},
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
},
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
},
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
}
```