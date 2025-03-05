"use client"

import { useState, useEffect } from 'react'

interface Event {
    id: string
    title: string
    description: string
    category: string
    subcategory1?: string
    subcategory2?: string
    release_date: string
    link?: string
    image_url?: string
}

export function useEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [favorites, setFavorites] = useState<string[]>([])

    // Load events from API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true)
                console.log("useEvents: Fetching events...");
                const response = await fetch('/api/events')
                if (!response.ok) {
                    console.error("useEvents: Error fetching events:", response.status, response.statusText);
                    throw new Error('Failed to fetch events')
                }
                const data = await response.json()
                console.log("useEvents: Events loaded:", data ? data.length : 0, "events");
                setEvents(data)
            } catch (err) {
                console.error("useEvents: Failed to load events:", err)
                setError(err instanceof Error ? err : new Error('An unknown error occurred'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvents()
    }, [])

    // Load favorites from localStorage
    useEffect(() => {
        const storedFavorites = localStorage.getItem('favoriteEvents')
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites))
        }
    }, [])

    // Save favorites to localStorage when they change
    useEffect(() => {
        localStorage.setItem('favoriteEvents', JSON.stringify(favorites))
    }, [favorites])

    const toggleFavorite = (eventId: string) => {
        setFavorites(prev => {
            if (prev.includes(eventId)) {
                return prev.filter(id => id !== eventId)
            } else {
                return [...prev, eventId]
            }
        })
    }

    const isFavorite = (eventId: string) => {
        return favorites.includes(eventId)
    }

    return {
        events,
        isLoading,
        error,
        toggleFavorite,
        isFavorite
    }
} 