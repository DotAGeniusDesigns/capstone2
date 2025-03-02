"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { useCalendar } from "../context/CalendarContext"
import { ScrollArea } from "../components/ui/scroll-area"
import { Share2 } from "lucide-react"
import { CountdownTimer } from "../components/CountdownTimer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { toast } from "../components/ui/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import { categoryColors, categoryBgColors } from "../calendar/page"
import type { Database } from "../lib/database.types"
import { useRouter } from "next/navigation"

type Event = Database['public']['Tables']['events']['Row']

interface GroupedEvents {
    [key: string]: Event[]
}

// Helper functions for subcategory handling
const isSubcategoryInterest = (interest: string): boolean => {
    return interest.includes(":");
}

const getMainCategoryFromSubcategory = (subcategoryInterest: string): string => {
    return subcategoryInterest.split(":")[0];
}

export default function ListViewPage() {
    const { events, userInterests, isLoading, searchQuery, setSearchQuery } = useCalendar()
    const [expandedEventId, setExpandedEventId] = React.useState<string | null>(null)
    const [isSearching, setIsSearching] = React.useState(false)

    const filteredEvents = React.useMemo(() => {
        // Convert userInterests to array for filtering
        const interestsArray = Array.from(userInterests);

        // Separate main categories and subcategories
        const mainCategories = interestsArray.filter(interest => !isSubcategoryInterest(interest));
        const subcategoryInterests = interestsArray.filter(isSubcategoryInterest);

        // Group subcategories by main category
        const subcategoriesByMainCategory: Record<string, string[]> = {};
        subcategoryInterests.forEach(interest => {
            const [mainCategory, subcategory] = interest.split(':');
            if (!subcategoriesByMainCategory[mainCategory]) {
                subcategoriesByMainCategory[mainCategory] = [];
            }
            subcategoriesByMainCategory[mainCategory].push(subcategory);
        });

        return events.filter(event => {
            const matchesSearch =
                searchQuery === '' ||
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

            // Check if the event matches user interests
            let matchesInterests = false;

            // If no interests are selected, show all events
            if (interestsArray.length === 0) {
                matchesInterests = true;
            }
            // If subcategories are selected for this event's category, only show events matching those subcategories
            else if (subcategoriesByMainCategory[event.category]?.length > 0) {
                matchesInterests = Boolean(
                    (event.subcategory1 && subcategoriesByMainCategory[event.category].includes(event.subcategory1)) ||
                    (event.subcategory2 && subcategoriesByMainCategory[event.category].includes(event.subcategory2))
                );
            }
            // Otherwise, check if the main category is selected
            else {
                matchesInterests = mainCategories.includes(event.category);
            }

            return matchesSearch && matchesInterests;
        }).sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
    }, [events, userInterests, searchQuery]);

    const groupedEvents = React.useMemo(() => {
        const grouped: GroupedEvents = {}

        filteredEvents.forEach(event => {
            const date = new Date(event.release_date)
            const dateKey = date.toDateString()

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }

            grouped[dateKey].push(event)
        })

        return grouped
    }, [filteredEvents])

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

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const handleShare = (event: Event, e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/event/${event.id}`;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                toast({
                    title: "Shared!",
                    description: "Event URL copied to clipboard.",
                })
            })
            .catch((err) => {
                console.error("Failed to copy: ", err)
                toast({
                    title: "Share failed",
                    description: "Could not copy event URL to clipboard.",
                    variant: "destructive",
                })
            })
    }

    const getCategoryColor = (category: string) => {
        return categoryColors[category] || "bg-gray-500";
    }

    const getCategoryBgColor = (category: string) => {
        return categoryBgColors[category] || "bg-gray-100";
    }

    const renderEventCard = (event: Event) => {
        const colorClass = getCategoryColor(event.category);
        const bgColorClass = getCategoryBgColor(event.category);

        return (
            <Card
                key={event.id}
                className={`mb-2 border-l-4 ${colorClass.replace('bg-', 'border-')} ${bgColorClass} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => window.location.href = `/event/${event.id}`}
            >
                <CardHeader className={`py-2`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-sm">{event.title}</CardTitle>
                            <CardDescription className="text-xs">
                                {new Date(event.release_date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric",
                                })}
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={(e) => handleShare(event, e)}>
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription className="text-xs">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-white ${colorClass}`}>
                            {event.category}
                        </span>
                        {" | "}{formatEventTime(event.release_date)}
                    </CardDescription>
                    {(event.subcategory1 || event.subcategory2) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {event.subcategory1 && (
                                <span className={`px-1.5 py-0.5 text-xs rounded-md bg-opacity-70 ${colorClass} text-white`}>
                                    {event.subcategory1}
                                </span>
                            )}
                            {event.subcategory2 && (
                                <span className={`px-1.5 py-0.5 text-xs rounded-md bg-opacity-70 ${colorClass} text-white`}>
                                    {event.subcategory2}
                                </span>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="py-2 text-xs">
                    <div className="text-xs text-gray-600">
                        <CountdownTimer targetDate={event.release_date} />
                    </div>
                    <div className="mt-2 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 px-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/event/${event.id}`;
                            }}
                        >
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold">All Releases</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="flex">
                            <Input
                                type="text"
                                placeholder="Search releases..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setIsSearching(true)
                                }}
                                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                                className="w-64"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <span className="sr-only">Clear search</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                                        <path d="M18 6 6 18"></path>
                                        <path d="m6 6 12 12"></path>
                                    </svg>
                                </Button>
                            )}
                        </div>
                        {isSearching && (
                            <Command className="absolute top-full left-0 w-full z-10">
                                <CommandInput placeholder="Search releases..." value={searchQuery} onValueChange={setSearchQuery} />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredEvents.slice(0, 5).map((event) => (
                                            <CommandItem
                                                key={event.id}
                                                onSelect={() => {
                                                    setSearchQuery(event.title)
                                                    setIsSearching(false)
                                                }}
                                            >
                                                {event.title}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-hidden h-[calc(100vh-12rem)]">
                <ScrollArea className="h-full">
                    {Object.keys(groupedEvents).length > 0 ? (
                        Object.entries(groupedEvents)
                            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                            .map(([dateString, dateEvents]) => (
                                <div key={dateString} className="mb-4">
                                    <h3 className="text-lg font-bold mb-2 border-b pb-1">
                                        {formatDateHeader(dateString)}
                                    </h3>
                                    {dateEvents.map(renderEventCard)}
                                </div>
                            ))
                    ) : (
                        <p className="text-sm">No events matching your search or interests.</p>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
} 