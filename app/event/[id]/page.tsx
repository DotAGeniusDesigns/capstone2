"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { useCalendar } from "../../context/CalendarContext"
import { Button } from "../../components/ui/button"
import { Share2, ArrowLeft } from "lucide-react"
import { CountdownTimer } from "../../components/CountdownTimer"
import { toast } from "../../components/ui/use-toast"
import { categoryColors, categoryBgColors } from "../../calendar/page"
import Link from "next/link"

export default function ReleaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { events } = useCalendar()
    const eventId = params.id as string

    const event = React.useMemo(() => {
        return events.find(e => e.id === eventId)
    }, [events, eventId])

    const getCategoryColor = (category: string) => {
        return categoryColors[category] || "bg-gray-500"
    }

    const getCategoryBgColor = (category: string) => {
        return categoryBgColors[category] || "bg-gray-100"
    }

    const formatEventTime = (dateString: string) => {
        const date = new Date(dateString)
        return (
            date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/New_York",
            }) + " ET"
        )
    }

    const handleShare = () => {
        const url = `${window.location.origin}/event/${eventId}`
        navigator.clipboard
            .writeText(url)
            .then(() => {
                toast({
                    title: "Shared!",
                    description: "Release URL copied to clipboard.",
                })
            })
            .catch((err) => {
                console.error("Failed to copy: ", err)
                toast({
                    title: "Share failed",
                    description: "Could not copy release URL to clipboard.",
                    variant: "destructive",
                })
            })
    }

    if (!event) {
        return (
            <div className="container mx-auto py-8">
                <Button variant="outline" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Card>
                    <CardContent className="pt-6">
                        <p>Release not found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const colorClass = getCategoryColor(event.category)
    const bgColorClass = getCategoryBgColor(event.category)

    return (
        <div className="container mx-auto py-8">
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <Card className={`${bgColorClass} border-l-4 ${colorClass.replace('bg-', 'border-')}`}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{event.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                                {new Date(event.release_date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                    <div className="flex items-center mt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-white ${colorClass} mr-3`}>
                            {event.category}
                        </span>
                        <span className="text-sm">
                            {formatEventTime(event.release_date)}
                        </span>
                    </div>
                    {(event.subcategory1 || event.subcategory2) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {event.subcategory1 && (
                                <span className={`inline-block px-2 py-0.5 rounded-md bg-opacity-70 ${colorClass} text-white text-xs`}>
                                    {event.subcategory1}
                                </span>
                            )}
                            {event.subcategory2 && (
                                <span className={`inline-block px-2 py-0.5 rounded-md bg-opacity-70 ${colorClass} text-white text-xs`}>
                                    {event.subcategory2}
                                </span>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <h3 className="text-base font-semibold mb-1">Countdown</h3>
                        <CountdownTimer targetDate={event.release_date} />
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="whitespace-pre-line">{event.description}</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Release Details</h3>
                        <p>
                            <strong>Release Date:</strong> {new Date(event.release_date).toLocaleString("en-US", { timeZone: "America/New_York" })} ET
                        </p>
                    </div>

                    {event.link && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Release Link</h3>
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline inline-block px-4 py-2 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                Visit Release Website
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 