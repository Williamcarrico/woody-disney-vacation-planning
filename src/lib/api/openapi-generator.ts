/**
 * OpenAPI specification generator from Zod schemas
 * 
 * @module api/openapi-generator
 * @category API Documentation
 */

import { z } from 'zod'
import { writeFileSync } from 'fs'
import { join } from 'path'

/**
 * OpenAPI specification structure
 */
interface OpenAPISpec {
    openapi: string
    info: {
        title: string
        description: string
        version: string
        contact?: {
            name: string
            email: string
            url: string
        }
        license?: {
            name: string
            url: string
        }
    }
    servers: Array<{
        url: string
        description: string
    }>
    paths: Record<string, any>
    components: {
        schemas: Record<string, any>
        securitySchemes?: Record<string, any>
        responses?: Record<string, any>
        parameters?: Record<string, any>
    }
    security?: Array<Record<string, any>>
    tags?: Array<{
        name: string
        description: string
    }>
}

/**
 * Route definition for OpenAPI generation
 */
export interface RouteDefinition {
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    summary: string
    description?: string
    tags?: string[]
    parameters?: {
        query?: z.ZodSchema
        path?: z.ZodSchema
        headers?: z.ZodSchema
    }
    requestBody?: z.ZodSchema
    responses: {
        [statusCode: string]: {
            description: string
            schema?: z.ZodSchema
        }
    }
    security?: string[]
}

/**
 * Convert Zod schema to OpenAPI schema
 */
function zodToOpenAPISchema(schema: z.ZodSchema): any {
    const zodType = schema._def

    switch (zodType.typeName) {
        case 'ZodString':
            const stringSchema: any = { type: 'string' }
            
            // Handle string validations
            if (zodType.checks) {
                for (const check of zodType.checks) {
                    switch (check.kind) {
                        case 'email':
                            stringSchema.format = 'email'
                            break
                        case 'url':
                            stringSchema.format = 'uri'
                            break
                        case 'uuid':
                            stringSchema.format = 'uuid'
                            break
                        case 'datetime':
                            stringSchema.format = 'date-time'
                            break
                        case 'min':
                            stringSchema.minLength = check.value
                            break
                        case 'max':
                            stringSchema.maxLength = check.value
                            break
                        case 'regex':
                            stringSchema.pattern = check.regex.source
                            break
                    }
                }
            }
            
            return stringSchema

        case 'ZodNumber':
            const numberSchema: any = { type: 'number' }
            
            if (zodType.checks) {
                for (const check of zodType.checks) {
                    switch (check.kind) {
                        case 'int':
                            numberSchema.type = 'integer'
                            break
                        case 'min':
                            numberSchema.minimum = check.value
                            break
                        case 'max':
                            numberSchema.maximum = check.value
                            break
                    }
                }
            }
            
            return numberSchema

        case 'ZodBoolean':
            return { type: 'boolean' }

        case 'ZodArray':
            return {
                type: 'array',
                items: zodToOpenAPISchema(zodType.type)
            }

        case 'ZodObject':
            const properties: Record<string, any> = {}
            const required: string[] = []

            for (const [key, value] of Object.entries(zodType.shape())) {
                properties[key] = zodToOpenAPISchema(value as z.ZodSchema)
                
                // Check if field is required
                if (!(value as any).isOptional()) {
                    required.push(key)
                }
            }

            return {
                type: 'object',
                properties,
                required: required.length > 0 ? required : undefined
            }

        case 'ZodEnum':
            return {
                type: 'string',
                enum: zodType.values
            }

        case 'ZodOptional':
            return zodToOpenAPISchema(zodType.innerType)

        case 'ZodNullable':
            const schema = zodToOpenAPISchema(zodType.innerType)
            return {
                ...schema,
                nullable: true
            }

        case 'ZodUnion':
            return {
                anyOf: zodType.options.map((option: z.ZodSchema) => zodToOpenAPISchema(option))
            }

        case 'ZodLiteral':
            return {
                type: typeof zodType.value,
                enum: [zodType.value]
            }

        case 'ZodDate':
            return {
                type: 'string',
                format: 'date-time'
            }

        default:
            // Fallback for unsupported types
            return { type: 'object' }
    }
}

/**
 * Generate OpenAPI specification
 */
export class OpenAPIGenerator {
    private spec: OpenAPISpec
    private schemas: Map<string, any> = new Map()

