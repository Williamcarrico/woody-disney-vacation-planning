import { NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'

export async function GET() {
    try {
        const db = firestore
        const querySnapshot = await getDocs(collection(db, 'resorts'))

        const resorts: any[] = []
        querySnapshot.forEach((doc) => {
            resorts.push({
                id: doc.id,
                ...doc.data()
            })
        })

        // Group by category
        const categories = resorts.reduce((acc, resort) => {
            const category = resort.category || 'UNKNOWN'
            acc[category] = (acc[category] || 0) + 1
            return acc
        }, {})

        return NextResponse.json({
            success: true,
            data: {
                totalResorts: resorts.length,
                categories,
                sampleResort: resorts[0],
                resortNames: resorts.map(r => r.name).slice(0, 10)
            }
        })
    } catch (error) {
        console.error('Error fetching resorts:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}