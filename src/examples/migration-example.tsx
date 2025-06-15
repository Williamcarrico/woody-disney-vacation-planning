/**
 * Migration Example: From Direct Firebase to Validated Services
 * 
 * This example demonstrates how to migrate existing code from direct Firebase
 * usage to the new validated services with runtime type checking.
 */

import { useEffect, useState } from 'react'

// ❌ OLD WAY - Direct Firebase usage (no validation)
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  query,
  where 
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'

// ✅ NEW WAY - Validated services with runtime type checking
import { 
  ValidatedUserService,
  ValidatedVacationService,
  ValidationError 
} from '@/lib/firebase/validated-firestore-service'
import { validationMonitor } from '@/lib/monitoring/validation-error-monitor'

/**
 * Example 1: Fetching a User Document
 */
// ❌ OLD WAY
async function getUser_OLD(userId: string) {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId))
    if (userDoc.exists()) {
      // No validation - data could be malformed!
      return userDoc.data() as any
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// ✅ NEW WAY
async function getUser_NEW(userId: string) {
  try {
    // Automatically validates data against UserSchema
    const user = await ValidatedUserService.get(userId)
    return user // Type-safe and validated!
  } catch (error) {
    if (error instanceof ValidationError) {
      // Log validation errors for monitoring
      validationMonitor.logError(error, {
        operation: 'get',
        collection: 'users',
        documentId: userId
      })
    }
    throw error
  }
}

/**
 * Example 2: Creating/Updating a Vacation
 */
// ❌ OLD WAY
async function createVacation_OLD(vacationData: any) {
  try {
    const vacationRef = doc(collection(firestore, 'vacations'))
    // No validation - could save invalid data!
    await setDoc(vacationRef, {
      ...vacationData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return vacationRef.id
  } catch (error) {
    console.error('Error creating vacation:', error)
    throw error
  }
}

// ✅ NEW WAY
async function createVacation_NEW(vacationData: any) {
  try {
    // Validates against VacationSchema before saving
    const vacationId = await ValidatedVacationService.set(
      ValidatedVacationService.generateId(),
      vacationData
    )
    return vacationId
  } catch (error) {
    if (error instanceof ValidationError) {
      // Detailed validation error info
      console.error('Validation failed:', error.zodError?.errors)
      
      // Monitor validation failures
      validationMonitor.logError(error, {
        operation: 'set',
        collection: 'vacations',
        rawData: vacationData
      })
    }
    throw error
  }
}

/**
 * Example 3: Real-time Subscriptions
 */
// ❌ OLD WAY - React Hook
function useVacations_OLD(userId: string) {
  const [vacations, setVacations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const q = query(
      collection(firestore, 'vacations'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // No validation - malformed data could crash the app!
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setVacations(data)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  return { vacations, loading, error }
}

// ✅ NEW WAY - React Hook with Validation
function useVacations_NEW(userId: string) {
  const [vacations, setVacations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  useEffect(() => {
    const unsubscribe = ValidatedVacationService.subscribe(
      {
        where: [['userId', '==', userId]],
        orderBy: [['createdAt', 'desc']]
      },
      {
        onData: (validVacations) => {
          // Only valid data reaches here!
          setVacations(validVacations)
          setLoading(false)
        },
        onError: (err) => {
          setError(err)
          setLoading(false)
        },
        onValidationError: (validationError, invalidDoc) => {
          // Handle validation errors separately
          setValidationErrors(prev => [...prev, validationError])
          
          // Log for monitoring
          validationMonitor.logError(validationError, {
            operation: 'subscribe',
            collection: 'vacations',
            documentId: invalidDoc.id,
            userId
          })
        }
      }
    )

    return () => unsubscribe()
  }, [userId])

  return { vacations, loading, error, validationErrors }
}

/**
 * Example 4: Batch Operations
 */
// ❌ OLD WAY
async function updateMultipleUsers_OLD(updates: Array<{ id: string; data: any }>) {
  const batch = firestore.batch()
  
  updates.forEach(({ id, data }) => {
    const userRef = doc(firestore, 'users', id)
    // No validation - could corrupt multiple documents!
    batch.update(userRef, data)
  })
  
  await batch.commit()
}

// ✅ NEW WAY
async function updateMultipleUsers_NEW(updates: Array<{ id: string; data: any }>) {
  try {
    // Validates ALL updates before committing ANY
    await ValidatedUserService.batchUpdate(
      updates.map(({ id, data }) => ({
        id,
        data: { ...data, updatedAt: new Date() }
      }))
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      // Detailed info about which update failed validation
      console.error('Batch validation failed:', {
        failedIndex: error.batchIndex,
        errors: error.zodError?.errors
      })
      
      validationMonitor.logError(error, {
        operation: 'update',
        collection: 'users',
        rawData: updates
      })
    }
    throw error
  }
}

/**
 * Example 5: Component Usage
 */
export function VacationListComponent({ userId }: { userId: string }) {
  // Using the new validated hook
  const { vacations, loading, error, validationErrors } = useVacations_NEW(userId)
  
  // Display validation errors to help with debugging
  if (validationErrors.length > 0) {
    console.warn(`Found ${validationErrors.length} validation errors in vacation data`)
  }
  
  if (loading) return <div>Loading vacations...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {validationErrors.length > 0 && (
        <div className="bg-yellow-100 p-4 mb-4">
          <p>Some vacation data failed validation. This data has been filtered out.</p>
          <details>
            <summary>View validation errors ({validationErrors.length})</summary>
            <pre className="text-xs mt-2">
              {JSON.stringify(validationErrors.map(e => e.zodError?.errors), null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      <ul>
        {vacations.map(vacation => (
          <li key={vacation.id}>
            {/* Type-safe access to validated data */}
            <h3>{vacation.title}</h3>
            <p>Start: {vacation.startDate.toLocaleDateString()}</p>
            <p>Guests: {vacation.adults + vacation.children}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 6: Error Monitoring Dashboard
 */
export function ValidationErrorDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  
  useEffect(() => {
    // Update every 5 seconds
    const interval = setInterval(() => {
      setAnalytics(validationMonitor.getAnalytics())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!analytics) return null
  
  return (
    <div className="p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">Validation Error Monitor</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold">Last Hour</h3>
          <p className="text-2xl">{analytics.summary.total} errors</p>
        </div>
        
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold">Error Rate</h3>
          <p className="text-2xl">{analytics.errorRate.last5Minutes.toFixed(2)}/min</p>
        </div>
        
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold">Critical Errors</h3>
          <p className="text-2xl text-red-600">
            {analytics.summary.bySeverity.critical}
          </p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded">
        <h3 className="font-semibold mb-2">Most Common Errors</h3>
        <ul className="text-sm">
          {analytics.mostCommonErrors.slice(0, 5).map((error: any, i: number) => (
            <li key={i} className="py-1">
              {error.key}: {error.count} occurrences
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Migration Checklist:
 * 
 * 1. ✅ Replace direct Firestore imports with validated services
 * 2. ✅ Add error handling for ValidationError
 * 3. ✅ Set up validation error monitoring
 * 4. ✅ Update React hooks to use subscribe() with validation callbacks
 * 5. ✅ Test with malformed data to ensure validation works
 * 6. ✅ Monitor validation errors in production
 * 7. ✅ Gradually update schemas based on validation failures
 */ 