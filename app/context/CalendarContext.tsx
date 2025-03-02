"use client"

import React from "react"
import type { Database } from "../lib/database.types"

type Event = Database['public']['Tables']['events']['Row']

interface CalendarContextType {
    events: Event[]
    userInterests: Set<string>
    isLoading: boolean
    error: string | null
    searchQuery: string
    setSearchQuery: (query: string) => void
    toggleInterest: (interest: string) => void
    getEventsByDate: (date: Date) => Event[]
    refreshEvents: () => Promise<void>
}

const CalendarContext = React.createContext<CalendarContextType | undefined>(undefined)

const STORAGE_KEY = 'userInterests'

// Helper functions for subcategory handling
const isSubcategoryInterest = (interest: string): boolean => {
    return interest.includes(":");
}

const getMainCategoryFromSubcategory = (subcategoryInterest: string): string => {
    return subcategoryInterest.split(":")[0];
}

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
    const [events, setEvents] = React.useState<Event[]>([])
    const [userInterests, setUserInterests] = React.useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    const loadEvents = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/events')
            if (!response.ok) {
                throw new Error('Failed to fetch events')
            }

            const data = await response.json()

            if (!data.events) {
                setEvents([])
                return
            }

            setEvents(data.events)
        } catch (err) {
            console.error("Failed to load events:", err)
            setError("Failed to load events. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    const loadUserInterests = () => {
        try {
            const savedInterests = localStorage.getItem(STORAGE_KEY)
            if (savedInterests) {
                setUserInterests(new Set(JSON.parse(savedInterests)))
            }
        } catch (err) {
            console.error("Failed to load user interests from localStorage:", err)
            setError("Failed to load your interests. Please try again later.")
        }
    }

    React.useEffect(() => {
        loadEvents()
        loadUserInterests()
    }, [])

    const toggleInterest = React.useCallback((interest: string) => {
        try {
            setUserInterests(prev => {
                const newInterests = new Set(prev)
                if (newInterests.has(interest)) {
                    newInterests.delete(interest)
                } else {
                    newInterests.add(interest)
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newInterests)))
                return newInterests
            })
        } catch (err) {
            console.error("Failed to update interests:", err)
            setError("Failed to save your interests. Please try again later.")
        }
    }, [])

    const getEventsByDate = React.useCallback((date: Date) => {
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

        return events.filter((event) => {
            const eventDate = new Date(event.release_date)
            const dateMatches = eventDate.toDateString() === date.toDateString();

            if (!dateMatches) return false;

            // If no interests are selected, show all events
            if (interestsArray.length === 0) {
                return true;
            }

            // If subcategories are selected for this event's category, only show events matching those subcategories
            if (subcategoriesByMainCategory[event.category]?.length > 0) {
                return Boolean(
                    (event.subcategory1 && subcategoriesByMainCategory[event.category].includes(event.subcategory1)) ||
                    (event.subcategory2 && subcategoriesByMainCategory[event.category].includes(event.subcategory2))
                );
            }

            // Otherwise, check if the main category is selected
            return mainCategories.includes(event.category);
        });
    }, [events, userInterests])

    const refreshEvents = React.useCallback(async () => {
        await loadEvents()
    }, [])

    return (
        <CalendarContext.Provider
            value={{
                events,
                userInterests,
                isLoading,
                error,
                searchQuery,
                setSearchQuery,
                toggleInterest,
                getEventsByDate,
                refreshEvents
            }}
        >
            {children}
        </CalendarContext.Provider>
    )
}

export const useCalendar = () => {
    const context = React.useContext(CalendarContext)
    if (!context) {
        throw new Error("useCalendar must be used within a CalendarProvider")
    }
    return context
}

