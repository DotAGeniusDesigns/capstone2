"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import type { Database } from "../lib/database.types"

type Event = Database['public']['Tables']['events']['Row']

interface CalendarContextType {
    events: Event[]
    userInterests: Set<string>
    isLoading: boolean
    error: string | null
    searchQuery: string
    setSearchQuery: (query: string) => void
    toggleInterest: (category: string) => void
    getEventsByDate: (date: Date) => Event[]
    refreshEvents: () => Promise<void>
    selectedDate: Date | null
    setSelectedDate: (date: Date | null) => void
    selectedCategories: string[]
    setSelectedCategories: (categories: string[]) => void
    getEventsForDate: (date: Date) => Event[]
    getEventsForMonth: (year: number, month: number) => Record<number, Event[]>
    getFilteredEvents: () => Event[]
    getAllCategories: () => string[]
    getSubcategories: () => Record<string, string[]>
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

const STORAGE_KEY = 'userInterests'

function getUserInterestsFromStorage(): Set<string> {
    if (typeof window === 'undefined') {
        return new Set()
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return new Set(JSON.parse(stored))
        }
    } catch (err) {
        console.error("Failed to load user interests:", err)
    }

    return new Set()
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[]>([])
    const [userInterests, setUserInterests] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    // Cache for categorized events
    const [categoryEventsCache, setCategoryEventsCache] = useState<Record<string, Event[]>>({})
    const [dateEventsCache, setDateEventsCache] = useState<Record<string, Event[]>>({})

    // Fetch events from API
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

    // Memoize filtered events based on selectedCategories
    const filteredEvents = useMemo(() => {
        if (selectedCategories.length === 0) {
            return events
        }
        return events.filter(event => selectedCategories.includes(event.category))
    }, [events, selectedCategories])

    // Get all unique categories from events
    const allCategories = useMemo(() => {
        const categories = new Set<string>()
        events.forEach(event => {
            if (event.category) {
                categories.add(event.category)
            }
        })
        return Array.from(categories)
    }, [events])

    // Get subcategories organized by main category
    const subcategories = useMemo(() => {
        const subcategoriesByMainCategory: Record<string, string[]> = {}

        events.forEach(event => {
            const mainCategory = event.category
            const subcategory1 = event.subcategory1
            const subcategory2 = event.subcategory2

            if (!mainCategory) return

            if (!subcategoriesByMainCategory[mainCategory]) {
                subcategoriesByMainCategory[mainCategory] = []
            }

            if (subcategory1 && !subcategoriesByMainCategory[mainCategory].includes(subcategory1)) {
                subcategoriesByMainCategory[mainCategory].push(subcategory1)
            }

            if (subcategory2 && !subcategoriesByMainCategory[mainCategory].includes(subcategory2)) {
                subcategoriesByMainCategory[mainCategory].push(subcategory2)
            }
        })

        return subcategoriesByMainCategory
    }, [events])

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0]

        // Check if we have a cached result
        if (dateEventsCache[dateString]) {
            return dateEventsCache[dateString]
        }

        // Filter events for this date
        const result = filteredEvents.filter(event => {
            const eventDate = new Date(event.release_date)
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear()
            )
        })

        // Cache the result
        setDateEventsCache(prev => ({
            ...prev,
            [dateString]: result
        }))

        return result
    }

    // Get events for a specific month, organized by day
    const getEventsForMonth = (year: number, month: number) => {
        const monthKey = `${year}-${month}`

        // Filter events for this month first
        const monthEvents = useMemo(() => {
            return filteredEvents.filter(event => {
                const eventDate = new Date(event.release_date)
                return (
                    eventDate.getMonth() === month &&
                    eventDate.getFullYear() === year
                )
            })
        }, [filteredEvents, year, month])

        // Group by day
        const eventsPerDay: Record<number, Event[]> = {}

        monthEvents.forEach(event => {
            const eventDate = new Date(event.release_date)
            const day = eventDate.getDate()

            if (!eventsPerDay[day]) {
                eventsPerDay[day] = []
            }

            eventsPerDay[day].push(event)
        })

        return eventsPerDay
    }

    // Get all filtered events
    const getFilteredEvents = () => {
        return filteredEvents
    }

    // Get all categories
    const getAllCategories = () => {
        return allCategories
    }

    // Get all subcategories
    const getSubcategories = () => {
        return subcategories
    }

    // Get events for a specific date (original function)
    const getEventsByDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.release_date)
            return (
                eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear()
            )
        })
    }

    const loadUserInterests = () => {
        const interests = getUserInterestsFromStorage()
        setUserInterests(interests)
    }

    const saveUserInterests = (interests: Set<string>) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(interests)))
        } catch (err) {
            console.error("Failed to save user interests:", err)
        }
    }

    const toggleInterest = (category: string) => {
        const newInterests = new Set(userInterests)

        if (newInterests.has(category)) {
            newInterests.delete(category)
        } else {
            newInterests.add(category)
        }

        setUserInterests(newInterests)
        saveUserInterests(newInterests)
    }

    const refreshEvents = async () => {
        await loadEvents()
    }

    useEffect(() => {
        loadEvents()
        loadUserInterests()
    }, [])

    const value = {
        events,
        userInterests,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        toggleInterest,
        getEventsByDate,
        refreshEvents,
        selectedDate,
        setSelectedDate,
        selectedCategories,
        setSelectedCategories,
        getEventsForDate,
        getEventsForMonth,
        getFilteredEvents,
        getAllCategories,
        getSubcategories,
    }

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    )
}

export function useCalendar() {
    const context = useContext(CalendarContext)
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider')
    }
    return context
}

