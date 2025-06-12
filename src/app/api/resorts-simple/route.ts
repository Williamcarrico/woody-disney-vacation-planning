import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/firebase.config'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query parameters
        const category = searchParams.get('category')
        const area = searchParams.get('area')
        const search = searchParams.get('search')
        const pageLimit = parseInt(searchParams.get('limit') || '20')
        const sortBy = searchParams.get('sortBy') || 'name'
        const sortOrder = searchParams.get('sortOrder') || 'asc'

        // Build Firestore query
        let q = query(collection(firestore, 'resorts'))

        // Add filters
        if (category && category !== 'all') {
            q = query(q, where('category', '==', category))
        }

        if (area && area !== 'all') {
            const areaIndex = area.toLowerCase().replace(/\s+/g, '_')
            q = query(q, where('areaIndex', '==', areaIndex))
        }

        if (search && search.trim()) {
            // For search, use array-contains-any with search terms
            const searchTerms = search.toLowerCase().split(' ')
                .map(term => term.trim())
                .filter(term => term.length > 2)

            if (searchTerms.length > 0) {
                q = query(q, where('searchTerms', 'array-contains-any', searchTerms.slice(0, 10))) // Firestore limit
            }
        }

        // Add sorting (only if no filters to avoid Firestore query limitations)
        if (!category && !area && !search) {
            if (sortBy === 'price') {
                q = query(q, orderBy('priceIndex', sortOrder === 'desc' ? 'desc' : 'asc'))
            } else if (sortBy === 'rating') {
                q = query(q, orderBy('ratingIndex', sortOrder === 'desc' ? 'desc' : 'asc'))
            } else {
                q = query(q, orderBy('name', sortOrder === 'desc' ? 'desc' : 'asc'))
            }
        }

        // Add limit
        q = query(q, limit(pageLimit))

        // Execute query
        const querySnapshot = await getDocs(q)
        const resorts: any[] = []

        querySnapshot.forEach((doc) => {
            const data = doc.data()
            // Convert to a more API-friendly format
            resorts.push({
                id: doc.id,
                name: data.name,
                description: data.description,
                category: data.category,
                type: data.type,
                location: {
                    area: data.location,
                    address: data.address
                },
                pricing: {
                    min: data.rates?.min || 0,
                    max: data.rates?.max || 0,
                    currency: data.rates?.currency || 'USD'
                },
                amenities: data.amenities || [],
                dining: data.dining || [],
                transportation: data.transportation || [],
                roomTypes: data.roomTypes || [],
                imageUrl: data.images?.[0] || '',
                galleryImages: data.images || [],
                starRating: data.ratingIndex || data.reviews?.avgRating || 0,
                reviews: {
                    count: data.reviews?.reviewCount || 0,
                    average: data.reviews?.avgRating || 0
                },
                isDVC: data.isDVC || false,
                roomCount: data.roomCount || 0,
                phoneNumber: data.phone,
                website: data.website,
                promotionalTags: data.promotionalTags || [],
                mapLocation: data.mapLocation,
                status: data.status || 'Open',
                dateOpened: data.dateOpened
            })
        })

        // Calculate statistics
        const allResortsQuery = query(collection(firestore, 'resorts'))
        const allSnapshot = await getDocs(allResortsQuery)
        const allResorts: any[] = []
        allSnapshot.forEach(doc => allResorts.push({ id: doc.id, ...doc.data() }))

        const statistics = {
            totalResorts: allResorts.length,
            byCategory: allResorts.reduce((acc, resort) => {
                acc[resort.category] = (acc[resort.category] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            byArea: allResorts.reduce((acc, resort) => {
                const area = resort.location
                acc[area] = (acc[area] || 0) + 1
                return acc
            }, {} as Record<string, number>),
            averageRating: allResorts.reduce((sum, resort) =>
                sum + (resort.ratingIndex || resort.reviews?.avgRating || 0), 0) / allResorts.length,
            priceRange: {
                min: Math.min(...allResorts.map(r => r.rates?.min || 0).filter(p => p > 0)),
                max: Math.max(...allResorts.map(r => r.rates?.max || 0))
            }
        }

        // Available filters
        const availableFilters = {
            categories: [...new Set(allResorts.map(r => r.category))],
            areas: [...new Set(allResorts.map(r => r.location))],
            amenities: [...new Set(allResorts.flatMap(r => r.amenities || []))],
            priceRange: statistics.priceRange
        }

        return NextResponse.json({
            success: true,
            data: {
                resorts,
                pagination: {
                    page: 1,
                    limit: pageLimit,
                    total: resorts.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false
                },
                filters: {
                    applied: { category, area, search },
                    available: availableFilters
                },
                statistics,
                meta: {
                    timestamp: new Date().toISOString(),
                    cached: false,
                    dataSource: 'firestore'
                }
            }
        })

    } catch (error) {
        console.error('Error fetching resorts:', error)
        return NextResponse.json({
            success: false,
            error: {
                message: 'Failed to fetch resorts',
                code: 'INTERNAL_SERVER_ERROR'
            }
        }, { status: 500 })
    }
}