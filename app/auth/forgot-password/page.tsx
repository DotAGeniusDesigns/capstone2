"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { toast } from '../../components/ui/use-toast'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                throw error
            }

            setIsSubmitted(true)
            toast({
                title: 'Password reset email sent',
                description: 'Please check your email for the password reset link',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send password reset email',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-5rem)] py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <p className="text-muted-foreground">
                                Password reset email sent! Please check your inbox for further instructions.
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/auth/sign-in">Return to Sign In</Link>
                            </Button>
                        </div>
                    ) : (
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <Link href="/auth/sign-in" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
} 