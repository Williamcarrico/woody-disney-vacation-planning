import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/firebase/auth-session-server'
import { firebaseDataManager } from '@/lib/firebase/firebase-data-manager'
import { z } from 'zod'

// Validation schemas
const createVacationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  destination: z.string().optional(),
  travelers: z.object({
    adults: z.number().min(1),
    children: z.number().min(0),
    childrenAges: z.array(z.number()).optional()
  }),
  budget: z.object({
    total: z.number().min(0),
    spent: z.number().min(0).optional(),
    categories: z.record(z.object({
      planned: z.number(),
      actual: z.number()
    })).optional()
  }).optional(),
  accommodations: z.object({
    resortId: z.string().optional(),
    resortName: z.string().optional(),
    roomType: z.string().optional(),
    checkInDate: z.string().optional(),
    checkOutDate: z.string().optional(),
    confirmationNumber: z.string().optional()
  }).optional(),
  notes: z.string().optional()
})

const updateVacationSchema = createVacationSchema.partial()

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Firebase session
    const user = await getCurrentUser()
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const archived = searchParams.get('archived') === 'true'
    const destination = searchParams.get('destination')

    try {
      let vacations

      if (archived) {
        // Get archived vacations
        const result = await firebaseDataManager.vacations.searchVacations({
          userId: user.uid,
          isArchived: true
        }, { limit })
        vacations = result.vacations
      } else if (destination) {
        // Get vacations by destination
        const result = await firebaseDataManager.vacations.searchVacations({
          userId: user.uid,
          destination,
          isArchived: false
        }, { limit })
        vacations = result.vacations
      } else {
        // Get active vacations
        const result = await firebaseDataManager.vacations.getVacationsByUserId(user.uid, { limit })
        vacations = result.vacations.filter(v => !v.isArchived)
      }

      // Transform vacations for API response
      const transformedVacations = vacations.map(vacation => ({
        id: vacation.id,
        name: vacation.name,
        startDate: vacation.startDate.toDate().toISOString(),
        endDate: vacation.endDate.toDate().toISOString(),
        destination: vacation.destination,
        travelers: vacation.travelers,
        budget: vacation.budget,
        accommodations: vacation.accommodations,
        notes: vacation.notes,
        isArchived: vacation.isArchived,
        createdAt: vacation.createdAt.toDate().toISOString(),
        updatedAt: vacation.updatedAt.toDate().toISOString(),
        duration: firebaseDataManager.vacations.getVacationDuration(vacation),
        status: firebaseDataManager.vacations.isVacationCurrent(vacation) 
          ? 'current' 
          : firebaseDataManager.vacations.isVacationUpcoming(vacation) 
            ? 'upcoming' 
            : 'past'
      }))

      return NextResponse.json({
        vacations: transformedVacations,
        total: transformedVacations.length
      })

    } catch (error) {
      console.error('Firebase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vacations' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error fetching vacations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vacations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Firebase session
    const user = await getCurrentUser()
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    try {
      const validatedData = createVacationSchema.parse(body)

      // Validate dates
      const dateValidation = firebaseDataManager.validateVacationDates(
        validatedData.startDate,
        validatedData.endDate
      )
      
      if (!dateValidation.isValid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        )
      }

      // Create vacation using the data manager
      const vacationId = await firebaseDataManager.createVacationWithDefaults(
        user.uid,
        {
          name: validatedData.name,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          destination: validatedData.destination,
          travelers: validatedData.travelers
        }
      )

      // Update additional fields if provided
      if (validatedData.budget || validatedData.accommodations || validatedData.notes) {
        const updates: any = {}
        if (validatedData.budget) updates.budget = validatedData.budget
        if (validatedData.accommodations) updates.accommodations = validatedData.accommodations
        if (validatedData.notes) updates.notes = validatedData.notes

        await firebaseDataManager.vacations.updateVacation(vacationId, updates)
      }

      // Get the created vacation
      const vacation = await firebaseDataManager.vacations.getVacationById(vacationId)
      if (!vacation) {
        throw new Error('Failed to retrieve created vacation')
      }

      return NextResponse.json({
        id: vacation.id,
        name: vacation.name,
        startDate: vacation.startDate.toDate().toISOString(),
        endDate: vacation.endDate.toDate().toISOString(),
        destination: vacation.destination,
        travelers: vacation.travelers,
        budget: vacation.budget,
        accommodations: vacation.accommodations,
        notes: vacation.notes,
        isArchived: vacation.isArchived,
        createdAt: vacation.createdAt.toDate().toISOString(),
        updatedAt: vacation.updatedAt.toDate().toISOString()
      }, { status: 201 })

    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }

  } catch (error) {
    console.error('Error creating vacation:', error)
    return NextResponse.json(
      { error: 'Failed to create vacation' },
      { status: 500 }
    )
  }
}

export const revalidate = 300 // 5 minutes