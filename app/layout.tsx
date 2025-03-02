import React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { CalendarProvider } from "./context/CalendarContext"
import { Toaster } from "./components/ui/use-toast"
import { Navbar } from "./components/NavBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "Release Calendar",
    description: "Your personalized calendar for games, movies, TV shows, concerts, and more!",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full`}>
                <CalendarProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-grow flex flex-col">{children}</main>
                    </div>
                    <Toaster />
                </CalendarProvider>
            </body>
        </html>
    )
}

