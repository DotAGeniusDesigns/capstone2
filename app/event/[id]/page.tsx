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
import Image from 'next/image'
import { useEvents } from '../../hooks/useEvents'
import { Badge } from '../../components/ui/badge'
import { HeartIcon, CalendarIcon, LinkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

export default function ReleaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { events, isLoading, error, toggleFavorite, isFavorite } = useEvents()
    const eventId = params.id as string

    // Create a map of events by ID for O(1) lookup
    const eventsMap = React.useMemo(() => {
        const map = new Map()
        events.forEach(event => map.set(event.id, event))
        return map
    }, [events])

    // Lookup event from map instead of using find (O(1) instead of O(n))
    const event = React.useMemo(() => {
        return eventsMap.get(eventId)
    }, [eventsMap, eventId])

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

    const handleGoBack = () => {
        router.back()
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">Error: {error.message}</div>
    }

    if (!event) {
        return <div className="container mx-auto p-4">Event not found</div>
    }

    const colorClass = getCategoryColor(event.category)
    const bgColorClass = getCategoryBgColor(event.category)

    const favorited = isFavorite(event.id)

    return (
        <div className="container mx-auto py-8">
            <Button variant="outline" onClick={handleGoBack} className="mb-4">
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

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                            <CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getCategoryColor(event.category)}>
                                        {event.category}
                                    </Badge>
                                    {event.subcategory1 && (
                                        <Badge variant="outline">
                                            {event.subcategory1}
                                        </Badge>
                                    )}
                                    {event.subcategory2 && (
                                        <Badge variant="outline">
                                            {event.subcategory2}
                                        </Badge>
                                    )}
                                </div>
                            </CardDescription>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(event.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-transparent"
                        >
                            {favorited ? (
                                <HeartIconSolid className="h-6 w-6" />
                            ) : (
                                <HeartIcon className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {event.image_url && (
                        <div className="relative h-64 mb-4">
                            <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                className="object-cover rounded-md"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <CalendarIcon className="h-5 w-5" />
                        <span>{new Date(event.release_date).toLocaleDateString()}</span>
                    </div>

                    <div className="prose max-w-none">
                        <p>{event.description}</p>
                    </div>

                    {event.link && (
                        <div className="mt-6">
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                            >
                                <LinkIcon className="h-5 w-5" />
                                <span>Visit official site</span>
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 