import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type Event = Database['public']['Tables']['events']['Row']

// Mock data to use when database is unavailable
const MOCK_EVENTS = [
    {
        id: '1',
        title: 'The Batman 2',
        description: 'The sequel to the hit Batman movie',
        category: 'Movies',
        subcategory1: 'Action',
        subcategory2: 'Superhero',
        release_date: '2025-10-15T18:00:00.000Z',
        link: 'https://www.batman.com',
        image_url: 'https://example.com/batman.jpg',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Stranger Things Season 5',
        description: 'The final season of Stranger Things',
        category: 'TV Shows',
        subcategory1: 'Sci-Fi',
        subcategory2: 'Horror',
        release_date: '2025-07-04T16:00:00.000Z',
        link: 'https://www.netflix.com/strangerthings',
        image_url: 'https://example.com/strangerthings.jpg',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Grand Theft Auto 6',
        description: 'The most anticipated game of the decade',
        category: 'Games',
        subcategory1: 'Action',
        subcategory2: 'Open World',
        release_date: '2025-10-31T04:00:00.000Z',
        link: 'https://www.rockstargames.com/gta6',
        image_url: 'https://example.com/gta6.jpg',
        created_at: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Adele World Tour',
        description: 'Adele returns with a new world tour',
        category: 'Music',
        subcategory1: 'Concert',
        subcategory2: 'Pop',
        release_date: '2025-06-01T19:30:00.000Z',
        link: 'https://www.adele.com/tour',
        image_url: 'https://example.com/adele.jpg',
        created_at: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Attack on Titan Movie',
        description: 'The epic conclusion to the Attack on Titan saga',
        category: 'Anime',
        subcategory1: 'Action',
        subcategory2: 'Fantasy',
        release_date: '2025-12-25T15:00:00.000Z',
        link: 'https://www.attackontitan.com',
        image_url: 'https://example.com/aot.jpg',
        created_at: new Date().toISOString()
    }
];

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const subcategories = searchParams.get('subcategories')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Create a cache key based on query parameters
        const cacheKey = `events-${category || 'all'}-${subcategories || 'all'}-${startDate || 'all'}-${endDate || 'all'}`

        // Check if we have a cached response
        const cachedResponse = await getCachedResponse(cacheKey)
        if (cachedResponse) {
            return cachedResponse
        }

        let query = supabase.from('events').select('*')

        if (category) {
            query = query.eq('category', category)
        }

        if (subcategories) {
            const categories = subcategories.split(',')
            query = query.in('category', categories)
        }

        if (startDate) {
            query = query.gte('release_date', startDate)
        }

        if (endDate) {
            query = query.lte('release_date', endDate)
        }

        let { data, error } = await query.order('release_date', { ascending: true })

        // If there's an error or no data, use mock data
        if (error || !data || data.length === 0) {
            console.warn("Using mock data due to error or no data from database:", error)
            data = MOCK_EVENTS;
        }

        // Create the response
        const response = NextResponse.json(data)

        // Cache the response
        await cacheResponse(cacheKey, response.clone(), CACHE_DURATION)

        return response
    } catch (error) {
        console.error("API error:", error);
        // Return mock data as fallback
        return NextResponse.json(MOCK_EVENTS);
    }
}

// Helper function to get cached response
async function getCachedResponse(key: string): Promise<NextResponse | null> {
    // Skip caching in server-side rendering context
    if (typeof window === 'undefined') {
        return null;
    }

    // In a production environment, you would use a proper cache store like Redis
    try {
        const cached = localStorage.getItem(key)
        if (cached) {
            const { value, expires } = JSON.parse(cached)
            if (expires > Date.now()) {
                return NextResponse.json(value)
            } else {
                localStorage.removeItem(key)
            }
        }
    } catch (error) {
        console.error('Cache error:', error)
    }
    return null
}

// Helper function to cache a response
async function cacheResponse(key: string, response: Response, duration: number): Promise<void> {
    // Skip caching in server-side rendering context
    if (typeof window === 'undefined') {
        return;
    }

    try {
        // In a production environment, you would use a proper cache store like Redis
        const data = await response.json()

        localStorage.setItem(
            key,
            JSON.stringify({
                value: data,
                expires: Date.now() + duration * 1000
            })
        )
    } catch (error) {
        console.error('Cache error:', error)
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, description, release_date, category, subcategory1, subcategory2, link } = body as Event

        if (!title || !release_date || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('events')
            .insert([
                {
                    title,
                    description,
                    release_date,
                    category,
                    subcategory1,
                    subcategory2,
                    link
                }
            ])
            .select()
            .single()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            event: data as Event
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 