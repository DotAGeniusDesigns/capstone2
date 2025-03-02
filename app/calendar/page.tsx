"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { useCalendar } from "../context/CalendarContext"
import { ScrollArea } from "../components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Share2, Calendar, List } from "lucide-react"
import { CountdownTimer } from "../components/CountdownTimer"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { toast } from "../components/ui/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import type { Database } from "../lib/database.types"
import { useRouter } from "next/navigation"

type Event = Database['public']['Tables']['events']['Row']

interface CalendarDay {
  date: Date | null
  events: Event[]
}

interface GroupedEvents {
  [key: string]: Event[]
}

export const categoryColors: { [key: string]: string } = {
  Movies: "bg-red-500",
  "TV Shows": "bg-blue-500",
  Anime: "bg-purple-500",
  Games: "bg-amber-500",
  Music: "bg-green-500",
}

export const categoryBgColors: { [key: string]: string } = {
  Movies: "bg-red-100",
  "TV Shows": "bg-blue-100",
  Anime: "bg-purple-100",
  Games: "bg-amber-100",
  Music: "bg-green-100",
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

// Helper functions for subcategory handling
const isSubcategoryInterest = (interest: string): boolean => {
  return interest.includes(":");
}

const getMainCategoryFromSubcategory = (subcategoryInterest: string): string => {
  return subcategoryInterest.split(":")[0];
}

export default function CalendarPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, today.getMonth(), 1))
  const { events, userInterests, isLoading, searchQuery, setSearchQuery } = useCalendar()
  const [expandedEventId, setExpandedEventId] = React.useState<string | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const router = useRouter()

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

  const getEventsByDate = React.useCallback(
    (date: Date) => {
      return filteredEvents.filter((event) => {
        const eventDate = new Date(event.release_date)
        return eventDate.toDateString() === date.toDateString()
      })
    },
    [filteredEvents],
  )

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth: CalendarDay[] = []

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

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      daysInMonth.push({ date: null, events: [] })
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i)
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.release_date)
        const dateMatches = eventDate.getDate() === currentDate.getDate() &&
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear();

        if (!dateMatches) return false;

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

        return matchesInterests;
      });

      daysInMonth.push({
        date: currentDate,
        events: dayEvents,
      })
    }

    return daysInMonth
  }

  // Check if a day has events matching the search query
  const hasSearchMatch = (events: Event[]) => {
    if (!searchQuery || searchQuery.trim() === '') return false;

    return events.some(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
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

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const eventDots = (events: Event[]) => {
    const uniqueCategories = Array.from(new Set(events.map(event => event.category)));
    return uniqueCategories.map(category => (
      <div
        key={category}
        className={`w-2 h-2 rounded-full ${categoryColors[category] || "bg-gray-500"}`}
      />
    ))
  }

  const renderEventCard = (event: Event) => {
    const isExpanded = expandedEventId === event.id
    const colorClass = categoryColors[event.category] || "bg-gray-500"
    const bgColorClass = categoryBgColors[event.category] || "bg-gray-100"

    return (
      <Card
        key={event.id}
        className={`mb-3 overflow-hidden ${bgColorClass} hover:bg-opacity-90 transition-all`}
      >
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base font-semibold">{event.title}</CardTitle>
              <CardDescription className="text-xs">
                {new Date(event.release_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardDescription>
            </div>
            <div
              className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass} text-white`}
            >
              {event.category}
            </div>
          </div>
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
        <CardContent className="p-3 pt-1">
          <div className="text-xs text-gray-500 mb-2">
            {formatEventTime(event.release_date)}
          </div>

          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => {
                router.push(`/event/${event.id}`)
              }}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Release Calendar</h1>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Input
              placeholder="Search releases..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearching(e.target.value.length > 0)
              }}
              className="pr-8"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {isSearching && filteredEvents.length > 0 && (
        <Command className="rounded-lg border shadow-md mb-4">
          <CommandInput placeholder="Search releases..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Releases">
              {filteredEvents.slice(0, 5).map(event => (
                <CommandItem
                  key={event.id}
                  onSelect={() => {
                    const date = new Date(event.release_date)
                    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1))
                    setIsSearching(false)
                  }}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[event.category]} mr-2`}></div>
                    <span>{event.title}</span>
                    <span className="ml-2 text-gray-400 text-xs">
                      {new Date(event.release_date).toLocaleDateString()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-2/3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium py-1 border-b border-gray-200"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 h-[calc(100vh-250px)]">
            {getDaysInMonth(currentDate).map((day, index) => {
              const hasMatch = day.date && hasSearchMatch(day.events);
              return (
                <div
                  key={index}
                  className={`p-1 rounded-lg flex flex-col justify-start items-center border border-gray-100 
                  ${day.date ? "hover:bg-gray-50 cursor-pointer" : "bg-gray-50 opacity-50"} 
                  ${day.date?.toDateString() === new Date().toDateString() ? "bg-blue-100" : ""}
                  ${hasMatch ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}
                  onClick={() => day.date && setCurrentDate(day.date)}
                >
                  {day.date && (
                    <>
                      <span className={`text-sm ${hasMatch ? "font-bold text-indigo-700" : ""}`}>{day.date.getDate()}</span>
                      <div className="flex gap-0.5 mt-1">
                        {day.events.length > 0 && eventDots(day.events)}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="w-1/3 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-2">
            Releases for{" "}
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <ScrollArea className="flex-grow h-full">
            {getEventsByDate(currentDate).length > 0 ? (
              getEventsByDate(currentDate).map(renderEventCard)
            ) : (
              <p className="text-sm">No releases for this date or matching your interests.</p>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

