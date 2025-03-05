"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../context/AuthContext"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && !user) {
            // Redirect to login page with the return url
            router.push(`/auth/sign-in?returnUrl=${encodeURIComponent(pathname)}`)
        }
    }, [isLoading, user, router, pathname])

    // Show loading or nothing while checking authentication
    if (isLoading || !user) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return <>{children}</>
} 