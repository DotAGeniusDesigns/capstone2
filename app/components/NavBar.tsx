"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/button"

export function Navbar() {
    const pathname = usePathname()
    const { user, signOut, isLoading } = useAuth()

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold">Release Calendar</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/interests"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/interests"
                                    ? "border-primary text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    }`}
                            >
                                Interests
                            </Link>
                            <Link
                                href="/calendar"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/calendar"
                                    ? "border-primary text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    }`}
                            >
                                Calendar
                            </Link>
                            <Link
                                href="/list"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/list"
                                    ? "border-primary text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    }`}
                            >
                                List
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isLoading ? (
                            <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
                        ) : user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">
                                    {user.email?.split('@')[0]}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => signOut()}
                                    className="text-sm"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Button variant="ghost" asChild className="text-sm">
                                    <Link href="/auth/sign-in">Sign In</Link>
                                </Button>
                                <Button asChild className="text-sm">
                                    <Link href="/auth/sign-up">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

