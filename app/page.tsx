import React from "react"
import Link from "next/link"
import { Button } from "./components/ui/button"

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Welcome to Release Calendar</h1>
            <p className="text-xl mb-8">Your personalized calendar for games, movies, TV shows, concerts, and more!</p>
            <Link href="/interests">
                <Button>Select Your Interests</Button>
            </Link>
        </main>
    )
}