    constructor(config: {
        title: string
        description: string
        version: string
        servers: Array<{ url: string; description: string }>
        contact?: { name: string; email: string; url: string }
        license?: { name: string; url: string }
    }) {
        this.spec = {
            openapi: '3.0.3',
            info: {
                title: config.title,
                description: config.description,
                version: config.version,
                contact: config.contact,
                license: config.license
            },
            servers: config.servers,
            paths: {},
            components: {
                schemas: {},
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    },
                    SessionAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'session'
                    }
                },
                responses: {
                    ValidationError: {
                        description: 'Validation error',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: {
                                            type: 'object',
                                            properties: {
                                                message: { type: 'string' },
                                                code: { type: 'string' },
                                                details: { type: 'object' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    InternalError: {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: false },
                                        error: {
                                            type: 'object',
                                            properties: {
                                                message: { type: 'string' },
                                                code: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            security: [
                { BearerAuth: [] },
                { SessionAuth: [] }
            ],
            tags: [
                { name: 'Authentication', description: 'User authentication and session management' },
                { name: 'Parks', description: 'Disney park information and data' },
                { name: 'Attractions', description: 'Attraction details and wait times' },
                { name: 'Restaurants', description: 'Dining locations and reservations' },
                { name: 'Resorts', description: 'Disney resort information' },
                { name: 'Itineraries', description: 'Trip planning and itinerary management' },
                { name: 'Weather', description: 'Weather information and forecasts' },
                { name: 'User', description: 'User profile and preferences' }
            ]
        }
    }

    /**
     * Add a route to the OpenAPI specification
     */
    addRoute(route: RouteDefinition): void {
        const pathItem = this.spec.paths[route.path] || {}
        
        const operation: any = {
            summary: route.summary,
            description: route.description,
            tags: route.tags || [],
            parameters: [],
            responses: {}
        }

        // Add path parameters
        if (route.parameters?.path) {
            const pathSchema = zodToOpenAPISchema(route.parameters.path)
            if (pathSchema.properties) {
                for (const [name, schema] of Object.entries(pathSchema.properties)) {
                    operation.parameters.push({
                        name,
                        in: 'path',
                        required: true,
                        schema
                    })
                }
            }
        }

        // Add query parameters
        if (route.parameters?.query) {
            const querySchema = zodToOpenAPISchema(route.parameters.query)
            if (querySchema.properties) {
                for (const [name, schema] of Object.entries(querySchema.properties)) {
                    operation.parameters.push({
                        name,
                        in: 'query',
                        required: querySchema.required?.includes(name) || false,
                        schema
                    })
                }
            }
        }

        // Add header parameters
        if (route.parameters?.headers) {
            const headerSchema = zodToOpenAPISchema(route.parameters.headers)
            if (headerSchema.properties) {
                for (const [name, schema] of Object.entries(headerSchema.properties)) {
                    operation.parameters.push({
                        name,
                        in: 'header',
                        required: headerSchema.required?.includes(name) || false,
                        schema
                    })
                }
            }
        }

        // Add request body
        if (route.requestBody) {
            operation.requestBody = {
                required: true,
                content: {
                    'application/json': {
                        schema: zodToOpenAPISchema(route.requestBody)
                    }
                }
            }
        }

        // Add responses
        for (const [statusCode, response] of Object.entries(route.responses)) {
            operation.responses[statusCode] = {
                description: response.description,
                content: response.schema ? {
                    'application/json': {
                        schema: zodToOpenAPISchema(response.schema)
                    }
                } : undefined
            }
        }

        // Add standard error responses
        if (!operation.responses['400']) {
            operation.responses['400'] = { $ref: '#/components/responses/ValidationError' }
        }
        if (!operation.responses['500']) {
            operation.responses['500'] = { $ref: '#/components/responses/InternalError' }
        }

        // Add security if specified
        if (route.security) {
            operation.security = route.security.map(scheme => ({ [scheme]: [] }))
        }

        pathItem[route.method.toLowerCase()] = operation
        this.spec.paths[route.path] = pathItem
    }

    /**
     * Add a reusable schema component
     */
    addSchema(name: string, schema: z.ZodSchema): void {
        this.spec.components.schemas[name] = zodToOpenAPISchema(schema)
    }

    /**
     * Generate the complete OpenAPI specification
     */
    generate(): OpenAPISpec {
        return this.spec
    }

    /**
     * Export specification to JSON file
     */
    exportToFile(filePath: string): void {
        const spec = this.generate()
        writeFileSync(filePath, JSON.stringify(spec, null, 2))
    }

    /**
     * Export specification to YAML file (requires js-yaml)
     */
    exportToYAML(filePath: string): void {
        try {
            const yaml = require('js-yaml')
            const spec = this.generate()
            writeFileSync(filePath, yaml.dump(spec, { noRefs: true, indent: 2 }))
        } catch (error) {
            console.error('YAML export requires js-yaml package. Falling back to JSON.')
            this.exportToFile(filePath.replace('.yaml', '.json').replace('.yml', '.json'))
        }
    }
}

/**
 * Generate OpenAPI specification for Disney Vacation Planner API
 */
export function generateDisneyAPISpec(): OpenAPISpec {
    const generator = new OpenAPIGenerator({
        title: 'Disney Vacation Planner API',
        description: 'Comprehensive API for planning your perfect Disney vacation with real-time data, personalized recommendations, and seamless integration.',
        version: '1.0.0',
        servers: [
            {
                url: process.env.NEXT_PUBLIC_APP_URL || 'https://woodysdisneyvacation.com',
                description: 'Production server'
            },
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        contact: {
            name: 'Disney Vacation Planner Support',
            email: 'support@woodysdisneyvacation.com',
            url: 'https://woodysdisneyvacation.com/support'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    })

    // Define common schemas
    generator.addSchema('Attraction', z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        parkId: z.string(),
        landId: z.string().optional(),
        type: z.enum(['ride', 'show', 'character-meet', 'dining', 'shopping']),
        thrillLevel: z.number().min(1).max(5),
        heightRequirement: z.number().optional(),
        lightningLane: z.boolean(),
        mustDo: z.boolean(),
        ageGroup: z.enum(['all-ages', 'kids', 'teens', 'adults']),
        waitTime: z.number().optional(),
        status: z.enum(['operating', 'closed', 'down', 'delayed']).optional()
    }))

    generator.addSchema('Restaurant', z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        parkId: z.string().optional(),
        resortId: z.string().optional(),
        cuisineType: z.string(),
        serviceType: z.enum(['quick-service', 'table-service', 'character-dining']),
        priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
        reservationsRequired: z.boolean(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        }).optional()
    }))

    generator.addSchema('Park', z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        openTime: z.string(),
        closeTime: z.string(),
        timezone: z.string(),
        location: z.object({
            latitude: z.number(),
            longitude: z.number()
        })
    }))

