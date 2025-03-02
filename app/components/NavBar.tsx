"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
    const pathname = usePathname()

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
                                List View
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

