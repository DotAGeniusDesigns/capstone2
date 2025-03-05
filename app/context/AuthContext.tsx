"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/use-toast'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    signUp: (email: string, password: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Initialize auth state from supabase
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true)
                // Check for existing session
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    setUser(session.user)
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user)
                } else {
                    setUser(null)
                }
                setIsLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Sign up failed')
            }

            toast({
                title: 'Account created',
                description: 'Please check your email to confirm your account',
            })

            router.push('/auth/sign-in')
        } catch (error: any) {
            toast({
                title: 'Sign up failed',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Sign in failed')
            }

            setUser(data.user)
            toast({
                title: 'Welcome back',
                description: 'You\'ve successfully signed in',
            })

            router.push('/')
        } catch (error: any) {
            toast({
                title: 'Sign in failed',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/auth/sign-out', {
                method: 'POST',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Sign out failed')
            }

            setUser(null)
            toast({
                title: 'Signed out',
                description: 'You\'ve been successfully signed out',
            })

            router.push('/')
        } catch (error: any) {
            toast({
                title: 'Sign out failed',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 