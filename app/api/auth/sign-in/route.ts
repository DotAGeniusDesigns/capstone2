import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        return NextResponse.json({
            user: data.user,
            session: data.session
        })
    } catch (error) {
        console.error('Sign in error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
} 