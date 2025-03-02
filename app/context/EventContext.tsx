"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"
import type { Database } from "../lib/database.types"

type Event = Database['public']['Tables']['events']['Row']

interface EventContextType {
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  return (
    <EventContext.Provider value={{ currentEvent, setCurrentEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvent = () => {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider")
  }
  return context
}