    // Add API routes
    
    // Attractions routes
    generator.addRoute({
        path: '/api/attractions',
        method: 'GET',
        summary: 'Search attractions',
        description: 'Search and filter attractions across all Disney parks',
        tags: ['Attractions'],
        parameters: {
            query: z.object({
                parkId: z.enum(['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom']).optional(),
                type: z.enum(['ride', 'show', 'character-meet', 'dining', 'shopping']).optional(),
                thrillLevel: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(5)).optional(),
                search: z.string().max(100).optional(),
                page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
                limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 100) : 20)
            })
        },
        responses: {
            '200': {
                description: 'List of attractions',
                schema: z.object({
                    success: z.boolean(),
                    data: z.object({
                        attractions: z.array(z.any()),
                        pagination: z.object({
                            page: z.number(),
                            limit: z.number(),
                            total: z.number(),
                            totalPages: z.number(),
                            hasMore: z.boolean()
                        })
                    })
                })
            }
        }
    })

    // Parks routes
    generator.addRoute({
        path: '/api/parks',
        method: 'GET',
        summary: 'Get all parks',
        description: 'Retrieve information about all Disney parks',
        tags: ['Parks'],
        responses: {
            '200': {
                description: 'List of Disney parks',
                schema: z.object({
                    success: z.boolean(),
                    data: z.array(z.any())
                })
            }
        }
    })

    generator.addRoute({
        path: '/api/parks/{parkId}',
        method: 'GET',
        summary: 'Get park details',
        description: 'Get detailed information about a specific park',
        tags: ['Parks'],
        parameters: {
            path: z.object({
                parkId: z.enum(['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom'])
            })
        },
        responses: {
            '200': {
                description: 'Park details',
                schema: z.object({
                    success: z.boolean(),
                    data: z.any()
                })
            },
            '404': {
                description: 'Park not found'
            }
        }
    })

    // Weather routes
    generator.addRoute({
        path: '/api/weather/forecast',
        method: 'GET',
        summary: 'Get weather forecast',
        description: 'Get weather forecast for a specific location',
        tags: ['Weather'],
        parameters: {
            query: z.object({
                location: z.string(),
                units: z.enum(['metric', 'imperial']).optional()
            })
        },
        responses: {
            '200': {
                description: 'Weather forecast data',
                schema: z.object({
                    timelines: z.object({
                        daily: z.array(z.any()),
                        hourly: z.array(z.any())
                    }),
                    location: z.object({
                        lat: z.number(),
                        lon: z.number(),
                        name: z.string()
                    })
                })
            }
        }
    })

    return generator.generate()
}

/**
 * CLI function to generate and export OpenAPI specification
 */
export function generateAndExportSpec(): void {
    const spec = generateDisneyAPISpec()
    
    // Export to multiple formats
    const outputDir = join(process.cwd(), 'docs', 'api')
    
    try {
        writeFileSync(join(outputDir, 'openapi.json'), JSON.stringify(spec, null, 2))
        console.log('✅ OpenAPI specification exported to docs/api/openapi.json')
        
        // Try to export YAML version
        try {
            const yaml = require('js-yaml')
            writeFileSync(join(outputDir, 'openapi.yaml'), yaml.dump(spec, { noRefs: true, indent: 2 }))
            console.log('✅ OpenAPI specification exported to docs/api/openapi.yaml')
        } catch (error) {
            console.log('⚠️  YAML export skipped (js-yaml not installed)')
        }
        
    } catch (error) {
        console.error('❌ Failed to export OpenAPI specification:', error)
    }
}