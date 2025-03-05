import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST() {
    try {
        const { error } = await supabase.auth.signOut()

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true
        })
    } catch (error) {
        console.error('Sign out error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
} 