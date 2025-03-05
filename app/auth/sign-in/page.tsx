"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { signIn, isLoading } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await signIn(email, password)
        } catch (error: any) {
            setError(error.message)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-5rem)] py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your Release Calendar account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm mt-2">{error}</div>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-muted-foreground w-full text-center">
                        Don't have an account?{' '}
                        <Link href="/auth/sign-up" className="text-primary hover:underline">
                            Sign Up
                        </Link>
                    </div>
                    <div className="text-sm text-muted-foreground w-full text-center">
                        <Link href="/auth/forgot-password" className="text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
} 