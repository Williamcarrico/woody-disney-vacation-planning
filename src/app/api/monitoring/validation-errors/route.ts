import { NextRequest, NextResponse } from 'next/server'
import { validationMonitor } from '@/lib/monitoring/validation-error-monitor'
import { z } from 'zod'

// Schema for logging validation errors via API
const LogErrorSchema = z.object({
  type: z.literal('validation_error'),
  timestamp: z.number(),
  collection: z.string().optional(),
  documentId: z.string().optional(),
  operation: z.enum(['get', 'set', 'update', 'delete', 'list', 'subscribe']).optional(),
  userId: z.string().optional(),
  errorPath: z.array(z.string()).optional(),
  errorMessage: z.string().optional(),
  schemaName: z.string().optional(),
  rawData: z.unknown().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  userAgent: z.string().optional(),
  url: z.string().optional()
})

// GET - Retrieve validation error analytics
export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication (implement your auth logic)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json'
    const action = searchParams.get('action')

    // Handle different actions
    if (action === 'export') {
      const exportFormat = searchParams.get('exportFormat') || 'json'
      const data = validationMonitor.exportErrors(exportFormat as 'json' | 'csv')
      
      const headers = {
        'Content-Type': exportFormat === 'csv' ? 'text/csv' : 'application/json',
        'Content-Disposition': `attachment; filename=validation-errors-${Date.now()}.${exportFormat}`
      }
      
      return new NextResponse(data, { headers })
    }

    if (action === 'clear') {
      validationMonitor.clearErrors()
      return NextResponse.json({ success: true, message: 'Error history cleared' })
    }

    // Default: return analytics
    const analytics = validationMonitor.getAnalytics()
    
    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in validation monitoring endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Log validation errors from client/server
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = LogErrorSchema.parse(body)
    
    // Log the error
    validationMonitor.logError(
      new Error(validatedData.errorMessage || 'Validation error'),
      {
        timestamp: validatedData.timestamp,
        collection: validatedData.collection,
        documentId: validatedData.documentId,
        operation: validatedData.operation,
        userId: validatedData.userId,
        errorPath: validatedData.errorPath,
        errorMessage: validatedData.errorMessage,
        schemaName: validatedData.schemaName,
        rawData: validatedData.rawData,
        environment: validatedData.environment,
        userAgent: validatedData.userAgent,
        url: validatedData.url
      }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Validation error logged successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error logging validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update monitoring configuration
export async function PUT(request: NextRequest) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const config = await request.json()
    
    // Update configuration
    validationMonitor.updateConfig(config)
    
    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully'
    })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 