import { NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type Event = Database['public']['Tables']['events']['Row']

export async function GET(request: Request) {
    const url = new URL(request.url)
    const categories = url.searchParams.get('categories')?.split(',').filter(Boolean) || []

    try {
        let query = supabase
            .from('events')
            .select('*')

        // Apply category filter if provided
        if (categories.length > 0) {
            query = query.in('category', categories)
        }

        const { data, error } = await query.order('release_date', { ascending: true })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        // Return empty array if no data
        if (!data) {
            return NextResponse.json({ events: [] })
        }

        // Return events array
        return NextResponse.json({
            events: data as Event[]
        })

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
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