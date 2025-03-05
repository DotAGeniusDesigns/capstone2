import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type Event = Database['public']['Tables']['events']['Row']

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

        const { data, error } = await query.order('release_date', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Create the response
        const response = NextResponse.json(data)

        // Cache the response
        await cacheResponse(cacheKey, response.clone(), CACHE_DURATION)

        return response
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

// Helper function to get cached response
async function getCachedResponse(key: string): Promise<NextResponse | null> {
    // In a production environment, you would use a proper cache store like Redis
    // For this example, we'll use a simple in-memory cache
    try {
        // Check if running in a browser environment (which has localStorage)
        if (typeof localStorage !== 'undefined') {
            const cached = localStorage.getItem(key)
            if (cached) {
                const { value, expires } = JSON.parse(cached)
                if (expires > Date.now()) {
                    return NextResponse.json(value)
                } else {
                    localStorage.removeItem(key)
                }
            }
        }
    } catch (error) {
        console.error('Cache error:', error)
    }
    return null
}

// Helper function to cache a response
async function cacheResponse(key: string, response: Response, duration: number): Promise<void> {
    try {
        // In a production environment, you would use a proper cache store like Redis
        const data = await response.json()

        // Only cache in browser environments
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(
                key,
                JSON.stringify({
                    value: data,
                    expires: Date.now() + duration * 1000
                })
            )
        }
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