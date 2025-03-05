import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase.auth.getUser()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        if (!data.user) {
            return NextResponse.json(
                { user: null },
                { status: 200 }
            )
        }

        return NextResponse.json({
            user: data.user
        })
    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
} 